"use client";

import { Alert } from "@/shared/components/Alert";
import { Select } from "@/shared/components/Select";
import { useApiAction } from "@/shared/hooks/useApiAction";

interface Props {
  user: { id: string; roleId: string; status: string; plan: string | null };
  roles: { id: string; name: string }[];
  canManageUsers: boolean;
  canManagePlan: boolean;
  isSelf: boolean;
}

export function UserAdminControls({ user, roles, canManageUsers, canManagePlan, isSelf }: Props) {
  const { run, loading, error } = useApiAction();
  const patch = (body: Record<string, string>) => void run(`/api/admin/users/${user.id}`, "PATCH", body);
  return (
    <div className="flex flex-wrap gap-2">
      <Select className="h-8 w-36 text-xs" aria-label="Role" value={user.roleId} disabled={loading || !canManageUsers || isSelf} onChange={(e) => patch({ roleId: e.target.value })}>
        {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
      </Select>
      <Select className="h-8 w-24 text-xs" aria-label="Plan" value={user.plan ?? "FREE"} disabled={loading || !canManagePlan} onChange={(e) => patch({ planCode: e.target.value })}>
        {["FREE", "PRO", "PLUS"].map((p) => <option key={p}>{p}</option>)}
      </Select>
      <Select className="h-8 w-28 text-xs" aria-label="Status" value={user.status} disabled={loading || !canManageUsers || isSelf} onChange={(e) => patch({ status: e.target.value })}>
        <option value="active">active</option>
        <option value="suspended">suspended</option>
      </Select>
      {error && <div className="w-full"><Alert tone="error">{error}</Alert></div>}
    </div>
  );
}
