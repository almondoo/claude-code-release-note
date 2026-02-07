import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { Badge, TAG_COLORS, TAG_LABELS } from "~/components/badge";
import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { CloseIcon, ExternalLinkIcon } from "~/components/icons";
import { SearchInput } from "~/components/search-input";
import releases from "~/data/releases.json";
import versionDetails from "~/data/version-details.json";
import { useModalLock } from "~/hooks/useModalLock";

interface ReleaseItem {
  t: string;
  tags: string[];
}

interface ReleaseVersion {
  v: string;
  items: ReleaseItem[];
}

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code リリースノート" },
    { name: "description", content: "Claude Code の全バージョンのリリースノートを閲覧できます" },
  ];
}

const RELEASES: ReleaseVersion[] = [...releases].reverse();

const ALL_TAGS = Object.keys(TAG_COLORS);

const VERSION_DETAILS_AVAILABLE = new Set(Object.keys(versionDetails));

const totalAll = RELEASES.reduce((sum, r) => sum + r.items.length, 0);

interface TabDef {
  id: string;
  label: string;
  color: string;
}

const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  ...ALL_TAGS.map((tag) => ({
    id: tag,
    label: TAG_LABELS[tag] ?? tag,
    color: TAG_COLORS[tag]?.text ?? "#3B82F6",
  })),
];

const TAG_ICONS: Record<string, () => React.JSX.Element> = {
  "新機能": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  "バグ修正": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  "改善": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  "SDK": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  "IDE": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "Platform": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  "Security": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  "Perf": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  "非推奨": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  "Plugin": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
    </svg>
  ),
  "MCP": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  "Agent": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09c-.658.003-1.25.396-1.51 1z" />
    </svg>
  ),
};

const NAV_LINKS = [
  { to: "/commands", label: "コマンド一覧" },
  { to: "/plugins", label: "公式プラグイン" },
  { to: "/directory", label: "ディレクトリ構成" },
];

function TagCountBadge({ tag, count }: { tag: string; count: number }): React.JSX.Element {
  return (
    <span
      className="inline-flex items-center gap-[3px] px-[7px] py-[2px] rounded text-[10px] font-semibold"
      style={{
        background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
        color: TAG_COLORS[tag]?.text ?? "#94A3B8",
        letterSpacing: "0.2px",
      }}
    >
      {TAG_LABELS[tag] ?? tag}
      <span className="opacity-50">{count}</span>
    </span>
  );
}

function computeSortedTagCounts(items: ReleaseItem[]): [string, number][] {
  const tagCounts: Record<string, number> = {};
  for (const item of items) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  return Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
}

function VersionCard({
  version,
  items,
  accentColor,
  onClick,
}: {
  version: string;
  items: ReleaseItem[];
  accentColor: string;
  onClick: () => void;
}): React.JSX.Element {
  const sortedTags = computeSortedTagCounts(items);
  const hasDetails = VERSION_DETAILS_AVAILABLE.has(version);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="hover-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-[10px] cursor-pointer relative overflow-hidden h-[200px]"
      style={{ padding: "18px 20px", "--accent": accentColor } as React.CSSProperties}
    >
      {/* Accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)` }}
      />

      {/* Version header */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-base font-bold text-slate-100 tracking-tight">
          v{version}
        </span>
        <span className="text-[11px] text-slate-500 font-mono bg-slate-900 px-2 py-[2px] rounded">
          {items.length}件
        </span>
      </div>

      {/* Tag badges */}
      <div className="flex gap-1 flex-wrap">
        {sortedTags.slice(0, 4).map(([tag, count]) => (
          <TagCountBadge key={tag} tag={tag} count={count} />
        ))}
        {sortedTags.length > 4 && (
          <span className="px-[7px] py-[2px] rounded text-[10px] font-semibold bg-slate-500/10 text-slate-500">
            +{sortedTags.length - 4}
          </span>
        )}
      </div>

      {/* Preview: first 2 items */}
      <div className="flex flex-col gap-1 flex-1 min-h-0 overflow-hidden">
        {items.slice(0, 2).map((item, i) => (
          <span
            key={i}
            className="text-slate-400 text-xs leading-normal overflow-hidden text-ellipsis whitespace-nowrap font-sans"
          >
            {item.t}
          </span>
        ))}
        {items.length > 2 && (
          <span className="text-slate-500 text-[11px]">
            他 {items.length - 2} 件...
          </span>
        )}
      </div>

      {/* Detail availability indicator */}
      {hasDetails && (
        <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-500 mt-auto">
          <ExternalLinkIcon />
          詳細あり
        </div>
      )}
    </div>
  );
}

