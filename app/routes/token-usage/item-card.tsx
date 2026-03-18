import { SummaryCard } from "~/components/summary-card";
import type { TUItem } from "./constants";
import { TAG_COLORS, DIFFICULTY_LABELS } from "./constants";

const DIFFICULTY_LEVELS: TUItem["difficulty"][] = ["easy", "medium", "advanced"];

const isDotFilled = (
  dotLevel: TUItem["difficulty"],
  itemDifficulty: TUItem["difficulty"],
): boolean => {
  const idx = DIFFICULTY_LEVELS.indexOf(dotLevel);
  const itemIdx = DIFFICULTY_LEVELS.indexOf(itemDifficulty);
  return idx <= itemIdx;
};

export const ItemCard = ({
  item,
  accentColor,
  sectionName,
  onClick,
}: {
  item: TUItem;
  accentColor: string;
  sectionName: string;
  onClick: () => void;
}): React.JSX.Element => {
  const difficulty = DIFFICULTY_LABELS[item.difficulty];

  return (
    <SummaryCard
      title={item.title}
      description={item.summary}
      tags={item.tags}
      accentColor={accentColor}
      sectionName={sectionName}
      onClick={onClick}
      tagColors={TAG_COLORS}
      headerExtra={
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
      }
    />
  );
};
