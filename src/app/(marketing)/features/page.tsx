import type { Metadata } from "next";
import { ButtonLink } from "@/shared/components/ButtonLink";
import { FeatureGrid } from "@/features/marketing/components/FeatureGrid";

export const metadata: Metadata = { title: "Features" };

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="text-center text-4xl font-bold tracking-tight">Built for teams that live on WhatsApp</h1>
      <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-slate-600">One modular platform: gateway, automation, AI and billing — deployed as a single Node.js service.</p>
      <div className="mt-12"><FeatureGrid /></div>
      <div className="mt-14 text-center"><ButtonLink href="/register" size="lg">Create your free workspace</ButtonLink></div>
    </div>
  );
}
