import { CopyButton } from "@/shared/components/CopyButton";

export function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2">
        <span className="text-xs text-slate-400">{title ?? "shell"}</span>
        <CopyButton value={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-emerald-100"><code>{code}</code></pre>
    </div>
  );
}
