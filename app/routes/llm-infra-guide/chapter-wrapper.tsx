import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";

import type { Chapter } from "./constants";

interface ChapterWrapperProps {
  chapter: Chapter;
  children: ReactNode[];
  sectionTitles: Record<string, string>;
}

const CHAPTER_ICONS: Record<string, string> = {
  "ch-overview": "📖",
  "ch-architecture": "🏗️",
  "ch-security": "🛡️",
  "ch-operations": "⚙️",
  "ch-decision": "🧭",
};

export function ChapterWrapper({ chapter, children, sectionTitles }: ChapterWrapperProps) {
  const [activeTab, setActiveTab] = useState(0);
  const reducedMotion = useReducedMotion();
  const icon = CHAPTER_ICONS[chapter.id] || "📋";

  return (
    <motion.div
      className="relative"
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
    >
      {/* Chapter header */}
      <div className="flex items-center gap-3 mb-6 mt-2">
        <span className="text-2xl">{icon}</span>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h2 className="text-[20px] font-bold m-0" style={{ color: chapter.color }}>
            {chapter.title}
          </h2>
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
            style={{
              background: `color-mix(in srgb, ${chapter.color} 15%, transparent)`,
              color: chapter.color,
            }}
          >
            {chapter.sectionIds.length}セクション
          </span>
        </div>
      </div>

      {/* Tab bar for security chapter */}
      {chapter.tabbed && children.length > 1 && (
        <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-none pb-1">
          {chapter.sectionIds.map((sid, i) => {
            const isActive = i === activeTab;
            return (
              <button
                key={sid}
                onClick={() => setActiveTab(i)}
                className="shrink-0 px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all text-[12px] font-medium"
                style={{
                  background: isActive
                    ? `color-mix(in srgb, ${chapter.color} 20%, transparent)`
                    : "rgba(30,41,59,0.5)",
                  color: isActive ? chapter.color : "#64748B",
                  outline: isActive ? `1px solid ${chapter.color}40` : "1px solid transparent",
                }}
              >
                {sectionTitles[sid] || sid}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {chapter.tabbed ? (
        <div>{children[activeTab]}</div>
      ) : (
        <div className="flex flex-col">
          {children.map((child, i) => (
            <div key={i}>
              {i > 0 && (
                <div className="py-6 flex items-center gap-4">
                  <div className="flex-1 h-px" style={{ background: `${chapter.color}20` }} />
                  <span className="text-[10px] text-slate-600 font-mono">
                    {i + 1}/{children.length}
                  </span>
                  <div className="flex-1 h-px" style={{ background: `${chapter.color}20` }} />
                </div>
              )}
              {child}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Chapter divider between chapters ─────────────────────────────────────

export function ChapterDivider({ color }: { color: string }) {
  return (
    <div className="py-10 flex items-center gap-4">
      <div
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${color}30, transparent)`,
        }}
      />
    </div>
  );
}
