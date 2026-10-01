import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { devices, messages, type Message } from "@/db/schema";
import { env } from "@/shared/config/env";
import { AppError } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import { publish } from "@/modules/api/application/events";
import { assertWithin } from "@/modules/subscription/application/limits";
import { getDriver } from "@/modules/whatsapp/infrastructure/driver-factory";
import type { SendMessageInput } from "@/modules/messages/domain/types";

const MAX_ATTEMPTS = 3;
const MAX_PER_DEVICE_PER_TICK = 2;

export function normalizeRecipient(raw: string): string {
  const value = raw.trim();
  if (value.endsWith("@g.us")) return value; // group chat
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = env.defaultCountryCode + digits.slice(1);
  if (digits.length < 8 || digits.length > 15) throw new AppError("Invalid phone number", 422, "invalid_phone");
  return digits;
}

export const jidToPhone = (jid: string) => jid.split("@")[0]?.split(":")[0] ?? jid;

export async function resolveDevice(tenantId: string, deviceId?: string) {
  const [device] = await db
    .select()
    .from(devices)
    .where(and(eq(devices.tenantId, tenantId), deviceId ? eq(devices.id, deviceId) : eq(devices.status, "connected")));
  if (!device) throw new AppError(deviceId ? "Device not found" : "No connected device available", deviceId ? 404 : 409, "no_device");
  return device;
}

function buildContent(input: SendMessageInput) {
  switch (input.type) {
    case "text":
      if (!input.text) throw new AppError("text is required", 422, "validation_failed");
      return { content: input.text, meta: null };
    case "location":
      if (input.latitude === undefined || input.longitude === undefined) throw new AppError("latitude and longitude are required", 422, "validation_failed");
      return { content: input.text ?? `${input.latitude},${input.longitude}`, meta: { latitude: input.latitude, longitude: input.longitude } };
    case "contact":
      if (!input.contactName || !input.contactPhone) throw new AppError("contactName and contactPhone are required", 422, "validation_failed");
      return { content: input.contactName, meta: { name: input.contactName, phone: input.contactPhone } };
    default:
      if (!input.mediaUrl) throw new AppError("mediaUrl is required for media messages", 422, "validation_failed");
      return { content: input.text ?? null, meta: null };
  }
}

/** Validates, enforces plan limits and puts the message on the queue (status: pending). */
export async function sendMessage(tenantId: string, input: SendMessageInput, source: string): Promise<Message> {
  const device = await resolveDevice(tenantId, input.deviceId);
  const to = normalizeRecipient(input.to);
  const { content, meta } = buildContent(input);
  await assertWithin(tenantId, "messages");
  const [row] = await db
    .insert(messages)
    .values({
      tenantId, deviceId: device.id, peer: to, type: input.type, content, meta, mediaUrl: input.mediaUrl ?? null,
      fileName: input.fileName ?? null, source, scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
    })
    .returning();
  return row;
}

export async function listMessages(tenantId: string, opts: { limit?: number; status?: string; direction?: string } = {}) {
  const filters = [eq(messages.tenantId, tenantId)];
  if (opts.status) filters.push(eq(messages.status, opts.status));
  if (opts.direction) filters.push(eq(messages.direction, opts.direction));
  return db
    .select({ message: messages, deviceName: devices.name })
    .from(messages)
    .innerJoin(devices, eq(devices.id, messages.deviceId))
    .where(and(...filters))
    .orderBy(desc(messages.createdAt))
    .limit(Math.min(opts.limit ?? 50, 200));
}

export async function markDelivered(externalId: string) {
  const [row] = await db
    .update(messages)
    .set({ status: "delivered", deliveredAt: new Date() })
    .where(and(eq(messages.externalId, externalId), eq(messages.status, "sent")))
    .returning();
  if (row) publish(row.tenantId, "message.delivered", { id: row.id, to: row.peer });
}

async function deliver(msg: Message) {
  try {
    const { externalId } = await getDriver().send(msg.deviceId, {
      to: msg.peer, type: msg.type as never, content: msg.content, mediaUrl: msg.mediaUrl, fileName: msg.fileName, meta: msg.meta,
    });
    await db.update(messages).set({ status: "sent", externalId, sentAt: new Date(), error: null }).where(eq(messages.id, msg.id));
    publish(msg.tenantId, "message.sent", { id: msg.id, to: msg.peer, type: msg.type });
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e);
    if (msg.attempts < MAX_ATTEMPTS) {
      const retryAt = new Date(Date.now() + 5_000 * msg.attempts ** 2); // exponential-ish backoff
      await db.update(messages).set({ status: "pending", scheduledAt: retryAt, error }).where(eq(messages.id, msg.id));
      return;
    }
    await db.update(messages).set({ status: "failed", error }).where(eq(messages.id, msg.id));
    publish(msg.tenantId, "message.failed", { id: msg.id, to: msg.peer, error });
    await logger.warn("message.failed", { id: msg.id, error }, { tenantId: msg.tenantId });
  }
}

/** Queue worker: atomically claims due messages (max N per device per tick = rate limit) and sends them. */
export async function processDueMessages(): Promise<number> {
  const claimed = await db.execute(sql`
    WITH due AS (
      SELECT id, row_number() OVER (PARTITION BY device_id ORDER BY created_at) AS rn
      FROM messages
      WHERE direction = 'out' AND status = 'pending' AND (scheduled_at IS NULL OR scheduled_at <= now())
    )
    UPDATE messages SET status = 'sending', attempts = attempts + 1
    WHERE status = 'pending' AND id IN (SELECT id FROM due WHERE rn <= ${MAX_PER_DEVICE_PER_TICK})
    RETURNING id`);
  const ids = claimed.rows.map((r) => r.id as string);
  if (!ids.length) return 0;
  const rows = await db.select().from(messages).where(inArray(messages.id, ids));
  await Promise.allSettled(rows.map(deliver));
  return rows.length;
}

export async function queueDepth(): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(messages).where(inArray(messages.status, ["pending", "sending"]));
  return row?.n ?? 0;
}
