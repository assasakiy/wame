"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { useApiAction } from "@/shared/hooks/useApiAction";

/** Small confirm-then-DELETE button used in tables. */
export function DeleteButton({ path, label = "Delete", confirm = "Delete this item?" }: { path: string; label?: string; confirm?: string }) {
  const { run, loading } = useApiAction();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={loading}
      className="text-red-600 hover:bg-red-50"
      onClick={() => window.confirm(confirm) && void run(path, "DELETE")}
      aria-label={label || "Delete"}
    >
      <Trash2 size={14} /> {label}
    </Button>
  );
}
