import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { createDevice, deviceInputSchema, listDevices } from "@/modules/whatsapp/application/device.service";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const user = await requireApiUser("devices.manage");
  return { devices: await listDevices(user.tenantId) };
});

export const POST = route(async (req) => {
  const user = await requireApiUser("devices.manage");
  const input = await readJson(req, deviceInputSchema);
  return { device: await createDevice(user.tenantId, input) };
});
