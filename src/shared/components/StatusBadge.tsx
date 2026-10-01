import { Badge, type BadgeTone } from "@/shared/components/Badge";

const TONES: Record<string, BadgeTone> = {
  connected: "green", healthy: "green", delivered: "green", paid: "green", active: "green", completed: "green", info: "green", sent: "blue", received: "blue", running: "blue",
  connecting: "yellow", qr_pending: "yellow", pending: "yellow", sending: "yellow", degraded: "yellow", scheduled: "yellow", warn: "yellow",
  failed: "red", error: "red", suspended: "red", logged_out: "red", expired: "red",
  disconnected: "gray", offline: "gray",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={TONES[status] ?? "gray"}>{status.replace("_", " ")}</Badge>;
}
