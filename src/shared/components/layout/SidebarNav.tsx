"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/shared/config/navigation";
import { NAV_ICONS } from "@/shared/components/layout/nav-icons";
import { cn } from "@/shared/utils/format";

export function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {items.map((item) => {
        const Icon = NAV_ICONS[item.icon];
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-emerald-500/15 text-emerald-300" : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
