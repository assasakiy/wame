import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { cn } from "@/shared/utils/format";

export function Logo({ dark = false, href = "/" }: { dark?: boolean; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
        <MessageCircle size={18} strokeWidth={2.5} />
      </span>
      <span className={cn("text-lg font-bold tracking-tight", dark ? "text-white" : "text-slate-900")}>WAME</span>
    </Link>
  );
}
