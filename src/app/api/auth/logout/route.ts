import { route } from "@/shared/lib/http";
import { logout } from "@/modules/auth/application/auth.service";
import { clearSessionCookie, readSessionToken } from "@/modules/auth/presentation/session-cookie";

export const POST = route(async () => {
  const token = await readSessionToken();
  if (token) await logout(token);
  await clearSessionCookie();
  return { ok: true };
});
