import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { createAutomation } from "@/modules/automation/application/automation.service";
import { automationInputSchema } from "@/modules/automation/domain/types";

export const POST = route(async (req) => {
  const user = await requireApiUser("automation.manage");
  return { automation: await createAutomation(user.tenantId, await readJson(req, automationInputSchema)) };
});
