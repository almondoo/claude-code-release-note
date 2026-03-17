import bpData from "~/data/best-practices/best-practices.json";
import {
  AgentGearIcon,
  LightbulbIcon,
  MonitorIcon,
  TrendingUpIcon,
} from "~/components/icons";
import { PALETTE } from "~/theme/colors";

// ---------------------------------------------------------------------------
// Types
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

export interface TabDef {
  id: string;
  label: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SECTIONS = bpData.sections as BPSection[];
export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
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

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
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

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  重要: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  ワークフロー: PALETTE.cyan,
  プロンプト: PALETTE.purple,
  環境設定: PALETTE.orange,
  セッション: PALETTE.blueDark,
  自動化: PALETTE.teal,
  アンチパターン: PALETTE.red,
};

export const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  ...SECTIONS.map((s) => ({
    id: s.id,
    label: s.name,
    color: SECTION_COLORS[s.id]?.color || "#3B82F6",
  })),
];

// ---------------------------------------------------------------------------
// Section-to-item map for lookups
// ---------------------------------------------------------------------------

export const ITEM_SECTION_MAP = new Map<string, { sectionName: string; sectionId: string }>();
for (const section of SECTIONS) {
  for (const item of section.items) {
    ITEM_SECTION_MAP.set(item.id, { sectionName: section.name, sectionId: section.id });
  }
}
