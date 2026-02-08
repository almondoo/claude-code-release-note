import pluginsData from "~/data/plugins.json";

export interface Plugin {
  name: string;
  displayName: string;
  description: string;
  binary: string | null;
  install: string;
  detail: string;
  whenToUse: string;
  setup: string;
  homepage?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  plugins: Plugin[];
}

export const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  "code-intelligence": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "dev-tools": { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  "code-review-git": { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  "external-integrations": { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  "output-styles": { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  "community": { color: "#F472B6", bg: "rgba(244, 114, 182, 0.15)" },
};

export const CATEGORY_ICONS: Record<string, () => React.JSX.Element> = {
  "code-intelligence": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  "dev-tools": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  "code-review-git": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  "external-integrations": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  "output-styles": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  "community": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
};

export const CATEGORIES: Category[] = pluginsData.categories;
export const TOTAL = CATEGORIES.flatMap((c) => c.plugins).length;

export interface TabDef {
  id: string;
  label: string;
  color: string;
  type: "category" | "quickstart";
}

export const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: "#3B82F6", type: "category" },
  ...CATEGORIES.map((c) => ({
    id: c.id,
    label: c.name,
    color: CATEGORY_COLORS[c.id]?.color || "#3B82F6",
    type: "category" as const,
  })),
  { id: "quickstart", label: "クイックスタート", color: "#5EEAD4", type: "quickstart" },
];

export const PLUGIN_CATEGORY_MAP = new Map<string, { color: string }>();
for (const cat of CATEGORIES) {
  for (const p of cat.plugins) {
    PLUGIN_CATEGORY_MAP.set(p.name, {
      color: CATEGORY_COLORS[cat.id]?.color || "#3B82F6",
    });
  }
}

export const QUICKSTART_STEPS = [
  {
    title: "ブラウズ",
    cmd: "/plugin",
    desc: "Discover タブで利用可能なプラグインを閲覧",
  },
  {
    title: "インストール",
    cmd: "/plugin install <name>@claude-plugins-official",
    desc: "プラグインをインストール（user / project / local スコープ選択可）",
  },
  {
    title: "管理",
    cmd: "/plugin",
    desc: "Installed タブでプラグインの有効化・無効化・削除",
  },
];
