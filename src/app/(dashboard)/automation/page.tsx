import type { Metadata } from "next";
import { Alert } from "@/shared/components/Alert";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/DataTable";
import { DeleteButton } from "@/shared/components/DeleteButton";
import { PageHeader } from "@/shared/components/PageHeader";
import { UsageMeter } from "@/shared/components/UsageMeter";
import { AutomationForm } from "@/features/automation/components/AutomationForm";
import { AutomationToggle } from "@/features/automation/components/AutomationToggle";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { listAutomations } from "@/modules/automation/application/automation.service";
import { getUsage } from "@/modules/subscription/application/limits";
import { getSubscription } from "@/modules/subscription/application/subscription.service";

export const metadata: Metadata = { title: "Automation" };
export const dynamic = "force-dynamic";

export default async function AutomationPage() {
  const user = await requirePagePermission("automation.manage");
  const [rows, sub, usage] = await Promise.all([listAutomations(user.tenantId), getSubscription(user.tenantId), getUsage(user.tenantId)]);
  return (
    <>
      <PageHeader title="Automation" description="Auto-replies and workflows that run on every inbound message." />
      <div className="space-y-6">
        {!sub.limits.workflows && <Alert tone="warning">Workflows, regex and AI actions need a higher plan. Auto-replies are available on {sub.plan.name}.</Alert>}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Create automation" className="lg:col-span-2"><AutomationForm /></Card>
          <Card><UsageMeter label="Automations" used={usage.automations} limit={sub.limits.automations} /></Card>
        </div>
        <Card title="Your automations" description="Evaluated oldest first. The first auto-reply that answers stops the chain." padded={false}>
          <DataTable
            rows={rows}
            rowKey={(a) => a.id}
            emptyTitle="No automations yet"
            columns={[
              { header: "Name", cell: (a) => <div><p className="font-medium text-slate-900">{a.name}</p><Badge tone={a.kind === "workflow" ? "purple" : "blue"}>{a.kind.replace("_", " ")}</Badge></div> },
              { header: "Trigger", cell: (a) => <span className="text-xs">{a.trigger.match === "any" ? "any message" : `${a.trigger.match.replace("_", " ")} “${a.trigger.value}”`}</span> },
              { header: "Actions", cell: (a) => <span className="text-xs text-slate-600">{a.actions.map((x) => x.type.replace("_", " ")).join(" → ")}{a.conditions.length ? ` · ${a.conditions.length} condition(s)` : ""}</span> },
              { header: "Runs", cell: (a) => a.runCount },
              { header: "Enabled", cell: (a) => <AutomationToggle id={a.id} enabled={a.enabled} /> },
              { header: "", cell: (a) => <DeleteButton path={`/api/automations/${a.id}`} label="" confirm="Delete this automation?" /> },
            ]}
          />
        </Card>
      </div>
    </>
  );
}
