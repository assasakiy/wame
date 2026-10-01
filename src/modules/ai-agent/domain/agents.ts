export type AgentType = "customer_service" | "automation" | "marketing" | "admin";
export type ToolName =
  | "get_usage_stats"
  | "list_devices"
  | "search_knowledge"
  | "list_automations"
  | "create_auto_reply"
  | "list_segments"
  | "analyze_customers"
  | "message_report"
  | "system_health";

export interface AgentDefinition {
  label: string;
  description: string;
  systemPrompt: string;
  tools: ToolName[];
  suggestions: string[];
}

export const AGENT_TYPES = ["customer_service", "automation", "marketing", "admin"] as const;

export const AGENTS: Record<AgentType, AgentDefinition> = {
  customer_service: {
    label: "Customer Service",
    description: "Answers customer chats using your knowledge base and conversation context.",
    systemPrompt:
      "You are a friendly customer service agent replying on WhatsApp. Keep answers short, polite and in the customer's language. Use only the provided knowledge base; if the answer is unknown, say a human agent will follow up.",
    tools: ["search_knowledge"],
    suggestions: ["What are your opening hours?", "How much does shipping cost?"],
  },
  automation: {
    label: "Automation Agent",
    description: "Builds auto-reply rules and recommends workflows.",
    systemPrompt:
      "You are an automation specialist for a WhatsApp gateway. Inspect existing automations, recommend improvements and create auto-reply rules when asked. Confirm what you created.",
    tools: ["list_automations", "create_auto_reply", "get_usage_stats"],
    suggestions: ['Create auto reply keyword "price" reply "Our plans start at Rp149.000"', "Recommend automations for my store"],
  },
  marketing: {
    label: "Marketing Agent",
    description: "Drafts campaigns and message templates, analyses your customers.",
    systemPrompt:
      "You are a marketing strategist for WhatsApp campaigns. Write concise, compliant, engaging templates using {{name}} placeholders, and suggest audience segments from the available data.",
    tools: ["list_segments", "analyze_customers", "get_usage_stats"],
    suggestions: ["Draft a template for a weekend promo", "Analyze my customers"],
  },
  admin: {
    label: "Admin Assistant",
    description: "Generates reports, analyses usage and monitors system health.",
    systemPrompt:
      "You are an operations assistant. Produce clear reports, analyse usage against plan limits, and monitor device and system health. Use tools to fetch real numbers; never invent data.",
    tools: ["message_report", "get_usage_stats", "list_devices", "system_health"],
    suggestions: ["Generate a weekly report", "Check system health"],
  },
};
