import { z } from "zod";

export const triggerSchema = z.object({
  type: z.literal("keyword").default("keyword"),
  match: z.enum(["contains", "exact", "starts_with", "regex", "any"]),
  value: z.string().max(200).default(""),
});

export const conditionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("has_tag"), value: z.string().min(1).max(50) }),
  z.object({ type: z.literal("text_contains"), value: z.string().min(1).max(200) }),
  z.object({ type: z.literal("time_between"), from: z.number().int().min(0).max(23), to: z.number().int().min(0).max(23) }),
]);

export const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("send_message"), text: z.string().min(1).max(4096) }),
  z.object({ type: z.literal("add_tag"), tag: z.string().min(1).max(50) }),
  z.object({ type: z.literal("call_webhook"), url: z.string().url() }),
  z.object({ type: z.literal("ai_reply") }),
]);

export const automationInputSchema = z.object({
  name: z.string().min(2).max(100),
  kind: z.enum(["auto_reply", "workflow"]),
  trigger: triggerSchema,
  conditions: z.array(conditionSchema).max(10).default([]),
  actions: z.array(actionSchema).min(1).max(10),
});

export type AutomationTrigger = z.infer<typeof triggerSchema>;
export type AutomationCondition = z.infer<typeof conditionSchema>;
export type AutomationAction = z.infer<typeof actionSchema>;
export type AutomationInput = z.infer<typeof automationInputSchema>;

export interface IncomingContext {
  tenantId: string;
  deviceId: string;
  from: string;
  name?: string;
  text: string;
}
