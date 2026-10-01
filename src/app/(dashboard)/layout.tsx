import type { ReactNode } from "react";
import { AppShell } from "@/shared/components/layout/AppShell";
import { USER_NAV } from "@/shared/config/navigation";
import { can, requireUser } from "@/modules/auth/presentation/guards";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const nav = USER_NAV.filter((item) => !item.permission || can(user, item.permission));
  const showSwitch = can(user, "system.manage") || can(user, "users.manage");
  return (
    <AppShell nav={nav} area="user" showSwitch={showSwitch} user={{ name: user.name, email: user.email, planCode: user.planCode, role: user.role }}>
      {children}
    </AppShell>
  );
}
