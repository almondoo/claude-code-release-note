import { TAG_COLORS, TAG_LABELS } from "~/components/badge";
import { ExternalLinkIcon } from "~/components/icons";

import type { ReleaseItem } from "./constants";
import { VERSION_DETAILS_AVAILABLE } from "./constants";

export function TagCountBadge({ tag, count }: { tag: string; count: number }): React.JSX.Element {
  return (
    <span
      className="inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded text-[11px] font-semibold"
      style={{
        background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
        color: TAG_COLORS[tag]?.text ?? "#94A3B8",
        letterSpacing: "0.2px",
      }}
    >
      {TAG_LABELS[tag] ?? tag}
      <span className="opacity-50">{count}</span>
    </span>
  );
}

export function computeSortedTagCounts(items: ReleaseItem[]): [string, number][] {
  const tagCounts: Record<string, number> = {};
  for (const item of items) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
}

export function VersionCard({
  version,
  items,
  accentColor,
  onClick,
}: {
  version: string;
  items: ReleaseItem[];
  accentColor: string;
  onClick: () => void;
}): React.JSX.Element {
  const sortedTags = computeSortedTagCounts(items);
  const hasDetails = VERSION_DETAILS_AVAILABLE.has(version);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="hover-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-[10px] cursor-pointer relative overflow-hidden h-[200px]"
      style={{ padding: "18px 20px", "--accent": accentColor } as React.CSSProperties}
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)` }}
      />

      {/* Version header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-base font-bold text-slate-100 tracking-tight">
          v{version}
        </span>
        <span className="text-[12px] text-slate-500 font-mono bg-slate-900 px-2 py-[2px] rounded">
          {items.length}件
        </span>
      </div>

      {/* Tag badges */}
      <div className="flex gap-1 flex-wrap">
        {sortedTags.slice(0, 4).map(([tag, count]) => (
          <TagCountBadge key={tag} tag={tag} count={count} />
        ))}
        {sortedTags.length > 4 && (
          <span className="px-[7px] py-[2px] rounded text-[11px] font-semibold bg-slate-500/10 text-slate-500">
            +{sortedTags.length - 4}
          </span>
        )}
      </div>

      {/* Preview: first 2 items */}
      <div className="flex flex-col gap-1 flex-1 min-h-0 overflow-hidden">
        {items.slice(0, 2).map((item, i) => (
          <span
            key={i}
            className="text-slate-400 text-xs leading-normal overflow-hidden text-ellipsis whitespace-nowrap font-sans"
          >
            {item.t}
          </span>
        ))}
        {items.length > 2 && (
          <span className="text-slate-500 text-[12px]">他 {items.length - 2} 件...</span>
        )}
      </div>

      {/* Detail availability indicator */}
      {hasDetails && (
        <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 mt-auto">
          <ExternalLinkIcon />
          詳細あり
        </div>
      )}
    </div>
  );
}
