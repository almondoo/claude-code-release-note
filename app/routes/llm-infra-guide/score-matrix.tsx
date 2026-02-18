import { useState } from "react";
import type { ScoreAxis, ScoreProduct, SecurityCombo } from "./constants";

// ── Shared card background ───────────────────────────────────────────────

const CARD_BG = "rgba(30,41,59,0.4)" as const;

// ── Score bar segment ────────────────────────────────────────────────────

interface ScoreBarProps {
  score: number;
  max?: number;
  color: string;
}

function ScoreBar({ score, max = 5, color }: ScoreBarProps): React.JSX.Element {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className="h-[14px] w-[18px] rounded-sm transition-colors"
          style={{
            background: i < score ? color : "rgba(100,116,139,0.15)",
            opacity: i < score ? 0.7 + (i / max) * 0.3 : 1,
          }}
        />
      ))}
    </div>
  );
}

// ── Axis legend colors ───────────────────────────────────────────────────

const AXIS_COLORS: Record<string, string> = {
  S: "#EF4444",
  C: "#10B981",
  O: "#3B82F6",
  E: "#A855F7",
};

const FALLBACK_COLOR = "#64748B";

function getAxisColor(key: string): string {
  return AXIS_COLORS[key] ?? FALLBACK_COLOR;
}

// ── Score Matrix ─────────────────────────────────────────────────────────

interface ScoreMatrixProps {
  axes: ScoreAxis[];
  products: ScoreProduct[];
}

type SortKey = "total" | "S" | "C" | "O" | "E";

export function ScoreMatrix({ axes, products }: ScoreMatrixProps): React.JSX.Element {
  const [sortBy, setSortBy] = useState<SortKey>("total");

  const sortKeys: SortKey[] = ["total", ...axes.map((a) => a.key as SortKey)];

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "total") return b.total - a.total;
    return (b.scores[sortBy] ?? 0) - (a.scores[sortBy] ?? 0);
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Axis legend */}
      <div className="flex flex-wrap gap-3 text-[12px] text-slate-400">
        {axes.map((axis) => (
          <span key={axis.key} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: getAxisColor(axis.key) }}
            />
            {axis.label}({axis.key})
          </span>
        ))}
      </div>

      {/* Sort controls */}
      <div className="flex gap-1.5 text-[12px]">
        <span className="text-slate-500 self-center mr-1">ソート:</span>
        {sortKeys.map((key) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className="px-2 py-0.5 rounded border text-[12px] cursor-pointer transition-colors"
            style={{
              background: sortBy === key ? "rgba(99,102,241,0.15)" : "transparent",
              borderColor: sortBy === key ? "#6366F1" : "#334155",
              color: sortBy === key ? "#A5B4FC" : "#64748B",
            }}
          >
            {key === "total" ? "総合" : key}
          </button>
        ))}
      </div>

      {/* Product cards */}
      <div className="flex flex-col gap-2">
        {sorted.map((product, idx) => (
          <div
            key={product.name}
            className="rounded-lg border border-slate-700 px-4 py-3 flex flex-col md:flex-row md:items-center gap-3"
            style={{ background: CARD_BG }}
          >
            {/* Rank + Name */}
            <div className="flex items-center gap-3 md:w-[200px] shrink-0">
              <span
                className="text-[12px] font-bold w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  background: idx < 3 ? "rgba(99,102,241,0.2)" : "rgba(100,116,139,0.1)",
                  color: idx < 3 ? "#A5B4FC" : "#64748B",
                }}
              >
                {idx + 1}
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-semibold text-slate-200 truncate">
                  {product.name}
                </span>
                <span className="text-[11px] text-slate-500">{product.recommended}</span>
              </div>
            </div>

            {/* Score bars */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
              {axes.map((axis) => (
                <div key={axis.key} className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 w-3">{axis.key}</span>
                  <ScoreBar score={product.scores[axis.key] ?? 0} color={getAxisColor(axis.key)} />
                  <span className="text-[12px] text-slate-400 w-3">{product.scores[axis.key]}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center gap-1 md:w-[60px] shrink-0 justify-end">
              <span className="text-[19px] font-bold text-indigo-400">{product.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Security Combos ──────────────────────────────────────────────────────

interface SecurityCombosProps {
  combos: SecurityCombo[];
}

export function SecurityCombos({ combos }: SecurityCombosProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-[14px] font-semibold text-slate-300 m-0 px-1">
        セキュリティ強化オプションの組み合わせ評価
      </h3>
      {combos.map((combo) => (
        <div
          key={combo.name}
          className="rounded-lg border border-slate-700 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2"
          style={{ background: CARD_BG }}
        >
          <span className="text-[14px] font-medium text-slate-200 sm:w-[200px] shrink-0">
            {combo.name}
          </span>
          <ScoreBar score={combo.security} color="#EF4444" />
          <div className="flex gap-3 text-[12px] text-slate-400 ml-auto">
            <span>コスト: {combo.cost}</span>
            <span>運用負荷: {combo.ops}</span>
          </div>
          <span className="text-[11px] text-slate-500 sm:w-[140px] shrink-0 text-right">
            {combo.recommended}
          </span>
        </div>
      ))}
    </div>
  );
}
