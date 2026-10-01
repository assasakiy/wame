import { StatusBadge } from "@/shared/components/StatusBadge";
import { EmptyState } from "@/shared/components/EmptyState";
import { timeAgo } from "@/shared/utils/format";
import type { MessageRow } from "@/features/messages/components/MessageTable";

export function RecentMessages({ rows }: { rows: MessageRow[] }) {
  if (!rows.length) return <EmptyState title="No activity yet" description="Messages will appear here in realtime." />;
  return (
    <ul className="divide-y divide-slate-100">
      {rows.map(({ message: m }) => (
        <li key={m.id} className="flex items-center justify-between gap-3 px-5 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{m.direction === "in" ? "←" : "→"} {m.peer}</p>
            <p className="truncate text-xs text-slate-500">{m.content ?? `[${m.type}]`}</p>
          </div>
          <div className="shrink-0 text-right">
            <StatusBadge status={m.status} />
            <p className="mt-1 text-[11px] text-slate-400">{timeAgo(m.createdAt)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
