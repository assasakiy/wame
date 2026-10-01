import { AppError } from "@/shared/lib/http";
import { rateLimit } from "@/shared/lib/rate-limit";
import { findActiveKey, touchApiKey } from "@/modules/api/application/api-key.service";
import { getSubscription } from "@/modules/subscription/application/subscription.service";

/** Authenticates a developer-API request (`x-api-key` or `Authorization: Bearer`) and applies the plan's rate limit. */
export async function authenticateApiRequest(req: Request): Promise<{ tenantId: string }> {
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const raw = req.headers.get("x-api-key") ?? bearer;
  if (!raw) throw new AppError("Missing API key. Send it in the x-api-key header.", 401, "unauthorized");
  const key = await findActiveKey(raw);
  if (!key) throw new AppError("Invalid or revoked API key", 401, "unauthorized");
  const sub = await getSubscription(key.tenantId);
  if (!sub.limits.apiAccess) throw new AppError(`API access is not included in the ${sub.plan.name} plan`, 403, "plan_feature");
  rateLimit(`api:${key.id}`, sub.limits.apiRatePerMinute, 60_000);
  void touchApiKey(key.id);
  return { tenantId: key.tenantId };
}
