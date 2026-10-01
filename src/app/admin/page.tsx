import type { Metadata } from "next";
import { Activity, CreditCard, Smartphone, Users } from "lucide-react";
import { BarChart } from "@/shared/components/BarChart";
import { Card } from "@/shared/components/Card";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { formatIDR } from "@/shared/utils/format";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getPlatformStats } from "@/modules/users/application/admin.service";

export const metadata: Metadata = { title: "Admin overview" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requirePagePermission("system.manage", "/dashboard");
  const s = await getPlatformStats();
  const deviceTotal = Object.values(s.devices).reduce((a, b) => a + b, 0);
  return (
    <>
      <PageHeader title="Platform overview" description="Analytics across every tenant." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Users" value={s.users} hint={`${s.tenants} workspaces`} icon={<Users size={18} />} />
        <StatCard label="Devices" value={deviceTotal} hint={`${s.devices.connected ?? 0} connected`} icon={<Smartphone size={18} />} />
        <StatCard label="Messages (24h)" value={s.messages24h} hint={`${s.messagesTotal} all time`} icon={<Activity size={18} />} />
        <StatCard label="Revenue (30d)" value={formatIDR(s.revenue30d)} hint={`${formatIDR(s.revenueTotal)} lifetime`} icon={<CreditCard size={18} />} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Platform traffic" description="Messages per day, last 7 days" className="lg:col-span-2">
          <BarChart data={s.messagesPerDay.map((d) => ({ label: d.day.slice(5), values: [d.n] }))} series={[{ label: "Messages", color: "#10b981" }]} />
        </Card>
        <Card title="Plan distribution">
          <ul className="space-y-3 text-sm">
            {["FREE", "PRO", "PLUS"].map((code) => (
              <li key={code} className="flex items-center justify-between"><span className="font-medium">{code}</span><span>{s.planDistribution[code] ?? 0} workspaces</span></li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
