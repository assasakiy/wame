import Link from "next/link";
import { Logo } from "@/shared/components/Logo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-sm text-slate-500">WhatsApp gateway, automation and AI agents in one platform.</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <Link href="/features" className="hover:text-slate-900">Features</Link>
          <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
          <Link href="/docs" className="hover:text-slate-900">Docs</Link>
          <Link href="/contact" className="hover:text-slate-900">Contact</Link>
          <Link href="/login" className="hover:text-slate-900">Sign in</Link>
        </nav>
      </div>
      <p className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">© {new Date().getFullYear()} WAME. Not affiliated with WhatsApp or Meta.</p>
    </footer>
  );
}
