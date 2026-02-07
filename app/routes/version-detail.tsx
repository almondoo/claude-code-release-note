import { useState } from "react";
import { Link, useParams } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "~/components/icons";
import { Badge, TAG_COLORS, TAG_LABELS } from "~/components/badge";
import releases from "~/data/releases.json";
import versionDetails from "~/data/version-details.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReleaseItem {
  t: string;
  tags: string[];
}

interface DetailItem {
  t: string;
  tags: string[];
  detail: string;
  category: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const RELEASES = [...releases].reverse();
const VERSION_DETAILS: Record<string, DetailItem[]> = versionDetails;

function getAdjacentVersions(version: string): { prev: string | null; next: string | null } {
  const idx = RELEASES.findIndex((r) => r.v === version);
  return {
    prev: idx < RELEASES.length - 1 ? RELEASES[idx + 1].v : null,
    next: idx > 0 ? RELEASES[idx - 1].v : null,
  };
}

// ---------------------------------------------------------------------------
// CategoryBadge
// ---------------------------------------------------------------------------

function CategoryBadge({ category }: { category: string }): React.JSX.Element {
  return (
    <span
      className="inline-flex items-center whitespace-nowrap font-semibold tracking-wide px-[9px] py-[2px] text-[11px] rounded-md text-blue-500 border border-blue-500/20"
      style={{
        background: "rgba(59, 130, 246, 0.1)",
        lineHeight: 1.6,
        letterSpacing: "0.2px",
      }}
    >
      {category}
    </span>
  );
}

// ---------------------------------------------------------------------------
// DetailCard
// ---------------------------------------------------------------------------

function DetailCard({
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
              {item.tags.map((tag) => (
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
                <p className="text-slate-400 text-[13px] leading-[1.9] m-0 font-sans whitespace-pre-wrap break-words">
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

// ---------------------------------------------------------------------------
// FallbackCard (for versions without detailed data)
// ---------------------------------------------------------------------------

function FallbackCard({ item }: { item: ReleaseItem }): React.JSX.Element {
  return (
    <div className="bg-surface rounded-xl border border-slate-700 px-[18px] py-4">
      <div className="flex gap-1.5 flex-wrap mb-2">
        {item.tags.map((tag) => (
          <Badge key={tag} tag={tag} />
        ))}
      </div>
      <p className="text-slate-400 text-sm leading-[1.7] m-0 font-sans">
        {item.t}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NavButton
// ---------------------------------------------------------------------------

function NavButton({ to, label, direction }: { to: string; label: string; direction: "prev" | "next" }): React.JSX.Element {
  return (
    <Link
      to={`/version/${to}`}
      className={`nav-button flex items-center gap-2 py-2.5 px-4 rounded-lg bg-surface border border-slate-700 text-slate-400 no-underline text-[13px] font-sans transition-all ${
        direction === "next" ? "flex-row-reverse" : ""
      }`}
    >
      {direction === "prev" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      <div className={direction === "next" ? "text-right" : "text-left"}>
        <div className="text-[11px] text-slate-500 mb-0.5">
          {direction === "prev" ? "前のバージョン" : "次のバージョン"}
        </div>
        <div className="font-mono font-semibold">v{label}</div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function VersionDetail(): React.JSX.Element {
  const { version } = useParams();
  const reducedMotion = useReducedMotion();

  const release = RELEASES.find((r) => r.v === version);
  const details = version ? VERSION_DETAILS[version] : null;
  const { prev, next } = version ? getAdjacentVersions(version) : { prev: null, next: null };

  if (!release) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">バージョンが見つかりません</h1>
        <Link
          to="/"
          className="text-blue-500 no-underline flex items-center gap-1.5 text-sm"
        >
          <ArrowLeftIcon />
          一覧に戻る
        </Link>
      </div>
    );
  }

  const tagCounts: Record<string, number> = {};
  for (const item of release.items) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[920px] mx-auto py-8 px-4">
        {/* Back link */}
        <motion.div
          initial={m ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/"
            className="back-link inline-flex items-center gap-1.5 text-slate-500 no-underline text-[13px] font-sans mb-6 py-1.5 px-3 rounded-md transition-all"
          >
            <ArrowLeftIcon />
            リリースノート一覧
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={m ? false : { opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-7 px-6 py-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl relative overflow-hidden border border-slate-700"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.08), transparent 60%), " +
                "radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.05), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="text-xs font-semibold text-slate-500 tracking-[3px] uppercase mb-3 font-mono">
              CLAUDE CODE
            </div>
            <h1 className="text-4xl font-extrabold m-0 mb-4 text-slate-100 tracking-tight font-mono">
              v{version}
            </h1>
            <div className="flex gap-3 flex-wrap items-center mb-3">
              <span className="text-[13px] text-slate-400">
                <strong className="text-slate-100">{release.items.length}</strong> 件の変更
              </span>
              {details && (
                <span className="text-[11px] py-0.5 px-2 rounded font-semibold" style={{ background: "rgba(16, 185, 129, 0.15)", color: "#6EE7B7" }}>
                  詳細情報あり
                </span>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {sortedTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-[3px] px-[9px] py-[2px] rounded-md text-[11px] font-semibold"
                  style={{
                    background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
                    color: TAG_COLORS[tag]?.text ?? "#94A3B8",
                    letterSpacing: "0.2px",
                  }}
                >
                  {TAG_LABELS[tag] ?? tag}
                  <span className="opacity-50 ml-0.5">{count}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Items */}
        <div className="flex flex-col gap-2 mb-7">
          {details
            ? details.map((item, i) => (
                <DetailCard
                  key={i}
                  item={item}
                  index={i}
                  reducedMotion={reducedMotion}
                />
              ))
            : release.items.map((item, i) => (
                <FallbackCard key={i} item={item} />
              ))}
        </div>

        {/* Navigation */}
        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex justify-between gap-3 mb-6"
        >
          <div>{prev && <NavButton to={prev} label={prev} direction="prev" />}</div>
          <div>{next && <NavButton to={next} label={next} direction="next" />}</div>
        </motion.div>

        {/* Footer */}
        <div className="text-center p-6 mt-6 text-slate-500 text-xs border-t border-slate-700">
          Claude Code Release Notes Viewer
        </div>
      </div>
    </div>
  );
}
