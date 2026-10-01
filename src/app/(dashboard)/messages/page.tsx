import type { Metadata } from "next";
import { Card } from "@/shared/components/Card";
import { PageHeader } from "@/shared/components/PageHeader";
import { MessageTable } from "@/features/messages/components/MessageTable";
import { SendMessageForm } from "@/features/messages/components/SendMessageForm";
import { can, requirePagePermission } from "@/modules/auth/presentation/guards";
import { listMessages } from "@/modules/messages/application/message.service";
import { listDevices } from "@/modules/whatsapp/application/device.service";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await requirePagePermission("messages.read");
  const [rows, devices] = await Promise.all([listMessages(user.tenantId, { limit: 100 }), listDevices(user.tenantId)]);
  return (
    <>
      <PageHeader title="Messages" description="Send, schedule and track every message. Status updates in realtime." />
      <div className="space-y-6">
        {can(user, "messages.send") && (
          <Card title="Send a message" description="Text, media, location and contact. Add a schedule to send later.">
            <SendMessageForm devices={devices.filter((d) => d.status === "connected").map((d) => ({ id: d.id, name: d.name }))} />
          </Card>
        )}
        <Card title="Message log" padded={false}>
          <MessageTable rows={rows} />
        </Card>
      </div>
    </>
  );
}
