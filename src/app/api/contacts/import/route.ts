import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { importContacts, importSchema } from "@/modules/messages/application/contact.service";

export const POST = route(async (req) => {
  const user = await requireApiUser("contacts.manage");
  const { csv } = await readJson(req, importSchema);
  return importContacts(user.tenantId, csv);
});
