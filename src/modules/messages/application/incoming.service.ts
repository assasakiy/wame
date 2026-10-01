import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contacts, devices, messages } from "@/db/schema";
import { logger } from "@/shared/lib/logger";
import { publish } from "@/modules/api/application/events";
import { runAutomations } from "@/modules/automation/application/automation-engine";
import { customerServiceAutoReply } from "@/modules/ai-agent/application/agent.service";
import { jidToPhone } from "@/modules/messages/application/message.service";

/** Entry point for every inbound WhatsApp message: persist → notify → automation → AI fallback. */
export async function handleIncoming(deviceId: string, msg: { from: string; text: string; pushName?: string; externalId?: string }) {
  const [device] = await db.select().from(devices).where(eq(devices.id, deviceId));
  if (!device) return;
  const { tenantId } = device;
  const phone = jidToPhone(msg.from);

  await db.insert(contacts).values({ tenantId, name: msg.pushName ?? phone, phone }).onConflictDoNothing();
  await db.insert(messages).values({
    tenantId, deviceId, direction: "in", peer: phone, type: "text", content: msg.text, status: "received", source: "incoming", externalId: msg.externalId ?? null,
  });
  publish(tenantId, "message.received", { deviceId, from: phone, text: msg.text });

  const ctx = { tenantId, deviceId, from: phone, name: msg.pushName, text: msg.text };
  try {
    const result = await runAutomations(ctx);
    if (!result.replied) await customerServiceAutoReply(ctx);
  } catch (e) {
    await logger.error("incoming.automation_failed", { error: e instanceof Error ? e.message : String(e) }, { tenantId });
  }
}
