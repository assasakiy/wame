"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function LoginForm() {
  const router = useRouter();
  const { run, loading, error } = useApiAction();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await run("/api/auth/login", "POST", { email, password }, { refresh: false });
    if (res) router.push("/dashboard");
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage your WhatsApp gateway.</p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      <Field label="Email">
        <Input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
      </Field>
      <Field label="Password">
        <Input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <div className="text-right text-xs">
        <Link href="/forgot-password" className="text-emerald-600 hover:underline">Forgot password?</Link>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      <p className="text-center text-sm text-slate-500">
        No account? <Link href="/register" className="font-medium text-emerald-600 hover:underline">Create one</Link>
      </p>
    </form>
  );
}
