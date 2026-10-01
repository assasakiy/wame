import { randomToken } from "@/shared/lib/crypto";
import type { DriverCallbacks, DriverDevice, OutboundPayload, WhatsAppDriver } from "@/modules/whatsapp/domain/driver";

interface SimSession {
  callbacks: DriverCallbacks;
  connected: boolean;
  qrTimer?: ReturnType<typeof setInterval>;
}

/**
 * In-process WhatsApp transport for development, demos and CI.
 * Emits QR codes, lets you "scan" them from the dashboard, delivers outbound messages
 * and can inject inbound messages to exercise automation and AI agents.
 */
export class SimulatedDriver implements WhatsAppDriver {
  readonly name = "simulated";
  private sessions = new Map<string, SimSession>();

  async start(device: DriverDevice, callbacks: DriverCallbacks, options: { resume: boolean }): Promise<void> {
    this.clear(device.id);
    const session: SimSession = { callbacks, connected: false };
    this.sessions.set(device.id, session);

    if (options.resume && device.phone) {
      const phone = device.phone;
      setTimeout(() => this.markConnected(device.id, phone), 400);
      return;
    }
    const emitQr = () => callbacks.onQr(`2@wame-sim,${device.id},${randomToken(24)}`);
    setTimeout(emitQr, 300);
    session.qrTimer = setInterval(emitQr, 20_000);
  }

  async stop(deviceId: string): Promise<void> {
    this.clear(deviceId);
    this.sessions.delete(deviceId);
  }

  async send(deviceId: string, payload: OutboundPayload): Promise<{ externalId: string }> {
    const session = this.sessions.get(deviceId);
    if (!session?.connected) throw new Error("Device is not connected");
    if (payload.to.includes("0000000000")) throw new Error("Recipient is not on WhatsApp"); // lets you test failures
    const externalId = `SIM${randomToken(9)}`;
    setTimeout(() => session.callbacks.onDelivery(externalId), 1500);
    return { externalId };
  }

  isReady(deviceId: string): boolean {
    return this.sessions.get(deviceId)?.connected ?? false;
  }

  /** Simulation helpers (not part of the driver port). */
  simulateScan(deviceId: string, phone: string): boolean {
    if (!this.sessions.has(deviceId)) return false;
    this.markConnected(deviceId, phone);
    return true;
  }

  simulateIncoming(deviceId: string, message: { from: string; text: string; pushName?: string }): boolean {
    const session = this.sessions.get(deviceId);
    if (!session?.connected) return false;
    session.callbacks.onMessage({ ...message, from: `${message.from}@s.whatsapp.net`, externalId: `SIM${randomToken(9)}` });
    return true;
  }

  private markConnected(deviceId: string, phone: string) {
    const session = this.sessions.get(deviceId);
    if (!session) return;
    this.clear(deviceId);
    session.connected = true;
    session.callbacks.onConnected({ phone });
  }

  private clear(deviceId: string) {
    const timer = this.sessions.get(deviceId)?.qrTimer;
    if (timer) clearInterval(timer);
  }
}
