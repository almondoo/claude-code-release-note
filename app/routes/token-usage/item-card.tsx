import type { TUItem } from "./constants";
import { TAG_COLORS, DIFFICULTY_LABELS } from "./constants";

const DIFFICULTY_LEVELS: TUItem["difficulty"][] = ["easy", "medium", "advanced"];

function isDotFilled(dotLevel: TUItem["difficulty"], itemDifficulty: TUItem["difficulty"]): boolean {
  const idx = DIFFICULTY_LEVELS.indexOf(dotLevel);
  const itemIdx = DIFFICULTY_LEVELS.indexOf(itemDifficulty);
  return idx <= itemIdx;
}

export function ItemCard({
  item,
  accentColor,
  sectionName,
  onClick,
}: {
  item: TUItem;
  accentColor: string;
  sectionName: string;
  onClick: () => void;
}): React.JSX.Element {
  const difficulty = DIFFICULTY_LABELS[item.difficulty];

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
      className="hover-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden h-[200px] px-5 py-[18px]"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` }}
      />
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm text-slate-100 leading-snug line-clamp-2">
          {item.title}
        </span>
        {/* Difficulty dots */}
        <div
          className="flex items-center gap-[3px] shrink-0 mt-[3px]"
          title={`難易度: ${difficulty.label}`}
        >
          {DIFFICULTY_LEVELS.map((level) => (
            <span
              key={level}
              className="w-[6px] h-[6px] rounded-full"
              style={{
                background: isDotFilled(level, item.difficulty)
                  ? difficulty.color
                  : "rgba(100,116,139,0.3)",
              }}
            />
          ))}
        </div>
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
    </div>
  );
}
