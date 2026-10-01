import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { broadcastInputSchema, createBroadcast } from "@/modules/automation/application/broadcast.service";

export const POST = route(async (req) => {
  const user = await requireApiUser("broadcast.manage");
  return { broadcast: await createBroadcast(user.tenantId, await readJson(req, broadcastInputSchema)) };
});
