import type { Metadata } from "next";
import Link from "next/link";
import { BarChart } from "@/shared/components/BarChart";
import { Card } from "@/shared/components/Card";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { cn } from "@/shared/utils/format";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getTenantAnalytics } from "@/modules/messages/application/analytics.service";

export const metadata: Metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const user = await requirePagePermission("analytics.view");
  const days = (await searchParams).days === "30" ? 30 : 7;
  const a = await getTenantAnalytics(user.tenantId, days);
  const tabs = [7, 30];
  return (
    <>
      <PageHeader
        title="Analytics"
        description="Delivery performance and traffic."
        actions={
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {tabs.map((t) => (
              <Link key={t} href={`/analytics?days=${t}`} className={cn("rounded-md px-3 py-1.5 text-xs font-medium", t === days ? "bg-emerald-600 text-white" : "text-slate-600")}>{t} days</Link>
            ))}
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sent" value={a.totals.sent} />
        <StatCard label="Delivered" value={a.totals.delivered} hint={`${a.deliveryRate}% delivery rate`} />
        <StatCard label="Failed" value={a.totals.failed} hint={`${a.failureRate}% failure rate`} />
        <StatCard label="Received" value={a.totals.received} />
      </div>
      <Card title="Traffic" description={`Last ${days} days`} className="mt-6">
        <BarChart
          data={a.perDay.map((d) => ({ label: days > 7 ? d.day.slice(8) : d.day.slice(5), values: [d.out, d.in] }))}
          series={[{ label: "Outbound", color: "#10b981" }, { label: "Inbound", color: "#0ea5e9" }]}
        />
      </Card>
    </>
  );
}
