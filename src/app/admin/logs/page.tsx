import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/DataTable";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { cn, formatDate } from "@/shared/utils/format";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { listLogs } from "@/modules/users/application/admin.service";

export const metadata: Metadata = { title: "Logs" };
export const dynamic = "force-dynamic";

export default async function AdminLogsPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  await requirePagePermission("logs.view", "/admin");
  const level = (await searchParams).level;
  const logs = await listLogs(level === "info" || level === "warn" || level === "error" ? level : undefined);
  return (
    <>
      <PageHeader
        title="Logs"
        description="Audit trail and system events (latest 200)."
        actions={
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {[undefined, "info", "warn", "error"].map((l) => (
              <Link key={l ?? "all"} href={l ? `/admin/logs?level=${l}` : "/admin/logs"} className={cn("rounded-md px-3 py-1.5 text-xs font-medium", l === level ? "bg-emerald-600 text-white" : "text-slate-600")}>{l ?? "all"}</Link>
            ))}
          </div>
        }
      />
      <Card padded={false}>
        <DataTable
          rows={logs}
          rowKey={(l) => l.id}
          emptyTitle="No log entries"
          columns={[
            { header: "Time", cell: (l) => <span className="whitespace-nowrap text-xs text-slate-500">{formatDate(l.createdAt)}</span> },
            { header: "Level", cell: (l) => <StatusBadge status={l.level} /> },
            { header: "Action", cell: (l) => <span className="font-mono text-xs">{l.action}</span> },
            { header: "Detail", cell: (l) => <span className="line-clamp-2 max-w-md break-all font-mono text-[11px] text-slate-500">{l.detail ? JSON.stringify(l.detail) : ""}</span> },
          ]}
        />
      </Card>
    </>
  );
}
