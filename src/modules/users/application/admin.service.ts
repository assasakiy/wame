import { and, desc, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, devices, invoices, messages, plans, roles, sessions, subscriptions, tenants, users } from "@/db/schema";
import { AppError } from "@/shared/lib/http";
import { changePlan } from "@/modules/subscription/application/subscription.service";
import type { AuthUser } from "@/modules/auth/domain/types";

export const adminUserUpdateSchema = z.object({
  roleId: z.string().uuid().optional(),
  status: z.enum(["active", "suspended"]).optional(),
  planCode: z.enum(["FREE", "PRO", "PLUS"]).optional(),
});

export async function listUsers() {
  return db
    .select({
      id: users.id, name: users.name, email: users.email, status: users.status, createdAt: users.createdAt, lastLoginAt: users.lastLoginAt,
      roleId: roles.id, role: roles.name, tenant: tenants.name, plan: plans.code, periodEnd: subscriptions.currentPeriodEnd,
    })
    .from(users)
    .innerJoin(roles, eq(roles.id, users.roleId))
    .innerJoin(tenants, eq(tenants.id, users.tenantId))
    .leftJoin(subscriptions, eq(subscriptions.tenantId, users.tenantId))
    .leftJoin(plans, eq(plans.id, subscriptions.planId))
    .orderBy(desc(users.createdAt))
    .limit(300);
}

export async function adminUpdateUser(actor: AuthUser, id: string, input: z.infer<typeof adminUserUpdateSchema>) {
  const [target] = await db.select().from(users).where(eq(users.id, id));
  if (!target) throw new AppError("User not found", 404, "not_found");
  if (id === actor.id && (input.status === "suspended" || input.roleId)) throw new AppError("You cannot change your own role or suspend yourself", 400, "forbidden");
  if (input.roleId || input.status) {
    await db.update(users).set({ ...(input.roleId ? { roleId: input.roleId } : {}), ...(input.status ? { status: input.status } : {}) }).where(eq(users.id, id));
    if (input.status === "suspended") await db.delete(sessions).where(eq(sessions.userId, id));
  }
  if (input.planCode) await changePlan(target.tenantId, input.planCode, { id: actor.id, admin: true });
}

const n = sql<number>`count(*)::int`;

export async function getPlatformStats() {
  const day = new Date(Date.now() - 86_400_000);
  const month = new Date(Date.now() - 30 * 86_400_000);
  const [u, t, dev, m24, mTotal, revTotal, rev30, dist, perDay] = await Promise.all([
    db.select({ n }).from(users),
    db.select({ n }).from(tenants),
    db.select({ status: devices.status, n }).from(devices).groupBy(devices.status),
    db.select({ n }).from(messages).where(gte(messages.createdAt, day)),
    db.select({ n }).from(messages),
    db.select({ s: sql<number>`coalesce(sum(amount),0)::int` }).from(invoices).where(eq(invoices.status, "paid")),
    db.select({ s: sql<number>`coalesce(sum(amount),0)::int` }).from(invoices).where(and(eq(invoices.status, "paid"), gte(invoices.createdAt, month))),
    db.select({ code: plans.code, n }).from(subscriptions).innerJoin(plans, eq(plans.id, subscriptions.planId)).groupBy(plans.code),
    db.execute(sql`SELECT to_char(created_at, 'YYYY-MM-DD') AS day, count(*)::int AS n FROM messages WHERE created_at >= now() - interval '7 days' GROUP BY 1 ORDER BY 1`),
  ]);
  return {
    users: u[0]?.n ?? 0,
    tenants: t[0]?.n ?? 0,
    devices: Object.fromEntries(dev.map((d) => [d.status, d.n])) as Record<string, number>,
    messages24h: m24[0]?.n ?? 0,
    messagesTotal: mTotal[0]?.n ?? 0,
    revenueTotal: revTotal[0]?.s ?? 0,
    revenue30d: rev30[0]?.s ?? 0,
    planDistribution: Object.fromEntries(dist.map((d) => [d.code, d.n])) as Record<string, number>,
    messagesPerDay: perDay.rows.map((r) => ({ day: r.day as string, n: r.n as number })),
  };
}

export async function getRevenue() {
  const [monthly, recent] = await Promise.all([
    db.execute(sql`SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month, sum(amount)::int AS total FROM invoices WHERE status = 'paid' GROUP BY 1 ORDER BY 1 DESC LIMIT 6`),
    db
      .select({ id: invoices.id, amount: invoices.amount, status: invoices.status, description: invoices.description, provider: invoices.provider, createdAt: invoices.createdAt, tenant: tenants.name })
      .from(invoices)
      .innerJoin(tenants, eq(tenants.id, invoices.tenantId))
      .orderBy(desc(invoices.createdAt))
      .limit(50),
  ]);
  return { monthly: monthly.rows.map((r) => ({ month: r.month as string, total: r.total as number })).reverse(), recent };
}

export const listAllDevices = () =>
  db
    .select({ device: devices, tenant: tenants.name })
    .from(devices)
    .innerJoin(tenants, eq(tenants.id, devices.tenantId))
    .orderBy(desc(devices.createdAt))
    .limit(300);

export async function listLogs(level?: string) {
  return db.select().from(auditLogs).where(level ? eq(auditLogs.level, level) : undefined).orderBy(desc(auditLogs.createdAt)).limit(200);
}
