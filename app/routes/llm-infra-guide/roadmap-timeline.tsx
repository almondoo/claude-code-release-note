import { useState } from "react";
import type { TimelinePhase, StaffingRow } from "./constants";

// ── Phase Card ───────────────────────────────────────────────────────────

const PHASE_COLORS = [
  { color: "#10B981", bg: "rgba(16,185,129,0.12)" },
  { color: "#3B82F6", bg: "rgba(59,130,246,0.12)" },
  { color: "#A855F7", bg: "rgba(168,85,247,0.12)" },
  { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
];

interface PhaseCardProps {
  phase: TimelinePhase;
  index: number;
  isLast: boolean;
}

function PhaseCard({ phase, index, isLast }: PhaseCardProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(index === 0);
  const c = PHASE_COLORS[index % PHASE_COLORS.length];

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      {!isLast && (
        <div
          className="absolute left-[11px] top-[32px] bottom-[-16px] w-px"
          style={{ background: `linear-gradient(to bottom, ${c.color}40, transparent)` }}
        />
      )}
      {/* Timeline dot */}
      <div
        className="absolute left-0 top-2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
        style={{ background: c.bg, border: `2px solid ${c.color}`, color: c.color }}
      >
        {index + 1}
      </div>

      {/* Card */}
      <div className="rounded-lg border border-slate-700 overflow-hidden" style={{ background: "rgba(30,41,59,0.4)" }}>
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer border-none bg-transparent"
        >
          <div className="flex-1 min-w-0">
            <span className="text-[14px] font-semibold text-slate-200 block">{phase.title}</span>
            <span className="text-[12px] text-slate-500">{phase.duration}</span>
          </div>
          {phase.roi && (
            <span
              className="text-[12px] font-medium px-2 py-0.5 rounded"
              style={{ background: c.bg, color: c.color }}
            >
              {phase.roi}
            </span>
          )}
          <span
            className="text-slate-500 text-sm transition-transform duration-200"
            style={{ transform: expanded ? "rotate(180deg)" : "none" }}
          >
            &#9660;
          </span>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-slate-700 px-4 py-3">
            {phase.investment && (
              <div className="text-[12px] text-slate-400 mb-3">
                <span className="text-slate-500">投資: </span>{phase.investment}
              </div>
            )}
            <div className="flex flex-col gap-2">
              {phase.items.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 rounded-md px-3 py-2"
                  style={{ background: "rgba(15,23,42,0.5)" }}
                >
                  <span className="text-[13px] text-slate-300 font-medium sm:w-[240px] shrink-0">
                    {item.task}
                  </span>
                  <span className="text-[12px] text-slate-500 sm:w-[80px] shrink-0">{item.duration}</span>
                  <span className="text-[12px] text-slate-500 sm:w-[140px] shrink-0">{item.resources}</span>
                  <span className="text-[12px] ml-auto" style={{ color: c.color }}>{item.effect}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Roadmap Timeline ─────────────────────────────────────────────────────

interface RoadmapTimelineProps {
  phases: TimelinePhase[];
  staffing?: StaffingRow[];
}

export function RoadmapTimeline({ phases, staffing }: RoadmapTimelineProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      {phases.map((phase, i) => (
        <PhaseCard key={phase.id} phase={phase} index={i} isLast={i === phases.length - 1} />
      ))}

      {staffing?.length ? (
        <div className="mt-2">
          <h4 className="text-[13px] font-semibold text-slate-400 mb-2 px-1">必要人材とスキル</h4>
          <div className="flex flex-col gap-1">
            {staffing.map((row, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row gap-1 sm:gap-4 px-3 py-2 rounded-md text-[12px]"
                style={{ background: "rgba(30,41,59,0.3)" }}
              >
                <span className="text-slate-300 font-medium sm:w-[80px] shrink-0">{row.phase}</span>
                <span className="text-slate-400 sm:w-[240px] shrink-0">{row.skills}</span>
                <span className="text-slate-500">{row.team}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
