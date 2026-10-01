import { z } from "zod";
import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { deleteDevice, getDevice } from "@/modules/whatsapp/application/device.service";
import { connectDevice, disconnectDevice, simulateIncoming, simulateScan } from "@/modules/whatsapp/application/engine";

export const dynamic = "force-dynamic";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("connect") }),
  z.object({ action: z.literal("disconnect") }),
  z.object({ action: z.literal("logout") }),
  z.object({ action: z.literal("simulate_scan"), phone: z.string().min(8).max(20).regex(/^\+?[\d\s().-]+$/, "Enter a valid phone number") }),
  z.object({ action: z.literal("simulate_incoming"), from: z.string().min(8).max(20).regex(/^\+?[\d\s().-]+$/, "Enter a valid phone number"), text: z.string().min(1).max(1000), name: z.string().max(60).optional() }),
]);

export const GET = route(async (_req, ctx) => {
  const user = await requireApiUser("devices.manage");
  const { id } = await ctx.params;
  return { device: await getDevice(user.tenantId, id) };
});

export const DELETE = route(async (_req, ctx) => {
  const user = await requireApiUser("devices.manage");
  const { id } = await ctx.params;
  await deleteDevice(user.tenantId, id);
  return { ok: true };
});

export const POST = route(async (req, ctx) => {
  const user = await requireApiUser("devices.manage");
  const { id } = await ctx.params;
  const input = await readJson(req, actionSchema);
  switch (input.action) {
    case "connect":
      await connectDevice(user.tenantId, id);
      break;
    case "disconnect":
      await disconnectDevice(user.tenantId, id);
      break;
    case "logout":
      await disconnectDevice(user.tenantId, id, true);
      break;
    case "simulate_scan":
      await simulateScan(user.tenantId, id, input.phone);
      break;
    case "simulate_incoming":
      await simulateIncoming(user.tenantId, id, input.from, input.text, input.name);
      break;
  }
  return { ok: true };
});
