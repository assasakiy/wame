"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { run, loading, error } = useApiAction();
  const [password, setPassword] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await run("/api/auth/reset", "POST", { token, password }, { refresh: false });
    if (res) router.push("/login");
  }

  if (!token) return <Alert tone="error">Missing reset token. <Link href="/forgot-password" className="underline">Request a new link</Link>.</Alert>;
  return (
    <form onSubmit={submit} className="space-y-4">
      <h1 className="text-xl font-semibold">Choose a new password</h1>
      {error && <Alert tone="error">{error}</Alert>}
      <Field label="New password" hint="At least 8 characters"><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "Saving…" : "Update password"}</Button>
    </form>
  );
}
