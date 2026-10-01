import type { Metadata } from "next";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { formatDate, timeAgo } from "@/shared/utils/format";
import { UserAdminControls } from "@/features/admin/components/UserAdminControls";
import { can, requirePagePermission } from "@/modules/auth/presentation/guards";
import { listRolesWithPermissions } from "@/modules/rbac/application/rbac.service";
import { listUsers } from "@/modules/users/application/admin.service";

export const metadata: Metadata = { title: "Users" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = await requirePagePermission("users.manage", "/admin");
  const [users, roles] = await Promise.all([listUsers(), listRolesWithPermissions()]);
  return (
    <>
      <PageHeader title="Users" description="Manage accounts, roles, plans and suspensions." />
      <Card padded={false}>
        <DataTable
          rows={users}
          rowKey={(u) => u.id}
          columns={[
            { header: "User", cell: (u) => <div><p className="font-medium text-slate-900">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div> },
            { header: "Workspace", cell: (u) => u.tenant },
            { header: "Role", cell: (u) => <Badge tone={u.role === "SUPER_ADMIN" ? "purple" : "gray"}>{u.role}</Badge> },
            { header: "Joined", cell: (u) => <div className="text-xs text-slate-500">{formatDate(u.createdAt)}<br />last login {timeAgo(u.lastLoginAt)}</div> },
            {
              header: "Manage",
              cell: (u) => (
                <UserAdminControls
                  user={{ id: u.id, roleId: u.roleId, status: u.status, plan: u.plan }}
                  roles={roles.map((r) => ({ id: r.id, name: r.name }))}
                  canManageUsers={can(admin, "users.manage")}
                  canManagePlan={can(admin, "subscription.manage")}
                  isSelf={u.id === admin.id}
                />
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
