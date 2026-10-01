import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { createWebhook, webhookInputSchema } from "@/modules/api/application/webhook.service";

export const POST = route(async (req) => {
  const user = await requireApiUser("webhooks.manage");
  return { webhook: await createWebhook(user.tenantId, await readJson(req, webhookInputSchema)) };
});
