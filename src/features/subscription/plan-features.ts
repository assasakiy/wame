import { limitLabel } from "@/shared/utils/format";
import type { PlanLimits } from "@/modules/subscription/domain/plans";

/** Human-readable feature bullets for a plan (shared by pricing page and subscription page). */
export function planFeatures(l: PlanLimits): string[] {
  return [
    `${limitLabel(l.devices)} WhatsApp device${l.devices > 1 ? "s" : ""}`,
    `${limitLabel(l.messagesPerMonth)} messages / month`,
    `${limitLabel(l.contacts)} contacts`,
    `${limitLabel(l.automations)} automations`,
    `${limitLabel(l.aiRequestsPerMonth)} AI requests / month`,
    l.apiAccess ? `API access (${l.apiRatePerMinute} req/min)` : "No API access",
    l.broadcast ? "Broadcast campaigns" : "No broadcast",
    l.workflows ? "Workflow automation" : "Auto-reply only",
    l.advancedAutomation ? "Regex, webhook & AI actions" : "Basic triggers",
    l.webhooks ? `${l.webhooks} webhooks` : "No webhooks",
  ];
}
