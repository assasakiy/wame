import type { Metadata } from "next";
import { Badge } from "@/shared/components/Badge";
import { Card } from "@/shared/components/Card";
import { DataTable } from "@/shared/components/DataTable";
import { DeleteButton } from "@/shared/components/DeleteButton";
import { PageHeader } from "@/shared/components/PageHeader";
import { UsageMeter } from "@/shared/components/UsageMeter";
import { AgentChat } from "@/features/ai-agent/components/AgentChat";
import { CustomerServiceSettings } from "@/features/ai-agent/components/CustomerServiceSettings";
import { KnowledgeForm } from "@/features/ai-agent/components/KnowledgeForm";
import { getCustomerServiceConfig, listChat } from "@/modules/ai-agent/application/agent.service";
import { listKnowledge } from "@/modules/ai-agent/application/knowledge.service";
import { llmEnabled } from "@/modules/ai-agent/application/llm";
import { AGENTS, AGENT_TYPES } from "@/modules/ai-agent/domain/agents";
import { requirePagePermission } from "@/modules/auth/presentation/guards";
import { getUsage } from "@/modules/subscription/application/limits";
import { getSubscription } from "@/modules/subscription/application/subscription.service";
import { listDevices } from "@/modules/whatsapp/application/device.service";

export const metadata: Metadata = { title: "AI Agent" };
export const dynamic = "force-dynamic";

export default async function AiAgentPage() {
  const user = await requirePagePermission("ai.use");
  const [config, knowledge, devices, sub, usage, histories] = await Promise.all([
    getCustomerServiceConfig(user.tenantId),
    listKnowledge(user.tenantId),
    listDevices(user.tenantId),
    getSubscription(user.tenantId),
    getUsage(user.tenantId),
    Promise.all(AGENT_TYPES.map((a) => listChat(user.tenantId, user.id, a))),
  ]);
  const initial = Object.fromEntries(AGENT_TYPES.map((a, i) => [a, histories[i].map((c) => ({ role: c.role, content: c.content }))]));
  const agents = AGENT_TYPES.map((type) => ({ type, label: AGENTS[type].label, description: AGENTS[type].description, suggestions: AGENTS[type].suggestions }));

  return (
    <>
      <PageHeader
        title="AI Agent"
        description="Four agents that work through tools on your real data: devices, automations, contacts and analytics."
        actions={<Badge tone={llmEnabled() ? "green" : "yellow"}>{llmEnabled() ? "LLM mode" : "Offline rules mode"}</Badge>}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Agent console" padded={false} className="lg:col-span-2"><AgentChat agents={agents} initial={initial} /></Card>
        <div className="space-y-6">
          <Card title="Customer service auto-reply"><CustomerServiceSettings config={{ enabled: config.enabled, deviceId: config.deviceId, customPrompt: config.customPrompt }} devices={devices.map((d) => ({ id: d.id, name: d.name }))} /></Card>
          <Card><UsageMeter label="AI requests this month" used={usage.ai} limit={sub.limits.aiRequestsPerMonth} /></Card>
        </div>
        <Card title="Knowledge base" description="Used by the customer service agent to answer questions." padded={false} className="lg:col-span-2">
          <DataTable
            rows={knowledge}
            rowKey={(k) => k.id}
            emptyTitle="Knowledge base is empty"
            emptyDescription="Add FAQs, prices and policies so the agent can answer accurately."
            columns={[
              { header: "Title", cell: (k) => <span className="font-medium text-slate-900">{k.title}</span> },
              { header: "Content", cell: (k) => <span className="line-clamp-2 max-w-md text-xs text-slate-600">{k.content}</span> },
              { header: "", cell: (k) => <DeleteButton path={`/api/ai/knowledge/${k.id}`} label="" confirm="Delete this entry?" /> },
            ]}
          />
        </Card>
        <Card title="Add knowledge"><KnowledgeForm /></Card>
      </div>
    </>
  );
}
