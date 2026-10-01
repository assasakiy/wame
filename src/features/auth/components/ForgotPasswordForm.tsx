"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function ForgotPasswordForm() {
  const { run, loading, error } = useApiAction();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await run<{ resetLink?: string | null }>("/api/auth/forgot", "POST", { email }, { refresh: false });
    if (res) {
      setDone(true);
      setLink(res.resetLink ?? null);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Reset your password</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your email and we&apos;ll send a reset link.</p>
      </div>
      {error && <Alert tone="error">{error}</Alert>}
      {done && (
        <Alert tone="success">
          If the account exists, a reset link has been issued.
          {link && (
            <>
              {" "}No mail transport is configured, so use this link: <Link href={link} className="break-all font-medium underline">{link}</Link>
            </>
          )}
        </Alert>
      )}
      <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Button>
      <p className="text-center text-sm"><Link href="/login" className="text-emerald-600 hover:underline">Back to sign in</Link></p>
    </form>
  );
}
