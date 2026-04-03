import { AgentGearIcon, LightbulbIcon, MonitorIcon, TrendingUpIcon } from "~/components/icons";
import { PALETTE } from "~/theme/colors";
import bpData from "~/data/best-practices/best-practices.json";
import promptData from "~/data/prompting/prompting.json";
import skillData from "~/data/skill-best-practices/skill-best-practices.json";
import hooksData from "~/data/hooks-best-practices/hooks-best-practices.json";

// ---------------------------------------------------------------------------
// Types — shared
// ---------------------------------------------------------------------------

export interface TabDef {
  id: string;
  label: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Types — best-practices
// ---------------------------------------------------------------------------

export interface BPExample {
  strategy: string;
  detail?: string;
  before: string;
  after: string;
}

export interface BPItem {
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

export interface BPSection {
  id: string;
  name: string;
  description: string;
  items: BPItem[];
}

// ---------------------------------------------------------------------------
// Types — prompting
// ---------------------------------------------------------------------------

export interface PromptCode {
  lang: string;
  label: string;
  value: string;
}

export interface PromptItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  examples?: BPExample[];
  tips?: string[];
  code?: PromptCode[];
}

export interface PromptSection {
  id: string;
  name: string;
  description: string;
  items: PromptItem[];
}

// ---------------------------------------------------------------------------
// Types — hooks
// ---------------------------------------------------------------------------

export interface CodeBlockDef {
  lang: string;
  label: string;
  value: string;
  recommended?: boolean;
}

export interface HooksItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  code?: string;
  codeBlocks?: CodeBlockDef[];
  tips?: string[];
  examples?: BPExample[];
  steps?: { phase: string; description: string; example: string }[];
  locations?: { path: string; description: string }[];
}

export interface HooksSection {
  id: string;
  name: string;
  description: string;
  items: HooksItem[];
}

// ---------------------------------------------------------------------------
// CategoryConfig
// ---------------------------------------------------------------------------

export interface CategoryConfig<T = any> {
  id: string;
  label: string;
  color: string;
  gradient: [string, string];
  description: string;
  sections: { id: string; name: string; description: string; items: T[] }[];
  sectionColors: Record<string, { color: string; bg: string }>;
  sectionIcons: Record<string, () => React.JSX.Element>;
  tabDefs: TabDef[];
  tabSectionMap?: Record<string, string[]>;
  tagColors: Record<string, { color: string; bg: string }>;
  totalItems: number;
  itemLabel: string;
  searchPlaceholder: string;
}

// ---------------------------------------------------------------------------
// best-practices config
// ---------------------------------------------------------------------------

const bpSections = bpData.sections as BPSection[];

