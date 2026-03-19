import {
  FolderIcon,
  LockIcon,
  SettingsIcon,
} from "~/components/icons";
import directoryData from "~/data/directory/directory-structure.json";
import { PALETTE } from "~/theme/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SECTIONS: Section[] = directoryData.sections as unknown as Section[];
export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.entries.length, 0);

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

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  推奨: PALETTE.green,
  任意: { color: "#64748B", bg: "rgba(100,116,139,0.15)" },
  上級: PALETTE.purple,
  "VCS ○": PALETTE.green,
  "VCS ×": { color: "#64748B", bg: "rgba(100,116,139,0.15)" },
  "OS 管理": PALETTE.orange,
};

export const TAB_DEFS = [
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

export const ITEM_SECTION_MAP = new Map<
  string,
  { sectionName: string; sectionId: string }
>();
for (const s of SECTIONS) {
  for (const e of s.entries) {
    ITEM_SECTION_MAP.set(`${s.id}:${e.path}`, {
      sectionName: s.name,
      sectionId: s.id,
    });
  }
}

export const getItemId = (sectionId: string, entryPath: string): string =>
  `${sectionId}:${entryPath}`;

// Keep for detail modal
export const MODAL_SECTION_META: Record<string, { label: string; icon: React.JSX.Element }> = {
  detail: {
    label: "詳細",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  usage: {
    label: "使い方",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  location: {
    label: "配置場所",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  bestPractices: {
    label: "ベストプラクティス",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="9" y1="18" x2="15" y2="18" />
        <line x1="10" y1="22" x2="14" y2="22" />
        <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
      </svg>
    ),
  },
};
