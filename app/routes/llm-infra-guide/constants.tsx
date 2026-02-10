import surveyData from "~/data/llm-infra-guide.json";
import type { DiagramData } from "./architecture-diagram";
export type { DiagramData };

// ── Types ────────────────────────────────────────────────────────────────

export interface KeyStat {
  label: string;
  value: number;
  unit: string;
  prefix?: string;
}

export interface SurveyMeta {
  title: string;
  subtitle?: string;
  date: string;
  audience: string;
  premise: string;
  keyStats: KeyStat[];
}

export type HighlightVariant = "info" | "warning" | "success" | "tip";
export type Trend = "up" | "down" | "neutral";

export type ContentBlock =
  | { type: "text"; content: string }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][]; footnote?: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "stats"; items: { label: string; value: string; trend?: Trend }[] }
  | { type: "highlight"; variant: HighlightVariant; title?: string; content: string }
  | { type: "subsection"; title: string; blocks: ContentBlock[] }
  | { type: "scoreMatrix"; axes: ScoreAxis[]; products: ScoreProduct[] }
  | { type: "securityCombos"; combos: SecurityCombo[] }
  | { type: "flowchart"; nodes: FlowNode[] }
  | { type: "timeline"; phases: TimelinePhase[]; staffing?: StaffingRow[] }
  | { type: "sources"; categories: SourceCategory[] }
  | { type: "checklist"; categories: ChecklistCategory[] }
  | { type: "diagram"; data: DiagramData }
  | {
      type: "codeBlock";
      language: string;
      title?: string;
      code: string;
      filename?: string;
      caption?: string;
    }
  | {
      type: "stepGuide";
      title?: string;
      steps: {
        label: string;
        title: string;
        description: string;
        duration?: string;
        difficulty?: "easy" | "medium" | "hard";
        blocks?: ContentBlock[];
      }[];
    }
  | {
      type: "infraDiagram";
      variant: "network" | "dataflow" | "cloudArch";
      title?: string;
      caption?: string;
      zones?: { label: string; color: string; items: { label: string; sublabel?: string }[] }[];
      connections?: { from: string; to: string; label?: string; style?: "solid" | "dashed" }[];
      stages?: { label: string; color: string; items: string[] }[];
      provider?: "aws" | "gcp" | "azure" | "generic";
      layers?: { label: string; color: string; services: { name: string; description?: string }[] }[];
    }
  | {
      type: "reactFlowDiagram";
      diagramId: string;
    };

export interface ScoreAxis {
  key: string;
  label: string;
  description: string;
}

export interface ScoreProduct {
  rank: number;
  name: string;
  scores: Record<string, number>;
  total: number;
  recommended: string;
}

export interface SecurityCombo {
  name: string;
  security: number;
  cost: string;
  ops: string;
  recommended: string;
}

export interface FlowNode {
  id: string;
  question?: string;
  result?: string;
  yes?: string;
  no?: string;
}

export interface TimelinePhase {
  id: string;
  title: string;
  duration: string;
  investment?: string;
  roi?: string;
  items: { task: string; duration: string; resources: string; effect: string }[];
}

export interface StaffingRow {
  phase: string;
  skills: string;
  team: string;
}

export interface SourceCategory {
  name: string;
  links: { title: string; url: string }[];
}

export interface ChecklistCategory {
  name: string;
  items: string[];
}

export interface SurveySection {
  id: string;
  title: string;
  description: string;
  blocks: ContentBlock[];
}

export interface SurveyData {
  meta: SurveyMeta;
  sections: SurveySection[];
}

// ── Glossary Types ───────────────────────────────────────────────────────

export interface GlossaryTerm {
  id: string;
  term: string;
  termEn: string;
  short: string;
  description: string;
  relatedTerms?: string[];
  category: string;
}

export interface GlossaryCategory {
  id: string;
  label: string;
  color: string;
}

export interface GlossaryData {
  categories: GlossaryCategory[];
  terms: GlossaryTerm[];
}

// ── Data ─────────────────────────────────────────────────────────────────

export const SURVEY: SurveyData = surveyData as unknown as SurveyData;

// ── Section colors & icons ───────────────────────────────────────────────

export interface SectionTheme {
  color: string;
  bg: string;
  icon: string;
}

