import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import {
  CloseIcon,
} from "~/components/icons";
import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { useModalLock } from "~/hooks/useModalLock";
import bpData from "~/data/best-practices.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BPExample {
  strategy: string;
  detail?: string;
  before: string;
  after: string;
}

interface BPItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  examples?: BPExample[];
  tips?: string[];
  steps?: { phase: string; description: string; example: string }[];
  code?: string;
  fix?: string;
  include?: string[];
  exclude?: string[];
  locations?: { path: string; description: string }[];
  writerReviewer?: { writer: string[]; reviewer: string[] };
}

interface BPSection {
  id: string;
  name: string;
  description: string;
  items: BPItem[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code ベストプラクティス" },
    { name: "description", content: "Claude Code を最大限に活用するためのヒントとパターン" },
  ];
}

const SECTIONS = bpData.sections as BPSection[];
const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  "core-principle": { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  verification: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  workflow: { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  prompting: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  environment: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  "session-management": { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
  scaling: { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  "anti-patterns": { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
  intuition: { color: "#A5B4FC", bg: "rgba(99, 102, 241, 0.15)" },
};

const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  "core-principle": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  verification: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  workflow: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  prompting: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  environment: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09c-.658.003-1.25.396-1.51 1z" />
    </svg>
  ),
  "session-management": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  scaling: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  "anti-patterns": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  intuition: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
};

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  "重要": { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  "ワークフロー": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "プロンプト": { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  "環境設定": { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  "セッション": { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
  "自動化": { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  "アンチパターン": { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
};

interface TabDef {
  id: string;
  label: string;
  color: string;
}

const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  ...SECTIONS.map((s) => ({
    id: s.id,
    label: s.name,
    color: SECTION_COLORS[s.id]?.color || "#3B82F6",
  })),
];


// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ItemCard({
  item,
  accentColor,
  sectionName,
  onClick,
}: {
  item: BPItem;
  accentColor: string;
  sectionName: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="hover-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden h-[200px] px-5 py-[18px]"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` }}
      />
      <div className="flex items-start gap-2">
        <span className="font-semibold text-sm text-slate-100 leading-snug line-clamp-2">
          {item.title}
        </span>
      </div>
      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 line-clamp-3">
        {item.summary}
      </p>
      <div className="flex items-center gap-1.5 mt-auto flex-wrap">
        <span
          className="text-[10px] font-semibold rounded self-start whitespace-nowrap"
          style={{
            padding: "2px 8px",
            background: accentColor + "18",
            color: accentColor,
          }}
        >
          {sectionName}
        </span>
        {item.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-semibold rounded whitespace-nowrap"
            style={{
              padding: "2px 8px",
              background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
              color: TAG_COLORS[tag]?.color ?? "#94A3B8",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function DetailModal({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: BPItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const overlayRef = useRef<HTMLDivElement>(null);
  useModalLock(onClose);

  return (
    <motion.div
      ref={overlayRef}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[4px] flex items-center justify-center p-6"
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-surface rounded-2xl w-full max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}15`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-start gap-3.5 relative border-b border-slate-700 shrink-0"
          style={{
            padding: "20px 24px",
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` }}
          />
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: accentColor + "18", color: accentColor }}
          >
            {SECTION_ICONS[SECTIONS.find((s) => s.items.some((i) => i.id === item.id))?.id ?? ""]?.() ?? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-100 m-0 leading-snug">
              {item.title}
            </h2>
            <p className="text-[13px] text-slate-400 mt-1.5 font-sans leading-[1.6] m-0">
              {item.summary}
            </p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <span
                className="text-[10px] font-semibold rounded"
                style={{ padding: "2px 8px", background: accentColor + "18", color: accentColor }}
              >
                {sectionName}
              </span>
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold rounded"
                  style={{
                    padding: "2px 8px",
                    background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
                    color: TAG_COLORS[tag]?.color ?? "#94A3B8",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="close-btn bg-transparent border-none text-slate-500 cursor-pointer p-1 rounded-md flex items-center justify-center transition-colors shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">
          {/* Content paragraphs */}
          {item.content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="m-0 text-[13px] leading-[1.8] text-slate-300 font-sans">
              {paragraph}
            </p>
          ))}

          {/* Before/After examples table */}
          {item.examples && item.examples.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
                具体例（Before → After）
              </h3>
              <div className="flex flex-col gap-2.5">
                {item.examples.map((ex, i) => (
                  <div key={i} className="rounded-lg border border-slate-700 overflow-hidden">
                    <div className="px-4 py-2 bg-slate-800 text-[11px] font-semibold text-slate-300">
                      {ex.strategy}{ex.detail ? ` — ${ex.detail}` : ""}
                    </div>
                    <div className="grid grid-cols-2 divide-x divide-slate-700">
                      <div className="p-3">
                        <span className="block text-[10px] font-bold text-red-400 mb-1 uppercase tracking-wider">Before</span>
                        <span className="text-[12px] text-slate-400 leading-relaxed italic">{ex.before}</span>
                      </div>
                      <div className="p-3">
                        <span className="block text-[10px] font-bold text-green-400 mb-1 uppercase tracking-wider">After</span>
                        <span className="text-[12px] text-slate-300 leading-relaxed">{ex.after}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Steps (workflow phases) */}
          {item.steps && item.steps.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
                フェーズ
              </h3>
              <div className="flex flex-col gap-2.5">
                {item.steps.map((step, i) => (
                  <div key={i} className="rounded-lg border border-slate-700 p-4 flex gap-3 items-start">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: accentColor + "18", color: accentColor }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-100 mb-1">{step.phase}</div>
                      <div className="text-[12px] text-slate-400 leading-relaxed mb-2">{step.description}</div>
                      <pre className="m-0 p-3 bg-[#0B1120] rounded-md overflow-x-auto text-[12px] leading-relaxed border border-slate-800">
                        <code className="font-mono text-slate-300 whitespace-pre-wrap">{step.example}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips list */}
          {item.tips && item.tips.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-orange-300 font-mono m-0">
                ポイント
              </h3>
              <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
                {item.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 items-start text-[13px] text-slate-300 leading-relaxed">
                    <span className="text-slate-500 shrink-0 mt-[2px]">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Code block */}
          {item.code && (
            <div className="rounded-lg overflow-hidden border border-slate-700">
              <pre className="m-0 p-4 bg-[#0B1120] overflow-x-auto text-[13px] leading-relaxed">
                <code className="font-mono text-slate-300 whitespace-pre-wrap">{item.code}</code>
              </pre>
            </div>
          )}

          {/* Include/Exclude tables (for CLAUDE.md item) */}
          {item.include && item.exclude && (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-green-500/20 p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-green-400 font-mono m-0 mb-2.5">
                  含めるもの
                </h4>
                <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
                  {item.include.map((inc, i) => (
                    <li key={i} className="flex gap-1.5 items-start text-[12px] text-slate-300 leading-relaxed">
                      <span className="text-green-400 shrink-0">+</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-red-500/20 p-4">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-red-400 font-mono m-0 mb-2.5">
                  除外するもの
                </h4>
                <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
                  {item.exclude.map((exc, i) => (
                    <li key={i} className="flex gap-1.5 items-start text-[12px] text-slate-300 leading-relaxed">
                      <span className="text-red-400 shrink-0">-</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* CLAUDE.md locations */}
          {item.locations && item.locations.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-purple-300 font-mono m-0">
                配置場所
              </h3>
              <div className="flex flex-col gap-1.5">
                {item.locations.map((loc, i) => (
                  <div key={i} className="flex gap-3 items-start rounded-lg border border-slate-700 p-3">
                    <code className="font-mono text-[12px] text-purple-300 shrink-0 bg-purple-500/10 px-2 py-0.5 rounded">
                      {loc.path}
                    </code>
                    <span className="text-[12px] text-slate-400 leading-relaxed">{loc.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Writer/Reviewer pattern */}
          {item.writerReviewer && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
                Writer / Reviewer パターン
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-cyan-500/20 p-4">
                  <h4 className="text-[11px] font-bold text-cyan-300 font-mono m-0 mb-2">
                    Session A（ライター）
                  </h4>
                  {item.writerReviewer.writer.map((w, i) => (
                    <p key={i} className="m-0 mt-1.5 text-[12px] text-slate-300 leading-relaxed italic">{w}</p>
                  ))}
                </div>
                <div className="rounded-lg border border-orange-500/20 p-4">
                  <h4 className="text-[11px] font-bold text-orange-300 font-mono m-0 mb-2">
                    Session B（レビュアー）
                  </h4>
                  {item.writerReviewer.reviewer.map((r, i) => (
                    <p key={i} className="m-0 mt-1.5 text-[12px] text-slate-300 leading-relaxed italic">{r}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Anti-pattern fix */}
          {item.fix && (
            <div className="rounded-lg px-4 py-3 flex gap-3 items-start" style={{ background: "rgba(16, 185, 129, 0.08)", borderLeft: "3px solid #10B981" }}>
              <span className="text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 font-mono text-green-400">
                Fix
              </span>
              <span className="text-[13px] text-slate-300 leading-relaxed font-sans">{item.fix}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Section-to-item map for lookups
// ---------------------------------------------------------------------------

const ITEM_SECTION_MAP = new Map<string, { sectionName: string; sectionId: string }>();
for (const section of SECTIONS) {
  for (const item of section.items) {
    ITEM_SECTION_MAP.set(item.id, { sectionName: section.name, sectionId: section.id });
  }
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function BestPractices(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [modalItemId, setModalItemId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  if (!hasMounted.current) {
    hasMounted.current = true;
  }

  const lowerQuery = query.toLowerCase();
  const isAllTab = activeTab === "all";
  const activeSection = SECTIONS.find((s) => s.id === activeTab);

  const filteredSections = useMemo(() => {
    const sections = isAllTab ? SECTIONS : activeSection ? [activeSection] : [];
    if (!query) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.summary.toLowerCase().includes(lowerQuery) ||
            item.content.toLowerCase().includes(lowerQuery) ||
            item.tags.some((t) => t.toLowerCase().includes(lowerQuery))
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [isAllTab, activeSection, query, lowerQuery]);

  const visibleItemCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  const openModal = useCallback((itemId: string) => setModalItemId(itemId), []);
  const closeModal = useCallback(() => setModalItemId(null), []);

  const modalItem = modalItemId
    ? SECTIONS.flatMap((s) => s.items).find((i) => i.id === modalItemId) ?? null
    : null;
  const modalSection = modalItemId ? ITEM_SECTION_MAP.get(modalItemId) : null;

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="ベストプラクティス"
          description="環境設定から並列セッションでのスケーリングまで、Claude Code を最大限に活用するためのヒントとパターン。"
          stats={[
            { value: SECTIONS.length, label: "カテゴリ" },
            { value: TOTAL_ITEMS, label: "プラクティス" },
          ]}
          gradient={["rgba(99,102,241,0.08)", "rgba(16,185,129,0.05)"]}
        />

        {/* Tabs */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          ref={tabScrollRef}
          className="flex gap-1 mb-5 overflow-x-auto pb-1 scrollbar-none"
        >
          {TAB_DEFS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setQuery("");
                }}
                className={`shrink-0 rounded-[10px] text-[13px] font-sans cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 px-4 py-2.5 ${isActive ? "font-semibold" : "font-medium tab-btn-inactive"}`}
                style={{
                  border: isActive ? `1px solid ${tab.color}40` : "1px solid transparent",
                  background: isActive ? tab.color + "18" : "transparent",
                  color: isActive ? tab.color : "#64748B",
                }}
              >
                {SECTION_ICONS[tab.id] && (
                  <span className="flex items-center scale-[0.8]">
                    {SECTION_ICONS[tab.id]()}
                  </span>
                )}
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-4"
        >
          <SearchInput value={query} onChange={setQuery} placeholder="プラクティスを検索..." />
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Count */}
            <div className="flex items-center gap-2.5 mb-4 px-1">
              <span className="text-[13px] text-slate-500 font-medium">
                {visibleItemCount} / {isAllTab ? TOTAL_ITEMS : (activeSection?.items.length ?? 0)} 件
              </span>
            </div>

            {/* Grouped cards */}
            <div className="flex flex-col gap-6">
              {filteredSections.map((section) => {
                const colors = SECTION_COLORS[section.id] || { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" };
                return (
                  <div key={section.id}>
                    {isAllTab && (
                      <div className="flex items-center gap-2.5 mb-3 px-1">
                        {SECTION_ICONS[section.id] && (
                          <span className="flex items-center" style={{ color: colors.color }}>
                            {SECTION_ICONS[section.id]()}
                          </span>
                        )}
                        <h2 className="text-base font-bold m-0" style={{ color: colors.color }}>
                          {section.name}
                        </h2>
                        <span className="text-xs text-slate-500">{section.description}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
                      <AnimatePresence mode="popLayout">
                        {section.items.map((item, i) => (
                          <motion.div
                            key={item.id}
                            layout={!reducedMotion}
                            initial={reducedMotion ? false : { opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.2, delay: reducedMotion ? 0 : Math.min(i * 0.04, 0.4) }}
                          >
                            <ItemCard
                              item={item}
                              accentColor={colors.color}
                              sectionName={section.name}
                              onClick={() => openModal(item.id)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {visibleItemCount === 0 && (
              <EmptyState message="条件に一致するプラクティスはありません" reducedMotion={reducedMotion} />
            )}
          </motion.div>
        </AnimatePresence>

        <Footer />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalItem && modalSection && (
          <DetailModal
            item={modalItem}
            sectionName={modalSection.sectionName}
            accentColor={SECTION_COLORS[modalSection.sectionId]?.color ?? "#3B82F6"}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
