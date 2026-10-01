import { readJson, route } from "@/shared/lib/http";
import { requireApiUser } from "@/modules/auth/presentation/guards";
import { listMessages, sendMessage } from "@/modules/messages/application/message.service";
import { sendMessageSchema } from "@/modules/messages/domain/types";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const user = await requireApiUser("messages.read");
  const q = req.nextUrl.searchParams;
  const rows = await listMessages(user.tenantId, { limit: Number(q.get("limit")) || 50, status: q.get("status") ?? undefined, direction: q.get("direction") ?? undefined });
  return { messages: rows.map((r) => ({ ...r.message, deviceName: r.deviceName })) };
});

export const POST = route(async (req) => {
  const user = await requireApiUser("messages.send");
  const input = await readJson(req, sendMessageSchema);
  return { message: await sendMessage(user.tenantId, input, "dashboard") };
});
