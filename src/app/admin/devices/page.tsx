import type { Metadata } from "next";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { timeAgo } from "@/shared/utils/format";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { listAllDevices } from "@/modules/users/application/admin.service";
import { deviceHealth } from "@/modules/whatsapp/application/device.service";

export const metadata: Metadata = { title: "Device monitoring" };
export const dynamic = "force-dynamic";

export default async function AdminDevicesPage() {
  await requirePagePermission("system.manage", "/dashboard");
  const rows = await listAllDevices();
  return (
    <>
      <PageHeader title="Device monitoring" description="Every WhatsApp session on the platform." />
      <Card padded={false}>
        <DataTable
          rows={rows}
          rowKey={(r) => r.device.id}
          emptyTitle="No devices registered"
          columns={[
            { header: "Device", cell: (r) => <div><p className="font-medium text-slate-900">{r.device.name}</p><p className="text-xs text-slate-500">{r.device.phone ? `+${r.device.phone}` : "not linked"}</p></div> },
            { header: "Workspace", cell: (r) => r.tenant },
            { header: "Type", cell: (r) => r.device.type },
            { header: "Status", cell: (r) => <StatusBadge status={r.device.status} /> },
            { header: "Health", cell: (r) => <StatusBadge status={deviceHealth(r.device)} /> },
            { header: "Reconnects", cell: (r) => r.device.reconnectCount },
            { header: "Last seen", cell: (r) => <span className="text-xs text-slate-500">{timeAgo(r.device.lastSeenAt)}</span> },
          ]}
        />
      </Card>
    </>
  );
}
