import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { profileSchema, updateProfile } from "@/modules/users/application/profile.service";

export const PATCH = route(async (req) => {
  const user = await requireApiUser("settings.manage");
  await updateProfile(user.id, user.tenantId, await readJson(req, profileSchema));
  return { ok: true };
});
