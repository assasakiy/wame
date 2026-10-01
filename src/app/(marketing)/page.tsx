import {
  Activity,
  ArrowRight,
  Bot,
  Check,
  CheckCheck,
  ChevronRight,
  Code2,
  MessageCircle,
  MoreHorizontal,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { ButtonLink } from "@/shared/components/ButtonLink";
import { FeatureGrid } from "@/features/marketing/components/FeatureGrid";
import { PricingCards } from "@/features/marketing/components/PricingCards";
import { STEPS } from "@/features/marketing/content";

const TICKER_ITEMS = ["MULTI-DEVICE", "REALTIME EVENTS", "AUTOMATION", "AI AGENTS", "DEVELOPER API", "TEAM READY"];

function LiveInboxPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[650px]">
      <div className="marketing-float-reverse absolute -right-2 -top-8 z-10 hidden items-center gap-2 rounded-full border border-[#c7f36b]/30 bg-[#19362a] px-3 py-2 text-[11px] font-medium text-[#dfffaa] shadow-xl shadow-black/20 sm:flex">
        <span className="marketing-pulse h-2 w-2 rounded-full bg-[#c7f36b]" /> 3 devices online
      </div>

      <div className="relative rounded-[1.75rem] border border-white/15 bg-[#1b382c] p-2 shadow-2xl shadow-black/30 sm:p-3">
        <div className="overflow-hidden rounded-[1.25rem] bg-[#f4f6ee]">
          <div className="flex items-center justify-between border-b border-[#10231d]/10 bg-white px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#10231d] text-[#c7f36b]"><MessageCircle size={15} fill="currentColor" /></span>
              <span className="text-xs font-bold tracking-[0.16em] text-[#10231d]">WAME / INBOX</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-medium text-[#587066]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#65c45b]" /> LIVE
              <MoreHorizontal size={16} />
            </div>
          </div>

          <div className="grid min-h-[395px] sm:grid-cols-[185px_1fr]">
            <aside className="hidden border-r border-[#10231d]/10 bg-[#eef2e7] p-3 sm:block">
              <div className="mb-4 flex items-center justify-between px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#789086]">
                <span>Inbox</span><span className="rounded-full bg-[#dce8d2] px-1.5 py-0.5 text-[#416052]">12</span>
              </div>
              <div className="space-y-1.5">
                {[
                  ["Budi Santoso", "Paket Pro?", "now"],
                  ["Sari · new lead", "Boleh minta katalog?", "2m"],
                  ["Raka Wijaya", "Terima kasih!", "8m"],
                  ["Nadia Store", "Pesanan #2418", "13m"],
                ].map(([name, message, time], index) => (
                  <div key={name} className={`rounded-xl p-2.5 ${index === 0 ? "bg-white shadow-sm" : ""}`}>
                    <div className="flex items-center justify-between gap-2"><span className="truncate text-[11px] font-semibold text-[#20382e]">{name}</span><span className="text-[9px] text-[#91a39b]">{time}</span></div>
                    <p className="mt-1 truncate text-[10px] text-[#759087]">{message}</p>
                  </div>
                ))}
              </div>
            </aside>

            <div className="relative flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-[#10231d]/10 px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dff3bd] text-xs font-bold text-[#315438]">BS</span>
                  <div><p className="text-xs font-semibold text-[#20382e]">Budi Santoso</p><p className="mt-0.5 flex items-center gap-1 text-[10px] text-[#789086]"><span className="h-1.5 w-1.5 rounded-full bg-[#65c45b]" /> WhatsApp · 2m ago</p></div>
                </div>
                <span className="rounded-full bg-[#eef7e3] px-2 py-1 text-[9px] font-semibold text-[#5d8051]">VIP lead</span>
              </div>

              <div className="flex-1 space-y-3 bg-[radial-gradient(circle_at_50%_0%,#f6f9f0,white_62%)] px-4 py-5 sm:px-7">
                <p className="w-fit max-w-[78%] rounded-2xl rounded-tl-sm bg-[#edf1ea] px-3.5 py-2.5 text-[11px] leading-5 text-[#365046]">Halo, berapa harga paket Pro?</p>
                <div className="ml-auto w-fit max-w-[84%] rounded-2xl rounded-tr-sm bg-[#10231d] px-3.5 py-2.5 text-[11px] leading-5 text-white shadow-lg shadow-[#10231d]/10">
                  Hi Budi! Paket Pro Rp149.000/bulan — 5 device, API & broadcast. 🚀
                  <div className="mt-1.5 flex items-center justify-end gap-1 text-[9px] text-[#c7f36b]"><CheckCheck size={12} /> delivered</div>
                </div>
                <div className="flex items-center gap-2 py-2 text-[9px] uppercase tracking-[0.16em] text-[#9aac9f]"><span className="h-px flex-1 bg-[#10231d]/10" /> automation <span className="h-px flex-1 bg-[#10231d]/10" /></div>
                <p className="w-fit max-w-[78%] rounded-2xl rounded-tl-sm border border-[#dce9d5] bg-[#f6faef] px-3.5 py-2.5 text-[11px] leading-5 text-[#365046]">Knowledge base matched · reply sent in 0.8s</p>
              </div>

              <div className="flex items-center gap-2 border-t border-[#10231d]/10 px-4 py-3 sm:px-5">
                <div className="h-8 flex-1 rounded-lg bg-[#f2f5ee] px-3 py-2 text-[10px] text-[#9aac9f]">Type a message…</div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c7f36b] text-[#10231d]"><ArrowRight size={14} /></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="marketing-float absolute -bottom-5 -left-3 z-10 hidden w-44 rounded-2xl border border-[#10231d]/10 bg-white p-3 shadow-xl shadow-[#10231d]/10 sm:block">
        <div className="flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#789086]">Response time</span><Activity size={14} className="text-[#65a64b]" /></div>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-[#10231d]">0.8<span className="text-sm text-[#789086]">s</span></p>
        <div className="mt-2 flex items-end gap-1">
          {[8, 12, 10, 17, 14, 21, 25, 31, 28, 36].map((height, index) => <span key={index} className="w-1.5 rounded-full bg-[#b9df8e]" style={{ height }} />)}
        </div>
      </div>
    </div>
  );
}

function SignalCard() {
  return (
    <article className="marketing-card-lift relative overflow-hidden rounded-[1.75rem] bg-[#10231d] p-6 text-white sm:p-8 lg:col-span-7">
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#c7f36b]/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-6">
        <div><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c7f36b]">One source of truth</span><h3 className="mt-4 max-w-sm text-2xl font-semibold tracking-tight sm:text-3xl">See the signal, not just the messages.</h3></div>
        <span className="hidden rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-medium text-slate-300 sm:inline-flex">REALTIME</span>
      </div>
      <p className="relative mt-4 max-w-md text-sm leading-6 text-slate-400">Every device, reply and delivery event in one quiet control room. No tab archaeology required.</p>
      <div className="relative mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-3">
        <div className="mb-3 flex items-center justify-between px-1 text-[10px] text-slate-500"><span>WORKSPACE ACTIVITY</span><span>Last 24 hours</span></div>
        <div className="space-y-2">
          {[
            ["message.received", "Budi Santoso", "just now", "bg-[#c7f36b]"],
            ["automation.executed", "Pricing reply", "2m ago", "bg-[#73b9ed]"],
            ["device.connected", "Support · 62812…", "8m ago", "bg-[#d9a76c]"],
          ].map(([event, subject, time, color]) => (
            <div key={event} className="flex items-center gap-3 rounded-xl bg-black/15 px-3 py-2.5"><span className={`h-2 w-2 shrink-0 rounded-full ${color}`} /><span className="min-w-0 flex-1"><span className="block text-[10px] font-medium text-slate-300">{event}</span><span className="block truncate text-[11px] text-slate-500">{subject}</span></span><span className="text-[10px] text-slate-600">{time}</span></div>
          ))}
        </div>
      </div>
    </article>
  );
}

