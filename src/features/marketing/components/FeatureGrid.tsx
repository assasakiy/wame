import { ArrowUpRight } from "lucide-react";
import { FEATURES } from "@/features/marketing/content";

export function FeatureGrid() {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, description }, index) => (
        <article key={title} className="marketing-card-lift group rounded-2xl border border-[#10231d]/10 bg-[#fffefa] p-6 sm:p-7">
          <div className="flex items-start justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f2df] text-[#4e7e48] transition-colors group-hover:bg-[#c7f36b] group-hover:text-[#10231d]"><Icon size={19} /></span><span className="font-mono text-[10px] text-[#9aac9f]">0{index + 1}</span></div>
          <h3 className="mt-7 text-[17px] font-semibold tracking-tight text-[#10231d]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#6b7c73]">{description}</p>
          <div className="mt-6 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6d9160] opacity-0 transition-opacity group-hover:opacity-100">Learn more <ArrowUpRight size={13} /></div>
        </article>
      ))}
    </div>
  );
}
