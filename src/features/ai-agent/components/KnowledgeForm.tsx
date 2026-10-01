"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Textarea } from "@/shared/components/Textarea";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function KnowledgeForm() {
  const { run, loading, error } = useApiAction();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (await run("/api/ai/knowledge", "POST", { title, content })) {
      setTitle("");
      setContent("");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <Alert tone="error">{error}</Alert>}
      <Field label="Title"><Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Opening hours" /></Field>
      <Field label="Content"><Textarea required minLength={5} maxLength={4000} value={content} onChange={(e) => setContent(e.target.value)} placeholder="We are open Monday–Saturday, 09:00–17:00 WIB." /></Field>
      <Button type="submit" disabled={loading} className="w-full">Add to knowledge base</Button>
    </form>
  );
}
