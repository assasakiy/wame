import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { contactInputSchema, createContact } from "@/modules/messages/application/contact.service";

export const POST = route(async (req) => {
  const user = await requireApiUser("contacts.manage");
  return { contact: await createContact(user.tenantId, await readJson(req, contactInputSchema)) };
});
