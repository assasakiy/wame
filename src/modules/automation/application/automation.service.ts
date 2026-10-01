import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { automations } from "@/db/schema";
import { AppError } from "@/shared/lib/http";
import { assertFeature, assertWithin } from "@/modules/subscription/application/limits";
import type { AutomationInput } from "@/modules/automation/domain/types";

export const listAutomations = (tenantId: string) =>
  db.select().from(automations).where(eq(automations.tenantId, tenantId)).orderBy(desc(automations.createdAt));

export async function createAutomation(tenantId: string, input: AutomationInput) {
  await assertWithin(tenantId, "automations");
  if (input.kind === "workflow") await assertFeature(tenantId, "workflows");
  const advanced = input.trigger.match === "regex" || input.actions.some((a) => a.type === "call_webhook" || a.type === "ai_reply");
  if (advanced) await assertFeature(tenantId, "advancedAutomation");
  const [row] = await db.insert(automations).values({ tenantId, ...input }).returning();
  return row;
}

export async function setAutomationEnabled(tenantId: string, id: string, enabled: boolean) {
  const res = await db
    .update(automations)
    .set({ enabled })
    .where(and(eq(automations.id, id), eq(automations.tenantId, tenantId)))
    .returning({ id: automations.id });
  if (!res.length) throw new AppError("Automation not found", 404, "not_found");
}

export async function deleteAutomation(tenantId: string, id: string) {
  const res = await db.delete(automations).where(and(eq(automations.id, id), eq(automations.tenantId, tenantId))).returning({ id: automations.id });
  if (!res.length) throw new AppError("Automation not found", 404, "not_found");
}
