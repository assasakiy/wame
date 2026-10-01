import type { SelectHTMLAttributes } from "react";
import { fieldClass } from "@/shared/components/Input";
import { cn } from "@/shared/utils/format";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClass, "h-10", className)} {...props} />;
}
