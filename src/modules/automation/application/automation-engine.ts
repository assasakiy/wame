import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { automations, contacts, type Automation } from "@/db/schema";
import { env } from "@/shared/config/env";
import { logger } from "@/shared/lib/logger";
import { renderTemplate } from "@/shared/utils/template";
import { publish } from "@/modules/api/application/events";
import { sendMessage } from "@/modules/messages/application/message.service";
import { generateCustomerReply } from "@/modules/ai-agent/application/agent.service";
import { getSubscription } from "@/modules/subscription/application/subscription.service";
import type { AutomationAction, AutomationCondition, AutomationTrigger, IncomingContext } from "@/modules/automation/domain/types";
import type { PlanLimits } from "@/modules/subscription/domain/plans";

export function matchesTrigger(trigger: AutomationTrigger, text: string, limits: PlanLimits): boolean {
  const t = text.trim().toLowerCase();
  const v = trigger.value.trim().toLowerCase();
  switch (trigger.match) {
    case "any":
      return true;
    case "exact":
      return t === v;
    case "starts_with":
      return t.startsWith(v);
    case "contains":
      return v !== "" && t.includes(v);
    case "regex":
      if (!limits.advancedAutomation || trigger.value.length > 200) return false;
      try {
        return new RegExp(trigger.value, "i").test(text);
      } catch {
        return false;
      }
  }
}

const currentHour = () =>
  Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: env.timezone }).format(new Date())) % 24;

async function conditionPasses(c: AutomationCondition, ctx: IncomingContext): Promise<boolean> {
  switch (c.type) {
    case "text_contains":
      return ctx.text.toLowerCase().includes(c.value.toLowerCase());
    case "time_between": {
      const h = currentHour();
      return c.from <= c.to ? h >= c.from && h < c.to : h >= c.from || h < c.to;
    }
    case "has_tag": {
      const [row] = await db
        .select({ tags: contacts.tags })
        .from(contacts)
        .where(and(eq(contacts.tenantId, ctx.tenantId), eq(contacts.phone, ctx.from)));
      return row?.tags.includes(c.value) ?? false;
    }
  }
}

async function runAction(action: AutomationAction, ctx: IncomingContext, limits: PlanLimits): Promise<boolean> {
  const vars = { name: ctx.name ?? ctx.from, phone: ctx.from, text: ctx.text };
  switch (action.type) {
    case "send_message":
      await sendMessage(ctx.tenantId, { deviceId: ctx.deviceId, to: ctx.from, type: "text", text: renderTemplate(action.text, vars) }, "automation");
      return true;
    case "add_tag":
      await db
        .update(contacts)
        .set({ tags: sql`case when ${contacts.tags} @> ${JSON.stringify([action.tag])}::jsonb then ${contacts.tags} else ${contacts.tags} || ${JSON.stringify([action.tag])}::jsonb end` })
        .where(and(eq(contacts.tenantId, ctx.tenantId), eq(contacts.phone, ctx.from)));
      return false;
    case "call_webhook":
      if (!limits.advancedAutomation) return false;
      await fetch(action.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from: ctx.from, name: ctx.name, text: ctx.text }),
        signal: AbortSignal.timeout(5000),
      });
      return false;
    case "ai_reply": {
      if (!limits.advancedAutomation) return false;
      const reply = await generateCustomerReply(ctx);
      if (!reply) return false;
      await sendMessage(ctx.tenantId, { deviceId: ctx.deviceId, to: ctx.from, type: "text", text: reply }, "ai");
      return true;
    }
  }
}

async function execute(rule: Automation, ctx: IncomingContext, limits: PlanLimits): Promise<boolean> {
  let replied = false;
  for (const action of rule.actions) {
    try {
      replied = (await runAction(action, ctx, limits)) || replied;
    } catch (e) {
      await logger.warn("automation.action_failed", { rule: rule.id, action: action.type, error: String(e) }, { tenantId: ctx.tenantId });
    }
  }
  await db.update(automations).set({ runCount: sql`${automations.runCount} + 1`, lastRunAt: new Date() }).where(eq(automations.id, rule.id));
  publish(ctx.tenantId, "automation.executed", { id: rule.id, name: rule.name, from: ctx.from });
  return replied;
}

/** Evaluates every enabled rule (oldest first). Auto-replies stop at the first rule that answered. */
export async function runAutomations(ctx: IncomingContext): Promise<{ matched: number; replied: boolean }> {
  const [rules, sub] = await Promise.all([
    db.select().from(automations).where(and(eq(automations.tenantId, ctx.tenantId), eq(automations.enabled, true))).orderBy(asc(automations.createdAt)),
    getSubscription(ctx.tenantId),
  ]);
  let matched = 0;
  let replied = false;
  for (const rule of rules) {
    if (rule.kind === "workflow" && !sub.limits.workflows) continue;
    if (!matchesTrigger(rule.trigger, ctx.text, sub.limits)) continue;
    const checks = await Promise.all(rule.conditions.map((c) => conditionPasses(c, ctx)));
    if (!checks.every(Boolean)) continue;
    matched += 1;
    const answered = await execute(rule, ctx, sub.limits);
    replied = replied || answered;
    if (rule.kind === "auto_reply" && answered) break;
  }
  return { matched, replied };
}
