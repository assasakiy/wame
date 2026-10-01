import { ArrowUpRight } from "lucide-react";
import { FEATURES } from "@/features/marketing/content";

export function FeatureGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, description }, index) => (
        <article key={title} className="marketing-card-lift group relative overflow-hidden rounded-[1.5rem] border border-[#10231d]/10 bg-[#f8faf4] p-6 sm:p-7">
          <div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e4f2d4] text-[#4c7e45] transition-colors group-hover:bg-[#c7f36b] group-hover:text-[#10231d]"><Icon size={20} /></span><span className="font-mono text-[10px] text-[#a0b0a5]">0{index + 1}</span></div>
          <h3 className="mt-8 text-lg font-semibold tracking-tight text-[#10231d]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[#6b7d73]">{description}</p>
          <div className="mt-7 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#76916e] opacity-0 transition-opacity group-hover:opacity-100">Explore capability <ArrowUpRight size={13} /></div>
        </article>
      ))}
    </div>
  );
}
