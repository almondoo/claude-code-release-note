import {
  BoltIcon,
  CodeIcon,
  LightbulbIcon,
  LinkIcon,
  LockIcon,
  ServerIcon,
  SettingsIcon,
  ShieldIcon,
  TerminalIcon,
  TriangleAlertIcon,
  WrenchIcon,
} from "~/components/icons";
import { PALETTE } from "~/theme/colors";
import { commandsData, pluginsData, envVarsData } from "~/data/quick-reference";

// ---------------------------------------------------------------------------
// Types — shared
// ---------------------------------------------------------------------------

export interface TabDef {
  id: string;
  label: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Types — commands
// ---------------------------------------------------------------------------

export interface CommandItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  usage?: string;
}

export interface CommandSection {
  id: string;
  name: string;
  description: string;
  items: CommandItem[];
}

// ---------------------------------------------------------------------------
// Types — plugins
// ---------------------------------------------------------------------------

export interface PluginItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  provider?: string;
  install?: string;
}

export interface PluginSection {
  id: string;
  name: string;
  description: string;
  items: PluginItem[];
}

// ---------------------------------------------------------------------------
// Types — env-vars
// ---------------------------------------------------------------------------

export interface EnvVarItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  values?: string;
  defaultValue?: string;
  example?: string;
}

export interface EnvVarSection {
  id: string;
  name: string;
  description: string;
  items: EnvVarItem[];
}

// ---------------------------------------------------------------------------
// CategoryConfig
// ---------------------------------------------------------------------------

export type AnyItem = CommandItem | PluginItem | EnvVarItem;

export interface CategoryConfig<T = AnyItem> {
  id: string;
  label: string;
  color: string;
  gradient: [string, string];
  description: string;
  sections: { id: string; name: string; description: string; items: T[] }[];
  sectionColors: Record<string, { color: string; bg: string }>;
  sectionIcons: Record<string, () => React.JSX.Element>;
  tabDefs: TabDef[];
  tabSectionMap?: Record<string, string[]>;
  tagColors: Record<string, { color: string; bg: string }>;
  totalItems: number;
  itemLabel: string;
  searchPlaceholder: string;
}

// ---------------------------------------------------------------------------
// commands config
// ---------------------------------------------------------------------------

const cmdSections = commandsData.sections as CommandSection[];

const cmdSectionColors: Record<string, { color: string; bg: string }> = {
  "daily-slash": PALETTE.cyan,
  workflow: PALETTE.purple,
  "cli-flags": PALETTE.orange,
  keyboard: PALETTE.green,
};

