"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { NavItem } from "@/shared/config/navigation";
import { AdminIcon } from "@/shared/components/layout/nav-icons";
import { LiveUpdates } from "@/shared/components/layout/LiveUpdates";
import { SidebarNav } from "@/shared/components/layout/SidebarNav";
import { Badge } from "@/shared/components/Badge";
import { Logo } from "@/shared/components/Logo";

interface Props {
  nav: NavItem[];
  area: "user" | "admin";
  showSwitch: boolean;
  user: { name: string; email: string; planCode: string; role: string };
  children: ReactNode;
}

export function AppShell({ nav, area, showSwitch, user, children }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <Logo dark href={area === "admin" ? "/admin" : "/dashboard"} />
        {area === "admin" && <Badge tone="purple">Admin</Badge>}
      </div>
      <SidebarNav items={nav} onNavigate={() => setOpen(false)} />
      {showSwitch && (
        <Link href={area === "admin" ? "/dashboard" : "/admin"} className="mx-3 mb-3 flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
          <AdminIcon size={16} /> {area === "admin" ? "Back to workspace" : "Admin console"}
        </Link>
      )}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">{user.name.charAt(0).toUpperCase()}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.role === "SUPER_ADMIN" ? "Super Admin" : `${user.planCode} plan`}</p>
          </div>
          <button onClick={logout} aria-label="Log out" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} />
          <div className="relative h-full w-72 max-w-[85%]">
            {sidebar}
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-[-44px] top-3 rounded-full bg-white p-2 shadow">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100">
            <Menu size={20} />
          </button>
          <Logo href={area === "admin" ? "/admin" : "/dashboard"} />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
      <LiveUpdates />
    </div>
  );
}
