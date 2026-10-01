import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { formatDate } from "@/shared/utils/format";
import type { Message } from "@/db/schema";

export interface MessageRow {
  message: Message;
  deviceName: string;
}

function preview(m: Message): string {
  if (m.type === "text") return m.content ?? "";
  const label = `[${m.type}]`;
  return m.content ? `${label} ${m.content}` : `${label} ${m.mediaUrl ?? ""}`;
}

export function MessageTable({ rows }: { rows: MessageRow[] }) {
  return (
    <DataTable
      rows={rows}
      rowKey={(r) => r.message.id}
      emptyTitle="No messages yet"
      emptyDescription="Send your first message or connect a device to receive messages."
      columns={[
        {
          header: "Dir",
          cell: ({ message }) =>
            message.direction === "in" ? <ArrowDownLeft size={16} className="text-sky-600" /> : <ArrowUpRight size={16} className="text-emerald-600" />,
        },
        { header: "Contact", cell: ({ message }) => <span className="font-mono text-xs">{message.peer}</span> },
        { header: "Message", cell: ({ message }) => <span className="line-clamp-2 max-w-xs break-words">{preview(message)}</span> },
        { header: "Device", cell: (r) => r.deviceName },
        { header: "Source", cell: ({ message }) => <span className="text-xs text-slate-500">{message.source}</span> },
        {
          header: "Status",
          cell: ({ message }) => (
            <div>
              <StatusBadge status={message.status} />
              {message.error && <p className="mt-1 max-w-[160px] truncate text-xs text-red-600" title={message.error}>{message.error}</p>}
            </div>
          ),
        },
        {
          header: "Time",
          cell: ({ message }) => (
            <span className="whitespace-nowrap text-xs text-slate-500">
              {formatDate(message.createdAt)}
              {message.scheduledAt && message.status === "pending" && <span className="block text-amber-600">scheduled {formatDate(message.scheduledAt)}</span>}
            </span>
          ),
        },
      ]}
    />
  );
}