const bpSectionColors: Record<string, { color: string; bg: string }> = {
  "core-principle": { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  verification: PALETTE.green,
  workflow: PALETTE.cyan,
  prompting: PALETTE.purple,
  environment: PALETTE.orange,
  "session-management": PALETTE.blueDark,
  scaling: PALETTE.teal,
  "anti-patterns": PALETTE.red,
  intuition: PALETTE.indigo,
};

const bpSectionIcons: Record<string, () => React.JSX.Element> = {
  "core-principle": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  verification: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  workflow: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  prompting: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  environment: () => <AgentGearIcon />,
  "session-management": () => <MonitorIcon />,
  scaling: () => <TrendingUpIcon />,
  "anti-patterns": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  intuition: () => <LightbulbIcon width={18} height={18} />,
};

const bpConfig: CategoryConfig<BPItem> = {
  id: "best-practices",
  label: "ベストプラクティス",
  color: "#6366F1",
  gradient: ["rgba(99,102,241,0.08)", "rgba(16,185,129,0.05)"],
  description:
    "環境設定から並列セッションでのスケーリングまで、Claude Code を最大限に活用するためのヒントとパターン。",
  sections: bpSections,
  sectionColors: bpSectionColors,
  sectionIcons: bpSectionIcons,
  tabDefs: [
    { id: "all", label: "すべて", color: "#3B82F6" },
    ...bpSections.map((s) => ({
      id: s.id,
      label: s.name,
      color: bpSectionColors[s.id]?.color || "#3B82F6",
    })),
  ],
  tagColors: {
    重要: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  },
  totalItems: bpSections.reduce((sum, s) => sum + s.items.length, 0),
  itemLabel: "プラクティス",
  searchPlaceholder: "プラクティスを検索...",
};

// ---------------------------------------------------------------------------
// prompting config
// ---------------------------------------------------------------------------

const promptSections = promptData.sections as PromptSection[];

const promptSectionColors: Record<string, { color: string; bg: string }> = {
  "general-principles": { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  "output-formatting": PALETTE.blue,
  "tool-use": PALETTE.cyan,
  thinking: PALETTE.purple,
  agentic: PALETTE.orange,
  "capability-tips": PALETTE.green,
  migration: PALETTE.teal,
};

const promptSectionIcons: Record<string, () => React.JSX.Element> = {
  "general-principles": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  "output-formatting": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  "tool-use": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  thinking: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  agentic: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  "capability-tips": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  migration: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
};

const promptTabSectionMap: Record<string, string[]> = {
  foundations: ["general-principles"],
  output: ["output-formatting"],
  "tools-thinking": ["tool-use", "thinking"],
  agentic: ["agentic"],
  "tips-migration": ["capability-tips", "migration"],
};

const promptConfig: CategoryConfig<PromptItem> = {
  id: "prompting",
  label: "プロンプト",
  color: "#3B82F6",
  gradient: ["rgba(59,130,246,0.08)", "rgba(6,182,212,0.05)"],
  description:
    "Claude の最新モデルにおけるプロンプトエンジニアリングの包括的ガイド。明確さ、例示、XMLタグ、thinking、エージェントシステムなどを網羅。",
  sections: promptSections,
  sectionColors: promptSectionColors,
  sectionIcons: promptSectionIcons,
  tabDefs: [
    { id: "all", label: "すべて", color: "#3B82F6" },
    {
      id: "foundations",
      label: "基礎",
      color: promptSectionColors["general-principles"]?.color || "#3B82F6",
    },
    {
      id: "output",
      label: "出力",
      color: promptSectionColors["output-formatting"]?.color || "#3B82F6",
    },
    {
      id: "tools-thinking",
      label: "ツール・思考",
      color: promptSectionColors["tool-use"]?.color || "#3B82F6",
    },
    { id: "agentic", label: "エージェント", color: promptSectionColors.agentic?.color || "#3B82F6" },
    {
      id: "tips-migration",
      label: "Tips・移行",
      color: promptSectionColors["capability-tips"]?.color || "#3B82F6",
    },
  ],
  tabSectionMap: promptTabSectionMap,
  tagColors: {
    ビジョン: PALETTE.green,
    デザイン: PALETTE.indigo,
  },
  totalItems: promptSections.reduce((sum, s) => sum + s.items.length, 0),
  itemLabel: "プラクティス",
  searchPlaceholder: "プラクティスを検索...",
};

// ---------------------------------------------------------------------------
// skills config
// ---------------------------------------------------------------------------

const skillSections = skillData.sections as BPSection[];

const skillSectionColors: Record<string, { color: string; bg: string }> = {
  "core-principles": { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  "skill-structure": PALETTE.blue,
  "progressive-disclosure": PALETTE.cyan,
  workflows: PALETTE.purple,
  "content-guidelines": PALETTE.orange,
  "common-patterns": PALETTE.teal,
  evaluation: PALETTE.green,
  "advanced-code": PALETTE.indigo,
};

const skillSectionIcons: Record<string, () => React.JSX.Element> = {
  "core-principles": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  "skill-structure": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  "progressive-disclosure": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  workflows: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  "content-guidelines": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  "common-patterns": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  evaluation: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  "advanced-code": () => <LightbulbIcon width={18} height={18} />,
};

const skillConfig: CategoryConfig<BPItem> = {
  id: "skills",
  label: "スキル設計",
  color: "#8B5CF6",
  gradient: ["rgba(139,92,246,0.08)", "rgba(6,182,212,0.05)"],
  description:
    "Claude が発見・活用できる効果的な Agent Skills を作成するためのヒントとパターン。",
  sections: skillSections,
  sectionColors: skillSectionColors,
  sectionIcons: skillSectionIcons,
  tabDefs: [
    { id: "all", label: "すべて", color: "#3B82F6" },
    ...skillSections.map((s) => ({
      id: s.id,
      label: s.name,
      color: skillSectionColors[s.id]?.color || "#3B82F6",
    })),
  ],
  tagColors: {
    重要: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
    テスト: PALETTE.green,
  },
  totalItems: skillSections.reduce((sum, s) => sum + s.items.length, 0),
  itemLabel: "プラクティス",
  searchPlaceholder: "プラクティスを検索...",
};

// ---------------------------------------------------------------------------
// hooks config
// ---------------------------------------------------------------------------

const hooksSections = hooksData.sections as HooksSection[];

const hooksSectionColors: Record<string, { color: string; bg: string }> = {
  overview: PALETTE.indigo,
  events: PALETTE.cyan,
  configuration: PALETTE.orange,
  "best-practices": PALETTE.green,
  recipes: PALETTE.purple,
  troubleshooting: PALETTE.yellow,
  security: PALETTE.red,
};

const hooksSectionIcons: Record<string, () => React.JSX.Element> = {
  overview: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  events: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  configuration: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09c-.658.003-1.25.396-1.51 1z" />
    </svg>
  ),
  "best-practices": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  recipes: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  troubleshooting: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  security: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

const hooksConfig: CategoryConfig<HooksItem> = {
  id: "hooks",
  label: "Hooks",
  color: "#A855F7",
  gradient: ["rgba(168,85,247,0.08)", "rgba(16,185,129,0.05)"],
  description:
    "Claude Code のライフサイクルに Hooks を組み込み、自動フォーマット・セキュリティチェック・通知・監査ログを決定論的に実行するためのガイド。",
  sections: hooksSections,
  sectionColors: hooksSectionColors,
  sectionIcons: hooksSectionIcons,
  tabDefs: [
    { id: "all", label: "すべて", color: "#3B82F6" },
    ...hooksSections.map((s) => ({
      id: s.id,
      label: s.name,
      color: hooksSectionColors[s.id]?.color || "#3B82F6",
    })),
  ],
  tagColors: {
    重要: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
    デバッグ: PALETTE.yellow,
    自動化: PALETTE.teal,
    通知: PALETTE.blue,
    フォーマット: PALETTE.cyan,
    監査: PALETTE.purple,
  },
  totalItems: hooksSections.reduce((sum, s) => sum + s.items.length, 0),
  itemLabel: "トピック",
  searchPlaceholder: "Hooks を検索...",
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  { id: "best-practices", label: "ベストプラクティス", color: "#6366F1" },
  { id: "prompting", label: "プロンプト", color: "#3B82F6" },
  { id: "skills", label: "スキル設計", color: "#8B5CF6" },
  { id: "hooks", label: "Hooks", color: "#A855F7" },
];

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  "best-practices": bpConfig,
  prompting: promptConfig,
  skills: skillConfig,
  hooks: hooksConfig,
};

// ---------------------------------------------------------------------------
// Unified item → section lookup map
// ---------------------------------------------------------------------------

export const ITEM_SECTION_MAP = new Map<
  string,
  { sectionName: string; sectionId: string; categoryId: string }
>();
for (const [categoryId, config] of Object.entries(CATEGORY_CONFIGS)) {
  for (const section of config.sections) {
    for (const item of section.items) {
      ITEM_SECTION_MAP.set(item.id, {
        sectionName: section.name,
        sectionId: section.id,
        categoryId,
      });
    }
  }
}
