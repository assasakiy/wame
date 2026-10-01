export type PlanCode = "FREE" | "PRO" | "PLUS";

export interface PlanLimits {
  devices: number;
  messagesPerMonth: number;
  contacts: number;
  automations: number;
  aiRequestsPerMonth: number;
  webhooks: number;
  apiRatePerMinute: number;
  apiAccess: boolean;
  broadcast: boolean;
  workflows: boolean;
  advancedAutomation: boolean;
}

export type LimitResource = "devices" | "messages" | "contacts" | "automations" | "ai" | "webhooks";
export type PlanFeature = "apiAccess" | "broadcast" | "workflows" | "advancedAutomation";

const UNLIMITED = 1_000_000;

export interface PlanDefinition {
  code: PlanCode;
  name: string;
  description: string;
  priceMonthly: number;
  sortOrder: number;
  limits: PlanLimits;
}

export const DEFAULT_PLANS: PlanDefinition[] = [
  {
    code: "FREE",
    name: "Free",
    description: "Untuk mencoba WAME dengan fitur dasar.",
    priceMonthly: 0,
    sortOrder: 0,
    limits: {
      devices: 1, messagesPerMonth: 200, contacts: 100, automations: 3, aiRequestsPerMonth: 20, webhooks: 0,
      apiRatePerMinute: 0, apiAccess: false, broadcast: false, workflows: false, advancedAutomation: false,
    },
  },
  {
    code: "PRO",
    name: "Pro",
    description: "Untuk bisnis yang butuh API dan automation.",
    priceMonthly: 149000,
    sortOrder: 1,
    limits: {
      devices: 5, messagesPerMonth: 10_000, contacts: 5_000, automations: 25, aiRequestsPerMonth: 500, webhooks: 5,
      apiRatePerMinute: 120, apiAccess: true, broadcast: true, workflows: true, advancedAutomation: false,
    },
  },
  {
    code: "PLUS",
    name: "Plus",
    description: "Automation lanjutan dan limit tertinggi.",
    priceMonthly: 399000,
    sortOrder: 2,
    limits: {
      devices: 20, messagesPerMonth: 100_000, contacts: UNLIMITED, automations: 200, aiRequestsPerMonth: 5_000, webhooks: 25,
      apiRatePerMinute: 600, apiAccess: true, broadcast: true, workflows: true, advancedAutomation: true,
    },
  },
];
