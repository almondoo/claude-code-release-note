import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import {
  BoltIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  CopyIcon,
  BookOpenIcon,
} from "~/components/icons";
import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import setupData from "~/data/setup.json";

interface CodeBlock {
  lang: string;
  label: string;
  value: string;
}

interface Callout {
  type: "info" | "warning" | "tip" | "important";
  text: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  content: string;
  code: CodeBlock[];
  callouts: Callout[];
  tags: string[];
}

interface SetupSection {
  id: string;
  name: string;
  description: string;
  steps: Step[];
}

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code セットアップガイド" },
    { name: "description", content: "Claude Code のインストールから設定、ベストプラクティスまで" },
  ];
}

const SECTIONS = setupData.sections as SetupSection[];
const TOTAL_STEPS = SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);

const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  installation: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  "initial-setup": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "claude-md": { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  hooks: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  mcp: { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  ide: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
  permissions: { color: "#FDE68A", bg: "rgba(234, 179, 8, 0.15)" },
  tips: { color: "#F472B6", bg: "rgba(244, 114, 182, 0.15)" },
  troubleshooting: { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
  "best-practices": { color: "#A5B4FC", bg: "rgba(99, 102, 241, 0.15)" },
};

const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  installation: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  "initial-setup": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  "claude-md": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  hooks: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  mcp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  ide: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  permissions: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  tips: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  troubleshooting: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  "best-practices": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  "必須": { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  "初心者向け": { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  "上級者向け": { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  "チーム向け": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "CI/CD": { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
};

const CALLOUT_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  info: { color: "#60A5FA", bg: "rgba(59, 130, 246, 0.08)", border: "#3B82F6", label: "Info" },
  warning: { color: "#FBBF24", bg: "rgba(234, 179, 8, 0.08)", border: "#EAB308", label: "Warning" },
  tip: { color: "#34D399", bg: "rgba(16, 185, 129, 0.08)", border: "#10B981", label: "Tip" },
  important: { color: "#F87171", bg: "rgba(239, 68, 68, 0.08)", border: "#EF4444", label: "Important" },
};

interface TabDef {
  id: string;
  label: string;
  color: string;
  type: "section" | "special";
}

const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: "#3B82F6", type: "section" },
  ...SECTIONS.map((s) => ({
    id: s.id,
    label: s.name,
    color: SECTION_COLORS[s.id]?.color || "#3B82F6",
    type: "section" as const,
  })),
  { id: "quickstart", label: "クイックスタート", color: "#5EEAD4", type: "special" },
  { id: "summary", label: "まとめ", color: "#A5B4FC", type: "special" },
];


// --- Sub-components ---

function CopyButton({ text }: { text: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
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

function CodeBlockView({ block }: { block: CodeBlock }): React.JSX.Element {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between bg-slate-800 px-3.5 py-2">
        <span className="text-[11px] text-slate-400 font-mono">{block.label}</span>
        <CopyButton text={block.value} />
      </div>
      <pre className="m-0 p-3.5 bg-[#0B1120] overflow-x-auto text-[13px] leading-relaxed">
        <code className="font-mono text-slate-300 whitespace-pre">{block.value}</code>
      </pre>
    </div>
  );
}

function CalloutBox({ callout }: { callout: Callout }): React.JSX.Element {
  const style = CALLOUT_STYLES[callout.type] || CALLOUT_STYLES.info;
  return (
    <div
      className="rounded-lg px-4 py-3 flex gap-3 items-start"
      style={{
        background: style.bg,
        borderLeft: `3px solid ${style.border}`,
      }}
    >
      <span
        className="text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 font-mono"
        style={{ color: style.color }}
      >
        {style.label}
      </span>
      <span className="text-[13px] text-slate-300 leading-relaxed font-sans">{callout.text}</span>
    </div>
  );
}

interface StepCardProps {
  step: Step;
  accentColor: string;
  expanded: boolean;
  onToggle: () => void;
  reducedMotion: boolean | null;
}

function StepCard({ step, accentColor, expanded, onToggle, reducedMotion }: StepCardProps): React.JSX.Element {
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
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
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
              className="hidden sm:inline-flex text-[10px] font-semibold rounded px-2 py-[2px]"
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
                <p key={i} className="m-0 text-[13px] leading-[1.8] text-slate-400 font-sans">
                  {paragraph}
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

function QuickStartPanel(): React.JSX.Element {
  const steps = [
    { num: "1", title: "インストール", cmd: "npm install -g @anthropic-ai/claude-code", desc: "npm でグローバルインストール" },
    { num: "2", title: "認証", cmd: "claude", desc: "初回起動でブラウザ認証" },
    { num: "3", title: "CLAUDE.md 作成", cmd: "/init", desc: "プロジェクト設定を自動生成" },
    { num: "4", title: "使い始める", cmd: "claude", desc: "プロジェクトディレクトリで起動" },
  ];

  return (
    <div className="bg-surface rounded-xl border border-teal-500/20 p-6">
      <h2 className="text-lg font-bold text-slate-100 m-0 mb-1">
        クイックスタート
      </h2>
      <p className="text-sm text-slate-400 m-0 mb-5">
        4 ステップで Claude Code を使い始められます
      </p>
      <div className="flex flex-col gap-4">
        {steps.map((step) => (
          <div key={step.num} className="flex items-start gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
              style={{ background: "rgba(20, 184, 166, 0.15)", color: "#5EEAD4" }}
            >
              {step.num}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
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

function SummaryPanel(): React.JSX.Element {
  const items = [
    { label: "CLAUDE.md", desc: "プロジェクトの指示とコンテキストを定義。チームで共有してワークフローを統一", color: "#C4B5FD" },
    { label: "settings.json", desc: "権限・フック・MCP の設定。プロジェクトスコープで共有可能", color: "#FDE68A" },
    { label: ".claudeignore", desc: "不要ファイルを除外してパフォーマンスとコストを最適化", color: "#6EE7B7" },
    { label: "カスタムコマンド", desc: ".claude/commands/ でチーム独自のワークフローをコマンド化", color: "#F472B6" },
    { label: "フック", desc: "ツール呼び出し前後に自動処理を挿入。フォーマット、通知、セキュリティチェックに活用", color: "#FDBA74" },
    { label: "MCP サーバー", desc: "外部ツールやデータソースを接続して Claude Code の機能を拡張", color: "#5EEAD4" },
  ];

  return (
    <div className="bg-surface rounded-xl border border-indigo-500/20 p-6">
      <h2 className="text-lg font-bold text-slate-100 m-0 mb-1">
        セットアップまとめ
      </h2>
      <p className="text-sm text-slate-400 m-0 mb-5">
        Claude Code を最大限に活用するための主要な設定項目
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-700 p-4 flex flex-col gap-1.5"
          >
            <code className="font-mono text-sm font-bold" style={{ color: item.color }}>
              {item.label}
            </code>
            <span className="text-xs text-slate-400 leading-relaxed">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main page ---

export default function SetupPage(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  if (!hasMounted.current) {
    hasMounted.current = true;
  }

  const lowerQuery = query.toLowerCase();
  const isAllTab = activeTab === "all";
  const isQuickStart = activeTab === "quickstart";
  const isSummary = activeTab === "summary";
  const isSpecialTab = isQuickStart || isSummary;
  const activeSection = SECTIONS.find((s) => s.id === activeTab);

  const filteredSections = useMemo(() => {
    const sections = isAllTab
      ? SECTIONS
      : activeSection
        ? [activeSection]
        : [];
    if (!query) return sections;
    return sections
      .map((section) => ({
        ...section,
        steps: section.steps.filter(
          (step) =>
            step.title.toLowerCase().includes(lowerQuery) ||
            step.description.toLowerCase().includes(lowerQuery) ||
            step.content.toLowerCase().includes(lowerQuery) ||
            step.code.some((c) => c.value.toLowerCase().includes(lowerQuery)) ||
            step.callouts.some((c) => c.text.toLowerCase().includes(lowerQuery))
        ),
      }))
      .filter((section) => section.steps.length > 0);
  }, [isAllTab, activeSection, query, lowerQuery]);

  const visibleStepCount = filteredSections.reduce((sum, s) => sum + s.steps.length, 0);

  const toggleStep = useCallback((stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }, []);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="セットアップガイド"
          description="インストールから CLAUDE.md、フック、MCP、IDE 連携、ベストプラクティスまで。Claude Code を最大限に活用するためのステップバイステップガイド。"
          stats={[
            { value: SECTIONS.length, label: "セクション" },
            { value: TOTAL_STEPS, label: "ステップ" },
          ]}
          gradient={["rgba(139,92,246,0.08)", "rgba(16,185,129,0.05)"]}
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
                {tab.type === "section" && SECTION_ICONS[tab.id] && (
                  <span className="flex items-center scale-[0.8]">
                    {SECTION_ICONS[tab.id]()}
                  </span>
                )}
                {tab.id === "quickstart" && (
                  <span className="flex items-center">
                    <BoltIcon width={14} height={14} />
                  </span>
                )}
                {tab.id === "summary" && (
                  <span className="flex items-center">
                    <BookOpenIcon width={14} height={14} />
                  </span>
                )}
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Search -- only for non-special tabs */}
        {!isSpecialTab && (
          <motion.div
            initial={m ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mb-4"
          >
            <SearchInput value={query} onChange={setQuery} placeholder="ステップを検索..." />
          </motion.div>
        )}

        {/* Tab content */}
        <AnimatePresence mode="popLayout">
          {isQuickStart ? (
            <motion.div
              key="quickstart"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <QuickStartPanel />
            </motion.div>
          ) : isSummary ? (
            <motion.div
              key="summary"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SummaryPanel />
            </motion.div>
          ) : (
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
                  {visibleStepCount} / {isAllTab ? TOTAL_STEPS : (activeSection?.steps.length ?? 0)} ステップ
                </span>
              </div>

              {/* Step cards grouped by section */}
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
                      <div className="flex flex-col gap-2.5">
                        <AnimatePresence mode="popLayout">
                          {section.steps.map((step, i) => (
                            <motion.div
                              key={step.id}
                              layout={!reducedMotion}
                              initial={reducedMotion ? false : { opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                              transition={{ duration: 0.2, delay: reducedMotion ? 0 : Math.min(i * 0.04, 0.4) }}
                            >
                              <StepCard
                                step={step}
                                accentColor={colors.color}
                                expanded={expandedSteps.has(step.id)}
                                onToggle={() => toggleStep(step.id)}
                                reducedMotion={reducedMotion}
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
              {visibleStepCount === 0 && (
                <EmptyState message="条件に一致するステップはありません" reducedMotion={reducedMotion} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <Footer>
          <p className="m-0 mb-1">
            <a
              href="https://docs.anthropic.com/en/docs/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 no-underline"
            >
              公式ドキュメント
            </a>
            {" | "}
            <a
              href="https://github.com/anthropics/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 no-underline"
            >
              GitHub
            </a>
          </p>
          <p className="m-0 text-slate-500/50">
            Claude Code セットアップガイド
          </p>
        </Footer>
      </div>
    </div>
  );
}
