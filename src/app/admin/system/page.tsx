import type { Metadata } from "next";
import { Card } from "@/shared/components/Card";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getSystemHealth } from "@/modules/users/application/system-health";

export const metadata: Metadata = { title: "System health" };
export const dynamic = "force-dynamic";

const uptime = (s: number) => `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;

export default async function AdminSystemPage() {
  await requirePagePermission("system.manage", "/dashboard");
  const h = await getSystemHealth();
  const workerOk = h.worker.running && h.worker.lastTickAgoMs !== null && h.worker.lastTickAgoMs < 10_000;
  return (
    <>
      <PageHeader title="System health" description="Live status of the WAME runtime." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Database" value={<StatusBadge status={h.database.ok ? "healthy" : "failed"} />} hint={`${h.database.latencyMs} ms`} />
        <StatCard label="Background worker" value={<StatusBadge status={workerOk ? "healthy" : "degraded"} />} hint={`${h.worker.ticks} ticks · ${h.worker.processed} messages processed`} />
        <StatCard label="Queue depth" value={h.queueDepth} hint="pending + sending" />
        <StatCard label="Connected devices" value={h.connectedDevices} />
      </div>
      <Card title="Runtime" className="mt-6">
        <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["WhatsApp driver", h.driver], ["AI mode", h.aiMode], ["Uptime", uptime(h.uptimeSeconds)],
            ["Memory (RSS)", `${h.memoryMb} MB`], ["Heap used", `${h.heapMb} MB`], ["Node.js", h.node],
          ].map(([k, v]) => (
            <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="mt-0.5 font-medium">{v}</dd></div>
          ))}
        </dl>
      </Card>
    </>
  );
}
