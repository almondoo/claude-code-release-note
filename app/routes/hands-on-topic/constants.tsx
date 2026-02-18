import topicAgentTeams from "~/data/hands-on/topic-agent-teams.json";
import topicMultiSessionTasks from "~/data/hands-on/topic-multi-session-tasks.json";
import topicParallelImplementation from "~/data/hands-on/topic-parallel-implementation.json";

// ── Types ────────────────────────────────────────────────────────────────

export type HighlightVariant = "info" | "warning" | "success" | "tip";

export type ContentBlock =
  | { type: "text"; content: string }
  | { type: "codeBlock"; language: string; code: string; filename?: string; caption?: string }
  | { type: "highlight"; variant: HighlightVariant; title?: string; content: string }
  | { type: "list"; ordered?: boolean; items: string[] };

export interface Step {
  id: string;
  label: string;
  title: string;
  description: string;
  blocks: ContentBlock[];
}

export interface Approach {
  id: string;
  label: string;
  description: string;
  steps: Step[];
}

export interface CommonTip {
  title: string;
  blocks: ContentBlock[];
}

export interface TopicDetail {
  topicId: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  steps?: Step[];
  intro?: ContentBlock[];
  approaches?: Approach[];
  commonTips?: CommonTip[];
  summary: string[];
}

// ── Data ─────────────────────────────────────────────────────────────────

export const TOPIC_MAP: Record<string, TopicDetail> = {
  "agent-teams": topicAgentTeams as unknown as TopicDetail,
  "multi-session-tasks": topicMultiSessionTasks as unknown as TopicDetail,
  "parallel-implementation": topicParallelImplementation as unknown as TopicDetail,
};

// ── Highlight styles ─────────────────────────────────────────────────────

export const HIGHLIGHT_STYLES: Record<
  HighlightVariant,
  { bg: string; border: string; color: string; label: string }
> = {
  info: { bg: "rgba(59,130,246,0.08)", border: "#3B82F6", color: "#60A5FA", label: "INFO" },
  warning: { bg: "rgba(245,158,11,0.08)", border: "#F59E0B", color: "#FBBF24", label: "WARNING" },
  success: { bg: "rgba(16,185,129,0.08)", border: "#10B981", color: "#34D399", label: "SUCCESS" },
  tip: { bg: "rgba(139,92,246,0.08)", border: "#8B5CF6", color: "#A78BFA", label: "TIP" },
};

// ── Difficulty colors ────────────────────────────────────────────────────

export const DIFFICULTY_COLORS: Record<string, { color: string; bg: string; label: string }> = {
  easy: { color: "#10B981", bg: "rgba(16,185,129,0.12)", label: "初級" },
  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "中級" },
  hard: { color: "#EF4444", bg: "rgba(239,68,68,0.12)", label: "上級" },
};
