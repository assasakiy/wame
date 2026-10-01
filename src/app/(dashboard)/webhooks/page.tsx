import type { Metadata } from "next";
import { Card } from "@/shared/components/Card";
import { CodeBlock } from "@/shared/components/CodeBlock";
import { PageHeader } from "@/shared/components/PageHeader";
import { UpgradeNotice } from "@/shared/components/UpgradeNotice";
import { EVENT_TYPES } from "@/shared/lib/events";
import { webhookExample } from "@/features/developer/api-examples";
import { WebhookManager } from "@/features/developer/components/WebhookManager";
import { listWebhooks } from "@/modules/api/application/webhook.service";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getSubscription } from "@/modules/subscription/application/subscription.service";

export const metadata: Metadata = { title: "Webhook" };
export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  const user = await requirePagePermission("webhooks.manage");
  const [hooks, sub] = await Promise.all([listWebhooks(user.tenantId), getSubscription(user.tenantId)]);
  return (
    <>
      <PageHeader title="Webhook" description="Receive realtime events on your own server. Each request is signed with HMAC-SHA256." />
      <div className="space-y-6">
        {sub.limits.webhooks === 0 && <UpgradeNotice feature="Webhooks" />}
        <Card title="Endpoints" padded={false}><WebhookManager hooks={hooks} eventTypes={[...EVENT_TYPES]} locked={sub.limits.webhooks === 0} /></Card>
        <Card title="Payload format"><CodeBlock title="POST application/json" code={webhookExample} /></Card>
      </div>
    </>
  );
}
