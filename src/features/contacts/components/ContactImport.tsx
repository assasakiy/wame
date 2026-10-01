"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Textarea } from "@/shared/components/Textarea";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function ContactImport() {
  const { run, loading, error } = useApiAction();
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await run<{ imported: number; skipped: number }>("/api/contacts/import", "POST", { csv });
    if (res) {
      setResult(res);
      setCsv("");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      {result && <Alert tone="success">Imported {result.imported}, skipped {result.skipped}.</Alert>}
      <Textarea required value={csv} onChange={(e) => setCsv(e.target.value)} placeholder={"Budi,081234567890,vip|jakarta\nSiti,6285612345678,new"} className="font-mono text-xs" />
      <p className="text-xs text-slate-500">One per line: <code>name,phone,tag1|tag2</code></p>
      <Button type="submit" variant="secondary" disabled={loading} className="w-full">Import contacts</Button>
    </form>
  );
}
