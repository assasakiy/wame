"use client";

import { Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Select } from "@/shared/components/Select";
import { Textarea } from "@/shared/components/Textarea";
import { useApiAction } from "@/shared/hooks/useApiAction";

type ActionDraft = { type: "send_message" | "add_tag" | "call_webhook" | "ai_reply"; value: string };

function toAction(a: ActionDraft) {
  switch (a.type) {
    case "send_message": return { type: a.type, text: a.value };
    case "add_tag": return { type: a.type, tag: a.value };
    case "call_webhook": return { type: a.type, url: a.value };
    case "ai_reply": return { type: a.type };
  }
}

export function AutomationForm() {
  const { run, loading, error } = useApiAction();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"auto_reply" | "workflow">("auto_reply");
  const [match, setMatch] = useState("contains");
  const [value, setValue] = useState("");
  const [useHours, setUseHours] = useState(false);
  const [hours, setHours] = useState({ from: "9", to: "17" });
  const [tag, setTag] = useState("");
  const [actions, setActions] = useState<ActionDraft[]>([{ type: "send_message", value: "" }]);

  const patch = (i: number, p: Partial<ActionDraft>) => setActions((list) => list.map((a, idx) => (idx === i ? { ...a, ...p } : a)));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const conditions = [
      ...(useHours ? [{ type: "time_between", from: Number(hours.from), to: Number(hours.to) }] : []),
      ...(tag ? [{ type: "has_tag", value: tag }] : []),
    ];
    const body = { name, kind, trigger: { type: "keyword", match, value }, conditions, actions: (kind === "auto_reply" ? actions.slice(0, 1) : actions).map(toAction) };
    if (await run("/api/automations", "POST", body)) {
      setName(""); setValue(""); setActions([{ type: "send_message", value: "" }]);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name"><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Pricing reply" /></Field>
        <Field label="Type">
          <Select value={kind} onChange={(e) => { setKind(e.target.value as typeof kind); setActions([{ type: "send_message", value: "" }]); }}>
            <option value="auto_reply">Auto reply (keyword → response)</option>
            <option value="workflow">Workflow (trigger → conditions → actions)</option>
          </Select>
        </Field>
      </div>

      <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">1 · Trigger — when a message arrives</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Match type">
            <Select value={match} onChange={(e) => setMatch(e.target.value)}>
              <option value="contains">contains</option>
              <option value="exact">is exactly</option>
              <option value="starts_with">starts with</option>
              <option value="regex">regex pattern (Plus)</option>
              <option value="any">any message</option>
            </Select>
          </Field>
          {match !== "any" && <Field label="Keyword / pattern"><Input required value={value} onChange={(e) => setValue(e.target.value)} placeholder={match === "regex" ? "^(harga|price)\\b" : "harga"} /></Field>}
        </div>
      </fieldset>

      {kind === "workflow" && (
        <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">2 · Conditions (optional)</legend>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={useHours} onChange={(e) => setUseHours(e.target.checked)} /> Only between hours</label>
          {useHours && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="From (0–23)"><Input type="number" min={0} max={23} value={hours.from} onChange={(e) => setHours({ ...hours, from: e.target.value })} /></Field>
              <Field label="To (0–23)"><Input type="number" min={0} max={23} value={hours.to} onChange={(e) => setHours({ ...hours, to: e.target.value })} /></Field>
            </div>
          )}
          <Field label="Contact must have tag"><Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="vip" /></Field>
        </fieldset>
      )}

      <fieldset className="space-y-3 rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{kind === "workflow" ? "3 · Actions" : "2 · Response"}</legend>
        {actions.map((a, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            {kind === "workflow" && (
              <Select className="sm:w-48" value={a.type} onChange={(e) => patch(i, { type: e.target.value as ActionDraft["type"], value: "" })}>
                <option value="send_message">Send message</option>
                <option value="add_tag">Add tag to contact</option>
                <option value="call_webhook">Call webhook (Plus)</option>
                <option value="ai_reply">AI reply (Plus)</option>
              </Select>
            )}
            {a.type === "send_message" && <Textarea required className="min-h-20 flex-1" value={a.value} onChange={(e) => patch(i, { value: e.target.value })} placeholder="Hi {{name}}! Our plans start at Rp149.000." />}
            {a.type === "add_tag" && <Input required className="flex-1" value={a.value} onChange={(e) => patch(i, { value: e.target.value })} placeholder="interested" />}
            {a.type === "call_webhook" && <Input required type="url" className="flex-1" value={a.value} onChange={(e) => patch(i, { value: e.target.value })} placeholder="https://example.com/hook" />}
            {a.type === "ai_reply" && <p className="flex-1 self-center text-sm text-slate-500">The customer-service AI answers using your knowledge base.</p>}
            {kind === "workflow" && actions.length > 1 && <Button variant="ghost" size="sm" aria-label="Remove action" onClick={() => setActions((l) => l.filter((_, idx) => idx !== i))}><X size={14} /></Button>}
          </div>
        ))}
        {kind === "workflow" && actions.length < 10 && <Button variant="secondary" size="sm" onClick={() => setActions((l) => [...l, { type: "send_message", value: "" }])}><Plus size={14} /> Add action</Button>}
        <p className="text-xs text-slate-500">Variables: {"{{name}} {{phone}} {{text}}"}</p>
      </fieldset>
      <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Create automation"}</Button>
    </form>
  );
}
