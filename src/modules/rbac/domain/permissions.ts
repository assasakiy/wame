export const PERMISSIONS = {
  // platform administration
  "users.manage": "Manage users",
  "roles.manage": "Manage roles",
  "permissions.manage": "Manage permissions",
  "subscription.manage": "Manage subscriptions of all tenants",
  "system.manage": "Manage and monitor the system",
  "logs.view": "View system logs",
  // tenant features
  "devices.manage": "Manage WhatsApp devices",
  "messages.send": "Send messages",
  "messages.read": "Read messages",
  "contacts.manage": "Manage contacts",
  "broadcast.manage": "Manage broadcasts",
  "automation.manage": "Manage automation",
  "api.manage": "Manage API keys",
  "webhooks.manage": "Manage webhooks",
  "ai.use": "Use AI agents",
  "billing.view": "View subscription & billing",
  "analytics.view": "View analytics",
  "settings.manage": "Manage settings",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as PermissionKey[];

const USER_PERMISSIONS: PermissionKey[] = [
  "devices.manage", "messages.send", "messages.read", "contacts.manage", "broadcast.manage", "automation.manage",
  "api.manage", "webhooks.manage", "ai.use", "billing.view", "analytics.view", "settings.manage",
];

export const SYSTEM_ROLES: Record<string, { description: string; permissions: PermissionKey[] }> = {
  SUPER_ADMIN: { description: "Full platform access", permissions: ALL_PERMISSIONS },
  USER: { description: "Workspace owner on a subscription plan", permissions: USER_PERMISSIONS },
};
