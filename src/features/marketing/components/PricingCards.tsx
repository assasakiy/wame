import { Check } from "lucide-react";
import { ButtonLink } from "@/shared/components/ButtonLink";
import { cn, formatIDR } from "@/shared/utils/format";
import { planFeatures } from "@/features/subscription/plan-features";
import { DEFAULT_PLANS } from "@/modules/subscription/domain/plans";

export function PricingCards() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {DEFAULT_PLANS.map((p) => {
        const featured = p.code === "PRO";
        return (
          <div key={p.code} className={cn("relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm", featured ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200")}>
            {featured && <span className="absolute -top-3 left-7 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold text-white">Most popular</span>}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{p.description}</p>
            <p className="mt-5 text-3xl font-bold">{p.priceMonthly ? formatIDR(p.priceMonthly) : "Free"}<span className="text-sm font-normal text-slate-500">{p.priceMonthly ? " / month" : ""}</span></p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-slate-700">
              {planFeatures(p.limits).map((f) => <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />{f}</li>)}
            </ul>
            <ButtonLink href="/register" variant={featured ? "primary" : "secondary"} className="mt-7 w-full">{p.priceMonthly ? `Start with ${p.name}` : "Start for free"}</ButtonLink>
          </div>
        );
      })}
    </div>
  );
}
