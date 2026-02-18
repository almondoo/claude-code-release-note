import type { SetupSection } from "./constants";
import { SECTION_COLORS } from "./constants";

interface MobileTimelineMarkerProps {
  index: number;
  section: SetupSection;
}

export function MobileTimelineMarker({
  index,
  section,
}: MobileTimelineMarkerProps): React.JSX.Element {
  const colors = SECTION_COLORS[section.id] || { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" };
  return (
    <div className="md:hidden flex items-center gap-3 mb-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
        style={{
          background: colors.color + "25",
          border: `2px solid ${colors.color}`,
          color: colors.color,
        }}
      >
        {index + 1}
      </div>
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to right, ${colors.color}40, transparent)` }}
      />
    </div>
  );
}
