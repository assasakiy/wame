import type { Metadata } from "next";
import { PageHeader } from "@/shared/components/PageHeader";
import { RoleManager } from "@/features/admin/components/RoleManager";
import { can, requirePagePermission } from "@/modules/auth/presentation/guards";
import { listRolesWithPermissions } from "@/modules/rbac/application/rbac.service";
import { PERMISSIONS } from "@/modules/rbac/domain/permissions";

export const metadata: Metadata = { title: "Roles & Permissions" };
export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const admin = await requirePagePermission("roles.manage", "/admin");
  const roles = await listRolesWithPermissions();
  return (
    <>
      <PageHeader title="Roles & permissions" description="Dynamic RBAC: create roles and grant granular permissions. Changes apply on the next request." />
      <RoleManager
        roles={roles}
        permissions={Object.entries(PERMISSIONS).map(([key, description]) => ({ key, description }))}
        canEditPermissions={can(admin, "permissions.manage")}
        canManageRoles={can(admin, "roles.manage")}
      />
    </>
  );
}
