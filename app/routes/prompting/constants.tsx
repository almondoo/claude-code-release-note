import promptData from "~/data/prompting/prompting.json";
import { PALETTE } from "~/theme/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PromptExample {
  strategy: string;
  detail?: string;
  before: string;
  after: string;
}

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
  examples?: PromptExample[];
  tips?: string[];
  code?: PromptCode[];
}

export interface PromptSection {
  id: string;
  name: string;
  description: string;
  items: PromptItem[];
}

export interface TabDef {
  id: string;
  label: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SECTIONS = promptData.sections as PromptSection[];
export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  "general-principles": { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  "output-formatting": PALETTE.blue,
  "tool-use": PALETTE.cyan,
  thinking: PALETTE.purple,
  agentic: PALETTE.orange,
  "capability-tips": PALETTE.green,
  migration: PALETTE.teal,
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  "general-principles": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  "output-formatting": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  "tool-use": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  thinking: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  agentic: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  "capability-tips": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  migration: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
};

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  基礎: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  出力: PALETTE.blue,
  ツール: PALETTE.cyan,
  思考: PALETTE.purple,
  エージェント: PALETTE.orange,
  移行: PALETTE.teal,
  ビジョン: PALETTE.green,
  デザイン: PALETTE.indigo,
};

// ---------------------------------------------------------------------------
// Tab definitions (5 grouped tabs + "all")
// ---------------------------------------------------------------------------

export const TAB_SECTION_MAP: Record<string, string[]> = {
  foundations: ["general-principles"],
  output: ["output-formatting"],
  "tools-thinking": ["tool-use", "thinking"],
  agentic: ["agentic"],
  "tips-migration": ["capability-tips", "migration"],
};

export const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  { id: "foundations", label: "基礎", color: SECTION_COLORS["general-principles"]?.color || "#3B82F6" },
  { id: "output", label: "出力", color: SECTION_COLORS["output-formatting"]?.color || "#3B82F6" },
  { id: "tools-thinking", label: "ツール・思考", color: SECTION_COLORS["tool-use"]?.color || "#3B82F6" },
  { id: "agentic", label: "エージェント", color: SECTION_COLORS.agentic?.color || "#3B82F6" },
  { id: "tips-migration", label: "Tips・移行", color: SECTION_COLORS["capability-tips"]?.color || "#3B82F6" },
];

// ---------------------------------------------------------------------------
// Lookup maps
// ---------------------------------------------------------------------------

export const ITEM_SECTION_MAP = new Map<string, { sectionName: string; sectionId: string }>();
for (const section of SECTIONS) {
  for (const item of section.items) {
    ITEM_SECTION_MAP.set(item.id, { sectionName: section.name, sectionId: section.id });
  }
}
