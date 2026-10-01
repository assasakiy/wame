"use client";

import { KeyRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { CopyButton } from "@/shared/components/CopyButton";
import { DataTable } from "@/shared/components/DataTable";
import { Input } from "@/shared/components/Input";
import { useApiAction } from "@/shared/hooks/useApiAction";
import { formatDate, timeAgo } from "@/shared/utils/format";

interface KeyRow {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export function ApiKeyManager({ keys, locked }: { keys: KeyRow[]; locked: boolean }) {
  const { run, loading, error } = useApiAction();
  const [name, setName] = useState("");
  const [created, setCreated] = useState<string | null>(null);

  async function create(e: FormEvent) {
    e.preventDefault();
    const res = await run<{ key: string }>("/api/api-keys", "POST", { name });
    if (res) {
      setCreated(res.key);
      setName("");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={create} className="flex flex-col gap-2 px-5 pt-5 sm:flex-row">
        <Input required minLength={2} placeholder="Key name, e.g. Production backend" value={name} onChange={(e) => setName(e.target.value)} disabled={locked} />
        <Button type="submit" disabled={loading || locked}><KeyRound size={16} /> Create key</Button>
      </form>
      <div className="space-y-3 px-5">
        {error && <Alert tone="error">{error}</Alert>}
        {created && (
          <Alert tone="success">
            <p className="mb-2 font-medium">Copy your key now — it won&apos;t be shown again.</p>
            <div className="flex flex-wrap items-center gap-2">
              <code className="break-all rounded bg-white/70 px-2 py-1 text-xs">{created}</code>
              <CopyButton value={created} />
            </div>
          </Alert>
        )}
      </div>
      <DataTable
        rows={keys}
        rowKey={(k) => k.id}
        emptyTitle="No API keys"
        columns={[
          { header: "Name", cell: (k) => <span className="font-medium text-slate-900">{k.name}</span> },
          { header: "Key", cell: (k) => <code className="text-xs">{k.prefix}…</code> },
          { header: "Last used", cell: (k) => <span className="text-xs text-slate-500">{timeAgo(k.lastUsedAt)}</span> },
          { header: "Created", cell: (k) => <span className="text-xs text-slate-500">{formatDate(k.createdAt)}</span> },
          {
            header: "",
            cell: (k) =>
              k.revokedAt ? <Badge tone="red">revoked</Badge> : (
                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => window.confirm("Revoke this key? Apps using it will stop working.") && void run(`/api/api-keys/${k.id}`, "DELETE")}>Revoke</Button>
              ),
          },
        ]}
      />
    </div>
  );
}
