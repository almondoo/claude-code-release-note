import { SummaryCard } from "~/components/summary-card";
import type { PromptItem } from "./constants";
import { TAG_COLORS } from "./constants";

export function ItemCard({
  item,
  accentColor,
  sectionName,
  onClick,
}: {
  item: PromptItem;
  accentColor: string;
  sectionName: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <SummaryCard
      title={item.title}
      description={item.summary}
      tags={item.tags}
      accentColor={accentColor}
      sectionName={sectionName}
      onClick={onClick}
      tagColors={TAG_COLORS}
    />
  );
}
