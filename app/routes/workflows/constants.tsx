import metaJson from "~/data/workflows/meta.json";
import overviewJson from "~/data/workflows/section-overview.json";
import whyJson from "~/data/workflows/section-why.json";
import patternsJson from "~/data/workflows/section-patterns.json";
import useCasesJson from "~/data/workflows/section-use-cases.json";
import whenNotJson from "~/data/workflows/section-when-not.json";
import tipsJson from "~/data/workflows/section-tips.json";
import referencesJson from "~/data/workflows/section-references.json";

// ── Types ──────────────────────────────────────────────────────────────────

export type Block =
  | { type: "paragraph"; content: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "callout"; variant: "info" | "warning" | "tip"; title?: string; content: string }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string }
  | { type: "pattern"; patternId: string; name: string; tagline?: string; content: string }
  | { type: "subsection"; title: string; blocks: Block[] };

export interface WorkflowSection {
  id: string;
  title: string;
  description?: string;
  blocks: Block[];
}

export interface WorkflowMeta {
  title: string;
  subtitle: string;
  date: string;
  premise: string;
  keyStats: { value: string; label: string }[];
}

// ── Data ───────────────────────────────────────────────────────────────────

export const META: WorkflowMeta = metaJson as WorkflowMeta;

export const SECTIONS: WorkflowSection[] = [
  overviewJson as WorkflowSection,
  whyJson as WorkflowSection,
  patternsJson as WorkflowSection,
  useCasesJson as WorkflowSection,
  whenNotJson as WorkflowSection,
  tipsJson as WorkflowSection,
  referencesJson as WorkflowSection,
];

// ── Accent color ───────────────────────────────────────────────────────────

export const ACCENT = "#e0734d";

// ── Tab definitions ────────────────────────────────────────────────────────

export const TAB_DEFS = [
  { id: "overview", label: "概要", color: ACCENT },
  { id: "why", label: "なぜ使うか", color: ACCENT },
  { id: "patterns", label: "6つのパターン", color: ACCENT },
  { id: "use-cases", label: "ユースケース", color: ACCENT },
  { id: "when-not", label: "使わない場合", color: ACCENT },
  { id: "tips", label: "Tips", color: ACCENT },
  { id: "references", label: "出典", color: ACCENT },
];
