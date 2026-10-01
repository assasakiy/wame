import type { Metadata } from "next";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { formatDate, formatIDR } from "@/shared/utils/format";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getSubscription, listInvoices } from "@/modules/subscription/application/subscription.service";

export const metadata: Metadata = { title: "Billing" };
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requirePagePermission("billing.view");
  const [invoices, sub] = await Promise.all([listInvoices(user.tenantId), getSubscription(user.tenantId)]);
  const total = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  return (
    <>
      <PageHeader title="Billing" description="Invoices and payment history." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Current plan" value={sub.plan.name} hint={sub.plan.priceMonthly ? `${formatIDR(sub.plan.priceMonthly)} / month` : "Free forever"} />
        <StatCard label="Next renewal" value={sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd).split(",")[0] : "—"} />
        <StatCard label="Total paid" value={formatIDR(total)} />
      </div>
      <Card title="Invoice history" padded={false}>
        <DataTable
          rows={invoices}
          rowKey={(i) => i.id}
          emptyTitle="No invoices yet"
          emptyDescription="Invoices appear here when you subscribe to a paid plan."
          columns={[
            { header: "Invoice", cell: (i) => <span className="font-mono text-xs">INV-{i.id.slice(0, 8).toUpperCase()}</span> },
            { header: "Description", cell: (i) => i.description },
            { header: "Amount", cell: (i) => <span className="font-medium">{formatIDR(i.amount)}</span> },
            { header: "Provider", cell: (i) => i.provider },
            { header: "Status", cell: (i) => <StatusBadge status={i.status} /> },
            { header: "Date", cell: (i) => <span className="text-xs text-slate-500">{formatDate(i.createdAt)}</span> },
          ]}
        />
      </Card>
    </>
  );
}
