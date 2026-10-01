import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { changePassword } from "@/modules/auth/application/auth.service";
import { passwordChangeSchema } from "@/modules/auth/domain/types";

export const POST = route(async (req) => {
  const user = await requireApiUser("settings.manage");
  const { currentPassword, newPassword } = await readJson(req, passwordChangeSchema);
  await changePassword(user.id, currentPassword, newPassword);
  return { ok: true };
});
