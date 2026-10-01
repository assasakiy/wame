import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/utils/format";

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  padded?: boolean;
}

export function Card({ title, description, action, padded = true, className, children, ...props }: Props) {
  return (
    <section className={cn("rounded-xl border border-slate-200 bg-white shadow-sm", className)} {...props}>
      {(title || action) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn(padded && "p-5")}>{children}</div>
    </section>
  );
}
