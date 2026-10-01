import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/shared/components/Logo";

const FOOTER_LINKS = [
  ["Platform", "/features"],
  ["Pricing", "/pricing"],
  ["Documentation", "/docs"],
  ["Contact", "/contact"],
  ["Sign in", "/login"],
] as const;

export function MarketingFooter() {
  return (
    <footer className="bg-[#10231d] text-white">
      <div className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="flex flex-col gap-10 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Logo dark />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">The practical operating layer for teams running conversations on WhatsApp.</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              {FOOTER_LINKS.map(([label, href]) => <Link key={href} href={href} className="transition-colors hover:text-[#c7f36b]">{label}</Link>)}
            </nav>
            <Link href="/register" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#c7f36b] transition-colors hover:text-white">Create workspace <ArrowUpRight size={15} /></Link>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} WAME. Not affiliated with WhatsApp or Meta.</p><p>Built for useful conversations.</p></div>
      </div>
    </footer>
  );
}
