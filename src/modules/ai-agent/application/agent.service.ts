import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { aiAgents, aiChats, messages } from "@/db/schema";
import { logger } from "@/shared/lib/logger";
import { sendMessage } from "@/modules/messages/application/message.service";
import { assertWithin } from "@/modules/subscription/application/limits";
import { AGENTS, AGENT_TYPES, type AgentType } from "@/modules/ai-agent/domain/agents";
import { llmEnabled, runLlm, type ChatTurn } from "@/modules/ai-agent/application/llm";
import { FALLBACK_REPLY, offlineAgent } from "@/modules/ai-agent/application/offline-agent";
import { searchKnowledge } from "@/modules/ai-agent/application/knowledge.service";
import type { ToolContext } from "@/modules/ai-agent/application/tools";
import type { AuthUser } from "@/modules/auth/domain/types";
import type { IncomingContext } from "@/modules/automation/domain/types";

export const chatInputSchema = z.object({ agent: z.enum(AGENT_TYPES), message: z.string().min(1).max(2000) });
export const agentConfigSchema = z.object({
  enabled: z.boolean(),
  deviceId: z.string().uuid().nullable().default(null),
  customPrompt: z.string().max(2000).default(""),
});

export async function getCustomerServiceConfig(tenantId: string) {
  const [row] = await db.select().from(aiAgents).where(and(eq(aiAgents.tenantId, tenantId), eq(aiAgents.type, "customer_service")));
  return row ?? { enabled: false, deviceId: null, customPrompt: "" };
}

export async function saveCustomerServiceConfig(tenantId: string, input: z.infer<typeof agentConfigSchema>) {
  await db
    .insert(aiAgents)
    .values({ tenantId, type: "customer_service", ...input })
    .onConflictDoUpdate({ target: [aiAgents.tenantId, aiAgents.type], set: input });
}

export async function listChat(tenantId: string, userId: string, agent: AgentType, limit = 30) {
  const rows = await db
    .select()
    .from(aiChats)
    .where(and(eq(aiChats.tenantId, tenantId), eq(aiChats.userId, userId), eq(aiChats.agent, agent)))
    .orderBy(desc(aiChats.createdAt))
    .limit(limit);
  return rows.reverse();
}

/** Console chat with one of the four agents (quota-checked, persisted). */
export async function chatWithAgent(user: AuthUser, agent: AgentType, message: string) {
  await assertWithin(user.tenantId, "ai");
  const def = AGENTS[agent];
  const ctx: ToolContext = { tenantId: user.tenantId, userId: user.id, isSuperAdmin: user.role === "SUPER_ADMIN" };
  const history: ChatTurn[] = (await listChat(user.tenantId, user.id, agent, 10)).map((c) => ({ role: c.role as ChatTurn["role"], content: c.content }));
  await db.insert(aiChats).values({ tenantId: user.tenantId, userId: user.id, agent, role: "user", content: message });

  let reply: string;
  let mode: "llm" | "offline" = "offline";
  try {
    if (llmEnabled()) {
      reply = await runLlm({ system: def.systemPrompt, history: [...history, { role: "user", content: message }], tools: def.tools, ctx });
      mode = "llm";
    } else {
      reply = await offlineAgent(agent, message, ctx);
    }
  } catch (e) {
    await logger.warn("ai.agent_failed", { agent, error: e instanceof Error ? e.message : String(e) }, { tenantId: user.tenantId });
    reply = llmEnabled() && mode === "offline" ? await offlineAgent(agent, message, ctx).catch((err) => `Error: ${err instanceof Error ? err.message : err}`) : `Error: ${e instanceof Error ? e.message : e}`;
  }
  await db.insert(aiChats).values({ tenantId: user.tenantId, userId: user.id, agent, role: "assistant", content: reply });
  return { reply, mode };
}

/** Builds a reply for a customer message using conversation context + knowledge base. */
export async function generateCustomerReply(ctx: IncomingContext): Promise<string | null> {
  await assertWithin(ctx.tenantId, "ai");
  const config = await getCustomerServiceConfig(ctx.tenantId);
  const recent = await db
    .select()
    .from(messages)
    .where(and(eq(messages.tenantId, ctx.tenantId), eq(messages.deviceId, ctx.deviceId), eq(messages.peer, ctx.from)))
    .orderBy(desc(messages.createdAt))
    .limit(10);
  const history: ChatTurn[] = recent
    .reverse()
    .filter((m) => m.content)
    .map((m) => ({ role: m.direction === "in" ? "user" : "assistant", content: m.content as string }));

  const toolCtx: ToolContext = { tenantId: ctx.tenantId, isSuperAdmin: false };
  let reply = FALLBACK_REPLY;
  try {
    if (llmEnabled()) {
      const hits = await searchKnowledge(ctx.tenantId, ctx.text, 4);
      const knowledge = hits.map((h) => `# ${h.title}\n${h.content}`).join("\n\n") || "(no relevant entries)";
      const system = `${AGENTS.customer_service.systemPrompt}\n${config.customPrompt}\n\nKnowledge base:\n${knowledge}`;
      reply = await runLlm({ system, history: history.length ? history : [{ role: "user", content: ctx.text }], tools: [], ctx: toolCtx });
    } else {
      reply = await offlineAgent("customer_service", ctx.text, toolCtx);
    }
  } catch (e) {
    await logger.warn("ai.reply_failed", { error: e instanceof Error ? e.message : String(e) }, { tenantId: ctx.tenantId });
  }
  await db.insert(aiChats).values([
    { tenantId: ctx.tenantId, agent: "customer_service", role: "user", content: ctx.text },
    { tenantId: ctx.tenantId, agent: "customer_service", role: "assistant", content: reply },
  ]);
  return reply;
}

/** Fallback for inbound messages that no automation answered. */
export async function customerServiceAutoReply(ctx: IncomingContext): Promise<void> {
  const config = await getCustomerServiceConfig(ctx.tenantId);
  if (!config.enabled || (config.deviceId && config.deviceId !== ctx.deviceId)) return;
  const reply = await generateCustomerReply(ctx).catch(() => null);
  if (reply) await sendMessage(ctx.tenantId, { deviceId: ctx.deviceId, to: ctx.from, type: "text", text: reply }, "ai");
}
