import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { broadcasts, contacts, messages } from "@/db/schema";
import { AppError } from "@/shared/lib/http";
import { renderTemplate } from "@/shared/utils/template";
import { assertFeature, assertWithin } from "@/modules/subscription/application/limits";
import { resolveDevice } from "@/modules/messages/application/message.service";

export const broadcastInputSchema = z.object({
  name: z.string().min(2).max(100),
  deviceId: z.string().uuid(),
  message: z.string().min(1).max(4096),
  segmentTag: z.string().max(50).optional(),
  ratePerMinute: z.number().int().min(1).max(120).default(20),
  scheduledAt: z.string().datetime().optional(),
});

/** Expands a broadcast into queued messages, spaced by the rate limit (messages/minute). */
export async function createBroadcast(tenantId: string, input: z.infer<typeof broadcastInputSchema>) {
  await assertFeature(tenantId, "broadcast");
  const device = await resolveDevice(tenantId, input.deviceId);
  const recipients = await db
    .select()
    .from(contacts)
    .where(
      and(
        eq(contacts.tenantId, tenantId),
        input.segmentTag ? sql`${contacts.tags} @> ${JSON.stringify([input.segmentTag])}::jsonb` : undefined,
      ),
    );
  if (!recipients.length) throw new AppError("No contacts match this segment", 422, "empty_segment");
  await assertWithin(tenantId, "messages", recipients.length);

  const [broadcast] = await db
    .insert(broadcasts)
    .values({
      tenantId, deviceId: device.id, name: input.name, message: input.message, segmentTag: input.segmentTag ?? null,
      ratePerMinute: input.ratePerMinute, total: recipients.length, scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
    })
    .returning();

  const start = input.scheduledAt ? new Date(input.scheduledAt).getTime() : Date.now();
  const interval = 60_000 / input.ratePerMinute;
  const rows = recipients.map((c, i) => ({
    tenantId, deviceId: device.id, broadcastId: broadcast.id, peer: c.phone, type: "text", source: "broadcast",
    content: renderTemplate(input.message, { name: c.name, phone: c.phone }),
    scheduledAt: new Date(start + i * interval),
  }));
  for (let i = 0; i < rows.length; i += 500) await db.insert(messages).values(rows.slice(i, i + 500));
  return broadcast;
}

export async function listBroadcasts(tenantId: string) {
  const list = await db.select().from(broadcasts).where(eq(broadcasts.tenantId, tenantId)).orderBy(desc(broadcasts.createdAt)).limit(50);
  if (!list.length) return [];
  const stats = await db
    .select({ id: messages.broadcastId, status: messages.status, n: sql<number>`count(*)::int` })
    .from(messages)
    .where(inArray(messages.broadcastId, list.map((b) => b.id)))
    .groupBy(messages.broadcastId, messages.status);
  return list.map((b) => {
    const mine = stats.filter((s) => s.id === b.id);
    const count = (...st: string[]) => mine.filter((s) => st.includes(s.status)).reduce((a, s) => a + s.n, 0);
    const done = count("sent", "delivered");
    const failed = count("failed");
    const status = done + failed >= b.total ? "completed" : b.scheduledAt && b.scheduledAt.getTime() > Date.now() ? "scheduled" : "running";
    return { ...b, sent: done, delivered: count("delivered"), failed, status };
  });
}
