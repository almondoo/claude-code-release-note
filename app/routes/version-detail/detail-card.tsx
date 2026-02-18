import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { ChevronDownIcon } from "~/components/icons";
import { Badge, TAG_COLORS_BY_LABEL, TAG_LABELS } from "~/components/badge";

import type { ReleaseItem, DetailItem } from "./constants";

const DEFAULT_CATEGORY_COLOR = { bg: "rgba(59, 130, 246, 0.1)", text: "#60A5FA" };

export function CategoryBadge({ category }: { category: string }): React.JSX.Element {
  const colors = TAG_COLORS_BY_LABEL[category] ?? DEFAULT_CATEGORY_COLOR;

  return (
    <span
      className="inline-flex items-center whitespace-nowrap font-semibold tracking-wide px-[9px] py-[2px] text-[12px] rounded-md"
      style={{
        background: colors.bg,
        color: colors.text,
        lineHeight: 1.6,
        letterSpacing: "0.2px",
      }}
    >
      {category}
    </span>
  );
}

export function DetailCard({
  item,
  index,
  reducedMotion,
}: {
  item: DetailItem;
  index: number;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  function toggle() {
    setIsOpen((prev) => !prev);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.5) }}
      className={`bg-surface rounded-xl overflow-hidden detail-card ${
        isOpen
          ? "border border-blue-500/25 shadow-[0_0_0_1px_rgba(59,130,246,0.13),0_8px_32px_-8px_rgba(0,0,0,0.4)]"
          : "border border-slate-700 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
      }`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={`px-[18px] py-4 cursor-pointer transition-colors ${
          isOpen ? "bg-gradient-to-br from-surface to-surface-hover" : "detail-card-header"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex gap-1.5 flex-wrap mb-2">
              {item.tags
                .filter((tag) => (TAG_LABELS[tag] ?? tag) !== item.category)
                .map((tag) => (
                  <Badge key={tag} tag={tag} />
                ))}
              <CategoryBadge category={item.category} />
            </div>
            <p className="text-slate-100 text-sm leading-[1.7] m-0 font-sans break-words">
              {item.t}
            </p>
          </div>
          <div
            className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
              isOpen ? "bg-blue-500 text-white" : "bg-slate-900 text-slate-500"
            }`}
          >
            <ChevronDownIcon
              className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-[18px] pb-[18px] border-t border-slate-700/25">
              <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700/40">
                <p className="text-slate-400 text-[14px] leading-[1.9] m-0 font-sans whitespace-pre-wrap break-words">
                  {item.detail}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FallbackCard({ item }: { item: ReleaseItem }): React.JSX.Element {
  return (
    <div className="bg-surface rounded-xl border border-slate-700 px-[18px] py-4">
      <div className="flex gap-1.5 flex-wrap mb-2">
        {item.tags.map((tag) => (
          <Badge key={tag} tag={tag} />
        ))}
      </div>
      <p className="text-slate-400 text-sm leading-[1.7] m-0 font-sans">{item.t}</p>
    </div>
  );
}
