import { bus, type EventType, type WameEvent } from "@/shared/lib/events";
import { dispatchWebhooks } from "@/modules/api/application/webhook.service";

/** Single entry point for domain events: realtime stream (SSE) + outbound webhooks. */
export function publish(tenantId: string, type: EventType, data: Record<string, unknown> = {}): void {
  const event: WameEvent = { type, tenantId, data, at: new Date().toISOString() };
  bus.emit("event", event);
  void dispatchWebhooks(event);
}
