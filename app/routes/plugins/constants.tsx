import {
  CheckDocIcon,
  CodeIcon,
  LinkIcon,
  TeamIcon,
  WrenchIcon,
} from "~/components/icons";
import pluginsData from "~/data/plugins/plugins.json";
import { PALETTE } from "~/theme/colors";

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
  "code-intelligence": PALETTE.cyan,
  "dev-tools": PALETTE.purple,
  "code-review-git": PALETTE.green,
  "external-integrations": PALETTE.teal,
  "output-styles": PALETTE.orange,
  community: PALETTE.pinkBright,
};

export const CATEGORY_ICONS: Record<string, () => React.JSX.Element> = {
  "code-intelligence": () => <CodeIcon />,
  "dev-tools": () => <WrenchIcon />,
  "code-review-git": () => <CheckDocIcon />,
  "external-integrations": () => <LinkIcon />,
  "output-styles": () => (
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
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  community: () => <TeamIcon />,
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
