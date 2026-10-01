import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { devices, type Device } from "@/db/schema";
import { AppError } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import { publish } from "@/modules/api/application/events";
import { handleIncoming } from "@/modules/messages/application/incoming.service";
import { markDelivered, normalizeRecipient } from "@/modules/messages/application/message.service";
import { getDriver, isSimulated } from "@/modules/whatsapp/infrastructure/driver-factory";
import type { DriverCallbacks } from "@/modules/whatsapp/domain/driver";

const reconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();

async function findDevice(tenantId: string, id: string): Promise<Device> {
  const [device] = await db.select().from(devices).where(and(eq(devices.id, id), eq(devices.tenantId, tenantId)));
  if (!device) throw new AppError("Device not found", 404, "not_found");
  return device;
}

function callbacksFor(device: Device): DriverCallbacks {
  const { id, tenantId } = device;
  return {
    onQr: (qr) => {
      void db.update(devices).set({ qr, status: "qr_pending" }).where(eq(devices.id, id)).then(() => publish(tenantId, "qr.updated", { deviceId: id }));
    },
    onConnected: ({ phone }) => {
      const now = new Date();
      void db
        .update(devices)
        .set({ status: "connected", phone, qr: null, connectedAt: now, lastSeenAt: now })
        .where(eq(devices.id, id))
        .then(() => publish(tenantId, "device.connected", { deviceId: id, phone }));
    },
    onDisconnected: (reason, loggedOut) => {
      void db
        .update(devices)
        .set({ status: loggedOut ? "logged_out" : "disconnected", qr: null })
        .where(eq(devices.id, id))
        .then(() => publish(tenantId, "device.disconnected", { deviceId: id, reason }));
      if (!loggedOut) scheduleReconnect(tenantId, id, device.reconnectCount);
    },
    onMessage: (message) => {
      handleIncoming(id, message).catch((e) => logger.error("incoming.failed", { error: String(e) }, { tenantId }));
    },
    onDelivery: (externalId) => {
      markDelivered(externalId).catch(() => undefined);
    },
  };
}

function scheduleReconnect(tenantId: string, id: string, attempts: number) {
  clearTimeout(reconnectTimers.get(id));
  const delay = Math.min(30_000, 2_000 * 2 ** Math.min(attempts, 4));
  reconnectTimers.set(
    id,
    setTimeout(async () => {
      await db.update(devices).set({ reconnectCount: attempts + 1 }).where(eq(devices.id, id));
      await connectDevice(tenantId, id, true).catch((e) => logger.error("device.reconnect_failed", { id, error: String(e) }, { tenantId }));
    }, delay),
  );
}

export async function connectDevice(tenantId: string, id: string, resume = false): Promise<void> {
  const device = await findDevice(tenantId, id);
  await db.update(devices).set({ status: "connecting", qr: null }).where(eq(devices.id, id));
  await getDriver().start({ id, phone: device.phone }, callbacksFor(device), { resume });
}

export async function disconnectDevice(tenantId: string, id: string, logout = false): Promise<void> {
  await findDevice(tenantId, id);
  clearTimeout(reconnectTimers.get(id));
  await getDriver().stop(id);
  await db
    .update(devices)
    .set({ status: logout ? "logged_out" : "disconnected", qr: null, ...(logout ? { phone: null } : {}) })
    .where(eq(devices.id, id));
  publish(tenantId, "device.disconnected", { deviceId: id, reason: logout ? "logged_out" : "manual" });
}

export async function simulateScan(tenantId: string, id: string, phone: string): Promise<void> {
  await findDevice(tenantId, id);
  const driver = getDriver();
  if (!isSimulated(driver)) throw new AppError("Only available with the simulated driver", 400, "not_supported");
  const normalizedPhone = normalizeRecipient(phone);
  if (normalizedPhone.includes("@")) throw new AppError("A simulated device needs a phone number", 422, "invalid_phone");
  if (!driver.simulateScan(id, normalizedPhone)) throw new AppError("Start a connection first to get a QR code", 409, "not_connecting");
}

export async function simulateIncoming(tenantId: string, id: string, from: string, text: string, pushName?: string): Promise<void> {
  await findDevice(tenantId, id);
  const driver = getDriver();
  if (!isSimulated(driver)) throw new AppError("Only available with the simulated driver", 400, "not_supported");
  const normalizedFrom = normalizeRecipient(from);
  if (normalizedFrom.includes("@")) throw new AppError("A simulated message needs a phone number", 422, "invalid_phone");
  if (!driver.simulateIncoming(id, { from: normalizedFrom, text, pushName })) throw new AppError("Device is not connected", 409, "not_connected");
}

/** On boot: bring back every session that was active before the process stopped. */
export async function restoreSessions(): Promise<void> {
  const rows = await db.select().from(devices).where(inArray(devices.status, ["connected", "connecting", "qr_pending"]));
  for (const d of rows) {
    await connectDevice(d.tenantId, d.id, d.status === "connected").catch((e) => logger.error("device.restore_failed", { id: d.id, error: String(e) }));
  }
  if (rows.length) await logger.info("engine.sessions_restored", { count: rows.length });
}

/** Periodic health check: refresh lastSeenAt for live sessions, resurrect dead ones. */
export async function heartbeat(): Promise<void> {
  const driver = getDriver();
  const rows = await db.select().from(devices).where(eq(devices.status, "connected"));
  for (const d of rows) {
    if (driver.isReady(d.id)) await db.update(devices).set({ lastSeenAt: new Date() }).where(eq(devices.id, d.id));
    else scheduleReconnect(d.tenantId, d.id, d.reconnectCount);
  }
}
