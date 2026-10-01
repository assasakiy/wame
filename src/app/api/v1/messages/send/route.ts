import { readJson, route } from "@/shared/lib/http";
import { authenticateApiRequest } from "@/modules/api/presentation/api-auth";
import { sendMessage } from "@/modules/messages/application/message.service";
import { sendMessageSchema } from "@/modules/messages/domain/types";

export const dynamic = "force-dynamic";

/** POST /api/v1/messages/send — text, location or contact messages. */
export const POST = route(async (req) => {
  const { tenantId } = await authenticateApiRequest(req);
  const input = await readJson(req, sendMessageSchema);
  const message = await sendMessage(tenantId, input, "api");
  return Response.json({ id: message.id, status: message.status, to: message.peer, scheduledAt: message.scheduledAt }, { status: 202 });
});
