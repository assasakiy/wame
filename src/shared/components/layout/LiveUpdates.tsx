"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useRealtime, type RealtimeEvent } from "@/shared/hooks/useRealtime";

const LABELS: Record<string, string> = {
  "device.connected": "Device connected",
  "device.disconnected": "Device disconnected",
  "qr.updated": "New QR code",
  "message.received": "Message received",
  "message.sent": "Message sent",
  "message.failed": "Message failed",
  "automation.executed": "Automation executed",
  "subscription.updated": "Subscription updated",
};
const QUIET = new Set(["message.delivered", "qr.updated"]);

/** Subscribes to realtime events: shows a toast and refreshes the current page's server data. */
export function LiveUpdates() {
  const router = useRouter();
  const [toast, setToast] = useState<RealtimeEvent | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useRealtime((event) => {
    if (!QUIET.has(event.type)) setToast(event);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => router.refresh(), 500);
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // keep the session alive: rotate the session token every 30 minutes
  useEffect(() => {
    const t = setInterval(() => void fetch("/api/auth/refresh", { method: "POST" }), 30 * 60_000);
    return () => clearInterval(t);
  }, []);

  if (!toast) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex max-w-xs items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg" role="status">
      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />
      <span>{LABELS[toast.type] ?? toast.type}</span>
    </div>
  );
}
