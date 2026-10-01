"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function ProfileForm({ name: initialName, workspace: initialWorkspace, email }: { name: string; workspace: string; email: string }) {
  const { run, loading, error } = useApiAction();
  const [name, setName] = useState(initialName);
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [saved, setSaved] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    if (await run("/api/settings", "PATCH", { name, workspace })) setSaved(true);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {saved && <Alert tone="success">Profile updated.</Alert>}
      <Field label="Email"><Input value={email} disabled readOnly /></Field>
      <Field label="Full name"><Input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="Workspace"><Input required minLength={2} value={workspace} onChange={(e) => setWorkspace(e.target.value)} /></Field>
      <Button type="submit" disabled={loading}>Save changes</Button>
    </form>
  );
}
