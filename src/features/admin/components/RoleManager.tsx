"use client";

import { useState, type FormEvent } from "react";
import { Alert } from "@/shared/components/Alert";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { Card } from "@/shared/components/Card";
import { Field } from "@/shared/components/Field";
import { Input } from "@/shared/components/Input";
import { useApiAction } from "@/shared/hooks/useApiAction";

interface RoleView {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  users: number;
  permissions: string[];
}

interface Props {
  roles: RoleView[];
  permissions: { key: string; description: string }[];
  canEditPermissions: boolean;
  canManageRoles: boolean;
}

function RoleCard({ role, permissions, canEditPermissions, canManageRoles }: { role: RoleView } & Omit<Props, "roles">) {
  const { run, loading, error } = useApiAction();
  const [selected, setSelected] = useState(role.permissions);
  const [saved, setSaved] = useState(false);
  const locked = role.name === "SUPER_ADMIN" || !canEditPermissions;
  const toggle = (key: string) => setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  return (
    <Card
      title={<span className="flex items-center gap-2">{role.name}{role.isSystem && <Badge tone="purple">system</Badge>}</span>}
      description={`${role.description || "No description"} · ${role.users} user(s)`}
      action={
        <div className="flex gap-2">
          {!locked && <Button size="sm" disabled={loading} onClick={async () => { setSaved(false); if (await run(`/api/admin/roles/${role.id}`, "PATCH", { permissions: selected })) setSaved(true); }}>Save</Button>}
          {!role.isSystem && canManageRoles && <Button size="sm" variant="danger" disabled={loading} onClick={() => window.confirm(`Delete role ${role.name}?`) && void run(`/api/admin/roles/${role.id}`, "DELETE")}>Delete</Button>}
        </div>
      }
    >
      {error && <div className="mb-3"><Alert tone="error">{error}</Alert></div>}
      {saved && <div className="mb-3"><Alert tone="success">Permissions saved.</Alert></div>}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {permissions.map((p) => (
          <label key={p.key} className="flex items-start gap-2 text-sm" title={p.description}>
            <input type="checkbox" className="mt-1" checked={selected.includes(p.key)} disabled={locked} onChange={() => toggle(p.key)} />
            <span><code className="text-xs">{p.key}</code></span>
          </label>
        ))}
      </div>
    </Card>
  );
}

export function RoleManager({ roles, permissions, canEditPermissions, canManageRoles }: Props) {
  const { run, loading, error } = useApiAction();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function create(e: FormEvent) {
    e.preventDefault();
    if (await run("/api/admin/roles", "POST", { name: name.toUpperCase(), description, permissions: [] })) {
      setName("");
      setDescription("");
    }
  }

  return (
    <div className="space-y-6">
      {canManageRoles && (
        <Card title="Create role" description="Custom roles start with no permissions — tick them below after creating.">
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-3">
            <Field label="Name (UPPER_SNAKE_CASE)"><Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="SUPPORT_AGENT" /></Field>
            <Field label="Description"><Input value={description} onChange={(e) => setDescription(e.target.value)} /></Field>
            <div className="flex items-end"><Button type="submit" disabled={loading}>Create role</Button></div>
            {error && <div className="sm:col-span-3"><Alert tone="error">{error}</Alert></div>}
          </form>
        </Card>
      )}
      {roles.map((r) => (
        <RoleCard key={r.id} role={r} permissions={permissions} canEditPermissions={canEditPermissions} canManageRoles={canManageRoles} />
      ))}
    </div>
  );
}
