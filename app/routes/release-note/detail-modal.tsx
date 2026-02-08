import { Link } from "react-router";
import { motion } from "motion/react";

import { Badge } from "~/components/badge";
import { CloseIcon } from "~/components/icons";
import { useModalLock } from "~/hooks/useModalLock";

import type { ReleaseItem } from "./constants";
import { VERSION_DETAILS_AVAILABLE } from "./constants";
import { computeSortedTagCounts, TagCountBadge } from "./version-card";

export function DetailModal({
  version,
  items,
  onClose,
  reducedMotion,
}: {
  version: string;
  items: ReleaseItem[];
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const hasDetails = VERSION_DETAILS_AVAILABLE.has(version);
  const sortedTags = computeSortedTagCounts(items);

  useModalLock(onClose);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6"
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-2xl border border-slate-700 w-full max-w-[680px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
        style={{ boxShadow: "0 24px 64px -16px rgba(0,0,0,0.5)" }}
      >
        {/* Modal header */}
        <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between shrink-0 bg-gradient-to-br from-surface to-surface-hover">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[22px] font-bold text-slate-100 tracking-tight">
                v{version}
              </span>
              <span className="font-mono text-xs text-slate-500 bg-slate-900 px-2 py-[2px] rounded">
                {items.length}件の変更
              </span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {sortedTags.map(([tag, count]) => (
                <TagCountBadge key={tag} tag={tag} count={count} />
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="w-9 h-9 rounded-[10px] border border-slate-700 bg-slate-900 text-slate-500 flex items-center justify-center cursor-pointer transition-all shrink-0 hover:bg-surface-hover hover:text-slate-100"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal body */}
        <div className="overflow-y-auto flex-1 px-6 pt-4 pb-6">
          {/* Items list */}
          <div className="flex flex-col gap-[2px]">
            {items.map((item, i) => (
              <div
                key={i}
                className="modal-item rounded-lg transition-colors"
                style={{ padding: "10px 12px" }}
              >
                <div className="flex gap-2 items-start">
                  <div className="flex gap-[3px] flex-wrap shrink-0 pt-[2px]">
                    {item.tags.map((tag) => (
                      <Badge key={tag} tag={tag} small />
                    ))}
                  </div>
                  <span className="text-slate-100 text-[13px] leading-relaxed break-words font-sans">
                    {item.t}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Version page link */}
          <Link
            to={`/version/${version}`}
            className={`flex items-center justify-center gap-1.5 mt-4 py-2.5 px-4 rounded-lg text-[13px] font-semibold font-sans transition-all ${
              hasDetails
                ? "text-blue-500 bg-blue-500/[0.08] border border-blue-500/25 modal-link-detail"
                : "text-slate-500 bg-transparent border border-slate-700 modal-link-plain"
            }`}
          >
            {hasDetails ? "バージョン詳細ページへ →" : "バージョンページへ →"}
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
