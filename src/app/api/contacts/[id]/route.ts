import { route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { deleteContact } from "@/modules/messages/application/contact.service";

export const DELETE = route(async (_req, ctx) => {
  const user = await requireApiUser("contacts.manage");
  await deleteContact(user.tenantId, (await ctx.params).id);
  return { ok: true };
});
