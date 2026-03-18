import { motion, useReducedMotion } from "motion/react";

import { LinedCodeBlock } from "~/components/lined-code-block";
import { renderInlineMarkdown } from "~/components/paragraph-list";

import type { ContentBlock, Step } from "./constants";
import { HIGHLIGHT_STYLES } from "./constants";

// ── Block Renderer ───────────────────────────────────────────────────────

const renderBlock = (block: ContentBlock, key: number): React.ReactNode => {
  switch (block.type) {
    case "text":
      return (
        <p key={key} className="text-[14px] text-slate-400 leading-[1.8] m-0">
          {renderInlineMarkdown(block.content)}
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
            <li key={i}>{renderInlineMarkdown(item)}</li>
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
            {renderInlineMarkdown(block.content)}
          </span>
        </div>
      );
    }

    case "codeBlock":
      return (
        <LinedCodeBlock
          key={key}
          language={block.language}
          code={block.code}
          filename={block.filename}
          caption={block.caption}
        />
      );

    default:
      return null;
  }
};

// ── Intro Block Renderer (for shared intro / commonTips) ─────────────────

export const IntroBlockRenderer = ({
  block,
}: {
  block: ContentBlock;
}): React.JSX.Element | null => {
  return renderBlock(block, 0) as React.JSX.Element | null;
};

// ── Step Renderer ────────────────────────────────────────────────────────

interface StepRendererProps {
  step: Step;
  index: number;
  accentColor: string;
}

export const StepRenderer = ({
  step,
  index,
  accentColor,
}: StepRendererProps): React.JSX.Element => {
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
};
