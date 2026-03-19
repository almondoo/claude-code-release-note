import type { Callout } from "~/components/callout-box";
import type { CodeBlock } from "~/components/code-block-view";
import type { TabItem } from "~/components/tab-bar";
import { SECTIONS as RAW_SECTIONS } from "~/data/setup";
import { PALETTE } from "~/theme/colors";

export interface Step {
  id: string;
  title: string;
  description: string;
  content: string;
  code: CodeBlock[];
  callouts: Callout[];
  tags: string[];
}

export interface SetupSection {
  id: string;
  name: string;
  description: string;
  phase: number;
  order: number;
  steps: Step[];
}

export const SECTIONS = RAW_SECTIONS as SetupSection[];
export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);

export const PHASES = [
  { id: 1, label: "導入", description: "ここまでで使い始められます" },
  { id: 2, label: "活用", description: "日常的に使いこなす" },
  { id: 3, label: "カスタマイズ", description: "さらに深く使う" },
] as const;

export const PHASE_COLORS: Record<number, { color: string; bg: string }> = {
  1: { color: "#6EE7B7", bg: "rgba(16,185,129,0.08)" },
  2: { color: "#C4B5FD", bg: "rgba(139,92,246,0.08)" },
  3: { color: "#FDBA74", bg: "rgba(249,115,22,0.08)" },
};

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  intro: PALETTE.blue,
  installation: PALETTE.green,
  authentication: PALETTE.cyan,
  "first-steps": { color: "#86EFAC", bg: "rgba(34, 197, 94, 0.15)" },
  "claude-md": PALETTE.purple,
  ide: PALETTE.blueDark,
  tips: PALETTE.pinkBright,
  permissions: PALETTE.yellow,
  troubleshooting: PALETTE.red,
};

export { SECTION_ICONS } from "./section-icons";

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  必須: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  初心者向け: PALETTE.green,
  中級者向け: { color: "#FCD34D", bg: "rgba(250, 204, 21, 0.15)" },
  上級者向け: PALETTE.purple,
  チーム向け: PALETTE.cyan,
  "CI/CD": PALETTE.orange,
};

export const TAB_SECTION_MAP: Record<string, string[]> = {
  "phase-1": ["intro", "installation", "authentication", "first-steps"],
  "phase-2": ["claude-md", "ide", "tips", "permissions"],
  "phase-3": ["troubleshooting"],
};

export const TAB_DEFS: TabItem[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  { id: "phase-1", label: "Phase 1: 導入", color: PHASE_COLORS[1].color },
  { id: "phase-2", label: "Phase 2: 活用", color: PHASE_COLORS[2].color },
  { id: "phase-3", label: "Phase 3: カスタマイズ", color: PHASE_COLORS[3].color },
  ...SECTIONS.map((s) => ({
    id: s.id,
    label: `${s.phase}-${s.order} ${s.name}`,
    color: SECTION_COLORS[s.id]?.color || "#3B82F6",
  })),
];

export const ITEM_SECTION_MAP = new Map<string, { sectionName: string; sectionId: string }>();
for (const section of SECTIONS) {
  for (const step of section.steps) {
    ITEM_SECTION_MAP.set(step.id, { sectionName: section.name, sectionId: section.id });
  }
}