function ApiCard() {
  return (
    <article className="marketing-card-lift rounded-[1.75rem] border border-[#10231d]/10 bg-white p-6 sm:p-8 lg:col-span-5">
      <div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5d8] text-[#4c7e45]"><Code2 size={19} /></span><span className="font-mono text-[10px] text-[#9aac9f]">01 / API</span></div>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-[#10231d]">Plug it into your stack.</h3>
      <p className="mt-3 text-sm leading-6 text-[#647970]">A small API surface for a big conversation layer. Send, listen and build on events.</p>
      <div className="mt-7 overflow-hidden rounded-2xl bg-[#10231d] p-4 font-mono text-[10px] leading-6 text-slate-400">
        <p><span className="text-[#c7f36b]">POST</span> <span className="text-slate-200">/api/v1/messages/send</span></p>
        <p className="mt-2 text-slate-600">&#123;</p>
        <p className="pl-3"><span className="text-[#8fd6cb]">&quot;to&quot;</span>: <span className="text-[#e3be83]">&quot;62812…&quot;</span>,</p>
        <p className="pl-3"><span className="text-[#8fd6cb]">&quot;text&quot;</span>: <span className="text-[#e3be83]">&quot;Hello from WAME&quot;</span></p>
        <p className="text-slate-600">&#125;</p>
        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[#c7f36b]"><span className="h-1.5 w-1.5 rounded-full bg-[#c7f36b]" /> 202 · queued</div>
      </div>
    </article>
  );
}

function WorkflowCard() {
  return (
    <article className="marketing-card-lift rounded-[1.75rem] border border-[#10231d]/10 bg-[#e7f3d6] p-6 sm:p-8 lg:col-span-5">
      <div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c7f36b] text-[#10231d]"><Workflow size={19} /></span><span className="font-mono text-[10px] text-[#71886e]">02 / FLOW</span></div>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight text-[#10231d]">Let the repeatable repeat itself.</h3>
      <p className="mt-3 text-sm leading-6 text-[#58705f]">Trigger → condition → action. Your best reply should never depend on who happens to be online.</p>
      <div className="mt-7 space-y-2">
        {[{ label: "Customer says", value: "harga", tint: "bg-white" }, { label: "Then check", value: "tag = interested", tint: "bg-white/70" }, { label: "Then send", value: "pricing reply", tint: "bg-[#10231d]" }].map((step, index) => (
          <div key={step.label} className="flex items-center gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#8fb57c] text-[10px] font-semibold text-[#4c7e45]">{index + 1}</span><div className={`flex min-w-0 flex-1 items-center justify-between rounded-xl px-3 py-2.5 ${step.tint} ${index === 2 ? "text-white" : "text-[#355542]"}`}><span className="text-[10px] text-[#789086]">{step.label}</span><span className="truncate text-[11px] font-semibold">{step.value}</span></div></div>
        ))}
      </div>
    </article>
  );
}

function AgentCard() {
  return (
    <article className="marketing-card-lift overflow-hidden rounded-[1.75rem] border border-[#10231d]/10 bg-[#fffdf8] p-6 sm:p-8 lg:col-span-7">
      <div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f9e8c9] text-[#a76d2e]"><Bot size={19} /></span><span className="font-mono text-[10px] text-[#a59a83]">03 / AGENT</span></div>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_220px] md:items-end">
        <div><h3 className="text-2xl font-semibold tracking-tight text-[#10231d]">AI with context, not theatre.</h3><p className="mt-3 max-w-md text-sm leading-6 text-[#6d786e]">Give your team an agent that can search the knowledge base, understand the thread and know when to hand off.</p></div>
        <div className="rounded-2xl border border-[#eadfca] bg-[#fff8e9] p-3"><div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10231d] text-[#c7f36b]"><Sparkles size={13} /></span><div><p className="text-[10px] font-semibold text-[#40533f]">Customer service</p><p className="text-[9px] text-[#9a927c]">Knowledge base on</p></div></div><div className="mt-3 flex items-center gap-1.5 text-[9px] text-[#6f7f6b]"><Check size={12} className="text-[#67a150]" /> uses real workspace data</div></div>
      </div>
    </article>
  );
}

export default function HomePage() {
  return (
    <div className="overflow-hidden bg-[#f4f6ee] text-[#10231d]">
      <section className="relative overflow-hidden bg-[#0d1d18] text-white">
        <div className="marketing-grid absolute inset-0" aria-hidden="true" />
        <div className="marketing-noise absolute inset-0" aria-hidden="true" />
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-[#c7f36b]/10 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1400px] items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-12 lg:pb-32 lg:pt-24">
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c7f36b]"><span>01</span><span className="h-px w-8 bg-[#c7f36b]/60" /><span>WhatsApp operating system</span></div>
            <h1 className="mt-7 max-w-3xl text-[clamp(3.65rem,8vw,7.3rem)] font-semibold leading-[0.88] tracking-[-0.085em] text-[#f4f6ee]">Less tab-switching.<br /><span className="font-serif font-normal italic text-[#c7f36b]">More momentum.</span></h1>
            <p className="mt-8 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">WAME turns WhatsApp into a reliable operating layer for your team — devices, automation, API and AI in one clear place.</p>
            <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <ButtonLink href="/register" size="lg" className="!h-14 !rounded-full !bg-[#c7f36b] !px-7 !font-semibold !text-[#10231d] hover:!bg-[#d9ff8a]">Start with a free workspace <ArrowRight size={17} /></ButtonLink>
              <a href="#platform" className="group inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors hover:text-white"><span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 transition-colors group-hover:border-[#c7f36b] group-hover:text-[#c7f36b]">↓</span> Explore the system</a>
            </div>
            <div className="mt-12 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500"><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#c7f36b]" /> No credit card</span><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#73b9ed]" /> API-first</span><span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#d9a76c]" /> Multi-tenant</span></div>
          </div>
          <div className="relative z-10 lg:pt-8"><LiveInboxPreview /></div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-[#10231d]/10 bg-[#c7f36b] text-[#10231d]">
        <div className="marketing-marquee flex w-max items-center py-3.5 text-[10px] font-bold tracking-[0.22em]">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => <span key={`${item}-${index}`} className="flex items-center gap-7 px-5"><span className="h-1.5 w-1.5 rounded-full bg-[#10231d]" />{item}</span>)}
        </div>
      </div>

      <section id="platform" className="marketing-paper-grid bg-[#f4f6ee] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5b8451]">02 / The whole signal</p><h2 className="mt-5 max-w-lg text-4xl font-semibold leading-[0.96] tracking-[-0.055em] text-[#10231d] sm:text-6xl">The inbox is only the beginning.</h2></div>
            <p className="max-w-xl text-base leading-7 text-[#60756b] lg:justify-self-end lg:text-lg">When a conversation becomes important, it deserves more than a notification. WAME connects the moving parts so your team can respond with context.</p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-12">
            <SignalCard />
            <ApiCard />
            <WorkflowCard />
            <AgentCard />
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5b8451]">03 / Built in</p><h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-none tracking-[-0.055em] text-[#10231d] sm:text-6xl">The boring, important bits.<br /><span className="font-serif font-normal italic text-[#8bad72]">Already handled.</span></h2></div><p className="max-w-xs text-sm leading-6 text-[#718279]">Thoughtful defaults for the details that make a messaging system dependable.</p></div>
          <div className="mt-14"><FeatureGrid /></div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#10231d] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_20%,rgba(199,243,107,.15),transparent_52%)]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div><p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c7f36b]">04 / Start small</p><h2 className="mt-5 max-w-xl text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-6xl">Make the first reply feel like a system.</h2><p className="mt-6 max-w-md text-base leading-7 text-slate-400">No six-week rollout. Link a device, add one rule, and let the rest of the workspace grow around what works.</p></div>
          <div className="relative">
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative flex gap-5 pb-10 last:pb-0">
                {index < STEPS.length - 1 && <span className="absolute left-[1.1rem] top-10 h-[calc(100%-1.2rem)] w-px bg-white/15" aria-hidden="true" />}
                <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#c7f36b]/50 bg-[#10231d] text-sm font-semibold text-[#c7f36b]">0{index + 1}</span>
                <div className="pt-1"><h3 className="text-lg font-medium text-white">{step.title}</h3><p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-400">{step.description}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f6ee] px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1180px]"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#5b8451]">05 / Transparent plans</p><h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] text-[#10231d] sm:text-6xl">Pay for the stage you&apos;re in.</h2></div><p className="max-w-xs text-sm leading-6 text-[#718279] sm:text-right">Start free. Move up when your conversations do.</p></div><div className="mt-12"><PricingCards /></div></div>
      </section>

      <section className="relative overflow-hidden bg-[#c7f36b] px-5 py-20 text-[#10231d] sm:px-8 sm:py-28 lg:px-12">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-[40px] border-[#10231d]/[0.07]" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-[1180px] flex-col gap-9 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#527642]">06 / Your move</p><h2 className="mt-5 max-w-2xl text-5xl font-semibold leading-[0.9] tracking-[-0.07em] sm:text-7xl">Give your conversations somewhere to go.</h2></div><ButtonLink href="/register" size="lg" variant="dark" className="!h-14 !w-fit !rounded-full !bg-[#10231d] !px-7 !font-semibold hover:!bg-[#1e4032]">Create workspace <ChevronRight size={17} /></ButtonLink></div>
      </section>
    </div>
  );
}
