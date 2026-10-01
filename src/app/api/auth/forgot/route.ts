import { env } from "@/shared/config/env";
import { clientIp, readJson, route } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import { rateLimit } from "@/shared/lib/rate-limit";
import { requestPasswordReset } from "@/modules/auth/application/auth.service";
import { forgotSchema } from "@/modules/auth/domain/types";

export const POST = route(async (req) => {
  rateLimit(`forgot:${clientIp(req)}`, 5, 60_000);
  const { email } = await readJson(req, forgotSchema);
  const token = await requestPasswordReset(email);
  const link = token ? `${req.nextUrl.origin}/reset-password?token=${token}` : null;
  if (link) await logger.info("auth.reset_link_issued", { email });
  // Never reveal whether the email exists. The link is only exposed when no mail transport is configured.
  return { ok: true, resetLink: env.exposeResetLink ? link : undefined };
});
