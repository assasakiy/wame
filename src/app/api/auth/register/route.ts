import { clientIp, readJson, route } from "@/shared/lib/http";
import { rateLimit } from "@/shared/lib/rate-limit";
import { register } from "@/modules/auth/application/auth.service";
import { registerSchema } from "@/modules/auth/domain/types";
import { setSessionCookie } from "@/modules/auth/presentation/session-cookie";

export const POST = route(async (req) => {
  const ip = clientIp(req);
  rateLimit(`register:${ip}`, 10, 60_000);
  const input = await readJson(req, registerSchema);
  const session = await register(input, { ip, userAgent: req.headers.get("user-agent") });
  await setSessionCookie(session);
  return { ok: true };
});
