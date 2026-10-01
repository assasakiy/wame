import type { Metadata } from "next";
import { PricingCards } from "@/features/marketing/components/PricingCards";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-center text-4xl font-bold tracking-tight">Pricing</h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-lg text-slate-600">Pick the plan that fits your volume. Upgrade or downgrade at any time.</p>
      <div className="mt-14"><PricingCards /></div>
    </div>
  );
}
