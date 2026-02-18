import { motion, useReducedMotion } from "motion/react";

import { CopyButton } from "~/components/copy-button";

import type { ContentBlock, Step } from "./constants";
import { HIGHLIGHT_STYLES } from "./constants";

// ── Block Renderer ───────────────────────────────────────────────────────

function renderBlock(block: ContentBlock, key: number): React.ReactNode {
  switch (block.type) {
    case "text":
      return (
        <p key={key} className="text-[14px] text-slate-400 leading-[1.8] m-0">
          {block.content}
        </p>
      );

    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          key={key}
          className="text-[14px] text-slate-400 leading-[1.8] m-0 pl-5 flex flex-col gap-2"
        >
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </Tag>
      );
    }

    case "highlight": {
      const style = HIGHLIGHT_STYLES[block.variant];
      return (
        <div
          key={key}
          className="rounded-lg px-5 py-4 flex flex-col gap-2"
          style={{
            background: style.bg,
            borderLeft: `3px solid ${style.border}`,
          }}
        >
          {block.title && (
            <span
              className="text-[12px] font-bold uppercase tracking-wider font-mono"
              style={{ color: style.color }}
            >
              {block.title}
            </span>
          )}
          <span className="text-[14px] text-slate-300 leading-[1.8] font-sans">
            {block.content}
          </span>
        </div>
      );
    }

    case "codeBlock": {
      const lines = block.code.split("\n");
      const lineNumberWidth = lines.length >= 100 ? 40 : 28;
      return (
        <div key={key} className="flex flex-col gap-1.5">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "#0A0E27",
              border: "1px solid #1E293B",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{
                borderBottom: "1px solid #1E293B",
                background: "rgba(15,23,42,0.6)",
              }}
            >
              <span className="text-[12px] font-mono font-medium" style={{ color: "#94A3B8" }}>
                {block.filename ?? block.language}
              </span>
              <div className="flex items-center gap-2">
                {block.filename && (
                  <span
                    className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(100,116,139,0.15)",
                      color: "#64748B",
                      border: "1px solid #334155",
                    }}
                  >
                    {block.language}
                  </span>
                )}
                <CopyButton text={block.code} />
              </div>
            </div>

            <div className="overflow-x-auto">
              <pre
                className="m-0 px-4 py-4"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  lineHeight: 1.7,
                  background: "transparent",
                }}
              >
                <code>
                  {lines.map((line, i) => (
                    <div key={i} className="flex">
                      <span
                        className="select-none text-right shrink-0 pr-4"
                        style={{
                          color: "#475569",
                          minWidth: lineNumberWidth,
                          userSelect: "none",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ color: "#E2E8F0" }}>{line || "\u00A0"}</span>
                    </div>
                  ))}
                </code>
              </pre>
            </div>
          </div>

          {block.caption && (
            <span className="text-[12px] italic px-1" style={{ color: "#64748B" }}>
              {block.caption}
            </span>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

// ── Intro Block Renderer (for shared intro / commonTips) ─────────────────

export function IntroBlockRenderer({ block }: { block: ContentBlock }): React.JSX.Element | null {
  return renderBlock(block, 0) as React.JSX.Element | null;
}

// ── Step Renderer ────────────────────────────────────────────────────────

interface StepRendererProps {
  step: Step;
  index: number;
  accentColor: string;
}

export function StepRenderer({ step, index, accentColor }: StepRendererProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: reducedMotion ? 0 : Math.min(index * 0.08, 0.5),
      }}
      className="flex gap-5"
    >
      {/* Step number badge */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold"
          style={{
            background: accentColor,
            color: "#0F172A",
          }}
        >
          {index + 1}
        </div>
        {/* Connecting line */}
        <div className="w-px flex-1 mt-2" style={{ background: "rgba(100,116,139,0.2)" }} />
      </div>

      {/* Step content */}
      <div className="flex-1 min-w-0 pb-10">
        <div className="mb-1">
          <span
            className="text-[11px] font-bold uppercase tracking-wider font-mono"
            style={{ color: accentColor }}
          >
            {step.label}
          </span>
        </div>
        <h3 className="text-[18px] font-bold text-slate-100 m-0 mb-1.5">{step.title}</h3>
        <p className="text-[13px] text-slate-500 m-0 mb-5">{step.description}</p>

        <div className="flex flex-col gap-4">
          {step.blocks.map((block, i) => renderBlock(block, i))}
        </div>
      </div>
    </motion.div>
  );
}
