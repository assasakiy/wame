import type { MessageType } from "@/modules/messages/domain/types";

/** Events a driver reports back to the engine. */
export interface DriverCallbacks {
  onQr(qr: string): void;
  onConnected(info: { phone: string }): void;
  onDisconnected(reason: string, loggedOut: boolean): void;
  onMessage(message: { from: string; text: string; pushName?: string; externalId?: string }): void;
  onDelivery(externalId: string): void;
}

export interface OutboundPayload {
  to: string;
  type: MessageType;
  content?: string | null;
  mediaUrl?: string | null;
  fileName?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface DriverDevice {
  id: string;
  phone: string | null;
}

/**
 * Port for a WhatsApp transport. `SimulatedDriver` ships by default;
 * a Baileys-backed implementation plugs in by implementing this interface and
 * registering it in `driver-factory.ts` (WA_DRIVER=baileys).
 */
export interface WhatsAppDriver {
  readonly name: string;
  start(device: DriverDevice, callbacks: DriverCallbacks, options: { resume: boolean }): Promise<void>;
  stop(deviceId: string): Promise<void>;
  send(deviceId: string, payload: OutboundPayload): Promise<{ externalId: string }>;
  isReady(deviceId: string): boolean;
}
