"use client";

import { useEffect, useRef } from "react";

export interface RealtimeEvent {
  type: string;
  tenantId: string;
  data: Record<string, unknown>;
  at: string;
}

/** Subscribes to the tenant's Server-Sent Events stream (auto-reconnects natively). */
export function useRealtime(onEvent: (event: RealtimeEvent) => void) {
  const handler = useRef(onEvent);
  useEffect(() => {
    handler.current = onEvent;
  });
  useEffect(() => {
    const source = new EventSource("/api/realtime");
    source.onmessage = (message) => {
      try {
        handler.current(JSON.parse(message.data) as RealtimeEvent);
      } catch {
        /* ignore malformed frames */
      }
    };
    return () => source.close();
  }, []);
}
