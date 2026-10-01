import { ArrowRight, CheckCheck } from "lucide-react";
import { ButtonLink } from "@/shared/components/ButtonLink";
import { FeatureGrid } from "@/features/marketing/components/FeatureGrid";
import { PricingCards } from "@/features/marketing/components/PricingCards";
import { STEPS } from "@/features/marketing/content";

function ChatMockup() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
      <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">W</span>
        <div><p className="text-sm font-medium text-white">Customer Support</p><p className="text-xs text-emerald-400">● connected · healthy</p></div>
      </div>
      <div className="space-y-3 py-4 text-sm">
        <p className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-800 px-3 py-2 text-slate-100">Halo, berapa harga paket Pro?</p>
        <p className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-emerald-600 px-3 py-2 text-white">Hi Budi! Paket Pro Rp149.000/bulan — 5 device, API & broadcast. 🚀</p>
        <p className="text-center text-[11px] text-slate-500">⚡ auto-reply · AI knowledge base</p>
        <p className="flex items-center justify-end gap-1 text-[11px] text-slate-400"><CheckCheck size={14} className="text-sky-400" /> delivered · 0.8s</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">WhatsApp Gateway SaaS</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Run WhatsApp like a platform, not a phone.</h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">WAME connects multiple WhatsApp numbers to one dashboard, one API and a team of AI agents — with automation, broadcast and realtime monitoring built in.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/register" size="lg">Start free <ArrowRight size={18} /></ButtonLink>
              <ButtonLink href="/docs" size="lg" variant="secondary" className="border-slate-600 bg-transparent text-white hover:bg-slate-800">Read the docs</ButtonLink>
            </div>
          </div>
          <ChatMockup />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight">Everything you need to scale conversations</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-600">From a single number to a fleet of devices, with the controls a growing business expects.</p>
        <div className="mt-10"><FeatureGrid /></div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">Live in three steps</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="rounded-2xl bg-slate-50 p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white">{i + 1}</span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight">Simple, scalable pricing</h2>
        <p className="mt-3 text-center text-slate-600">Start free. Upgrade when you grow.</p>
        <div className="mt-12"><PricingCards /></div>
      </section>
    </>
  );
}
