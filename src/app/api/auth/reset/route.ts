import { readJson, route } from "@/shared/lib/http";
import { resetPassword } from "@/modules/auth/application/auth.service";
import { resetSchema } from "@/modules/auth/domain/types";

export const POST = route(async (req) => {
  const { token, password } = await readJson(req, resetSchema);
  await resetPassword(token, password);
  return { ok: true };
});
