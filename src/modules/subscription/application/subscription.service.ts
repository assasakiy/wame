import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { invoices, plans, subscriptions } from "@/db/schema";
import { AppError } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import { publish } from "@/modules/api/application/events";
import { getPaymentProvider } from "@/modules/subscription/infrastructure/payment-provider";
import type { PlanCode, PlanLimits } from "@/modules/subscription/domain/plans";

export interface SubscriptionInfo {
  tenantId: string;
  status: string;
  currentPeriodEnd: Date | null;
  plan: typeof plans.$inferSelect;
  planCode: PlanCode;
  limits: PlanLimits;
}

export async function getSubscription(tenantId: string): Promise<SubscriptionInfo> {
  const [row] = await db
    .select({ sub: subscriptions, plan: plans })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(eq(subscriptions.tenantId, tenantId));
  if (!row) throw new AppError("Subscription not found", 404, "not_found");

  const expired = row.plan.code !== "FREE" && row.sub.currentPeriodEnd && row.sub.currentPeriodEnd < new Date();
  if (expired) {
    await applyPlan(tenantId, "FREE", null);
    await logger.info("subscription.expired", { from: row.plan.code }, { tenantId });
    return getSubscription(tenantId);
  }
  return {
    tenantId,
    status: row.sub.status,
    currentPeriodEnd: row.sub.currentPeriodEnd,
    plan: row.plan,
    planCode: row.plan.code as PlanCode,
    limits: row.plan.limits,
  };
}

async function applyPlan(tenantId: string, code: PlanCode, periodEnd: Date | null) {
  const [plan] = await db.select().from(plans).where(eq(plans.code, code));
  if (!plan) throw new AppError("Plan not found", 404, "not_found");
  await db
    .insert(subscriptions)
    .values({ tenantId, planId: plan.id, currentPeriodEnd: periodEnd })
    .onConflictDoUpdate({ target: subscriptions.tenantId, set: { planId: plan.id, currentPeriodEnd: periodEnd, status: "active", updatedAt: new Date() } });
  publish(tenantId, "subscription.updated", { plan: code, currentPeriodEnd: periodEnd?.toISOString() ?? null });
  return plan;
}

export const createSubscription = (tenantId: string, code: PlanCode) => applyPlan(tenantId, code, null);

/** Upgrade or downgrade. Paid plans create an invoice via the payment provider and run for 30 days. */
export async function changePlan(tenantId: string, code: PlanCode, actor: { id: string; admin?: boolean }) {
  const current = await getSubscription(tenantId);
  if (current.planCode === code && !actor.admin) throw new AppError("You are already on this plan", 400, "same_plan");
  const [target] = await db.select().from(plans).where(eq(plans.code, code));
  if (!target) throw new AppError("Plan not found", 404, "not_found");

  const direction = target.priceMonthly >= current.plan.priceMonthly ? "Upgrade" : "Downgrade";
  if (target.priceMonthly > 0) {
    const description = `${direction} to ${target.name} (30 days)`;
    const charge = actor.admin
      ? { status: "paid" as const, provider: "admin" }
      : await getPaymentProvider().charge({ tenantId, amount: target.priceMonthly, description });
    if (charge.status !== "paid") throw new AppError("Payment failed", 402, "payment_failed");
    await db.insert(invoices).values({
      tenantId, planId: target.id, amount: actor.admin ? 0 : target.priceMonthly, status: "paid", provider: charge.provider, description,
    });
  }
  const periodEnd = target.priceMonthly > 0 ? new Date(Date.now() + 30 * 86_400_000) : null;
  await applyPlan(tenantId, code, periodEnd);
  await logger.info("subscription.changed", { from: current.planCode, to: code }, { tenantId, userId: actor.id });
  return getSubscription(tenantId);
}

export const listPlans = () => db.select().from(plans).orderBy(plans.sortOrder);

export const listInvoices = (tenantId: string) =>
  db.select().from(invoices).where(eq(invoices.tenantId, tenantId)).orderBy(desc(invoices.createdAt)).limit(100);

/** Background job: downgrade expired subscriptions. */
export async function expireSubscriptions(): Promise<void> {
  const rows = await db.select({ tenantId: subscriptions.tenantId }).from(subscriptions);
  for (const r of rows) await getSubscription(r.tenantId).catch(() => undefined);
}
