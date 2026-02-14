import bpData from "~/data/best-practices/best-practices.json";

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
  verification: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  workflow: { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  prompting: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  environment: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  "session-management": { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
  scaling: { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  "anti-patterns": { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
  intuition: { color: "#A5B4FC", bg: "rgba(99, 102, 241, 0.15)" },
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
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

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  "重要": { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  "ワークフロー": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "プロンプト": { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  "環境設定": { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  "セッション": { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
  "自動化": { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  "アンチパターン": { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
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
