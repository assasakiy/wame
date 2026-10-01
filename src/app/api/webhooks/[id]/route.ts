import { route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { deleteWebhook } from "@/modules/api/application/webhook.service";

export const DELETE = route(async (_req, ctx) => {
  const user = await requireApiUser("webhooks.manage");
  await deleteWebhook(user.tenantId, (await ctx.params).id);
  return { ok: true };
});
