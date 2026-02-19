import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { CodeBlockView } from "~/components/code-block-view";
import { CalloutBox } from "~/components/callout-box";
import { useModalLock } from "~/hooks/useModalLock";

import type { CustomizationItem } from "./constants";
import { TAB_ICONS } from "./constants";

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

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
};

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

interface GuidedReaderProps {
  items: CustomizationItem[];
  currentIndex: number;
  accentColor: string;
  tabId: string;
  tabName: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  reducedMotion: boolean | null;
}

export function GuidedReader({
  items,
  currentIndex,
  accentColor,
  tabId,
  tabName,
  onClose,
  onNext,
  onPrev,
  reducedMotion,
}: GuidedReaderProps): React.JSX.Element {
  const [direction, setDirection] = useState(0);
  const item = items[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1;
  const progress = ((currentIndex + 1) / items.length) * 100;
  const IconComponent = TAB_ICONS[tabId];
  const variants = reducedMotion ? fadeVariants : slideVariants;

  useModalLock(onClose);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "ArrowRight") {
        setDirection(1);
        onNext();
      } else if (e.key === "ArrowLeft") {
        setDirection(-1);
        onPrev();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onNext, onPrev]);

  function handleNext(): void {
    if (isLast) {
      onClose();
    } else {
      setDirection(1);
      onNext();
    }
  }

  function handlePrev(): void {
    setDirection(-1);
    onPrev();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.97, y: 16 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-surface rounded-2xl w-full flex flex-col overflow-hidden"
        style={{
          maxWidth: 760,
          maxHeight: "90vh",
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}15`,
        }}
      >
        {/* Accent bar */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
            flexShrink: 0,
          }}
        />

        {/* Header */}
        <div
          className="flex items-center gap-4 shrink-0"
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid #334155",
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          }}
        >
          {IconComponent && (
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ background: accentColor + "18", color: accentColor }}
            >
              <IconComponent />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {/* Progress bar */}
            <div
              className="rounded-full overflow-hidden mb-1.5"
              style={{ height: 4, background: "#334155" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  background: accentColor,
                  width: `${progress}%`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div className="text-[12px] font-medium" style={{ color: "#64748B" }}>
              {tabName} &bull; {currentIndex + 1} / {items.length}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="close-btn bg-transparent border-none text-slate-500 cursor-pointer px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[13px] font-medium transition-colors shrink-0"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            閉じる
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "28px 32px" }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col gap-5"
            >
              {/* Title + description */}
              <div>
                <h2 className="text-[22px] font-bold text-slate-100 leading-snug m-0 mb-2">
                  {item.title}
                </h2>
                <p className="text-[14px] text-slate-400 m-0 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Content paragraphs */}
              {item.content && (
                <div className="flex flex-col gap-3">
                  <div
                    className="text-[12px] font-bold tracking-wide uppercase font-mono"
                    style={{ color: accentColor }}
                  >
                    詳細説明
                  </div>
                  {item.content.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="m-0 text-[14px] leading-[1.8] text-slate-400 font-sans">
                      {renderInlineLinks(paragraph)}
                    </p>
                  ))}
                </div>
              )}

              {/* Code blocks */}
              {item.code.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div
                    className="text-[12px] font-bold tracking-wide uppercase font-mono"
                    style={{ color: accentColor }}
                  >
                    コード例
                  </div>
                  {item.code.map((block, i) => (
                    <CodeBlockView key={i} block={block} />
                  ))}
                </div>
              )}

              {/* Callouts */}
              {item.callouts.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  {item.callouts.map((callout, i) => (
                    <CalloutBox key={i} callout={callout} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div
          className="flex items-center justify-between shrink-0"
          style={{ borderTop: "1px solid #334155", padding: "16px 24px" }}
        >
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="text-[13px] font-semibold rounded-[10px] transition-colors border-none"
            style={{
              background: accentColor + "18",
              border: `1px solid ${accentColor}40`,
              color: accentColor,
              padding: "6px 16px",
              opacity: isFirst ? 0.3 : 1,
              cursor: isFirst ? "default" : "pointer",
            }}
          >
            ← 前へ
          </button>
          <span
            className="text-[12px] font-medium text-center truncate"
            style={{ color: "#64748B", maxWidth: "40%" }}
          >
            {item.title}
          </span>
          <button
            onClick={handleNext}
            className="text-[13px] font-semibold rounded-[10px] border-none cursor-pointer transition-colors"
            style={{
              background: accentColor + "18",
              border: `1px solid ${accentColor}40`,
              color: accentColor,
              padding: "6px 16px",
            }}
          >
            {isLast ? "完了" : "次へ →"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
