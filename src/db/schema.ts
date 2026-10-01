import { boolean, index, integer, jsonb, pgTable, primaryKey, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import type { PlanLimits } from "@/modules/subscription/domain/plans";
import type { AutomationAction, AutomationCondition, AutomationTrigger } from "@/modules/automation/domain/types";

const pk = () => uuid("id").primaryKey().defaultRandom();
const ts = (name: string) => timestamp(name, { withTimezone: true });
const created = () => ts("created_at").notNull().defaultNow();
const tenantRef = () => uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" });

// ───────────── Tenancy, RBAC & auth ─────────────
export const tenants = pgTable("tenants", {
  id: pk(),
  name: text("name").notNull(),
  createdAt: created(),
});

export const roles = pgTable("roles", {
  id: pk(),
  name: text("name").notNull().unique(),
  description: text("description").notNull().default(""),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: created(),
});

export const permissions = pgTable("permissions", {
  id: pk(),
  key: text("key").notNull().unique(),
  description: text("description").notNull().default(""),
});

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.roleId, t.permissionId] })],
);

export const users = pgTable("users", {
  id: pk(),
  tenantId: tenantRef(),
  roleId: uuid("role_id").notNull().references(() => roles.id),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: created(),
  lastLoginAt: ts("last_login_at"),
});

export const sessions = pgTable("sessions", {
  id: pk(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: ts("expires_at").notNull(),
  userAgent: text("user_agent"),
  ip: text("ip"),
  createdAt: created(),
});

export const passwordResets = pgTable("password_resets", {
  id: pk(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: ts("expires_at").notNull(),
  usedAt: ts("used_at"),
  createdAt: created(),
});

// ───────────── Subscription & billing ─────────────
export const plans = pgTable("plans", {
  id: pk(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priceMonthly: integer("price_monthly").notNull().default(0),
  limits: jsonb("limits").$type<PlanLimits>().notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const subscriptions = pgTable("subscriptions", {
  id: pk(),
  tenantId: tenantRef().unique(),
  planId: uuid("plan_id").notNull().references(() => plans.id),
  status: text("status").notNull().default("active"),
  currentPeriodEnd: ts("current_period_end"),
  createdAt: created(),
  updatedAt: ts("updated_at").notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: pk(),
  tenantId: tenantRef(),
  planId: uuid("plan_id").references(() => plans.id),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("IDR"),
  status: text("status").notNull().default("paid"),
  provider: text("provider").notNull().default("sandbox"),
  description: text("description").notNull().default(""),
  createdAt: created(),
});

// ───────────── WhatsApp ─────────────
export const devices = pgTable("devices", {
  id: pk(),
  tenantId: tenantRef(),
  name: text("name").notNull(),
  type: text("type").notNull().default("personal"),
  phone: text("phone"),
  status: text("status").notNull().default("disconnected"),
  qr: text("qr"),
  driver: text("driver").notNull().default("simulated"),
  reconnectCount: integer("reconnect_count").notNull().default(0),
  lastSeenAt: ts("last_seen_at"),
  connectedAt: ts("connected_at"),
  createdAt: created(),
});

export const contacts = pgTable(
  "contacts",
  {
    id: pk(),
    tenantId: tenantRef(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    createdAt: created(),
  },
  (t) => [unique("contacts_tenant_phone_uq").on(t.tenantId, t.phone)],
);

export const messages = pgTable(
  "messages",
  {
    id: pk(),
    tenantId: tenantRef(),
    deviceId: uuid("device_id").notNull().references(() => devices.id, { onDelete: "cascade" }),
    broadcastId: uuid("broadcast_id"),
    direction: text("direction").notNull().default("out"),
    peer: text("peer").notNull(),
    type: text("type").notNull().default("text"),
    content: text("content"),
    mediaUrl: text("media_url"),
    fileName: text("file_name"),
    meta: jsonb("meta").$type<Record<string, unknown>>(),
    status: text("status").notNull().default("pending"),
    error: text("error"),
    attempts: integer("attempts").notNull().default(0),
    scheduledAt: ts("scheduled_at"),
    source: text("source").notNull().default("dashboard"),
    externalId: text("external_id"),
    createdAt: created(),
    sentAt: ts("sent_at"),
    deliveredAt: ts("delivered_at"),
  },
  (t) => [
    index("messages_tenant_created_idx").on(t.tenantId, t.createdAt),
    index("messages_queue_idx").on(t.status, t.scheduledAt),
    index("messages_external_idx").on(t.externalId),
  ],
);

export const broadcasts = pgTable("broadcasts", {
  id: pk(),
  tenantId: tenantRef(),
  deviceId: uuid("device_id").notNull().references(() => devices.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  message: text("message").notNull(),
  segmentTag: text("segment_tag"),
  ratePerMinute: integer("rate_per_minute").notNull().default(20),
  total: integer("total").notNull().default(0),
  scheduledAt: ts("scheduled_at"),
  createdAt: created(),
});

// ───────────── Automation ─────────────
export const automations = pgTable("automations", {
  id: pk(),
  tenantId: tenantRef(),
  name: text("name").notNull(),
  kind: text("kind").notNull().default("auto_reply"),
  enabled: boolean("enabled").notNull().default(true),
  trigger: jsonb("trigger").$type<AutomationTrigger>().notNull(),
  conditions: jsonb("conditions").$type<AutomationCondition[]>().notNull().default([]),
  actions: jsonb("actions").$type<AutomationAction[]>().notNull().default([]),
  runCount: integer("run_count").notNull().default(0),
  lastRunAt: ts("last_run_at"),
  createdAt: created(),
});

// ───────────── Developer platform ─────────────
export const apiKeys = pgTable("api_keys", {
  id: pk(),
  tenantId: tenantRef(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  prefix: text("prefix").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  lastUsedAt: ts("last_used_at"),
  revokedAt: ts("revoked_at"),
  createdAt: created(),
});

export const webhooks = pgTable("webhooks", {
  id: pk(),
  tenantId: tenantRef(),
  url: text("url").notNull(),
  events: jsonb("events").$type<string[]>().notNull().default([]),
  secret: text("secret").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  lastStatus: integer("last_status"),
  lastDeliveryAt: ts("last_delivery_at"),
  createdAt: created(),
});

// ───────────── AI agent ─────────────
export const aiAgents = pgTable(
  "ai_agents",
  {
    id: pk(),
    tenantId: tenantRef(),
    type: text("type").notNull(),
    enabled: boolean("enabled").notNull().default(false),
    deviceId: uuid("device_id").references(() => devices.id, { onDelete: "set null" }),
    customPrompt: text("custom_prompt").notNull().default(""),
  },
  (t) => [unique("ai_agents_tenant_type_uq").on(t.tenantId, t.type)],
);

export const knowledgeBase = pgTable("knowledge_base", {
  id: pk(),
  tenantId: tenantRef(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: created(),
});

export const aiChats = pgTable(
  "ai_chats",
  {
    id: pk(),
    tenantId: tenantRef(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    agent: text("agent").notNull(),
    role: text("role").notNull(),
    content: text("content").notNull(),
    createdAt: created(),
  },
  (t) => [index("ai_chats_lookup_idx").on(t.tenantId, t.userId, t.agent, t.createdAt)],
);

// ───────────── Observability ─────────────
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: pk(),
    tenantId: uuid("tenant_id"),
    userId: uuid("user_id"),
    level: text("level").notNull().default("info"),
    action: text("action").notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    createdAt: created(),
  },
  (t) => [index("audit_logs_created_idx").on(t.createdAt)],
);

export type Device = typeof devices.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type Automation = typeof automations.$inferSelect;
