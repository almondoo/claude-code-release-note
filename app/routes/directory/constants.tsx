import {
  BookOpenIcon,
  FolderIcon,
  LightbulbIcon,
  LockIcon,
  MapPinIcon,
  SettingsIcon,
  TerminalIcon,
} from "~/components/icons";
import directoryData from "~/data/directory/directory-structure.json";
import { PALETTE } from "~/theme/colors";

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
  global: PALETTE.purple,
  "project-root": PALETTE.green,
  "project-claude": PALETTE.cyan,
  home: PALETTE.orange,
  managed: PALETTE.red,
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
  "project-claude": () => <SettingsIcon width={18} height={18} />,
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
  managed: () => <LockIcon />,
};

export const RECOMMEND_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; title: string }
> = {
  recommended: {
    label: "推奨",
    ...PALETTE.green,
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
    ...PALETTE.purple,
    title: "仕組みを理解した上で設定してください",
  },
};

export const VCS_CONFIG = {
  true: {
    label: "VCS ○",
    ...PALETTE.green,
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
    ...PALETTE.orange,
    title: "OS のシステムディレクトリで管理される設定です",
  },
};

export const getVcsKey = (vcs: boolean | null): "true" | "false" | "null" => {
  if (vcs === null) return "null";
  return String(vcs) as "true" | "false";
};

export const SECTIONS: Section[] = directoryData.sections as unknown as Section[];
export const PRECEDENCE: PrecedenceItem[] = directoryData.precedence as PrecedenceItem[];
export const COMMIT_GUIDE = directoryData.commitGuide;
export const SKILLS_VS_AGENTS = directoryData.skillsVsAgents;

export const TOTAL = SECTIONS.flatMap((s) => s.entries).length;

const ENTRY_SECTION_MAP = new Map<string, Section>();
for (const s of SECTIONS) {
  for (const e of s.entries) {
    ENTRY_SECTION_MAP.set(e.path + "@" + s.id, s);
  }
}
export const getSectionForEntry = (entry: Entry): Section => {
  for (const s of SECTIONS) {
    if (s.entries.includes(entry)) return s;
  }
  return SECTIONS[0];
};

export const PRECEDENCE_COLORS: Record<string, { color: string; bg: string }> = {
  red: PALETTE.red,
  orange: PALETTE.orange,
  yellow: PALETTE.yellow,
  green: PALETTE.green,
  blue: PALETTE.blueDark,
};

export const SPECIAL_TABS = ["precedence", "commit-guide", "skills-agents"] as const;

export const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", shortLabel: "すべて", color: "#3B82F6", type: "section" },
  ...SECTIONS.map((s) => ({
    id: s.id,
    label: s.name,
    shortLabel: s.name.replace("（企業管理者向け）", "").replace("マネージド設定", "マネージド"),
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

export const MODAL_SECTION_META: Record<string, { label: string; icon: React.JSX.Element }> = {
  detail: { label: "詳細", icon: <BookOpenIcon /> },
  usage: { label: "使い方", icon: <TerminalIcon /> },
  location: { label: "配置場所", icon: <MapPinIcon /> },
  bestPractices: { label: "ベストプラクティス", icon: <LightbulbIcon /> },
};
