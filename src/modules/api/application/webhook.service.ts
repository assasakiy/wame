import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { webhooks } from "@/db/schema";
import { EVENT_TYPES, type WameEvent } from "@/shared/lib/events";
import { hmacSha256, randomToken } from "@/shared/lib/crypto";
import { AppError } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import { assertWithin } from "@/modules/subscription/application/limits";

export const webhookInputSchema = z.object({
  url: z.string().url().refine((u) => /^https?:\/\//.test(u), "URL must be http(s)"),
  events: z.array(z.enum(EVENT_TYPES)).min(1),
});

export const listWebhooks = (tenantId: string) =>
  db.select().from(webhooks).where(eq(webhooks.tenantId, tenantId)).orderBy(desc(webhooks.createdAt));

export async function createWebhook(tenantId: string, input: z.infer<typeof webhookInputSchema>) {
  await assertWithin(tenantId, "webhooks");
  const [row] = await db.insert(webhooks).values({ tenantId, url: input.url, events: input.events, secret: `whsec_${randomToken(18)}` }).returning();
  return row;
}

export async function deleteWebhook(tenantId: string, id: string) {
  const res = await db.delete(webhooks).where(and(eq(webhooks.id, id), eq(webhooks.tenantId, tenantId))).returning({ id: webhooks.id });
  if (!res.length) throw new AppError("Webhook not found", 404, "not_found");
}

/** Fire-and-forget delivery; signature: HMAC-SHA256(secret, body) in `x-wame-signature`. */
export async function dispatchWebhooks(event: WameEvent): Promise<void> {
  try {
    const hooks = await db.select().from(webhooks).where(and(eq(webhooks.tenantId, event.tenantId), eq(webhooks.enabled, true)));
    const body = JSON.stringify({ event: event.type, data: event.data, timestamp: event.at });
    await Promise.allSettled(
      hooks
        .filter((h) => h.events.includes(event.type))
        .map(async (h) => {
          let status = 0;
          try {
            const res = await fetch(h.url, {
              method: "POST",
              headers: { "content-type": "application/json", "x-wame-event": event.type, "x-wame-signature": hmacSha256(h.secret, body) },
              body,
              signal: AbortSignal.timeout(5000),
            });
            status = res.status;
          } catch (e) {
            logger.warn("webhook.failed", { url: h.url, error: e instanceof Error ? e.message : String(e) }, { tenantId: event.tenantId });
          }
          await db.update(webhooks).set({ lastStatus: status, lastDeliveryAt: new Date() }).where(eq(webhooks.id, h.id));
        }),
    );
  } catch {
    /* never break the caller */
  }
}