const cmdSectionIcons: Record<string, () => React.JSX.Element> = {
  "daily-slash": () => <TerminalIcon width={18} height={18} />,
  workflow: () => (
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
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
  "cli-flags": () => <CodeIcon />,
  keyboard: () => (
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
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
    </svg>
  ),
};

const cmdConfig: CategoryConfig<CommandItem> = {
  id: "commands",
  label: "コマンド",
  color: "#06B6D4",
  gradient: ["rgba(6,182,212,0.08)", "rgba(16,185,129,0.05)"],
  description:
    "毎日使うスラッシュコマンド・ワークフロー系コマンド・CLIフラグ・キーボードショートカットの厳選リスト。",
  sections: cmdSections,
  sectionColors: cmdSectionColors,
  sectionIcons: cmdSectionIcons,
  tabDefs: [
    { id: "all", label: "すべて", color: "#3B82F6" },
    ...cmdSections.map((s) => ({
      id: s.id,
      label: s.name,
      color: cmdSectionColors[s.id]?.color || "#3B82F6",
    })),
  ],
  tagColors: {
    推奨: { color: "#6EE7B7", bg: "rgba(16,185,129,0.15)" },
  },
  totalItems: cmdSections.reduce((sum, s) => sum + s.items.length, 0),
  itemLabel: "コマンド",
  searchPlaceholder: "コマンドを検索...",
};

// ---------------------------------------------------------------------------
// plugins config
// ---------------------------------------------------------------------------

const plgSections = pluginsData.sections as PluginSection[];

const plgSectionColors: Record<string, { color: string; bg: string }> = {
  "code-intelligence": PALETTE.cyan,
  external: PALETTE.blue,
  "dev-workflow": PALETTE.green,
  caution: PALETTE.red,
};

const plgSectionIcons: Record<string, () => React.JSX.Element> = {
  "code-intelligence": () => <CodeIcon />,
  external: () => <LinkIcon />,
  "dev-workflow": () => <WrenchIcon />,
  caution: () => <TriangleAlertIcon />,
};

const plgConfig: CategoryConfig<PluginItem> = {
  id: "plugins",
  label: "プラグイン",
  color: "#8B5CF6",
  gradient: ["rgba(139,92,246,0.08)", "rgba(6,182,212,0.05)"],
  description:
    "ベストなユーザーはプラグインを2〜3個に留め、代わりにCLAUDE.mdを最適化して書いている。実使用で価値が確認されたプラグインのみ掲載。",
  sections: plgSections,
  sectionColors: plgSectionColors,
  sectionIcons: plgSectionIcons,
  tabDefs: [
    { id: "all", label: "すべて", color: "#3B82F6" },
    ...plgSections.map((s) => ({
      id: s.id,
      label: s.name,
      color: plgSectionColors[s.id]?.color || "#3B82F6",
    })),
  ],
  tagColors: {
    公式: PALETTE.cyan,
    パートナー: PALETTE.purple,
    LSP: PALETTE.teal,
    注意: PALETTE.red,
  },
  totalItems: plgSections.reduce((sum, s) => sum + s.items.length, 0),
  itemLabel: "プラグイン",
  searchPlaceholder: "プラグインを検索...",
};

// ---------------------------------------------------------------------------
// env-vars config
// ---------------------------------------------------------------------------

const envSections = envVarsData.sections as EnvVarSection[];

const envSectionColors: Record<string, { color: string; bg: string }> = {
  auth: PALETTE.purple,
  cloud: PALETTE.blue,
  recommended: PALETTE.green,
  performance: PALETTE.orange,
  network: PALETTE.yellow,
  "settings-method": PALETTE.teal,
};

const envSectionIcons: Record<string, () => React.JSX.Element> = {
  auth: () => <LockIcon width={18} height={18} />,
  cloud: () => <ServerIcon />,
  recommended: () => <LightbulbIcon width={18} height={18} />,
  performance: () => <BoltIcon />,
  network: () => <ShieldIcon />,
  "settings-method": () => <SettingsIcon width={18} height={18} />,
};

const envConfig: CategoryConfig<EnvVarItem> = {
  id: "env-vars",
  label: "環境変数",
  color: "#F59E0B",
  gradient: ["rgba(245,158,11,0.08)", "rgba(139,92,246,0.05)"],
  description:
    "全体で100以上の変数が存在するが、ほとんどのユーザーが設定する必要があるのは5〜10個程度。本当に設定すべきものだけを掲載。",
  sections: envSections,
  sectionColors: envSectionColors,
  sectionIcons: envSectionIcons,
  tabDefs: [
    { id: "all", label: "すべて", color: "#3B82F6" },
    ...envSections.map((s) => ({
      id: s.id,
      label: s.name,
      color: envSectionColors[s.id]?.color || "#3B82F6",
    })),
  ],
  tagColors: {
    必須: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
    推奨: PALETTE.green,
    企業向け: PALETTE.yellow,
    Bedrock: PALETTE.orange,
    Vertex: PALETTE.blue,
    Foundry: PALETTE.purple,
  },
  totalItems: envSections.reduce((sum, s) => sum + s.items.length, 0),
  itemLabel: "環境変数",
  searchPlaceholder: "変数名やキーワードで検索...",
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  { id: "commands", label: "コマンド", color: "#06B6D4" },
  { id: "plugins", label: "プラグイン", color: "#8B5CF6" },
  { id: "env-vars", label: "環境変数", color: "#F59E0B" },
];

export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  commands: cmdConfig,
  plugins: plgConfig,
  "env-vars": envConfig,
};

// ---------------------------------------------------------------------------
// Unified item → section lookup map
// ---------------------------------------------------------------------------

export const ITEM_SECTION_MAP = new Map<
  string,
  { sectionName: string; sectionId: string; categoryId: string }
>();
for (const [categoryId, config] of Object.entries(CATEGORY_CONFIGS)) {
  for (const section of config.sections) {
    for (const item of section.items) {
      ITEM_SECTION_MAP.set(item.id, {
        sectionName: section.name,
        sectionId: section.id,
        categoryId,
      });
    }
  }
}
