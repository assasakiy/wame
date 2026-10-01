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
    <header className="sticky top-0 z-50 border-b border-[#10231d]/10 bg-[#f7f8f1]/95 text-[#10231d] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[1200px] items-center justify-between px-5 sm:px-8 lg:px-10">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          <nav className="flex items-center gap-7 text-[13px] font-medium text-[#607269]">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[#10231d]">{link.label}</Link>
            ))}
          </nav>
          <span className="h-5 w-px bg-[#10231d]/10" aria-hidden="true" />
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="ghost" size="sm" className="!h-10 !rounded-full !px-4 !text-[#52645a] hover:!bg-[#e9eee2] hover:!text-[#10231d]">Sign in</ButtonLink>
            <ButtonLink href="/register" size="sm" className="!h-10 !rounded-full !bg-[#10231d] !px-4 !font-semibold !text-white hover:!bg-[#24483a]">Start free <ArrowUpRight size={15} /></ButtonLink>
          </div>
        </div>

        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none rounded-full border border-[#10231d]/15 p-2.5 text-[#10231d] transition-colors hover:bg-[#e9eee2]" aria-label="Open navigation menu"><Menu size={19} /></summary>
          <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-[#10231d]/10 bg-[#fffefa] p-2 shadow-xl shadow-[#10231d]/10">
            {LINKS.map((link) => <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-3 text-sm text-[#52645a] hover:bg-[#eef3e8] hover:text-[#10231d]">{link.label}</Link>)}
            <div className="my-2 h-px bg-[#10231d]/10" />
            <Link href="/login" className="block rounded-xl px-3 py-3 text-sm text-[#52645a] hover:bg-[#eef3e8]">Sign in</Link>
            <Link href="/register" className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-[#10231d] px-3 py-3 text-sm font-semibold text-white">Start free <ArrowUpRight size={15} /></Link>
          </div>
        </details>
      </div>
    </header>
  );
}
