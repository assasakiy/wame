"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function RegisterForm() {
  const router = useRouter();
  const { run, loading, error } = useApiAction();
  const [form, setForm] = useState({ name: "", email: "", workspace: "", password: "" });
  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const body = { ...form, workspace: form.workspace || undefined };
    const res = await run("/api/auth/register", "POST", body, { refresh: false });
    if (res) router.push("/dashboard");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Create your WAME account</h1>
        <p className="mt-1 text-sm text-slate-500">Start free. No credit card required.</p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <Field label="Full name"><Input required value={form.name} onChange={set("name")} autoComplete="name" /></Field>
      <Field label="Email"><Input type="email" required value={form.email} onChange={set("email")} autoComplete="email" /></Field>
      <Field label="Workspace name" hint="Optional — your company or project"><Input value={form.workspace} onChange={set("workspace")} /></Field>
      <Field label="Password" hint="At least 8 characters"><Input type="password" required minLength={8} value={form.password} onChange={set("password")} autoComplete="new-password" /></Field>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating account…" : "Create account"}</Button>
      <p className="text-center text-sm text-slate-500">
        Already registered? <Link href="/login" className="font-medium text-emerald-600 hover:underline">Sign in</Link>
      </p>
    </form>
  );
}
