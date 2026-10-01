import type { Metadata } from "next";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { UpgradeNotice } from "@/shared/components/UpgradeNotice";
import { formatDate } from "@/shared/utils/format";
import { BroadcastForm } from "@/features/automation/components/BroadcastForm";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { listBroadcasts } from "@/modules/automation/application/broadcast.service";
import { listContacts, listSegments } from "@/modules/messages/application/contact.service";
import { getSubscription } from "@/modules/subscription/application/subscription.service";
import { listDevices } from "@/modules/whatsapp/application/device.service";

export const metadata: Metadata = { title: "Broadcast" };
export const dynamic = "force-dynamic";

export default async function BroadcastPage() {
  const user = await requirePagePermission("broadcast.manage");
  const [sub, devices, segments, contacts, broadcasts] = await Promise.all([
    getSubscription(user.tenantId), listDevices(user.tenantId), listSegments(user.tenantId), listContacts(user.tenantId), listBroadcasts(user.tenantId),
  ]);
  return (
    <>
      <PageHeader title="Broadcast" description="Segmented campaigns delivered through the queue with per-minute rate limiting." />
      <div className="space-y-6">
        {sub.limits.broadcast ? (
          <Card title="New broadcast">
            <BroadcastForm devices={devices.filter((d) => d.status === "connected").map((d) => ({ id: d.id, name: d.name }))} segments={segments} totalContacts={contacts.length} />
          </Card>
        ) : (
          <UpgradeNotice feature="Broadcast campaigns" />
        )}
        <Card title="Campaigns" padded={false}>
          <DataTable
            rows={broadcasts}
            rowKey={(b) => b.id}
            emptyTitle="No campaigns yet"
            columns={[
              { header: "Campaign", cell: (b) => <div><p className="font-medium text-slate-900">{b.name}</p><p className="max-w-xs truncate text-xs text-slate-500">{b.message}</p></div> },
              { header: "Segment", cell: (b) => b.segmentTag ?? "All contacts" },
              { header: "Progress", cell: (b) => {
                const pct = b.total ? Math.round(((b.sent + b.failed) / b.total) * 100) : 0;
                return (
                  <div className="w-36">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
                    <p className="mt-1 text-xs text-slate-500">{b.sent}/{b.total} sent{b.failed ? ` · ${b.failed} failed` : ""}</p>
                  </div>
                );
              } },
              { header: "Rate", cell: (b) => `${b.ratePerMinute}/min` },
              { header: "Status", cell: (b) => <StatusBadge status={b.status} /> },
              { header: "Created", cell: (b) => <span className="text-xs text-slate-500">{formatDate(b.createdAt)}</span> },
            ]}
          />
        </Card>
      </div>
    </>
  );
}
