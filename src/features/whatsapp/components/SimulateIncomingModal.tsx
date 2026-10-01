"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Modal } from "@/shared/components/Modal";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function SimulateIncomingModal({ deviceId, open, onClose }: { deviceId: string; open: boolean; onClose: () => void }) {
  const { run, loading, error } = useApiAction();
  const [from, setFrom] = useState("6285551234567");
  const [name, setName] = useState("Test Customer");
  const [text, setText] = useState("halo, berapa harga paketnya?");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await run(`/api/devices/${deviceId}`, "POST", { action: "simulate_incoming", from, text, name });
    if (res) onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Simulate incoming message">
      <form onSubmit={submit} className="space-y-4">
        <Alert tone="info">Injects an inbound message to test auto-replies, workflows, webhooks and the AI agent.</Alert>
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="From number"><Input required value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
        <Field label="Contact name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Message"><Input required value={text} onChange={(e) => setText(e.target.value)} /></Field>
        <Button type="submit" className="w-full" disabled={loading}>Send to device</Button>
      </form>
    </Modal>
  );
}
