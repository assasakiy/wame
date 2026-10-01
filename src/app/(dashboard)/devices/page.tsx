import type { Metadata } from "next";
import { Card } from "@/shared/components/Card";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageHeader } from "@/shared/components/PageHeader";
import { UsageMeter } from "@/shared/components/UsageMeter";
import { AddDeviceButton } from "@/features/whatsapp/components/AddDeviceButton";
import { DeviceCard } from "@/features/whatsapp/components/DeviceCard";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getUsage } from "@/modules/subscription/application/limits";
import { getSubscription } from "@/modules/subscription/application/subscription.service";
import { listDevices } from "@/modules/whatsapp/application/device.service";

export const metadata: Metadata = { title: "WhatsApp Devices" };
export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const user = await requirePagePermission("devices.manage");
  const [devices, sub, usage] = await Promise.all([listDevices(user.tenantId), getSubscription(user.tenantId), getUsage(user.tenantId)]);
  return (
    <>
      <PageHeader title="WhatsApp Devices" description="Link personal or business accounts. Sessions persist and auto-reconnect." actions={<AddDeviceButton />} />
      <div className="mb-6 max-w-sm">
        <Card><UsageMeter label={`Devices (${sub.plan.name} plan)`} used={usage.devices} limit={sub.limits.devices} /></Card>
      </div>
      {devices.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {devices.map((d) => (
            <DeviceCard
              key={d.id}
              device={{ id: d.id, name: d.name, type: d.type, phone: d.phone, status: d.status, qr: d.qr, health: d.health, lastSeenAt: d.lastSeenAt, reconnectCount: d.reconnectCount, driver: d.driver }}
            />
          ))}
        </div>
      ) : (
        <Card><EmptyState title="No devices yet" description="Add a device, scan the QR code and start sending messages." /></Card>
      )}
    </>
  );
}
