import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { devices, type Device } from "@/db/schema";
import { AppError } from "@/shared/lib/http";
import { assertWithin } from "@/modules/subscription/application/limits";
import { getDriver } from "@/modules/whatsapp/infrastructure/driver-factory";

export const deviceInputSchema = z.object({
  name: z.string().min(2).max(60),
  type: z.enum(["personal", "business"]).default("personal"),
});

export type DeviceHealth = "healthy" | "degraded" | "offline";

export function deviceHealth(d: Pick<Device, "status" | "lastSeenAt">): DeviceHealth {
  if (d.status !== "connected") return "offline";
  return d.lastSeenAt && Date.now() - d.lastSeenAt.getTime() < 90_000 ? "healthy" : "degraded";
}

export async function listDevices(tenantId: string) {
  const rows = await db.select().from(devices).where(eq(devices.tenantId, tenantId)).orderBy(desc(devices.createdAt));
  return rows.map((d) => ({ ...d, health: deviceHealth(d) }));
}

export async function getDevice(tenantId: string, id: string) {
  const [d] = await db.select().from(devices).where(and(eq(devices.id, id), eq(devices.tenantId, tenantId)));
  if (!d) throw new AppError("Device not found", 404, "not_found");
  return { ...d, health: deviceHealth(d) };
}

export async function createDevice(tenantId: string, input: z.infer<typeof deviceInputSchema>) {
  await assertWithin(tenantId, "devices");
  const [row] = await db.insert(devices).values({ tenantId, name: input.name, type: input.type, driver: getDriver().name }).returning();
  return row;
}

export async function deleteDevice(tenantId: string, id: string) {
  await getDevice(tenantId, id);
  await getDriver().stop(id);
  await db.delete(devices).where(eq(devices.id, id));
}
