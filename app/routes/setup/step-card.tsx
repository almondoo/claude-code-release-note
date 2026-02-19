import { AnimatePresence, motion } from "motion/react";

import { BookOpenIcon, ChevronDownIcon } from "~/components/icons";

import type { Step } from "./constants";
import { TAG_COLORS } from "./constants";
import { CodeBlockView } from "~/components/code-block-view";
import { CalloutBox } from "~/components/callout-box";

function renderInlineLinks(text: string): React.ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      return (
        <a
          key={i}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#67E8F9", textDecoration: "underline", textUnderlineOffset: 2 }}
        >
          {match[1]}
        </a>
      );
    }
    return part;
  });
}

interface StepCardProps {
  step: Step;
  accentColor: string;
  expanded: boolean;
  onToggle: () => void;
  reducedMotion: boolean | null;
}

export function StepCard({
  step,
  accentColor,
  expanded,
  onToggle,
  reducedMotion,
}: StepCardProps): React.JSX.Element {
  return (
    <div
      className="bg-surface rounded-xl border border-slate-700 overflow-hidden transition-all"
      style={{
        borderColor: expanded ? accentColor + "40" : undefined,
        boxShadow: expanded ? `0 0 0 1px ${accentColor}15` : undefined,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        className="hover-card flex items-center gap-3 cursor-pointer px-5 py-4"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: accentColor + "18", color: accentColor }}
        >
          <BookOpenIcon />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-slate-100">{step.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{step.description}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {step.tags.map((tag) => (
            <span
              key={tag}
              className="hidden sm:inline-flex text-[11px] font-semibold rounded px-2 py-[2px]"
              style={{
                background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
                color: TAG_COLORS[tag]?.color ?? "#94A3B8",
              }}
            >
              {tag}
            </span>
          ))}
          <ChevronDownIcon
            className={`text-slate-500 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 flex flex-col gap-4 border-t border-slate-700 pt-4">
              {step.content.split("\n\n").map((paragraph, i) => (
                <p key={i} className="m-0 text-[14px] leading-[1.8] text-slate-400 font-sans">
                  {renderInlineLinks(paragraph)}
                </p>
              ))}
              {step.code.map((block, i) => (
                <CodeBlockView key={i} block={block} />
              ))}
              {step.callouts.map((callout, i) => (
                <CalloutBox key={i} callout={callout} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
