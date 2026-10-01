import { readJson, route } from "@/shared/lib/http";
import { rateLimit } from "@/shared/lib/rate-limit";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { chatInputSchema, chatWithAgent } from "@/modules/ai-agent/application/agent.service";

export const POST = route(async (req) => {
  const user = await requireApiUser("ai.use");
  rateLimit(`ai:${user.id}`, 30, 60_000);
  const { agent, message } = await readJson(req, chatInputSchema);
  return chatWithAgent(user, agent, message);
});
