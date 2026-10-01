"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function ContactForm() {
  const { run, loading, error } = useApiAction();
  const [form, setForm] = useState({ name: "", phone: "", tags: "" });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const res = await run("/api/contacts", "POST", { name: form.name, phone: form.phone, tags });
    if (res) setForm({ name: "", phone: "", tags: "" });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Phone"><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0812…" /></Field>
      <Field label="Tags" hint="Comma separated, used for segmentation"><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="vip, jakarta" /></Field>
      <Button type="submit" disabled={loading} className="w-full">Add contact</Button>
    </form>
  );
}
