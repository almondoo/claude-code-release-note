import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import {
  CHAPTERS,
  SECTION_ICONS,
  SECTION_THEMES,
  type Chapter,
  type SurveySection,
} from "./constants";

interface SectionNavProps {
  sections: SurveySection[];
  activeSectionId: string;
  onSectionClick: (id: string) => void;
}

// Build a section→chapter lookup
const sectionToChapter = new Map<string, string>();
CHAPTERS.forEach((ch) => ch.sectionIds.forEach((sid) => sectionToChapter.set(sid, ch.id)));

export function SectionNav({
  sections,
  activeSectionId,
  onSectionClick,
}: SectionNavProps): React.JSX.Element {
  const activeChapterId = sectionToChapter.get(activeSectionId) || CHAPTERS[0].id;
  const [expandedChapter, setExpandedChapter] = useState<string>(activeChapterId);
  const reducedMotion = useReducedMotion();

  const sectionMap = new Map(sections.map((s) => [s.id, s]));

  function handleChapterClick(ch: Chapter) {
    if (expandedChapter === ch.id) {
      setExpandedChapter("");
    } else {
      setExpandedChapter(ch.id);
      // Scroll to first section of the chapter
      onSectionClick(ch.sectionIds[0]);
    }
  }

  return (
    <motion.nav
      className="hidden lg:block w-[240px] shrink-0"
      initial={reducedMotion ? false : { opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-none">
        <div className="flex flex-col gap-1">
          {CHAPTERS.map((ch) => {
            const isActiveChapter = activeChapterId === ch.id;
            const isExpanded = expandedChapter === ch.id;

            const activeSectionIdx = ch.sectionIds.indexOf(activeSectionId);
            let progress = 0;
            if (isActiveChapter && activeSectionIdx >= 0) {
              progress = (activeSectionIdx + 1) / ch.sectionIds.length;
            } else if (isActiveChapter) {
              progress = 0.05;
            }

            return (
              <div key={ch.id}>
                {/* Chapter level */}
                <button
                  onClick={() => handleChapterClick(ch)}
                  className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg text-left cursor-pointer border-none transition-all"
                  style={{
                    background: isActiveChapter
                      ? `color-mix(in srgb, ${ch.color} 10%, transparent)`
                      : "transparent",
                  }}
                >
                  {/* Progress circle */}
                  <div className="relative w-7 h-7 shrink-0">
                    <svg width="28" height="28" viewBox="0 0 28 28">
                      <circle cx="14" cy="14" r="12" fill="none" stroke="#1E293B" strokeWidth="2" />
                      {progress > 0 && (
                        <circle
                          cx="14"
                          cy="14"
                          r="12"
                          fill="none"
                          stroke={ch.color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={`${progress * 75.4} 75.4`}
                          transform="rotate(-90 14 14)"
                          style={{ transition: "stroke-dasharray 0.3s" }}
                        />
                      )}
                    </svg>
                    <span
                      className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ color: isActiveChapter ? ch.color : "#64748B" }}
                    >
                      {ch.sectionIds.length}
                    </span>
                  </div>

                  {/* Title */}
                  <span
                    className="text-[13px] font-semibold truncate transition-colors"
                    style={{ color: isActiveChapter ? ch.color : "#94A3B8" }}
                  >
                    {ch.title}
                  </span>

                  {/* Expand indicator */}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    className="ml-auto shrink-0 transition-transform"
                    style={{
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      color: "#64748B",
                    }}
                  >
                    <path
                      d="M4 2l4 4-4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>

                {/* Section level (expanded) */}
                {isExpanded && (
                  <div className="ml-5 pl-4 border-l border-slate-800 flex flex-col gap-0.5 py-1">
                    {ch.sectionIds.map((sid) => {
                      const section = sectionMap.get(sid);
                      if (!section) return null;
                      const isActive = sid === activeSectionId;
                      const theme = SECTION_THEMES[sid] || { color: "#3B82F6" };
                      const Icon = SECTION_ICONS[sid];

                      return (
                        <button
                          key={sid}
                          onClick={() => onSectionClick(sid)}
                          className="flex items-center gap-2 py-1.5 px-2 rounded-md text-left cursor-pointer border-none transition-all"
                          style={{
                            background: isActive
                              ? `color-mix(in srgb, ${theme.color} 10%, transparent)`
                              : "transparent",
                          }}
                        >
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                            style={{
                              color: isActive ? theme.color : "#64748B",
                            }}
                          >
                            {Icon ? (
                              <span
                                className="flex items-center"
                                style={{ transform: "scale(0.55)" }}
                              >
                                {Icon()}
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold">
                                {sections.findIndex((s) => s.id === sid) + 1}
                              </span>
                            )}
                          </div>
                          <span
                            className="text-[12px] truncate transition-colors"
                            style={{ color: isActive ? theme.color : "#94A3B8" }}
                          >
                            {section.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

interface MobileSectionMarkerProps {
  index: number;
  sectionId: string;
  chapterTitle?: string;
}

export function MobileSectionMarker({
  index,
  sectionId,
  chapterTitle,
}: MobileSectionMarkerProps): React.JSX.Element {
  const theme = SECTION_THEMES[sectionId] || { color: "#3B82F6" };
  return (
    <div className="lg:hidden flex items-center gap-3 mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
        style={{
          background: theme.color + "25",
          border: `2px solid ${theme.color}`,
          color: theme.color,
        }}
      >
        {index + 1}
      </div>
      {chapterTitle && (
        <span className="text-[10px] text-slate-600 font-medium shrink-0">{chapterTitle}</span>
      )}
      <div
        className="flex-1 h-px"
        style={{ background: `linear-gradient(to right, ${theme.color}40, transparent)` }}
      />
    </div>
  );
}
