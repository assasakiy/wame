import { TOOLS, type ToolContext } from "@/modules/ai-agent/application/tools";
import type { AgentType } from "@/modules/ai-agent/domain/agents";

/**
 * Deterministic fallback used when no LLM key is configured. It routes the request to the
 * same tools an LLM would call, so the full "agent → tools → services → data" path works offline.
 */
export const FALLBACK_REPLY = "Thank you for your message! Our team will get back to you shortly.";

const RULE_PATTERN = /(?:keyword|kata kunci)\s+["“']?([^"”']+?)["”']?\s+(?:reply|balas|jawab|respond)(?:\s+with)?\s+["“']?(.+?)["”']?\s*$/is;

const fmt = (v: unknown) => JSON.stringify(v, null, 2);

async function automationAgent(message: string, ctx: ToolContext): Promise<string> {
  const match = RULE_PATTERN.exec(message);
  if (match) {
    const result = (await TOOLS.create_auto_reply.run(ctx, { keyword: match[1].trim(), reply: match[2].trim() })) as { name: string };
    return `✅ Created auto-reply rule "${result.name}".\nWhen a customer's message contains "${match[1].trim()}", I will reply: "${match[2].trim()}".`;
  }
  const rules = (await TOOLS.list_automations.run(ctx, {})) as { name: string; enabled: boolean; runs: number }[];
  const tips = [
    'Greeting: keyword "halo" → welcome message with {{name}}.',
    'Pricing: keyword "harga" → price list.',
    "Business hours: add a time condition (e.g. outside 09–17) and reply with an away message.",
    "Lead tagging: workflow that adds the tag \"interested\" when a customer says \"beli\".",
  ];
  return [
    rules.length ? `You have ${rules.length} automation(s):\n${rules.map((r) => `• ${r.name} (${r.enabled ? "on" : "off"}, ${r.runs} runs)`).join("\n")}` : "You have no automations yet.",
    `\nRecommendations:\n${tips.map((t) => `• ${t}`).join("\n")}`,
    '\nTo create one, tell me: keyword "price" reply "Our plans start at Rp149.000".',
  ].join("\n");
}

function draftTemplates(topic: string): string {
  const t = topic || "our latest offer";
  return [
    `Here are 3 templates for "${t}":`,
    `\n1) Announcement\nHi {{name}}! 🎉 ${t}. Reply *YES* to get the details.`,
    `\n2) Urgency\nHi {{name}}, last chance! ⏰ ${t} ends tonight. Tap here to claim: [link]`,
    `\n3) Personal follow-up\nHello {{name}}, we thought of you 😊 ${t}. Want us to reserve one for you?`,
    "\nTip: send to a small segment first and respect opt-outs.",
  ].join("\n");
}

async function marketingAgent(message: string, ctx: ToolContext): Promise<string> {
  if (/template|campaign|promo|draft|copy|caption/i.test(message)) {
    const topic = message.replace(/^(please\s+)?(draft|write|create|make|buat(kan)?)\s+(a\s+|an\s+)?(whatsapp\s+)?(template|campaign|promo)?\s*(for|about|untuk|tentang)?/i, "").trim();
    return draftTemplates(topic.slice(0, 120));
  }
  const data = (await TOOLS.analyze_customers.run(ctx, {})) as { totalContacts: number; newLast7Days: number; segments: { tag: string; count: number }[]; mostActive: { phone: string; n: number }[] };
  return [
    `📊 Customer analysis`,
    `• Total contacts: ${data.totalContacts} (+${data.newLast7Days} in the last 7 days)`,
    data.segments.length ? `• Segments: ${data.segments.map((s) => `${s.tag} (${s.count})`).join(", ")}` : "• No segments yet — tag contacts to enable targeted broadcasts.",
    data.mostActive.length ? `• Most active: ${data.mostActive.map((m) => `${m.phone} (${m.n} msgs)`).join(", ")}` : "• No inbound conversations yet.",
    "\nSuggestion: re-engage your largest segment with a short personalised offer, then measure replies.",
  ].join("\n");
}

async function adminAgent(message: string, ctx: ToolContext): Promise<string> {
  if (/health|status|monitor|device|kesehatan/i.test(message)) {
    return `🩺 System health\n${fmt(await TOOLS.system_health.run(ctx, {}))}`;
  }
  if (/report|laporan|summary|weekly|analy/i.test(message)) {
    const r = (await TOOLS.message_report.run(ctx, { days: 7 })) as {
      totals: Record<string, number>; deliveryRate: number; failureRate: number; perDay: { day: string; out: number; in: number }[];
    };
    return [
      "📈 7-day report",
      `• Sent: ${r.totals.sent} · Delivered: ${r.totals.delivered} · Failed: ${r.totals.failed} · Received: ${r.totals.received}`,
      `• Delivery rate ${r.deliveryRate}% · Failure rate ${r.failureRate}%`,
      ...r.perDay.map((d) => `  ${d.day}: ${d.out} out / ${d.in} in`),
    ].join("\n");
  }
  const u = (await TOOLS.get_usage_stats.run(ctx, {})) as { plan: string; limits: Record<string, number>; usage: Record<string, number> };
  return [
    `📦 Usage on the ${u.plan} plan`,
    `• Devices: ${u.usage.devices}/${u.limits.devices}`,
    `• Messages this month: ${u.usage.messages}/${u.limits.messagesPerMonth}`,
    `• Contacts: ${u.usage.contacts} · Automations: ${u.usage.automations}/${u.limits.automations}`,
    "\nTry: \"Generate a weekly report\" or \"Check system health\".",
  ].join("\n");
}

export async function offlineAgent(agent: AgentType, message: string, ctx: ToolContext): Promise<string> {
  switch (agent) {
    case "automation":
      return automationAgent(message, ctx);
    case "marketing":
      return marketingAgent(message, ctx);
    case "admin":
      return adminAgent(message, ctx);
    case "customer_service": {
      const hits = (await TOOLS.search_knowledge.run(ctx, { query: message })) as { title: string; content: string }[];
      return hits[0] ? hits[0].content.slice(0, 600) : FALLBACK_REPLY;
    }
  }
}
