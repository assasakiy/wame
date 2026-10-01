import { route } from "@/shared/lib/http";
import { authenticateApiRequest } from "@/modules/api/presentation/api-auth";
import { listDevices } from "@/modules/whatsapp/application/device.service";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { tenantId } = await authenticateApiRequest(req);
  const rows = await listDevices(tenantId);
  return { devices: rows.map((d) => ({ id: d.id, name: d.name, type: d.type, phone: d.phone, status: d.status, health: d.health, lastSeenAt: d.lastSeenAt })) };
});
