import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { agentConfigSchema, saveCustomerServiceConfig } from "@/modules/ai-agent/application/agent.service";

export const PUT = route(async (req) => {
  const user = await requireApiUser("ai.use");
  await saveCustomerServiceConfig(user.tenantId, await readJson(req, agentConfigSchema));
  return { ok: true };
});
