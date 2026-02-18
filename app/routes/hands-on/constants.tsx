import topicsData from "~/data/hands-on/hands-on-topics.json";

// ── Types ────────────────────────────────────────────────────────────────

export type Difficulty = "easy" | "medium" | "hard";

export interface TopicMeta {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  estimatedTime: string;
  tags: string[];
  prerequisites: string[];
  icon: string;
}

export interface TopicsData {
  meta: { title: string; description: string };
  topics: TopicMeta[];
}

// ── Data ─────────────────────────────────────────────────────────────────

export const TOPICS_DATA = topicsData as unknown as TopicsData;
export const TOPICS = TOPICS_DATA.topics;

// ── Colors ───────────────────────────────────────────────────────────────

export const DIFFICULTY_COLORS: Record<Difficulty, { color: string; bg: string; label: string }> = {
  easy: { color: "#10B981", bg: "rgba(16,185,129,0.12)", label: "初級" },
  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "中級" },
  hard: { color: "#EF4444", bg: "rgba(239,68,68,0.12)", label: "上級" },
};

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  Agent: { color: "#A5B4FC", bg: "rgba(99,102,241,0.15)" },
  チーム開発: { color: "#67E8F9", bg: "rgba(6,182,212,0.15)" },
  タスク管理: { color: "#6EE7B7", bg: "rgba(16,185,129,0.15)" },
  セッション: { color: "#93C5FD", bg: "rgba(59,130,246,0.15)" },
  並列処理: { color: "#FDBA74", bg: "rgba(249,115,22,0.15)" },
  高度: { color: "#FCA5A5", bg: "rgba(239,68,68,0.15)" },
};

// ── Icons ────────────────────────────────────────────────────────────────

export const TOPIC_ICONS: Record<string, () => React.JSX.Element> = {
  team: () => (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  tasks: () => (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  parallel: () => (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="6" y1="3" x2="6" y2="21" />
      <line x1="18" y1="3" x2="18" y2="21" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="3" y1="12" x2="9" y2="12" />
      <line x1="15" y1="6" x2="21" y2="6" />
      <line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  ),
};
