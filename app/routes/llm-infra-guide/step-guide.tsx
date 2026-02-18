import { useState, useRef, useEffect } from "react";
import { useReducedMotion } from "motion/react";
import type { ContentBlock } from "./constants";

// ── Types ──────────────────────────────────────────────────────────────────

interface StepGuideProps {
  title?: string;
  steps: {
    label: string;
    title: string;
    description: string;
    duration?: string;
    difficulty?: "easy" | "medium" | "hard";
    blocks?: ContentBlock[];
  }[];
  accentColor?: string;
  renderBlock: (block: ContentBlock, key: number, accentColor?: string) => React.ReactNode;
}

// ── Difficulty helpers ──────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard";

const DIFFICULTY_META: Record<Difficulty, { dots: number; color: string; label: string }> = {
  easy: { dots: 1, color: "#10B981", label: "Easy" },
  medium: { dots: 2, color: "#F59E0B", label: "Medium" },
  hard: { dots: 3, color: "#EF4444", label: "Hard" },
};

function DifficultyIndicator({ level }: { level: Difficulty }): React.JSX.Element {
  const { dots, color, label } = DIFFICULTY_META[level];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block w-[7px] h-[7px] rounded-full"
            style={{ background: i < dots ? color : "rgba(100,116,139,0.3)" }}
          />
        ))}
      </span>
      <span className="text-[11px] font-medium" style={{ color }}>
        {label}
      </span>
    </span>
  );
}

// ── Step Card ───────────────────────────────────────────────────────────────

function StepCard({
  step,
  index,
  isLast,
  defaultExpanded,
  accentColor,
  renderBlock,
}: {
  step: StepGuideProps["steps"][number];
  index: number;
  isLast: boolean;
  defaultExpanded: boolean;
  accentColor: string;
  renderBlock: StepGuideProps["renderBlock"];
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const reducedMotion = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [expanded, step.blocks]);

  const transitionStyle = reducedMotion
    ? undefined
    : "max-height 200ms ease-out, opacity 200ms ease-out";

  return (
    <div className="relative pl-10">
      {!isLast && (
        <div
          className="absolute left-[15px] top-[40px] bottom-0 w-0"
          style={{ borderLeft: `2px solid ${accentColor}33` }}
        />
      )}

      <div
        className="absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-white"
        style={{ background: accentColor }}
      >
        {index + 1}
      </div>

      <div
        className="rounded-lg border border-slate-700 overflow-hidden mb-4"
        style={{ background: "rgba(30,41,59,0.4)" }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer border-none bg-transparent"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider font-mono"
                style={{ color: accentColor }}
              >
                {step.label}
              </span>
              {step.duration && (
                <span className="bg-[#1E293B] rounded-full px-2 text-[11px] text-slate-400 leading-[20px]">
                  {step.duration}
                </span>
              )}
              {step.difficulty && <DifficultyIndicator level={step.difficulty} />}
            </div>
            <span className="text-[14px] font-semibold text-slate-200 block mt-1">
              {step.title}
            </span>
            {!expanded && (
              <span className="text-[12px] text-slate-500 block mt-0.5 line-clamp-1">
                {step.description}
              </span>
            )}
          </div>
          <span
            className="text-slate-500 text-sm shrink-0"
            style={{
              transform: expanded ? "rotate(180deg)" : "none",
              transition: reducedMotion ? undefined : "transform 200ms ease-out",
            }}
          >
            &#9660;
          </span>
        </button>

        <div
          ref={contentRef}
          style={{
            maxHeight: expanded ? `${contentHeight}px` : "0px",
            opacity: expanded ? 1 : 0,
            overflow: "hidden",
            transition: transitionStyle,
          }}
        >
          <div className="border-t border-slate-700 px-4 py-4 flex flex-col gap-4">
            <p className="text-[13px] text-slate-400 leading-[1.8] m-0">{step.description}</p>
            {step.blocks?.map((block, i) => renderBlock(block, i, accentColor))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── StepGuide ───────────────────────────────────────────────────────────────

export function StepGuide({
  title,
  steps,
  accentColor = "#3B82F6",
  renderBlock,
}: StepGuideProps): React.JSX.Element {
  return (
    <div className="flex flex-col">
      {title && (
        <h3
          className="text-[14px] font-semibold m-0 mb-4 px-1 border-l-2 pl-3"
          style={{ borderColor: accentColor, color: accentColor }}
        >
          {title}
        </h3>
      )}
      <div className="flex flex-col">
        {steps.map((step, i) => (
          <StepCard
            key={i}
            step={step}
            index={i}
            isLast={i === steps.length - 1}
            defaultExpanded={i === 0}
            accentColor={accentColor}
            renderBlock={renderBlock}
          />
        ))}
      </div>
    </div>
  );
}