function DetailModal({
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

export default function ReleaseNote(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [modalVersion, setModalVersion] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const tabsRef = useRef<HTMLDivElement>(null);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  const closeModal = useCallback(() => setModalVersion(null), []);

  const filtered = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return RELEASES
      .map((release) => ({
        ...release,
        items: release.items.filter((item) => {
          const tagMatch = activeTab === "all" || item.tags.includes(activeTab);
          const queryMatch = !query || item.t.toLowerCase().includes(lowerQuery);
          return tagMatch && queryMatch;
        }),
      }))
      .filter((release) => release.items.length > 0);
  }, [activeTab, query]);

  const totalItems = filtered.reduce((sum, r) => sum + r.items.length, 0);

  const activeTabDef = TAB_DEFS.find((t) => t.id === activeTab) ?? TAB_DEFS[0];
  const accentColor = activeTabDef.color;

  const modalRelease = modalVersion
    ? RELEASES.find((r) => r.v === modalVersion)
    : null;

  const modalItems = modalRelease
    ? activeTab === "all"
      ? modalRelease.items
      : modalRelease.items.filter((item) => item.tags.includes(activeTab))
    : [];

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1100px] mx-auto p-8 px-4">
        {/* Header */}
        <motion.div
          initial={m ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-7 py-10 px-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl relative overflow-hidden border border-slate-700"
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
            <h1 className="text-[32px] font-bold mb-3 text-slate-100 tracking-tight">
              リリースノート
            </h1>
            <div className="flex justify-center items-baseline gap-6 text-[13px] text-slate-400 flex-wrap">
              <span>
                <strong className="text-slate-100">{RELEASES.length}</strong> バージョン
              </span>
              <span>
                <strong className="text-slate-100">{totalAll}</strong> 件の変更
              </span>
              <span className="font-mono text-xs">
                v{RELEASES[0]?.v} 〜 v{RELEASES[RELEASES.length - 1]?.v}
              </span>
            </div>
            <div className="mt-4 flex gap-3 justify-center flex-wrap">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="nav-link inline-flex items-center gap-1.5 text-slate-500 text-xs font-sans py-1 px-3 rounded-md border border-slate-700 transition-all"
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          ref={tabsRef}
          className="flex gap-1.5 mb-3.5 overflow-x-auto py-1 scrollbar-none"
        >
          {TAB_DEFS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.id !== "all" ? TAG_ICONS[tab.id] : null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all font-sans whitespace-nowrap shrink-0 ${
                  active ? "" : "hover:bg-surface-hover hover:text-slate-400"
                }`}
                style={{
                  border: `1px solid ${active ? tab.color + "60" : "#334155"}`,
                  background: active ? (TAG_COLORS[tab.id]?.bg ?? "rgba(59, 130, 246, 0.25)") : "#1E293B",
                  color: active ? tab.color : "#64748B",
                }}
              >
                {Icon && (
                  <span className="flex items-center">
                    <Icon />
                  </span>
                )}
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Search + count */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-3 items-center mb-[18px]"
        >
          <div className="flex-1">
            <SearchInput value={query} onChange={setQuery} placeholder="キーワードで検索..." accentColor={accentColor} />
          </div>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap font-mono">
            {filtered.length}ver / {totalItems}件
          </span>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
          <AnimatePresence mode="popLayout">
            {filtered.map((release, i) => (
              <motion.div
                key={release.v}
                layout={!reducedMotion}
                initial={m ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={m ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25, delay: reducedMotion ? 0 : Math.min(i * 0.03, 0.3) }}
              >
                <VersionCard
                  version={release.v}
                  items={release.items}
                  accentColor={accentColor}
                  onClick={() => setModalVersion(release.v)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        <AnimatePresence>
          {filtered.length === 0 && (
            <EmptyState message="条件に一致する変更はありません" reducedMotion={reducedMotion} />
          )}
        </AnimatePresence>

        {/* Footer */}
        <Footer />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalVersion && modalRelease && (
          <DetailModal
            version={modalVersion}
            items={modalItems}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
