import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import pluginsData from "~/data/plugins.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Plugin {
  name: string;
  displayName: string;
  description: string;
  binary: string | null;
  install: string;
  detail: string;
  whenToUse: string;
  setup: string;
  homepage?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  plugins: Plugin[];
}

// ---------------------------------------------------------------------------
// Category colors & icons
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  "code-intelligence": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "dev-tools": { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  "code-review-git": { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  "external-integrations": { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  "output-styles": { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  "community": { color: "#F472B6", bg: "rgba(244, 114, 182, 0.15)" },
};

const CATEGORY_ICONS: Record<string, () => React.JSX.Element> = {
  "code-intelligence": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  "dev-tools": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  "code-review-git": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  "external-integrations": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  "output-styles": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  "community": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function DetailInfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function TimingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function SetupIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code 公式プラグイン一覧" },
    { name: "description", content: "Claude Code の公式プラグインの詳細と使い方" },
  ];
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CATEGORIES: Category[] = pluginsData.categories;
const ALL_PLUGINS = CATEGORIES.flatMap((c) => c.plugins);
const TOTAL = ALL_PLUGINS.length;

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

interface TabDef {
  id: string;
  label: string;
  color: string;
  type: "category" | "quickstart";
}

const TAB_DEFS: TabDef[] = [
  ...CATEGORIES.map((c) => ({
    id: c.id,
    label: c.name,
    color: CATEGORY_COLORS[c.id]?.color || "#3B82F6",
    type: "category" as const,
  })),
  { id: "quickstart", label: "クイックスタート", color: "#5EEAD4", type: "quickstart" },
];

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleCopy();
      }}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[11px] cursor-pointer transition-all shrink-0"
      style={{
        borderColor: copied ? "#6EE7B740" : "#334155",
        background: copied ? "rgba(16, 185, 129, 0.15)" : "#0F172A",
        color: copied ? "#6EE7B7" : "#64748B",
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// PluginCard
// ---------------------------------------------------------------------------

function PluginCard({
  plugin,
  accentColor,
  onClick,
}: {
  plugin: Plugin;
  accentColor: string;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="plugin-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden px-5 py-[18px]"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
        }}
      />
      <div className="flex items-baseline gap-2">
        <code
          className="font-mono text-sm font-bold whitespace-nowrap"
          style={{ color: accentColor }}
        >
          {plugin.displayName}
        </code>
        {plugin.binary && (
          <span className="text-[10px] text-slate-500 font-mono bg-slate-900 whitespace-nowrap px-1.5 py-px rounded-sm">
            LSP
          </span>
        )}
      </div>
      <p className="m-0 text-xs leading-relaxed text-slate-400 font-sans flex-1 line-clamp-2">
        {plugin.description}
      </p>
      <div className="flex items-center gap-2 mt-auto">
        <code className="font-mono text-[10px] text-slate-500 bg-slate-900 rounded overflow-hidden text-ellipsis whitespace-nowrap flex-1 px-2 py-[2px]">
          {plugin.install}
        </code>
        <CopyButton text={plugin.install} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetailModal
// ---------------------------------------------------------------------------

function DetailModal({
  plugin,
  accentColor,
  onClose,
  reducedMotion,
}: {
  plugin: Plugin;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [onClose]);

  return (
    <motion.div
      ref={overlayRef}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      className="fixed inset-0 z-[1000] bg-overlay backdrop-blur-[4px] flex items-center justify-center p-6"
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-surface rounded-2xl w-full max-w-[640px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}15`,
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3.5 relative px-6 py-5 border-b border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
            }}
          />
          <div
            className="w-10 h-10 flex items-center justify-center shrink-0 rounded-[10px]"
            style={{
              background: accentColor + "18",
              color: accentColor,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <code
              className="font-mono text-base font-bold break-all"
              style={{ color: accentColor }}
            >
              {plugin.displayName}
            </code>
            <div className="text-[13px] text-slate-400 mt-1.5 font-sans leading-relaxed">
              {plugin.description}
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {plugin.binary && (
                <span className="text-[10px] font-semibold rounded px-2 py-[2px] bg-cyan-500/15 text-cyan-300">
                  LSP: {plugin.binary}
                </span>
              )}
              {plugin.homepage && (
                <a
                  href={plugin.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="homepage-link inline-flex items-center gap-1 text-[10px] font-semibold rounded bg-slate-900 text-slate-500 no-underline transition-colors px-2 py-[2px]"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                  <ExternalLinkIcon />
                </a>
              )}
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
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Install */}
          <div
            className="bg-slate-900 rounded-lg flex items-center justify-between gap-3 px-3.5 py-2.5"
            style={{ border: `1px solid ${accentColor}20` }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <DownloadIcon />
              <code
                className="font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis"
                style={{ color: accentColor }}
              >
                {plugin.install}
              </code>
            </div>
            <CopyButton text={plugin.install} />
          </div>

          {/* Detail */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase font-mono text-cyan-300">
              <DetailInfoIcon />
              詳細説明
            </div>
            <p className="m-0 text-[13px] leading-[1.8] text-slate-400 font-sans">
              {plugin.detail}
            </p>
          </div>

          {/* When to use */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase font-mono text-orange-300">
              <TimingIcon />
              使うタイミング
            </div>
            <p className="m-0 text-[13px] leading-[1.8] text-slate-400 font-sans">
              {plugin.whenToUse}
            </p>
          </div>

          {/* Setup */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase font-mono text-teal-300">
              <SetupIcon />
              セットアップ
            </div>
            <p className="m-0 text-[13px] leading-[1.8] text-slate-400 font-sans">
              {plugin.setup}
            </p>
            {plugin.binary && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-sans">必要なバイナリ:</span>
                <code className="font-mono text-[11px] rounded px-2 py-[2px] bg-cyan-500/15 text-cyan-300">
                  {plugin.binary}
                </code>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// QuickStartPanel
// ---------------------------------------------------------------------------

function QuickStartPanel() {
  const steps = [
    {
      title: "ブラウズ",
      cmd: "/plugin",
      desc: "Discover タブで利用可能なプラグインを閲覧",
    },
    {
      title: "インストール",
      cmd: "/plugin install <name>@claude-plugins-official",
      desc: "プラグインをインストール（user / project / local スコープ選択可）",
    },
    {
      title: "管理",
      cmd: "/plugin",
      desc: "Installed タブでプラグインの有効化・無効化・削除",
    },
  ];

  return (
    <div className="bg-surface rounded-xl border border-slate-700 p-6">
      <div className="text-[13px] font-bold tracking-wide uppercase font-mono mb-5 flex items-center gap-2 text-teal-300">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        クイックスタート
      </div>
      <div className="flex flex-col gap-4">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-mono shrink-0 bg-teal-500/15 text-teal-300">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-100">{step.title}</span>
                <code className="font-mono text-[11px] rounded-sm px-1.5 py-px bg-teal-500/15 text-teal-300">
                  {step.cmd}
                </code>
              </div>
              <span className="text-[13px] text-slate-400 font-sans leading-relaxed">
                {step.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Plugins(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(CATEGORIES[0]?.id || "");
  const [selectedPlugin, setSelectedPlugin] = useState<{ plugin: Plugin; accentColor: string } | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const lowerQuery = query.toLowerCase();

  const activeCategory = CATEGORIES.find((c) => c.id === activeTab);
  const isQuickStart = activeTab === "quickstart";

  const filteredPlugins = useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.plugins.filter(
      (p) =>
        !query ||
        p.name.toLowerCase().includes(lowerQuery) ||
        p.displayName.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.detail.toLowerCase().includes(lowerQuery) ||
        p.whenToUse.toLowerCase().includes(lowerQuery) ||
        (p.binary && p.binary.toLowerCase().includes(lowerQuery))
    );
  }, [activeCategory, query, lowerQuery]);

  const openModal = useCallback((plugin: Plugin, accentColor: string) => {
    setSelectedPlugin({ plugin, accentColor });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPlugin(null);
  }, []);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={m ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-7 relative overflow-hidden rounded-2xl border border-slate-700 px-6 py-9 bg-gradient-to-br from-slate-800 to-slate-900"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(6,182,212,0.08), transparent 60%), " +
                "radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.05), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="text-xs font-semibold text-slate-500 tracking-[3px] uppercase mb-3 font-mono">
              CLAUDE CODE
            </div>
            <h1 className="text-[28px] font-bold m-0 mb-2.5 text-slate-100 tracking-tight">
              公式プラグイン
            </h1>
            <p className="text-sm text-slate-400 m-0 mb-3.5 max-w-[520px] mx-auto leading-relaxed">
              Anthropic が公式マーケットプレイスで提供するプラグイン。
              コードインテリジェンス、外部サービス連携、開発ワークフローを拡張します。
            </p>
            <div className="flex justify-center gap-6 text-[13px] text-slate-400 flex-wrap">
              <span>
                <strong className="text-slate-100">{TOTAL}</strong> プラグイン
              </span>
              <span>
                <strong className="text-slate-100">{CATEGORIES.length}</strong> カテゴリ
              </span>
            </div>
            <div className="flex justify-center gap-3 mt-3.5">
              {[
                { to: "/", label: "リリースノート", icon: <ArrowLeftIcon />, trailing: false },
                { to: "/commands", label: "コマンド一覧", icon: null, trailing: true },
                { to: "/directory", label: "ディレクトリ構成", icon: null, trailing: true },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="nav-link inline-flex items-center gap-1.5 text-slate-500 no-underline text-xs font-sans rounded-md border border-slate-700 transition-all py-1 px-3"
                >
                  {link.icon}
                  {link.label}
                  {link.trailing && " →"}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

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
                {tab.type === "category" && CATEGORY_ICONS[tab.id] && (
                  <span className="flex items-center scale-[0.8]">
                    {CATEGORY_ICONS[tab.id]()}
                  </span>
                )}
                {tab.type === "quickstart" && (
                  <span className="flex items-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </span>
                )}
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Search — only for category tabs */}
        {!isQuickStart && (
          <motion.div
            initial={m ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bg-surface rounded-[10px] mb-4 flex items-center gap-2.5 transition-all px-3.5 py-[2px]"
            style={{
              border: `1px solid ${searchFocused ? "#3B82F6" : "#334155"}`,
              boxShadow: searchFocused ? "0 0 0 3px rgba(59, 130, 246, 0.25)" : "none",
            }}
          >
            <SearchIcon />
            <input
              type="text"
              placeholder="プラグインを検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full border-none bg-transparent text-sm text-slate-100 outline-none font-sans py-[11px]"
            />
          </motion.div>
        )}

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {isQuickStart ? (
            <motion.div
              key="quickstart"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <QuickStartPanel />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Count */}
              <div className="flex items-center gap-2.5 mb-4 px-1">
                <span className="text-[13px] text-slate-500 font-medium">
                  {filteredPlugins.length} 件表示中
                </span>
              </div>

              {/* Card grid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
                <AnimatePresence mode="popLayout">
                  {filteredPlugins.map((plugin, i) => (
                    <motion.div
                      key={plugin.name}
                      layout={!reducedMotion}
                      initial={reducedMotion ? false : hasMounted.current ? { opacity: 0 } : { opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.2, delay: reducedMotion || hasMounted.current ? 0 : Math.min(i * 0.04, 0.4) }}
                    >
                      <PluginCard
                        plugin={plugin}
                        accentColor={CATEGORY_COLORS[activeTab]?.color || "#3B82F6"}
                        onClick={() => openModal(plugin, CATEGORY_COLORS[activeTab]?.color || "#3B82F6")}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty state */}
              {filteredPlugins.length === 0 && (
                <motion.div
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center bg-surface rounded-xl border border-slate-700 py-16 px-6"
                >
                  <div className="mb-4">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-500"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-sm m-0">
                    条件に一致するプラグインはありません
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center p-6 mt-6 text-slate-500 text-xs font-sans">
          <p className="m-0 mb-1">
            <a
              href="https://github.com/anthropics/claude-plugins-official"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 no-underline"
            >
              公式プラグインリポジトリ
            </a>
            {" | "}
            <a
              href="https://code.claude.com/docs/en/discover-plugins"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 no-underline"
            >
              プラグインドキュメント
            </a>
          </p>
          <p className="m-0 text-slate-500/50">
            /plugin コマンドから最新のプラグイン一覧を確認できます
          </p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPlugin && (
          <DetailModal
            plugin={selectedPlugin.plugin}
            accentColor={selectedPlugin.accentColor}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
