"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { apiRequest } from "@/shared/services/api-client";

/** Runs a mutation, tracks loading/error and refreshes server components afterwards. */
export function useApiAction() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(path: string, method: string, body?: unknown, options: { refresh?: boolean } = {}): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiRequest<T>(path, { method, body });
        if (options.refresh !== false) router.refresh();
        return data;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  return { run, loading, error, setError };
}
