import { ArrowUpRight, Check } from "lucide-react";
import { ButtonLink } from "@/shared/components/ButtonLink";
import { cn, formatIDR } from "@/shared/utils/format";
import { planFeatures } from "@/features/subscription/plan-features";
import { DEFAULT_PLANS } from "@/modules/subscription/domain/plans";

export function PricingCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {DEFAULT_PLANS.map((plan) => {
        const featured = plan.code === "PRO";
        return (
          <article key={plan.code} className={cn("marketing-card-lift relative flex flex-col rounded-[1.5rem] border p-6 sm:p-7", featured ? "border-[#10231d] bg-[#10231d] text-white shadow-xl shadow-[#10231d]/15" : "border-[#10231d]/10 bg-white text-[#10231d]")}>
            {featured && <span className="absolute -top-3 left-6 rounded-full bg-[#c7f36b] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#10231d]">Most popular</span>}
            <div className="flex items-start justify-between gap-4"><div><p className={cn("text-[11px] font-bold uppercase tracking-[0.18em]", featured ? "text-[#c7f36b]" : "text-[#5b8451]")}>{plan.code}</p><h3 className="mt-3 text-2xl font-semibold tracking-tight">{plan.name}</h3></div><ArrowUpRight size={18} className={featured ? "text-[#c7f36b]" : "text-[#94a89b]"} /></div>
            <p className={cn("mt-3 min-h-12 text-sm leading-6", featured ? "text-slate-400" : "text-[#718279]")}>{plan.description}</p>
            <p className="mt-6 text-3xl font-semibold tracking-tight">{plan.priceMonthly ? formatIDR(plan.priceMonthly) : "Free"}<span className={cn("text-sm font-normal", featured ? "text-slate-500" : "text-[#84958b]")}>{plan.priceMonthly ? " / month" : ""}</span></p>
            <div className={cn("my-6 h-px", featured ? "bg-white/10" : "bg-[#10231d]/10")} />
            <ul className={cn("flex-1 space-y-3 text-sm", featured ? "text-slate-300" : "text-[#51685b]")}>
              {planFeatures(plan.limits).map((feature) => <li key={feature} className="flex gap-2.5"><Check size={16} className={cn("mt-0.5 shrink-0", featured ? "text-[#c7f36b]" : "text-[#5c9b4b]")} />{feature}</li>)}
            </ul>
            <ButtonLink href="/register" variant={featured ? "primary" : "secondary"} className={cn("mt-8 !h-12 !w-full !rounded-full !font-semibold", featured ? "!bg-[#c7f36b] !text-[#10231d] hover:!bg-[#d9ff8a]" : "!border-[#10231d]/15 !bg-transparent !text-[#10231d] hover:!bg-[#eef4e8]")}>{plan.priceMonthly ? `Start with ${plan.name}` : "Start for free"}</ButtonLink>
          </article>
        );
      })}
    </div>
  );
}
