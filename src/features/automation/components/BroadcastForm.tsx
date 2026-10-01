"use client";

import { Megaphone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Select } from "@/shared/components/Select";
import { Textarea } from "@/shared/components/Textarea";
import { useApiAction } from "@/shared/hooks/useApiAction";

interface Props {
  devices: { id: string; name: string }[];
  segments: { tag: string; count: number }[];
  totalContacts: number;
}

export function BroadcastForm({ devices, segments, totalContacts }: Props) {
  const { run, loading, error } = useApiAction();
  const [f, setF] = useState({ name: "", deviceId: devices[0]?.id ?? "", segmentTag: "", message: "", rate: "20", scheduledAt: "" });
  const [ok, setOk] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setOk(false);
    const body = {
      name: f.name, deviceId: f.deviceId, message: f.message, ratePerMinute: Number(f.rate),
      ...(f.segmentTag ? { segmentTag: f.segmentTag } : {}),
      ...(f.scheduledAt ? { scheduledAt: new Date(f.scheduledAt).toISOString() } : {}),
    };
    if (await run("/api/broadcasts", "POST", body)) {
      setOk(true);
      setF((s) => ({ ...s, name: "", message: "" }));
    }
  }

  if (!devices.length) return <Alert tone="info">Connect a WhatsApp device before creating a broadcast.</Alert>;
  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {error && <div className="sm:col-span-2"><Alert tone="error">{error}</Alert></div>}
      {ok && <div className="sm:col-span-2"><Alert tone="success">Broadcast queued. Messages are sent at the configured rate.</Alert></div>}
      <Field label="Campaign name"><Input required value={f.name} onChange={set("name")} placeholder="Ramadan promo" /></Field>
      <Field label="Send from">
        <Select value={f.deviceId} onChange={set("deviceId")}>{devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</Select>
      </Field>
      <Field label="Audience (segment)">
        <Select value={f.segmentTag} onChange={set("segmentTag")}>
          <option value="">All contacts ({totalContacts})</option>
          {segments.map((s) => <option key={s.tag} value={s.tag}>{s.tag} ({s.count})</option>)}
        </Select>
      </Field>
      <Field label="Rate limit (messages / minute)"><Input type="number" min={1} max={120} required value={f.rate} onChange={set("rate")} /></Field>
      <div className="sm:col-span-2">
        <Field label="Message" hint="Use {{name}} and {{phone}} to personalise.">
          <Textarea required value={f.message} onChange={set("message")} placeholder="Hi {{name}}, enjoy 20% off this week!" maxLength={4096} />
        </Field>
      </div>
      <Field label="Schedule start (optional)"><Input type="datetime-local" value={f.scheduledAt} onChange={set("scheduledAt")} /></Field>
      <div className="flex items-end"><Button type="submit" disabled={loading} className="w-full sm:w-auto"><Megaphone size={16} /> {f.scheduledAt ? "Schedule campaign" : "Start broadcast"}</Button></div>
    </form>
  );
}
