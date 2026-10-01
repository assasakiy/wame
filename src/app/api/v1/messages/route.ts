import { route } from "@/shared/lib/http";
import { authenticateApiRequest } from "@/modules/api/presentation/api-auth";
import { listMessages } from "@/modules/messages/application/message.service";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { tenantId } = await authenticateApiRequest(req);
  const q = req.nextUrl.searchParams;
  const rows = await listMessages(tenantId, { limit: Number(q.get("limit")) || 50, status: q.get("status") ?? undefined, direction: q.get("direction") ?? undefined });
  return {
    messages: rows.map(({ message: m }) => ({
      id: m.id, direction: m.direction, peer: m.peer, type: m.type, content: m.content, status: m.status, error: m.error, createdAt: m.createdAt, sentAt: m.sentAt, deliveredAt: m.deliveredAt,
    })),
  };
});
