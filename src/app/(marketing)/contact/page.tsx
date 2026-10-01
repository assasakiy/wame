import type { Metadata } from "next";
import { ContactForm } from "@/features/marketing/components/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="text-center text-4xl font-bold tracking-tight">Contact us</h1>
      <p className="mt-3 text-center text-slate-600">Questions about plans, integrations or enterprise needs? Send us a note.</p>
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><ContactForm /></div>
    </div>
  );
}
