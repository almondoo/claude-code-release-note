import { BaseCard } from "~/components/base-card";
import type { CustomizationItem } from "./constants";
import { DEFAULT_TAG_COLOR, TAG_COLORS } from "./constants";

export const CustomizationCard = ({
  item,
  accentColor,
  onClick,
}: {
  item: CustomizationItem;
  accentColor: string;
  onClick: () => void;
}): React.JSX.Element => {
  return (
    <BaseCard accentColor={accentColor} onClick={onClick} className="gap-2.5 px-5 py-[18px]">
      <h3 className="font-sans text-sm font-bold m-0 leading-snug" style={{ color: accentColor }}>
        {item.title}
      </h3>
      <p className="m-0 text-xs leading-[1.6] text-slate-300 font-sans flex-1 line-clamp-2">
        {item.description}
      </p>
      {item.tags.length > 0 && (
        <div className="flex gap-1.5 flex-wrap mt-auto">
          {item.tags.map((tag) => {
            const colors = TAG_COLORS[tag] ?? DEFAULT_TAG_COLOR;
            return (
              <span
                key={tag}
                className="text-[10px] font-semibold rounded px-2 py-0.5"
                style={{ color: colors.color, background: colors.bg }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}
    </BaseCard>
  );
};
