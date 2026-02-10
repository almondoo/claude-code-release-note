import type { Trend } from "./constants";

interface StatCardProps {
  label: string;
  value: string;
  trend?: Trend;
  accentColor?: string;
}

const TREND_ICONS: Record<Trend, { char: string; color: string }> = {
  up: { char: "\u2191", color: "#10B981" },
  down: { char: "\u2193", color: "#EF4444" },
  neutral: { char: "\u2192", color: "#64748B" },
};

export function StatCard({ label, value, trend, accentColor }: StatCardProps): React.JSX.Element {
  const t = trend ? TREND_ICONS[trend] : null;
  return (
    <div
      className="rounded-xl border border-slate-700 px-4 py-3 flex flex-col gap-1 min-w-[140px]"
      style={{ background: "rgba(30,41,59,0.6)" }}
    >
      <span className="text-[12px] text-slate-500 font-medium uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span
          className="text-lg font-bold"
          style={{ color: accentColor ?? "#F1F5F9" }}
        >
          {value}
        </span>
        {t && (
          <span className="text-sm font-bold" style={{ color: t.color }}>
            {t.char}
          </span>
        )}
      </div>
    </div>
  );
}
