import { BaseCard } from "~/components/base-card";
import type { BPItem } from "./constants";
import { TAG_COLORS } from "./constants";

export function ItemCard({
  item,
  accentColor,
  sectionName,
  onClick,
}: {
  item: BPItem;
  accentColor: string;
  sectionName: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <BaseCard accentColor={accentColor} onClick={onClick} className="gap-2.5 h-[200px] px-5 py-[18px]">
      <div className="flex items-start gap-2">
        <span className="font-semibold text-sm text-slate-100 leading-snug line-clamp-2">
          {item.title}
        </span>
      </div>
      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 line-clamp-3">
        {item.summary}
      </p>
      <div className="flex items-center gap-1.5 mt-auto flex-wrap">
        <span
          className="text-[11px] font-semibold rounded self-start whitespace-nowrap"
          style={{
            padding: "2px 8px",
            background: accentColor + "18",
            color: accentColor,
          }}
        >
          {sectionName}
        </span>
        {item.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-semibold rounded whitespace-nowrap"
            style={{
              padding: "2px 8px",
              background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
              color: TAG_COLORS[tag]?.color ?? "#94A3B8",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </BaseCard>
  );
}
