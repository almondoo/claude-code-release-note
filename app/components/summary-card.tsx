import { BaseCard } from "~/components/base-card";

interface TagColors {
  [key: string]: { color: string; bg: string } | undefined;
}

interface SummaryCardProps {
  title: string;
  description: string;
  tags: string[];
  accentColor: string;
  sectionName: string;
  onClick: () => void;
  tagColors: TagColors;
  headerExtra?: React.ReactNode;
}

export const SummaryCard = ({
  title,
  description,
  tags,
  accentColor,
  sectionName,
  onClick,
  tagColors,
  headerExtra,
}: SummaryCardProps): React.JSX.Element => {
  return (
    <BaseCard
      accentColor={accentColor}
      onClick={onClick}
      className="gap-2.5 h-[200px] px-5 py-[18px]"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-semibold text-sm text-slate-100 leading-snug line-clamp-2">
          {title}
        </span>
        {headerExtra}
      </div>
      <p className="m-0 text-xs leading-[1.6] text-slate-300 font-sans flex-1 line-clamp-3">
        {description}
      </p>
      <div className="flex items-center gap-1.5 mt-auto flex-wrap">
        {tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-semibold rounded whitespace-nowrap"
            style={{
              padding: "2px 8px",
              background: tagColors[tag]?.bg ?? "rgba(100,116,139,0.15)",
              color: tagColors[tag]?.color ?? "#94A3B8",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </BaseCard>
  );
};
