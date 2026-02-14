import {
  BookOpenIcon,
  CheckIcon,
  FolderIcon,
  LightbulbIcon,
  MapPinIcon,
  TerminalIcon,
} from "~/components/icons";
import directoryData from "~/data/directory/directory-structure.json";

export interface Entry {
  path: string;
  type: "file" | "directory";
  name: string;
  description: string;
  detail: string;
  usage: string;
  bestPractice: string;
  vcs: boolean | null;
  recommended: "recommended" | "optional" | "advanced";
}

export interface Section {
  id: string;
  name: string;
  basePath: string;
  description: string;
  entries: Entry[];
  bestPractices: string[];
}

export interface PrecedenceItem {
  level: number;
  name: string;
  description: string;
  color: string;
}

export interface TabDef {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  type: "section" | "info";
}

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  global: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  "project-root": { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  "project-claude": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  home: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  managed: { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  global: () => (
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
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  "project-root": () => <FolderIcon width={18} height={18} />,
  "project-claude": () => (
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
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  home: () => (
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
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  managed: () => (
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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

export const RECOMMEND_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; title: string }
> = {
  recommended: {
    label: "推奨",
    color: "#6EE7B7",
    bg: "rgba(16, 185, 129, 0.15)",
    title: "ほとんどのユーザーに設定をおすすめします",
  },
  optional: {
    label: "任意",
    color: "#64748B",
    bg: "rgba(100,116,139,0.15)",
    title: "必要に応じて設定してください",
  },
  advanced: {
    label: "上級",
    color: "#C4B5FD",
    bg: "rgba(139, 92, 246, 0.15)",
    title: "仕組みを理解した上で設定してください",
  },
};

export const VCS_CONFIG = {
  true: {
    label: "VCS ○",
    color: "#6EE7B7",
    bg: "rgba(16, 185, 129, 0.15)",
    title: "Git 等のバージョン管理にコミットしてチームで共有できます",
  },
  false: {
    label: "VCS ×",
    color: "#64748B",
    bg: "rgba(100,116,139,0.15)",
    title: "個人環境のみ。Git 等のバージョン管理にはコミットしません",
  },
  null: {
    label: "OS 管理",
    color: "#FDBA74",
    bg: "rgba(249, 115, 22, 0.15)",
    title: "OS のシステムディレクトリで管理される設定です",
  },
};

export function getVcsKey(vcs: boolean | null): "true" | "false" | "null" {
  if (vcs === null) return "null";
  return String(vcs) as "true" | "false";
}

export const SECTIONS: Section[] = directoryData.sections as unknown as Section[];
export const PRECEDENCE: PrecedenceItem[] =
  directoryData.precedence as PrecedenceItem[];
export const COMMIT_GUIDE = directoryData.commitGuide;
export const SKILLS_VS_AGENTS = directoryData.skillsVsAgents;

export const TOTAL = SECTIONS.flatMap((s) => s.entries).length;

const ENTRY_SECTION_MAP = new Map<string, Section>();
for (const s of SECTIONS) {
  for (const e of s.entries) {
    ENTRY_SECTION_MAP.set(e.path + "@" + s.id, s);
  }
}
export function getSectionForEntry(entry: Entry): Section {
  for (const s of SECTIONS) {
    if (s.entries.includes(entry)) return s;
  }
  return SECTIONS[0];
}

export const PRECEDENCE_COLORS: Record<string, { color: string; bg: string }> = {
  red: { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
  orange: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  yellow: { color: "#FDE68A", bg: "rgba(234, 179, 8, 0.15)" },
  green: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  blue: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
};

export const SPECIAL_TABS = ["precedence", "commit-guide", "skills-agents"] as const;

export const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", shortLabel: "すべて", color: "#3B82F6", type: "section" },
  ...SECTIONS.map((s) => ({
    id: s.id,
    label: s.name,
    shortLabel: s.name
      .replace("（企業管理者向け）", "")
      .replace("マネージド設定", "マネージド"),
    color: SECTION_COLORS[s.id]?.color || "#3B82F6",
    type: "section" as const,
  })),
  {
    id: "precedence",
    label: "優先順位",
    shortLabel: "優先順位",
    color: "#FDBA74",
    type: "info",
  },
  {
    id: "commit-guide",
    label: "コミットガイド",
    shortLabel: "コミット",
    color: "#5EEAD4",
    type: "info",
  },
  {
    id: "skills-agents",
    label: "Skills vs Agents",
    shortLabel: "Skills/Agents",
    color: "#C4B5FD",
    type: "info",
  },
];

export const MODAL_SECTION_META: Record<
  string,
  { label: string; icon: React.JSX.Element }
> = {
  detail: { label: "詳細", icon: <BookOpenIcon /> },
  usage: { label: "使い方", icon: <TerminalIcon /> },
  location: { label: "配置場所", icon: <MapPinIcon /> },
  bestPractices: { label: "ベストプラクティス", icon: <LightbulbIcon /> },
};
