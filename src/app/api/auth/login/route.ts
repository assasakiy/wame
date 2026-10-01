import { clientIp, readJson, route } from "@/shared/lib/http";
import { rateLimit } from "@/shared/lib/rate-limit";
import { login } from "@/modules/auth/application/auth.service";
import { loginSchema } from "@/modules/auth/domain/types";
import { setSessionCookie } from "@/modules/auth/presentation/session-cookie";

export const POST = route(async (req) => {
  const ip = clientIp(req);
  rateLimit(`login:${ip}`, 10, 60_000);
  const { email, password } = await readJson(req, loginSchema);
  const session = await login(email, password, { ip, userAgent: req.headers.get("user-agent") });
  await setSessionCookie(session);
  return { ok: true };
});
