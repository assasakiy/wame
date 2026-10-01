"use client";

import { Check } from "lucide-react";
import { Alert } from "@/shared/components/Alert";
import { Badge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { useApiAction } from "@/shared/hooks/useApiAction";
import { cn, formatIDR } from "@/shared/utils/format";
import { planFeatures } from "@/features/subscription/plan-features";
import type { PlanLimits } from "@/modules/subscription/domain/plans";

interface PlanView {
  code: string;
  name: string;
  description: string;
  priceMonthly: number;
  sortOrder: number;
  limits: PlanLimits;
}

export function PlanSelector({ plans, current }: { plans: PlanView[]; current: string }) {
  const { run, loading, error } = useApiAction();
  const currentOrder = plans.find((p) => p.code === current)?.sortOrder ?? 0;
  return (
    <div className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const active = p.code === current;
          const upgrade = p.sortOrder > currentOrder;
          return (
            <div key={p.code} className={cn("flex flex-col rounded-xl border bg-white p-5 shadow-sm", active ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200")}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                {active && <Badge tone="green">Current</Badge>}
              </div>
              <p className="mt-1 text-xs text-slate-500">{p.description}</p>
              <p className="mt-4 text-2xl font-bold">{p.priceMonthly ? formatIDR(p.priceMonthly) : "Free"}<span className="text-sm font-normal text-slate-500">{p.priceMonthly ? " / month" : ""}</span></p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                {planFeatures(p.limits).map((f) => <li key={f} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />{f}</li>)}
              </ul>
              <Button
                className="mt-5 w-full"
                variant={upgrade ? "primary" : "secondary"}
                disabled={active || loading}
                onClick={() => window.confirm(`${upgrade ? "Upgrade" : "Switch"} to ${p.name}?`) && void run("/api/subscription", "POST", { plan: p.code })}
              >
                {active ? "Current plan" : upgrade ? `Upgrade to ${p.name}` : `Downgrade to ${p.name}`}
              </Button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">Payments run through the sandbox provider. Plug a real gateway into <code>PaymentProvider</code> to charge cards or e-wallets.</p>
    </div>
  );
}
