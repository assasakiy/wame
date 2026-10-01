import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "@/shared/components/Logo";

const COLUMNS = [
  {
    label: "Explore",
    links: [
      ["Platform", "/features"],
      ["Pricing", "/pricing"],
      ["Documentation", "/docs"],
    ],
  },
  {
    label: "Company",
    links: [
      ["Contact", "/contact"],
      ["Sign in", "/login"],
      ["Create workspace", "/register"],
    ],
  },
] as const;

export function MarketingFooter() {
  return (
    <footer className="bg-[#0d1d18] text-white">
      <div className="mx-auto max-w-[1400px] px-5 pb-7 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div>
            <Logo dark />
            <p className="mt-5 max-w-sm text-[15px] leading-7 text-slate-400">
              A calmer, sharper way to run WhatsApp conversations. Built for teams that care about every reply.
            </p>
            <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c7f36b]">The conversation operating system</p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.label}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{column.label}</p>
              <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-slate-300">
                {column.links.map(([label, href]) => (
                  <Link key={href} href={href} className="transition-colors hover:text-[#c7f36b]">{label}</Link>
                ))}
              </nav>
            </div>
          ))}

          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <p className="text-sm font-medium text-white">Ready to make the inbox useful?</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Start with one workspace. Add complexity only when you need it.</p>
            <Link href="/register" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#c7f36b] transition-colors hover:text-white">
              Open your workspace <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} WAME. Not affiliated with WhatsApp or Meta.</p>
          <p className="text-slate-600">Built for the conversations that move business forward.</p>
        </div>
      </div>
    </footer>
  );
}
