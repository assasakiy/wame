"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Select } from "@/shared/components/Select";
import { Textarea } from "@/shared/components/Textarea";
import { useApiAction } from "@/shared/hooks/useApiAction";

interface Props {
  config: { enabled: boolean; deviceId: string | null; customPrompt: string };
  devices: { id: string; name: string }[];
}

export function CustomerServiceSettings({ config, devices }: Props) {
  const { run, loading, error } = useApiAction();
  const [enabled, setEnabled] = useState(config.enabled);
  const [deviceId, setDeviceId] = useState(config.deviceId ?? "");
  const [customPrompt, setCustomPrompt] = useState(config.customPrompt);
  const [saved, setSaved] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    if (await run("/api/ai/agent", "PUT", { enabled, deviceId: deviceId || null, customPrompt })) setSaved(true);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {saved && <Alert tone="success">Saved.</Alert>}
      <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> Auto-answer customer chats with AI
      </label>
      <p className="text-xs text-slate-500">Applies to inbound messages that no automation rule answered.</p>
      <Field label="Device">
        <Select value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
          <option value="">All devices</option>
          {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </Field>
      <Field label="Extra instructions (tone, rules)"><Textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} maxLength={2000} placeholder="Always greet by name. Never promise delivery dates." /></Field>
      <Button type="submit" disabled={loading} className="w-full">Save settings</Button>
    </form>
  );
}
