"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function PasswordForm() {
  const { run, loading, error } = useApiAction();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [saved, setSaved] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    if (await run("/api/settings/password", "POST", { currentPassword, newPassword }, { refresh: false })) {
      setSaved(true);
      setCurrent("");
      setNew("");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {saved && <Alert tone="success">Password changed.</Alert>}
      <Field label="Current password"><Input type="password" required autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} /></Field>
      <Field label="New password" hint="At least 8 characters"><Input type="password" required minLength={8} autoComplete="new-password" value={newPassword} onChange={(e) => setNew(e.target.value)} /></Field>
      <Button type="submit" disabled={loading}>Change password</Button>
    </form>
  );
}
