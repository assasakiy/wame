import type { TextareaHTMLAttributes } from "react";
import { fieldClass } from "@/shared/components/Input";
import { cn } from "@/shared/utils/format";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldClass, "min-h-24", className)} {...props} />;
}
