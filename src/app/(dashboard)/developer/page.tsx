import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Card } from "@/shared/components/Card";
import { CodeBlock } from "@/shared/components/CodeBlock";
import { PageHeader } from "@/shared/components/PageHeader";
import { UpgradeNotice } from "@/shared/components/UpgradeNotice";
import { listExample, sendMediaExample, sendTextExample } from "@/features/developer/api-examples";
import { ApiKeyManager } from "@/features/developer/components/ApiKeyManager";
import { listApiKeys } from "@/modules/api/application/api-key.service";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getSubscription } from "@/modules/subscription/application/subscription.service";

export const metadata: Metadata = { title: "API" };
export const dynamic = "force-dynamic";

export default async function DeveloperPage() {
  const user = await requirePagePermission("api.manage");
  const [keys, sub, h] = await Promise.all([listApiKeys(user.tenantId), getSubscription(user.tenantId), headers()]);
  const base = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`;
  return (
    <>
      <PageHeader title="API" description="Authenticate with an API key and send messages from your own systems." actions={<Link href="/docs" className="text-sm font-medium text-emerald-600 hover:underline">Full documentation →</Link>} />
      <div className="space-y-6">
        {!sub.limits.apiAccess && <UpgradeNotice feature="API access" />}
        {sub.limits.apiAccess && <p className="text-sm text-slate-500">Rate limit on your plan: <strong>{sub.limits.apiRatePerMinute} requests/minute</strong> per key.</p>}
        <Card title="API keys" padded={false}><ApiKeyManager keys={keys} locked={!sub.limits.apiAccess} /></Card>
        <Card title="Quick start">
          <div className="space-y-4">
            <CodeBlock title="Send a text message" code={sendTextExample(base)} />
            <CodeBlock title="Send media" code={sendMediaExample(base)} />
            <CodeBlock title="List devices & messages" code={listExample(base)} />
          </div>
        </Card>
      </div>
    </>
  );
}
