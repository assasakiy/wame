import { route } from "@/shared/lib/http";
import { bus, type WameEvent } from "@/shared/lib/events";
import { requireApiUser } from "@/modules/auth/presentation/guards";

export const dynamic = "force-dynamic";

/** Server-Sent Events stream of the caller's tenant events (device.*, message.*, qr.updated, ...). */
export const GET = route(async (req) => {
  const user = await requireApiUser();
  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      const send = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          cleanup();
        }
      };
      const listener = (event: WameEvent) => {
        if (event.tenantId === user.tenantId) send(`data: ${JSON.stringify(event)}\n\n`);
      };
      const ping = setInterval(() => send(": ping\n\n"), 20_000);
      bus.on("event", listener);
      cleanup = () => {
        clearInterval(ping);
        bus.off("event", listener);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };
      req.signal.addEventListener("abort", cleanup);
      send(": connected\n\n");
    },
    cancel() {
      cleanup();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" },
  });
});
