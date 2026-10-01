import { route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { revokeApiKey } from "@/modules/api/application/api-key.service";

export const DELETE = route(async (_req, ctx) => {
  const user = await requireApiUser("api.manage");
  await revokeApiKey(user.tenantId, (await ctx.params).id);
  return { ok: true };
});
