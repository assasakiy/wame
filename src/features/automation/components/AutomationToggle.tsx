"use client";

import { useApiAction } from "@/shared/hooks/useApiAction";
import { cn } from "@/shared/utils/format";

export function AutomationToggle({ id, enabled }: { id: string; enabled: boolean }) {
  const { run, loading } = useApiAction();
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label="Toggle automation"
      disabled={loading}
      onClick={() => void run(`/api/automations/${id}`, "PATCH", { enabled: !enabled })}
      className={cn("relative h-6 w-11 rounded-full transition-colors disabled:opacity-50", enabled ? "bg-emerald-500" : "bg-slate-300")}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", enabled ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}
