"use client";

import { Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Select } from "@/shared/components/Select";
import { Textarea } from "@/shared/components/Textarea";
import { useApiAction } from "@/shared/hooks/useApiAction";

const TYPES = ["text", "image", "video", "document", "audio", "location", "contact"] as const;
const initial = { type: "text", to: "", text: "", mediaUrl: "", fileName: "", latitude: "", longitude: "", contactName: "", contactPhone: "", scheduledAt: "" };

export function SendMessageForm({ devices }: { devices: { id: string; name: string }[] }) {
  const { run, loading, error } = useApiAction();
  const [deviceId, setDeviceId] = useState(devices[0]?.id ?? "");
  const [f, setF] = useState(initial);
  const [ok, setOk] = useState(false);
  const set = (k: keyof typeof initial) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));
  const isMedia = ["image", "video", "document", "audio"].includes(f.type);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setOk(false);
    const body: Record<string, unknown> = { deviceId, to: f.to, type: f.type };
    if (f.text) body.text = f.text;
    if (isMedia) Object.assign(body, { mediaUrl: f.mediaUrl, ...(f.fileName ? { fileName: f.fileName } : {}) });
    if (f.type === "location") Object.assign(body, { latitude: Number(f.latitude), longitude: Number(f.longitude) });
    if (f.type === "contact") Object.assign(body, { contactName: f.contactName, contactPhone: f.contactPhone });
    if (f.scheduledAt) body.scheduledAt = new Date(f.scheduledAt).toISOString();
    const res = await run("/api/messages", "POST", body);
    if (res) {
      setOk(true);
      setF((s) => ({ ...initial, type: s.type, to: s.to }));
    }
  }

  if (!devices.length) return <Alert tone="info">Connect a WhatsApp device first to send messages.</Alert>;

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      {error && <div className="sm:col-span-2"><Alert tone="error">{error}</Alert></div>}
      {ok && <div className="sm:col-span-2"><Alert tone="success">Message queued.</Alert></div>}
      <Field label="From device">
        <Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
          {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </Field>
      <Field label="Type">
        <Select value={f.type} onChange={set("type")}>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</Select>
      </Field>
      <Field label="To" hint="Phone number (0812… or 62812…) or group JID ending in @g.us">
        <Input required value={f.to} onChange={set("to")} placeholder="6281234567890" />
      </Field>
      <Field label="Schedule (optional)">
        <Input type="datetime-local" value={f.scheduledAt} onChange={set("scheduledAt")} />
      </Field>
      {isMedia && (
        <>
          <Field label="Media URL"><Input required type="url" value={f.mediaUrl} onChange={set("mediaUrl")} placeholder="https://…" /></Field>
          {f.type === "document" && <Field label="File name"><Input value={f.fileName} onChange={set("fileName")} placeholder="invoice.pdf" /></Field>}
        </>
      )}
      {f.type === "location" && (
        <>
          <Field label="Latitude"><Input required type="number" step="any" value={f.latitude} onChange={set("latitude")} /></Field>
          <Field label="Longitude"><Input required type="number" step="any" value={f.longitude} onChange={set("longitude")} /></Field>
        </>
      )}
      {f.type === "contact" && (
        <>
          <Field label="Contact name"><Input required value={f.contactName} onChange={set("contactName")} /></Field>
          <Field label="Contact phone"><Input required value={f.contactPhone} onChange={set("contactPhone")} /></Field>
        </>
      )}
      {f.type !== "contact" && (
        <div className="sm:col-span-2">
          <Field label={f.type === "text" ? "Message" : "Caption / label (optional)"}>
            <Textarea required={f.type === "text"} value={f.text} onChange={set("text")} maxLength={4096} />
          </Field>
        </div>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={loading}><Send size={16} /> {f.scheduledAt ? "Schedule message" : "Send message"}</Button>
      </div>
    </form>
  );
}