export const SECTION_THEMES: Record<string, SectionTheme> = {
  "guide-overview": { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: "book" },
  "architecture-patterns": { color: "#3B82F6", bg: "rgba(59,130,246,0.12)", icon: "map" },
  "pattern-direct": { color: "#10B981", bg: "rgba(16,185,129,0.12)", icon: "arrow-right" },
  "pattern-gateway": { color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", icon: "server" },
  "pattern-private": { color: "#EC4899", bg: "rgba(236,72,153,0.12)", icon: "lock" },
  "infra-components": { color: "#06B6D4", bg: "rgba(6,182,212,0.12)", icon: "cpu" },
  "security-overview": { color: "#EF4444", bg: "rgba(239,68,68,0.12)", icon: "shield" },
  "security-data-protection": { color: "#DC2626", bg: "rgba(220,38,38,0.12)", icon: "shield-lock" },
  "security-access-control": { color: "#E11D48", bg: "rgba(225,29,72,0.12)", icon: "key" },
  "security-network": { color: "#BE185D", bg: "rgba(190,24,93,0.12)", icon: "network" },
  "security-prompt": { color: "#F97316", bg: "rgba(249,115,22,0.12)", icon: "alert" },
  "security-compliance": { color: "#B91C1C", bg: "rgba(185,28,28,0.12)", icon: "clipboard" },
  "security-supply-chain": { color: "#9F1239", bg: "rgba(159,18,57,0.12)", icon: "package" },
  "cost-optimization": { color: "#14B8A6", bg: "rgba(20,184,166,0.12)", icon: "currency" },
  "monitoring": { color: "#A855F7", bg: "rgba(168,85,247,0.12)", icon: "chart" },
  "implementation-roadmap": { color: "#F97316", bg: "rgba(249,115,22,0.12)", icon: "calendar" },
  "decision-framework": { color: "#0EA5E9", bg: "rgba(14,165,233,0.12)", icon: "compass" },
  "references": { color: "#64748B", bg: "rgba(100,116,139,0.12)", icon: "link" },
};

// ── Highlight variant styles ─────────────────────────────────────────────

export const HIGHLIGHT_STYLES: Record<HighlightVariant, { bg: string; border: string; color: string; label: string }> = {
  info: { bg: "rgba(59,130,246,0.08)", border: "#3B82F6", color: "#60A5FA", label: "INFO" },
  warning: { bg: "rgba(245,158,11,0.08)", border: "#F59E0B", color: "#FBBF24", label: "WARNING" },
  success: { bg: "rgba(16,185,129,0.08)", border: "#10B981", color: "#34D399", label: "SUCCESS" },
  tip: { bg: "rgba(139,92,246,0.08)", border: "#8B5CF6", color: "#A78BFA", label: "TIP" },
};

// ── Section icon SVG renderers ───────────────────────────────────────────

function iconSvg(d: string) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  "guide-overview": () => iconSvg("M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2V3zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7V3z"),
  "architecture-patterns": () => iconSvg("M3 6l9-4 9 4v12l-9 4-9-4V6zM3 6l9 4M12 10l9-4M12 10v12"),
  "pattern-direct": () => iconSvg("M5 12h14M12 5l7 7-7 7"),
  "pattern-gateway": () => iconSvg("M2 9h6v6H2V9zM16 9h6v6h-6V9zM8 12h8M5 9V4h14v5M5 15v5h14v-5"),
  "pattern-private": () => iconSvg("M12 2L4 7v10l8 5 8-5V7l-8-5zM12 22V12M4 7l8 5 8-5"),
  "infra-components": () => iconSvg("M6 18h8M3 22h18M12 2v4M12 6a4 4 0 014 4c0 2-2 3-2 6H10c0-3-2-4-2-6a4 4 0 014-4z"),
  "security-overview": () => iconSvg("M12 2l8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4z"),
  "security-data-protection": () => iconSvg("M12 2l8 4v6c0 5.25-3.5 10-8 11-4.5-1-8-5.75-8-11V6l8-4zM12 12v4M12 8h.01"),
  "security-access-control": () => iconSvg("M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.78 7.78 5.5 5.5 0 017.78-7.78zM15.5 7.5l3 3L22 7l-3-3-3.5 3.5z"),
  "security-network": () => iconSvg("M12 2a10 10 0 110 20 10 10 0 010-20zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"),
  "security-prompt": () => iconSvg("M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"),
  "security-compliance": () => iconSvg("M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"),
  "security-supply-chain": () => iconSvg("M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"),
  "cost-optimization": () => iconSvg("M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"),
  "monitoring": () => iconSvg("M3 3v18h18M7 16l4-8 4 4 4-6"),
  "implementation-roadmap": () => iconSvg("M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18"),
  "decision-framework": () => iconSvg("M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"),
  "references": () => iconSvg("M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"),
};

// ── Chapter definitions ──────────────────────────────────────────────────

export interface Chapter {
  id: string;
  title: string;
  icon: string;
  color: string;
  sectionIds: string[];
  tabbed?: boolean;
}

export const CHAPTERS: Chapter[] = [
  {
    id: "ch-overview",
    title: "概要",
    icon: "book",
    color: "#F59E0B",
    sectionIds: ["guide-overview"],
  },
  {
    id: "ch-architecture",
    title: "アーキテクチャ",
    icon: "map",
    color: "#3B82F6",
    sectionIds: ["architecture-patterns", "pattern-direct", "pattern-gateway", "pattern-private", "infra-components"],
  },
  {
    id: "ch-security",
    title: "セキュリティ",
    icon: "shield",
    color: "#EF4444",
    sectionIds: ["security-overview", "security-data-protection", "security-access-control", "security-network", "security-prompt", "security-compliance", "security-supply-chain"],
    tabbed: true,
  },
  {
    id: "ch-operations",
    title: "運用",
    icon: "settings",
    color: "#10B981",
    sectionIds: ["cost-optimization", "monitoring", "implementation-roadmap"],
  },
  {
    id: "ch-decision",
    title: "意思決定・参考",
    icon: "compass",
    color: "#8B5CF6",
    sectionIds: ["decision-framework", "references"],
  },
];
