import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { aiChats, automations, contacts, devices, messages, webhooks } from "@/db/schema";
import { AppError } from "@/shared/lib/http";
import { getSubscription } from "@/modules/subscription/application/subscription.service";
import type { LimitResource, PlanFeature, PlanLimits } from "@/modules/subscription/domain/plans";

const monthStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

async function count(query: Promise<{ n: number }[]>): Promise<number> {
  return (await query)[0]?.n ?? 0;
}

const n = sql<number>`count(*)::int`;

export type Usage = Record<LimitResource, number>;

export async function getUsage(tenantId: string): Promise<Usage> {
  const since = monthStart();
  const [d, m, c, a, ai, w] = await Promise.all([
    count(db.select({ n }).from(devices).where(eq(devices.tenantId, tenantId))),
    count(db.select({ n }).from(messages).where(and(eq(messages.tenantId, tenantId), eq(messages.direction, "out"), gte(messages.createdAt, since)))),
    count(db.select({ n }).from(contacts).where(eq(contacts.tenantId, tenantId))),
    count(db.select({ n }).from(automations).where(eq(automations.tenantId, tenantId))),
    count(db.select({ n }).from(aiChats).where(and(eq(aiChats.tenantId, tenantId), eq(aiChats.role, "user"), gte(aiChats.createdAt, since)))),
    count(db.select({ n }).from(webhooks).where(eq(webhooks.tenantId, tenantId))),
  ]);
  return { devices: d, messages: m, contacts: c, automations: a, ai, webhooks: w };
}

export const LIMIT_KEY: Record<LimitResource, keyof PlanLimits> = {
  devices: "devices",
  messages: "messagesPerMonth",
  contacts: "contacts",
  automations: "automations",
  ai: "aiRequestsPerMonth",
  webhooks: "webhooks",
};

/** Throws 402 when `used + add` would exceed the plan limit for the resource. */
export async function assertWithin(tenantId: string, resource: LimitResource, add = 1): Promise<void> {
  const [sub, usage] = await Promise.all([getSubscription(tenantId), getUsage(tenantId)]);
  const limit = sub.limits[LIMIT_KEY[resource]] as number;
  if (usage[resource] + add > limit) {
    throw new AppError(`Plan limit reached for ${resource} (${limit} on ${sub.plan.name}). Upgrade your plan to continue.`, 402, "plan_limit");
  }
}

export async function assertFeature(tenantId: string, feature: PlanFeature): Promise<void> {
  const sub = await getSubscription(tenantId);
  if (!sub.limits[feature]) {
    throw new AppError(`"${feature}" is not available on the ${sub.plan.name} plan. Upgrade to unlock it.`, 402, "plan_feature");
  }
}
