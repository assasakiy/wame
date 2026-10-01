import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/shared/components/layout/AppShell";
import { ADMIN_NAV } from "@/shared/config/navigation";
import { can, requireUser } from "@/modules/auth/presentation/guards";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const nav = ADMIN_NAV.filter((item) => item.permission && can(user, item.permission));
  if (!nav.length) redirect("/dashboard");
  return (
    <AppShell nav={nav} area="admin" showSwitch user={{ name: user.name, email: user.email, planCode: user.planCode, role: user.role }}>
      {children}
    </AppShell>
  );
}
