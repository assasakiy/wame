import type { Metadata } from "next";
import { Bot, CheckCheck, Send, Smartphone } from "lucide-react";
import { BarChart } from "@/shared/components/BarChart";
import { Card } from "@/shared/components/Card";
import { PageHeader } from "@/shared/components/PageHeader";
import { StatCard } from "@/shared/components/StatCard";
import { UsageMeter } from "@/shared/components/UsageMeter";
import { Badge } from "@/shared/components/Badge";
import { ButtonLink } from "@/shared/components/ButtonLink";
import { DeviceWidget } from "@/features/dashboard/components/DeviceWidget";
import { RecentMessages } from "@/features/dashboard/components/RecentMessages";
import { requireUser } from "@/modules/auth/presentation/guards";
import { getTenantAnalytics } from "@/modules/messages/application/analytics.service";
import { listMessages } from "@/modules/messages/application/message.service";
import { getUsage } from "@/modules/subscription/application/limits";
import { getSubscription } from "@/modules/subscription/application/subscription.service";
import { listDevices } from "@/modules/whatsapp/application/device.service";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const [devices, analytics, sub, usage, recent] = await Promise.all([
    listDevices(user.tenantId),
    getTenantAnalytics(user.tenantId, 7),
    getSubscription(user.tenantId),
    getUsage(user.tenantId),
    listMessages(user.tenantId, { limit: 6 }),
  ]);
  const online = devices.filter((d) => d.status === "connected").length;

  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]} 👋`}
        description="Realtime overview of your WhatsApp gateway."
        actions={<><Badge tone="green">{sub.plan.name} plan</Badge><ButtonLink href="/messages" size="sm">Send message</ButtonLink></>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Devices online" value={`${online}/${devices.length}`} hint={`Limit ${sub.limits.devices}`} icon={<Smartphone size={18} />} />
        <StatCard label="Sent (7d)" value={analytics.totals.sent} hint={`${analytics.totals.pending} in queue`} icon={<Send size={18} />} />
        <StatCard label="Delivery rate" value={`${analytics.deliveryRate}%`} hint={`${analytics.totals.failed} failed`} icon={<CheckCheck size={18} />} />
        <StatCard label="Received (7d)" value={analytics.totals.received} hint="Inbound messages" icon={<Bot size={18} />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title="Message volume" description="Last 7 days" className="lg:col-span-2">
          <BarChart
            data={analytics.perDay.map((d) => ({ label: d.day.slice(5), values: [d.out, d.in] }))}
            series={[{ label: "Outbound", color: "#10b981" }, { label: "Inbound", color: "#0ea5e9" }]}
          />
        </Card>
        <Card title="Plan usage" action={<ButtonLink href="/subscription" variant="ghost" size="sm">Upgrade</ButtonLink>}>
          <div className="space-y-4">
            <UsageMeter label="Messages this month" used={usage.messages} limit={sub.limits.messagesPerMonth} />
            <UsageMeter label="Devices" used={usage.devices} limit={sub.limits.devices} />
            <UsageMeter label="Contacts" used={usage.contacts} limit={sub.limits.contacts} />
            <UsageMeter label="AI requests" used={usage.ai} limit={sub.limits.aiRequestsPerMonth} />
          </div>
        </Card>
        <Card title="Devices" padded={false}><DeviceWidget devices={devices} /></Card>
        <Card title="Recent messages" padded={false} className="lg:col-span-2"><RecentMessages rows={recent} /></Card>
      </div>
    </>
  );
}
