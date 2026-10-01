"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function ContactForm() {
  const { run, loading, error } = useApiAction();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (await run("/api/contact", "POST", form, { refresh: false })) {
      setSent(true);
      setForm({ name: "", email: "", message: "" });
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {sent && <Alert tone="success">Thanks! We&apos;ll get back to you shortly.</Alert>}
      <Field label="Name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <Field label="Message"><Textarea required minLength={10} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending…" : "Send message"}</Button>
    </form>
  );
}
