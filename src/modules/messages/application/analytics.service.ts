import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { env } from "@/shared/config/env";

export interface DayPoint {
  day: string;
  out: number;
  in: number;
}

export async function getTenantAnalytics(tenantId: string, days = 7) {
  const since = new Date(Date.now() - days * 86_400_000);
  const [perDayRes, statusRows] = await Promise.all([
    db.execute(sql`
      SELECT to_char(created_at AT TIME ZONE ${env.timezone}, 'YYYY-MM-DD') AS day, direction, count(*)::int AS n
      FROM messages WHERE tenant_id = ${tenantId} AND created_at >= ${since.toISOString()}
      GROUP BY 1, 2 ORDER BY 1`),
    db
      .select({ status: messages.status, n: sql<number>`count(*)::int` })
      .from(messages)
      .where(and(eq(messages.tenantId, tenantId), gte(messages.createdAt, since)))
      .groupBy(messages.status),
  ]);

  const byDay = new Map<string, DayPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: env.timezone }).format(new Date(Date.now() - i * 86_400_000));
    byDay.set(day, { day, out: 0, in: 0 });
  }
  for (const r of perDayRes.rows) {
    const point = byDay.get(r.day as string);
    if (point) point[r.direction === "in" ? "in" : "out"] = r.n as number;
  }

  const status = Object.fromEntries(statusRows.map((s) => [s.status, s.n])) as Record<string, number>;
  const get = (k: string) => status[k] ?? 0;
  const delivered = get("delivered");
  const sent = get("sent") + delivered;
  const failed = get("failed");
  const attempted = sent + failed;
  return {
    days,
    perDay: [...byDay.values()],
    totals: { sent, delivered, failed, received: get("received"), pending: get("pending") + get("sending") },
    deliveryRate: attempted ? Math.round((delivered / attempted) * 100) : 0,
    failureRate: attempted ? Math.round((failed / attempted) * 100) : 0,
  };
}
