import { Bot, Code2, Megaphone, ShieldCheck, Smartphone, Zap, type LucideIcon } from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  { icon: Smartphone, title: "Multi-device & multi-account", description: "Link personal and WhatsApp Business numbers by QR. Sessions persist, auto-reconnect and report health in realtime." },
  { icon: Code2, title: "Developer API & webhooks", description: "Send text, media, location and contacts with an API key. Receive signed webhooks for every event." },
  { icon: Zap, title: "Automation engine", description: "Keyword auto-replies, scheduled messages and trigger → condition → action workflows." },
  { icon: Megaphone, title: "Broadcast with rate limits", description: "Segment contacts by tag and deliver campaigns through a retrying queue at a pace you control." },
  { icon: Bot, title: "Agentic AI", description: "Customer-service, automation, marketing and admin agents that use tools on your real data and knowledge base." },
  { icon: ShieldCheck, title: "Multi-tenant & RBAC", description: "Isolated workspaces, dynamic roles, granular permissions, audit logs and plan-based feature limits." },
];

export const STEPS = [
  { title: "Create a workspace", description: "Register in seconds on the free plan." },
  { title: "Scan the QR code", description: "Link your WhatsApp number to a WAME device." },
  { title: "Automate & integrate", description: "Use the dashboard, the REST API, or let AI handle the chats." },
];
