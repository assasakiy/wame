import type { PermissionKey } from "@/modules/rbac/domain/permissions";

export type IconName =
  | "dashboard" | "devices" | "messages" | "contacts" | "broadcast" | "automation" | "api" | "webhook" | "ai"
  | "analytics" | "subscription" | "billing" | "settings" | "users" | "roles" | "revenue" | "system" | "logs";

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  permission?: PermissionKey;
}

export const USER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/devices", label: "WhatsApp Devices", icon: "devices", permission: "devices.manage" },
  { href: "/messages", label: "Messages", icon: "messages", permission: "messages.read" },
  { href: "/contacts", label: "Contacts", icon: "contacts", permission: "contacts.manage" },
  { href: "/broadcast", label: "Broadcast", icon: "broadcast", permission: "broadcast.manage" },
  { href: "/automation", label: "Automation", icon: "automation", permission: "automation.manage" },
  { href: "/developer", label: "API", icon: "api", permission: "api.manage" },
  { href: "/webhooks", label: "Webhook", icon: "webhook", permission: "webhooks.manage" },
  { href: "/ai-agent", label: "AI Agent", icon: "ai", permission: "ai.use" },
  { href: "/analytics", label: "Analytics", icon: "analytics", permission: "analytics.view" },
  { href: "/subscription", label: "Subscription", icon: "subscription", permission: "billing.view" },
  { href: "/billing", label: "Billing", icon: "billing", permission: "billing.view" },
  { href: "/settings", label: "Settings", icon: "settings", permission: "settings.manage" },
];

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "analytics", permission: "system.manage" },
  { href: "/admin/users", label: "Users", icon: "users", permission: "users.manage" },
  { href: "/admin/roles", label: "Roles & Permissions", icon: "roles", permission: "roles.manage" },
  { href: "/admin/revenue", label: "Revenue & Plans", icon: "revenue", permission: "subscription.manage" },
  { href: "/admin/devices", label: "Device Monitoring", icon: "devices", permission: "system.manage" },
  { href: "/admin/system", label: "System Health", icon: "system", permission: "system.manage" },
  { href: "/admin/logs", label: "Logs", icon: "logs", permission: "logs.view" },
];
