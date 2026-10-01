import { AppError, clientIp, route } from "@/shared/lib/http";
import { rotateSession } from "@/modules/auth/application/auth.service";
import { readSessionToken, setSessionCookie } from "@/modules/auth/presentation/session-cookie";

export const POST = route(async (req) => {
  const token = await readSessionToken();
  const session = token ? await rotateSession(token, { ip: clientIp(req), userAgent: req.headers.get("user-agent") }) : null;
  if (!session) throw new AppError("Session expired", 401, "unauthorized");
  await setSessionCookie(session);
  return { ok: true, expiresAt: session.expiresAt };
});
