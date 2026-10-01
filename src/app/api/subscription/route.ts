import { z } from "zod";
import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { changePlan } from "@/modules/subscription/application/subscription.service";

export const POST = route(async (req) => {
  const user = await requireApiUser("billing.view");
  const { plan } = await readJson(req, z.object({ plan: z.enum(["FREE", "PRO", "PLUS"]) }));
  const sub = await changePlan(user.tenantId, plan, { id: user.id });
  return { plan: sub.planCode, currentPeriodEnd: sub.currentPeriodEnd };
});
