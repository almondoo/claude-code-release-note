import { useState } from "react";
import type { SourceCategory, ChecklistCategory } from "./constants";

// ── Shared set-toggle hook ──────────────────────────────────────────────

function useToggleSet<T>(initial: T[] = []): [Set<T>, (item: T) => void] {
  const [set, setSet] = useState<Set<T>>(() => new Set(initial));

  function toggle(item: T): void {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  return [set, toggle];
}

// ── Source List ───────────────────────────────────────────────────────────

interface SourceListProps {
  categories: SourceCategory[];
}

export function SourceList({ categories }: SourceListProps): React.JSX.Element {
  const [expandedCat, toggleCat] = useToggleSet([categories[0]?.name]);

  return (
    <div className="flex flex-col gap-1.5">
      {categories.map((cat) => {
        const isOpen = expandedCat.has(cat.name);
        return (
          <div key={cat.name} className="rounded-lg border border-slate-700 overflow-hidden" style={{ background: "rgba(30,41,59,0.3)" }}>
            <button
              onClick={() => toggleCat(cat.name)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left cursor-pointer border-none bg-transparent"
            >
              <span className="text-[14px] font-medium text-slate-300">{cat.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-slate-500">{cat.links.length}件</span>
                <span
                  className="text-slate-500 text-[11px] transition-transform duration-200"
                  style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
                >
                  &#9660;
                </span>
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-slate-700 px-4 py-2 flex flex-col gap-1">
                {cat.links.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-blue-400 no-underline py-1 px-2 rounded transition-colors"
                    style={{ display: "block" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(59,130,246,0.08)"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.background = "transparent"; }}
                  >
                    {link.title} &rarr;
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Checklist ─────────────────────────────────────────────────────────────

interface ChecklistProps {
  categories: ChecklistCategory[];
}

export function Checklist({ categories }: ChecklistProps): React.JSX.Element {
  const [checked, toggleItem] = useToggleSet<string>();

  const total = categories.reduce((sum, c) => sum + c.items.length, 0);
  const done = checked.size;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${total > 0 ? (done / total) * 100 : 0}%`,
              background: "linear-gradient(to right, #3B82F6, #10B981)",
            }}
          />
        </div>
        <span className="text-[12px] text-slate-400 shrink-0">
          {done}/{total}
        </span>
      </div>

      {categories.map((cat) => (
        <div key={cat.name}>
          <h4 className="text-[13px] font-semibold text-slate-400 mb-1.5 px-1">{cat.name}</h4>
          <div className="flex flex-col gap-0.5">
            {cat.items.map((item) => {
              const key = `${cat.name}:${item}`;
              const isDone = checked.has(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleItem(key)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-left cursor-pointer border-none transition-colors"
                  style={{ background: isDone ? "rgba(16,185,129,0.06)" : "transparent" }}
                >
                  <span
                    className="w-4 h-4 rounded border flex items-center justify-center shrink-0 text-[11px]"
                    style={{
                      borderColor: isDone ? "#10B981" : "#475569",
                      background: isDone ? "rgba(16,185,129,0.2)" : "transparent",
                      color: isDone ? "#10B981" : "transparent",
                    }}
                  >
                    &#10003;
                  </span>
                  <span
                    className="text-[13px] transition-colors"
                    style={{
                      color: isDone ? "#64748B" : "#CBD5E1",
                      textDecoration: isDone ? "line-through" : "none",
                    }}
                  >
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
