import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { ButtonLink } from "@/shared/components/ButtonLink";
import { Logo } from "@/shared/components/Logo";

const LINKS = [
  { href: "/features", label: "Platform" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Developers" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0d1d18] text-white">
      <div className="mx-auto flex h-[4.75rem] max-w-[1400px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Logo dark />

        <div className="hidden items-center gap-8 md:flex">
          <nav className="flex items-center gap-7 text-[13px] font-medium text-slate-300">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[#c7f36b]">
                {link.label}
              </Link>
            ))}
          </nav>
          <span className="h-5 w-px bg-white/15" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="ghost" size="sm" className="!h-10 !rounded-full !px-4 !text-slate-200 hover:!bg-white/10 hover:!text-white">
              Sign in
            </ButtonLink>
            <ButtonLink href="/register" size="sm" className="!h-10 !rounded-full !bg-[#c7f36b] !px-4 !font-semibold !text-[#10231d] hover:!bg-[#d8ff8a]">
              Start free <ArrowUpRight size={15} />
            </ButtonLink>
          </div>
        </div>

        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none rounded-full border border-white/15 p-2.5 text-slate-200 transition-colors hover:bg-white/10" aria-label="Open navigation menu">
            <Menu size={19} />
          </summary>
          <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-[#152c24] p-2 shadow-2xl shadow-black/30">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-3 text-sm text-slate-200 transition-colors hover:bg-white/10 hover:text-[#c7f36b]">
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-white/10" />
            <Link href="/login" className="block rounded-xl px-3 py-3 text-sm text-slate-200 hover:bg-white/10">Sign in</Link>
            <Link href="/register" className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#c7f36b] px-3 py-3 text-sm font-semibold text-[#10231d]">Start free <ArrowUpRight size={15} /></Link>
          </div>
        </details>
      </div>
    </header>
  );
}
