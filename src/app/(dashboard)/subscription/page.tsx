import type { Metadata } from "next";
import { Alert } from "@/shared/components/Alert";
import { Card } from "@/shared/components/Card";
import { PageHeader } from "@/shared/components/PageHeader";
import { UsageMeter } from "@/shared/components/UsageMeter";
import { daysUntil, formatDate } from "@/shared/utils/format";
import { PlanSelector } from "@/features/subscription/components/PlanSelector";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getUsage } from "@/modules/subscription/application/limits";
import { getSubscription, listPlans } from "@/modules/subscription/application/subscription.service";

export const metadata: Metadata = { title: "Subscription" };
export const dynamic = "force-dynamic";

export default async function SubscriptionPage() {
  const user = await requirePagePermission("billing.view");
  const [sub, plans, usage] = await Promise.all([getSubscription(user.tenantId), listPlans(), getUsage(user.tenantId)]);
  const daysLeft = sub.currentPeriodEnd ? daysUntil(sub.currentPeriodEnd) : null;
  return (
    <>
      <PageHeader title="Subscription" description="Upgrade or downgrade any time. Limits apply instantly." />
      <div className="space-y-6">
        {daysLeft !== null && daysLeft <= 7 && <Alert tone="warning">Your {sub.plan.name} plan expires in {daysLeft} day(s). Renew to keep your features.</Alert>}
        <Card title={`Current plan: ${sub.plan.name}`} description={sub.currentPeriodEnd ? `Renews / expires ${formatDate(sub.currentPeriodEnd)}` : "No expiration"}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <UsageMeter label="Devices" used={usage.devices} limit={sub.limits.devices} />
            <UsageMeter label="Messages this month" used={usage.messages} limit={sub.limits.messagesPerMonth} />
            <UsageMeter label="Contacts" used={usage.contacts} limit={sub.limits.contacts} />
            <UsageMeter label="Automations" used={usage.automations} limit={sub.limits.automations} />
            <UsageMeter label="AI requests this month" used={usage.ai} limit={sub.limits.aiRequestsPerMonth} />
            <UsageMeter label="Webhooks" used={usage.webhooks} limit={sub.limits.webhooks} />
          </div>
        </Card>
        <PlanSelector plans={plans.map((p) => ({ code: p.code, name: p.name, description: p.description, priceMonthly: p.priceMonthly, sortOrder: p.sortOrder, limits: p.limits }))} current={sub.planCode} />
      </div>
    </>
  );
}
