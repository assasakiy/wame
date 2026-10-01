import type { Metadata } from "next";
import { BarChart } from "@/shared/components/BarChart";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { formatDate, formatIDR } from "@/shared/utils/format";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getPlatformStats, getRevenue } from "@/modules/users/application/admin.service";

export const metadata: Metadata = { title: "Revenue & Plans" };
export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  await requirePagePermission("subscription.manage", "/admin");
  const [revenue, stats] = await Promise.all([getRevenue(), getPlatformStats()]);
  return (
    <>
      <PageHeader title="Revenue & subscriptions" description="Paid invoices across all workspaces." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Lifetime revenue" value={formatIDR(stats.revenueTotal)} />
        <StatCard label="Last 30 days" value={formatIDR(stats.revenue30d)} />
        <StatCard label="Pro workspaces" value={stats.planDistribution.PRO ?? 0} />
        <StatCard label="Plus workspaces" value={stats.planDistribution.PLUS ?? 0} />
      </div>
      <Card title="Monthly revenue (IDR, thousands)" className="mt-6">
        {revenue.monthly.length ? (
          <BarChart data={revenue.monthly.map((m) => ({ label: m.month, values: [Math.round(m.total / 1000)] }))} series={[{ label: "Revenue (k IDR)", color: "#8b5cf6" }]} />
        ) : <p className="text-sm text-slate-500">No paid invoices yet.</p>}
      </Card>
      <Card title="Recent invoices" padded={false} className="mt-6">
        <DataTable
          rows={revenue.recent}
          rowKey={(i) => i.id}
          emptyTitle="No invoices yet"
          columns={[
            { header: "Workspace", cell: (i) => i.tenant },
            { header: "Description", cell: (i) => i.description },
            { header: "Amount", cell: (i) => formatIDR(i.amount) },
            { header: "Provider", cell: (i) => i.provider },
            { header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
            { header: "Date", cell: (i) => <span className="text-xs text-slate-500">{formatDate(i.createdAt)}</span> },
          ]}
        />
      </Card>
    </>
  );
}
