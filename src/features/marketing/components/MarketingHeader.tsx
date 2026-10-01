import Link from "next/link";
import { Menu } from "lucide-react";
import { ButtonLink } from "@/shared/components/ButtonLink";
import { Logo } from "@/shared/components/Logo";

const LINKS = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Documentation" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          {LINKS.map((l) => <Link key={l.href} href={l.href} className="hover:text-slate-900">{l.label}</Link>)}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/login" variant="ghost" size="sm">Sign in</ButtonLink>
          <ButtonLink href="/register" size="sm">Get started</ButtonLink>
        </div>
        <details className="relative md:hidden">
          <summary className="flex cursor-pointer list-none rounded-lg p-2 hover:bg-slate-100" aria-label="Menu"><Menu size={22} /></summary>
          <div className="absolute right-0 mt-2 w-56 space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            {LINKS.map((l) => <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">{l.label}</Link>)}
            <Link href="/login" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">Sign in</Link>
            <Link href="/register" className="block rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-medium text-white">Get started</Link>
          </div>
        </details>
      </div>
    </header>
  );
}
