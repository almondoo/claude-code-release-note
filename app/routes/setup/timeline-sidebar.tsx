import type { SetupSection } from "./constants";
import { SECTION_COLORS } from "./constants";

interface TimelineSidebarProps {
  sections: SetupSection[];
  activeSectionId: string;
  onSectionClick: (id: string) => void;
  filteredSectionIds: Set<string>;
  hasQuery: boolean;
}

export function TimelineSidebar({ sections, activeSectionId, onSectionClick, filteredSectionIds, hasQuery }: TimelineSidebarProps): React.JSX.Element {
  return (
    <nav className="hidden md:block w-[260px] shrink-0">
      <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-none">
        <div className="flex flex-col relative">
          {/* Vertical line */}
          <div
            className="absolute left-[15px] top-[16px] bottom-[16px] w-px"
            style={{ background: "linear-gradient(to bottom, #334155 0%, #1E293B 100%)" }}
          />
          {sections.map((section, idx) => {
            const isActive = section.id === activeSectionId;
            const colors = SECTION_COLORS[section.id] || { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" };
            const isDimmed = hasQuery && !filteredSectionIds.has(section.id);

            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className="timeline-node relative flex items-center gap-3 py-2.5 px-0 text-left cursor-pointer border-none bg-transparent transition-all"
                style={{
                  opacity: isDimmed ? 0.4 : 1,
                }}
              >
                {/* Node circle */}
                <div
                  className="relative z-10 w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-all duration-300"
                  style={{
                    background: isActive ? colors.color + "25" : "#1E293B",
                    border: isActive ? `2px solid ${colors.color}` : "2px solid #334155",
                    color: isActive ? colors.color : "#64748B",
                    boxShadow: isActive ? `0 0 12px ${colors.color}30` : "none",
                  }}
                >
                  {idx + 1}
                </div>
                {/* Label */}
                <div className="flex flex-col min-w-0">
                  <span
                    className="text-[13px] font-medium truncate transition-colors duration-300"
                    style={{ color: isActive ? colors.color : "#94A3B8" }}
                  >
                    {section.name}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {section.steps.length} ステップ
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
