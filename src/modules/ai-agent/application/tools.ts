import { desc, eq, gte, sql, and } from "drizzle-orm";
import { db } from "@/db";
import { contacts, devices, messages } from "@/db/schema";
import { createAutomation, listAutomations } from "@/modules/automation/application/automation.service";
import { listSegments } from "@/modules/messages/application/contact.service";
import { getTenantAnalytics } from "@/modules/messages/application/analytics.service";
import { getSubscription } from "@/modules/subscription/application/subscription.service";
import { getUsage } from "@/modules/subscription/application/limits";
import { getSystemHealth } from "@/modules/users/application/system-health";
import { deviceHealth } from "@/modules/whatsapp/application/device.service";
import { searchKnowledge } from "@/modules/ai-agent/application/knowledge.service";
import type { ToolName } from "@/modules/ai-agent/domain/agents";

export interface ToolContext {
  tenantId: string;
  userId?: string;
  isSuperAdmin: boolean;
}

export interface Tool {
  description: string;
  parameters: Record<string, unknown>;
  run(ctx: ToolContext, args: Record<string, unknown>): Promise<unknown>;
}

const none = { type: "object", properties: {} };
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

/** Tools = the only way agents touch WAME services, scoped to the caller's tenant. */
export const TOOLS: Record<ToolName, Tool> = {
  get_usage_stats: {
    description: "Current plan, limits and this month's usage.",
    parameters: none,
    async run(ctx) {
      const [sub, usage] = await Promise.all([getSubscription(ctx.tenantId), getUsage(ctx.tenantId)]);
      return { plan: sub.plan.name, expiresAt: sub.currentPeriodEnd, limits: sub.limits, usage };
    },
  },
  list_devices: {
    description: "List WhatsApp devices with status and health.",
    parameters: none,
    async run(ctx) {
      const rows = await db.select().from(devices).where(eq(devices.tenantId, ctx.tenantId));
      return rows.map((d) => ({ name: d.name, type: d.type, phone: d.phone, status: d.status, health: deviceHealth(d), reconnects: d.reconnectCount }));
    },
  },
  search_knowledge: {
    description: "Search the knowledge base for relevant entries.",
    parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
    async run(ctx, args) {
      return (await searchKnowledge(ctx.tenantId, str(args.query))).map((e) => ({ title: e.title, content: e.content }));
    },
  },
  list_automations: {
    description: "List existing automation rules.",
    parameters: none,
    async run(ctx) {
      return (await listAutomations(ctx.tenantId)).map((a) => ({ name: a.name, kind: a.kind, enabled: a.enabled, trigger: a.trigger, runs: a.runCount }));
    },
  },
  create_auto_reply: {
    description: "Create a keyword auto-reply rule.",
    parameters: {
      type: "object",
      properties: { keyword: { type: "string" }, reply: { type: "string" }, name: { type: "string" } },
      required: ["keyword", "reply"],
    },
    async run(ctx, args) {
      const keyword = str(args.keyword);
      const rule = await createAutomation(ctx.tenantId, {
        name: str(args.name, `Auto reply: ${keyword}`).slice(0, 100),
        kind: "auto_reply",
        trigger: { type: "keyword", match: "contains", value: keyword },
        conditions: [],
        actions: [{ type: "send_message", text: str(args.reply) }],
      });
      return { created: true, id: rule.id, name: rule.name };
    },
  },
  list_segments: {
    description: "Contact segments (tags) with sizes.",
    parameters: none,
    run: (ctx) => listSegments(ctx.tenantId),
  },
  analyze_customers: {
    description: "Customer base analysis: size, growth, segments, most active contacts.",
    parameters: none,
    async run(ctx) {
      const since = new Date(Date.now() - 7 * 86_400_000);
      const [total, fresh, top, segments] = await Promise.all([
        db.select({ n: sql<number>`count(*)::int` }).from(contacts).where(eq(contacts.tenantId, ctx.tenantId)),
        db.select({ n: sql<number>`count(*)::int` }).from(contacts).where(and(eq(contacts.tenantId, ctx.tenantId), gte(contacts.createdAt, since))),
        db
          .select({ phone: messages.peer, n: sql<number>`count(*)::int` })
          .from(messages)
          .where(and(eq(messages.tenantId, ctx.tenantId), eq(messages.direction, "in")))
          .groupBy(messages.peer)
          .orderBy(desc(sql`count(*)`))
          .limit(5),
        listSegments(ctx.tenantId),
      ]);
      return { totalContacts: total[0]?.n ?? 0, newLast7Days: fresh[0]?.n ?? 0, segments, mostActive: top };
    },
  },
  message_report: {
    description: "Message statistics for the last N days (default 7).",
    parameters: { type: "object", properties: { days: { type: "number" } } },
    run: (ctx, args) => getTenantAnalytics(ctx.tenantId, Math.min(Math.max(Number(args.days) || 7, 1), 30)),
  },
  system_health: {
    description: "Device health and failure rate; platform-wide metrics for super administrators.",
    parameters: none,
    async run(ctx) {
      const rows = await db.select().from(devices).where(eq(devices.tenantId, ctx.tenantId));
      const analytics = await getTenantAnalytics(ctx.tenantId, 1);
      const base = {
        devices: { total: rows.length, healthy: rows.filter((d) => deviceHealth(d) === "healthy").length, offline: rows.filter((d) => d.status !== "connected").length },
        failureRate24h: analytics.failureRate,
        pendingQueue: analytics.totals.pending,
      };
      return ctx.isSuperAdmin ? { ...base, platform: await getSystemHealth() } : base;
    },
  },
};
