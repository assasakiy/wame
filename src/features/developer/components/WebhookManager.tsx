"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { CopyButton } from "@/shared/components/CopyButton";
import { DataTable } from "@/shared/components/DataTable";
import { DeleteButton } from "@/shared/components/DeleteButton";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { useApiAction } from "@/shared/hooks/useApiAction";
import { timeAgo } from "@/shared/utils/format";

interface HookRow {
  id: string;
  url: string;
  events: string[];
  secret: string;
  lastStatus: number | null;
  lastDeliveryAt: Date | null;
}

export function WebhookManager({ hooks, eventTypes, locked }: { hooks: HookRow[]; eventTypes: string[]; locked: boolean }) {
  const { run, loading, error } = useApiAction();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["message.received"]);

  const toggle = (ev: string) => setEvents((list) => (list.includes(ev) ? list.filter((e) => e !== ev) : [...list, ev]));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (await run("/api/webhooks", "POST", { url, events })) setUrl("");
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="space-y-4 px-5 pt-5">
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="Endpoint URL"><Input required type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-app.com/wame/webhook" disabled={locked} /></Field>
        <div>
          <p className="mb-2 text-xs font-medium text-slate-700">Events</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {eventTypes.map((ev) => (
              <label key={ev} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={events.includes(ev)} onChange={() => toggle(ev)} disabled={locked} /> {ev}
              </label>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={loading || locked || !events.length}>Add webhook</Button>
      </form>
      <DataTable
        rows={hooks}
        rowKey={(h) => h.id}
        emptyTitle="No webhooks configured"
        columns={[
          { header: "Endpoint", cell: (h) => <span className="break-all text-xs font-medium text-slate-900">{h.url}</span> },
          { header: "Events", cell: (h) => <span className="text-xs">{h.events.join(", ")}</span> },
          { header: "Last delivery", cell: (h) => <div className="text-xs">{h.lastStatus ? <StatusBadge status={h.lastStatus >= 200 && h.lastStatus < 300 ? "delivered" : "failed"} /> : "—"} <span className="text-slate-500">{timeAgo(h.lastDeliveryAt)}</span></div> },
          { header: "Secret", cell: (h) => <CopyButton value={h.secret} /> },
          { header: "", cell: (h) => <DeleteButton path={`/api/webhooks/${h.id}`} label="" confirm="Delete this webhook?" /> },
        ]}
      />
    </div>
  );
}
