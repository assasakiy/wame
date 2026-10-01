import type { ReactNode } from "react";
import { Logo } from "@/shared/components/Logo";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 px-4 py-10">
      <div className="mb-6">
        <Logo dark />
      </div>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8">{children}</div>
    </div>
  );
}
