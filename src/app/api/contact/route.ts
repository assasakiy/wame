import { z } from "zod";
import { clientIp, readJson, route } from "@/shared/lib/http";
import { logger } from "@/shared/lib/logger";
import { rateLimit } from "@/shared/lib/rate-limit";

const schema = z.object({ name: z.string().min(2).max(80), email: z.string().email(), message: z.string().min(10).max(2000) });

export const POST = route(async (req) => {
  rateLimit(`contact:${clientIp(req)}`, 5, 60_000);
  const input = await readJson(req, schema);
  await logger.info("contact.submitted", input);
  return { ok: true };
});
