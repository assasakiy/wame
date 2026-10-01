import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { apiKeyInputSchema, createApiKey } from "@/modules/api/application/api-key.service";

export const POST = route(async (req) => {
  const user = await requireApiUser("api.manage");
  const { name } = await readJson(req, apiKeyInputSchema);
  return createApiKey(user.tenantId, user.id, name);
});
