interface Series {
  label: string;
  color: string;
}

interface Props {
  data: { label: string; values: number[] }[];
  series: Series[];
}

/** Dependency-free grouped bar chart. */
export function BarChart({ data, series }: Props) {
  const max = Math.max(1, ...data.flatMap((d) => d.values));
  return (
    <div>
      <div className="flex h-40 items-end gap-2 sm:gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex h-full flex-1 flex-col justify-end">
            <div className="flex flex-1 items-end justify-center gap-1">
              {d.values.map((v, i) => (
                <div
                  key={series[i].label}
                  title={`${series[i].label}: ${v}`}
                  className="w-full max-w-5 rounded-t"
                  style={{ height: `${Math.max((v / max) * 100, v > 0 ? 4 : 1)}%`, background: series[i].color }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2 sm:gap-3">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-[10px] text-slate-500">{d.label}</span>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-slate-600">
        {series.map((s) => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
