import tuData from "~/data/token-usage/token-usage.json";
import type { CodeBlock } from "~/components/code-block-view";
import type { Callout } from "~/components/callout-box";
import { TeamIcon } from "~/components/icons";
import { PALETTE } from "~/theme/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TULink {
  label: string;
  url: string;
}

export interface TUItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  difficulty: "easy" | "medium" | "advanced";
  targetUsers: string;
  code: CodeBlock[];
  callouts: Callout[];
  tips: string[];
  links: TULink[];
}

export interface TUSection {
  id: string;
  name: string;
  description: string;
  items: TUItem[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SECTIONS = tuData.sections as TUSection[];
export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  builtin: PALETTE.green,
  proxy: PALETTE.cyan,
  organization: PALETTE.purple,
  reference: PALETTE.orange,
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  builtin: () => (
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
  proxy: () => (
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
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  organization: () => <TeamIcon />,
  reference: () => (
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
};

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  初心者向け: PALETTE.green,
  中級者向け: { color: "#FCD34D", bg: "rgba(234, 179, 8, 0.15)" },
  上級者向け: PALETTE.red,
  API: PALETTE.cyan,
  サブスクリプション: PALETTE.purple,
  チーム向け: { color: "#93C5FD", bg: "rgba(59, 130, 246, 0.2)" },
};

export const DIFFICULTY_LABELS: Record<TUItem["difficulty"], { label: string; color: string }> = {
  easy: { label: "かんたん", color: "#6EE7B7" },
  medium: { label: "ふつう", color: "#FCD34D" },
  advanced: { label: "上級", color: "#FCA5A5" },
};

export interface TabDef {
  id: string;
  label: string;
  color: string;
}

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

