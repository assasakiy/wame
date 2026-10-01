import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { addKnowledge, knowledgeInputSchema } from "@/modules/ai-agent/application/knowledge.service";

export const POST = route(async (req) => {
  const user = await requireApiUser("ai.use");
  return { entry: await addKnowledge(user.tenantId, await readJson(req, knowledgeInputSchema)) };
});
