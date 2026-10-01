import type { Metadata } from "next";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import { PageHeader } from "@/shared/components/PageHeader";
import { PasswordForm } from "@/features/settings/components/PasswordForm";
import { ProfileForm } from "@/features/settings/components/ProfileForm";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getWorkspaceName } from "@/modules/users/application/profile.service";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requirePagePermission("settings.manage");
  const workspace = await getWorkspaceName(user.tenantId);
  return (
    <>
      <PageHeader title="Settings" description="Your profile, workspace and security." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profile"><ProfileForm name={user.name} workspace={workspace} email={user.email} /></Card>
        <Card title="Password"><PasswordForm /></Card>
        <Card title="Access" description="Granted by your role. Administrators can change this.">
          <p className="mb-3 text-sm">Role: <Badge tone="purple">{user.role}</Badge> · Plan: <Badge tone="green">{user.planCode}</Badge></p>
          <div className="flex flex-wrap gap-1.5">{user.permissions.map((p) => <Badge key={p}>{p}</Badge>)}</div>
        </Card>
      </div>
    </>
  );
}
