"use client";

import { Plus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Button } from "@/shared/components/Button";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { Modal } from "@/shared/components/Modal";
import { Select } from "@/shared/components/Select";
import { useApiAction } from "@/shared/hooks/useApiAction";

export function AddDeviceButton() {
  const { run, loading, error, setError } = useApiAction();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("personal");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const res = await run("/api/devices", "POST", { name, type });
    if (res) {
      setOpen(false);
      setName("");
    }
  }

  return (
    <>
      <Button onClick={() => { setError(null); setOpen(true); }}><Plus size={16} /> Add device</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add WhatsApp device">
        <form onSubmit={submit} className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Field label="Device name"><Input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer support" /></Field>
          <Field label="Account type">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="personal">WhatsApp Personal</option>
              <option value="business">WhatsApp Business</option>
            </Select>
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Adding…" : "Add device"}</Button>
        </form>
      </Modal>
    </>
  );
}
