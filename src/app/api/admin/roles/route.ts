import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { createRole, roleInputSchema } from "@/modules/rbac/application/rbac.service";

export const POST = route(async (req) => {
  await requireApiUser("roles.manage");
  return { role: await createRole(await readJson(req, roleInputSchema)) };
});
