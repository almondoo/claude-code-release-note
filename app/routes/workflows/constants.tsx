import metaJson from "~/data/workflows/meta.json";
import overviewJson from "~/data/workflows/section-overview.json";
import whyJson from "~/data/workflows/section-why.json";
import patternsJson from "~/data/workflows/section-patterns.json";
import useCasesJson from "~/data/workflows/section-use-cases.json";
import whenNotJson from "~/data/workflows/section-when-not.json";
import tipsJson from "~/data/workflows/section-tips.json";
import referencesJson from "~/data/workflows/section-references.json";
import type { Dictionary } from "~/i18n/dict";

// ── Types ──────────────────────────────────────────────────────────────────

export type Block =
  | { type: "paragraph"; content: string; content_en?: string }
  | { type: "list"; ordered?: boolean; items: string[]; items_en?: string[] }
  | {
      type: "callout";
      variant: "info" | "warning" | "tip";
      title?: string;
      title_en?: string;
      content: string;
      content_en?: string;
    }
  | {
      type: "table";
      headers: string[];
      headers_en?: string[];
      rows: string[][];
      rows_en?: string[][];
      caption?: string;
      caption_en?: string;
    }
  | {
      type: "pattern";
      patternId: string;
      name: string;
      name_en?: string;
      tagline?: string;
      tagline_en?: string;
      content: string;
      content_en?: string;
    }
  | { type: "subsection"; title: string; title_en?: string; blocks: Block[] };

export interface WorkflowSection {
  id: string;
  title: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  blocks: Block[];
}

export interface WorkflowMeta {
  title: string;
  title_en?: string;
  subtitle: string;
  subtitle_en?: string;
  date: string;
  premise: string;
  premise_en?: string;
  keyStats: { value: string; label: string; label_en?: string }[];
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

export const getTabDefs = (t: Dictionary) => [
  { id: "overview", label: t.workflows.tabOverview, color: ACCENT },
  { id: "why", label: t.workflows.tabWhy, color: ACCENT },
  { id: "patterns", label: t.workflows.tabPatterns, color: ACCENT },
  { id: "use-cases", label: t.workflows.tabUseCases, color: ACCENT },
  { id: "when-not", label: t.workflows.tabWhenNot, color: ACCENT },
  { id: "tips", label: t.workflows.tabTips, color: ACCENT },
  { id: "references", label: t.workflows.tabReferences, color: ACCENT },
];
