import { route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { deleteKnowledge } from "@/modules/ai-agent/application/knowledge.service";

export const DELETE = route(async (_req, ctx) => {
  const user = await requireApiUser("ai.use");
  await deleteKnowledge(user.tenantId, (await ctx.params).id);
  return { ok: true };
});
