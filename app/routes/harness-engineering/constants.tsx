import configData from "~/data/harness-engineering/config-files.json";
import executionData from "~/data/harness-engineering/execution-control.json";
import agentsData from "~/data/harness-engineering/agents.json";
import contextData from "~/data/harness-engineering/context.json";
import practicesData from "~/data/harness-engineering/practices.json";
import { PALETTE } from "~/theme/colors";
import { AgentGearIcon } from "~/components/icons";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HETable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface HEItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  tables?: HETable[];
  code?: string;
  tips?: string[];
  gotchas?: string[];
  realWorld?: string[];
}

export interface HESection {
  id: string;
  name: string;
  description: string;
  items: HEItem[];
}

export interface TabDef {
  id: string;
  label: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export const SECTIONS: HESection[] = [
  ...(configData as HESection[]),
  ...(executionData as HESection[]),
  ...(agentsData as HESection[]),
  ...(contextData as HESection[]),
  ...(practicesData as HESection[]),
];

export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

// ---------------------------------------------------------------------------
// Tab → Section mapping (tabs are NOT 1:1 with sections)
// ---------------------------------------------------------------------------

export const TAB_SECTION_MAP: Record<string, string[]> = {
  "config-files": ["claude-md", "rules", "memory", "environment"],
  "execution-control": ["hooks", "permissions", "mcp"],
  agents: ["subagents", "skills", "agent-teams"],
  context: ["context-window", "ci-cd", "git-worktree"],
  practices: ["patterns", "anti-patterns"],
};

export const ACCENT = "#06b6d4";

export const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: ACCENT },
  { id: "config-files", label: "設定ファイル", color: PALETTE.orange.color },
  { id: "execution-control", label: "実行制御", color: PALETTE.red.color },
  { id: "agents", label: "エージェント", color: PALETTE.purple.color },
  { id: "context", label: "コンテキスト", color: PALETTE.cyan.color },
  { id: "practices", label: "実践ガイド", color: PALETTE.green.color },
];

// ---------------------------------------------------------------------------
// Section colors & icons
// ---------------------------------------------------------------------------

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  "claude-md": PALETTE.orange,
  rules: PALETTE.yellow,
  memory: PALETTE.pink,
  environment: PALETTE.slate,
  hooks: PALETTE.red,
  permissions: PALETTE.pinkBright,
  mcp: { color: "#FCA5A5", bg: "rgba(239,68,68,0.10)" },
  subagents: PALETTE.purple,
  skills: PALETTE.indigo,
  "agent-teams": { color: "#C4B5FD", bg: "rgba(139,92,246,0.10)" },
  "context-window": PALETTE.cyan,
  "ci-cd": PALETTE.teal,
  "git-worktree": PALETTE.blue,
  patterns: PALETTE.green,
  "anti-patterns": { color: "#F87171", bg: "rgba(239,68,68,0.15)" },
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  "claude-md": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  rules: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  ),
  memory: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  environment: () => <AgentGearIcon />,
  hooks: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  permissions: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  mcp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  subagents: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  skills: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  "agent-teams": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  "context-window": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "ci-cd": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  "git-worktree": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  ),
  patterns: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  "anti-patterns": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Tag colors (for card tags)
// ---------------------------------------------------------------------------

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  設定ファイル: PALETTE.orange,
  実行制御: PALETTE.red,
  エージェント: PALETTE.purple,
  コンテキスト: PALETTE.cyan,
  実践ガイド: PALETTE.green,
};

// ---------------------------------------------------------------------------
// Item → Section lookup
// ---------------------------------------------------------------------------

export const ITEM_SECTION_MAP = new Map<string, { sectionName: string; sectionId: string }>();
for (const section of SECTIONS) {
  for (const item of section.items) {
    ITEM_SECTION_MAP.set(item.id, { sectionName: section.name, sectionId: section.id });
  }
}
