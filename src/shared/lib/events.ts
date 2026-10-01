import { EventEmitter } from "node:events";

export const EVENT_TYPES = [
  "device.connected",
  "device.disconnected",
  "qr.updated",
  "message.received",
  "message.sent",
  "message.delivered",
  "message.failed",
  "automation.executed",
  "subscription.updated",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export interface WameEvent {
  type: EventType;
  tenantId: string;
  data: Record<string, unknown>;
  at: string;
}

const g = globalThis as typeof globalThis & { __wameBus?: EventEmitter };
/** Process-wide event bus (globalThis so instrumentation + route bundles share one instance). */
export const bus: EventEmitter = (g.__wameBus ??= new EventEmitter().setMaxListeners(0));
