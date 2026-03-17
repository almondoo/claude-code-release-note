import categoriesData from "~/data/commands/commands-categories.json";
import cliData from "~/data/commands/commands-cli.json";
import shortcutsData from "~/data/commands/commands-shortcuts.json";
import {
  BookOpenIcon,
  CornerDownRightIcon,
  LinkIcon,
  LockIcon,
  SettingsIcon,
  StarIcon,
  UserIcon,
  WrenchIcon,
} from "~/components/icons";
import { PALETTE } from "~/theme/colors";
import { matchesQuery } from "~/utils/search";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Command {
  name: string;
  description: string;
  args: string | null;
  detail: string;
  whenToUse: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  commands: Command[];
}

export interface Shortcut {
  key: string;
  description: string;
  detail: string;
  whenToUse: string;
}

export interface TabDef {
  id: string;
  label: string;
  color: string;
  type: "popular" | "slash-category" | "cli" | "shortcuts";
}

export type ModalData =
  | { type: "command"; cmd: Command; categoryName: string; accentColor: string }
  | { type: "cli"; cmd: Command; kind: "command" | "flag" }
  | { type: "shortcut"; shortcut: Shortcut };

// ---------------------------------------------------------------------------
// Data (from JSON)
// ---------------------------------------------------------------------------

export const CATEGORIES: Category[] = categoriesData.categories;
export const CLI_COMMANDS: Command[] = cliData.cli.commands;
export const CLI_FLAGS: Command[] = cliData.cli.flags;
export const SHORTCUTS: Shortcut[] = shortcutsData.shortcuts;

// ---------------------------------------------------------------------------
// Colors & Icons
// ---------------------------------------------------------------------------

const DEFAULT_COLOR = "#3B82F6";

export const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  popular: { color: "#FCD34D", bg: "rgba(252, 211, 77, 0.15)" },
  essential: PALETTE.green,
  session: PALETTE.cyan,
  config: PALETTE.orange,
  memory: PALETTE.blueDark,
  integration: PALETTE.teal,
  agent: PALETTE.purple,
  utility: PALETTE.pinkBright,
  account: PALETTE.yellow,
};

export function getCategoryColor(id: string): string {
  return CATEGORY_COLORS[id]?.color ?? DEFAULT_COLOR;
}

export const CLI_ACCENT = "#C4B5FD";
export const SHORTCUT_ACCENT = "#FDBA74";

export const CATEGORY_ICONS: Record<string, () => React.JSX.Element> = {
  popular: () => <StarIcon />,
  essential: () => <StarIcon />,
  session: () => <CornerDownRightIcon />,
  config: () => <SettingsIcon width={18} height={18} />,
  memory: () => <BookOpenIcon width={18} height={18} />,
  integration: () => <LinkIcon />,
  agent: () => <LockIcon />,
  utility: () => <WrenchIcon />,
  account: () => <UserIcon />,
};

// ---------------------------------------------------------------------------
// Derived data
// ---------------------------------------------------------------------------

export const TOTAL_SLASH = CATEGORIES.flatMap((c) => c.commands).length;
export const TOTAL_CLI = CLI_COMMANDS.length + CLI_FLAGS.length;

const ALL_SLASH_COMMANDS = CATEGORIES.flatMap((c) => c.commands);

const POPULAR_COMMAND_NAMES = [
  "/init",
  "/model",
  "/help",
  "/clear",
  "/compact",
  "/resume",
  "/memory",
  "/cost",
  "/plan",
  "/mcp",
  "/doctor",
  "/rewind",
] as const;

export const POPULAR_COMMANDS: Command[] = POPULAR_COMMAND_NAMES.map((name) =>
  ALL_SLASH_COMMANDS.find((cmd) => cmd.name === name),
).filter((cmd): cmd is Command => cmd !== undefined);

export const CMD_CATEGORY_MAP = new Map<string, { name: string; color: string }>();
for (const cat of CATEGORIES) {
  for (const cmd of cat.commands) {
    CMD_CATEGORY_MAP.set(cmd.name, {
      name: cat.name,
      color: getCategoryColor(cat.id),
    });
  }
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

export const TAB_DEFS: TabDef[] = [
  { id: "popular", label: "よく使う", color: "#FCD34D", type: "popular" },
  { id: "all", label: "すべて", color: DEFAULT_COLOR, type: "slash-category" },
  ...CATEGORIES.map((c) => ({
    id: c.id,
    label: c.name,
    color: getCategoryColor(c.id),
    type: "slash-category" as const,
  })),
  { id: "cli", label: "CLI", color: "#C4B5FD", type: "cli" },
  { id: "shortcuts", label: "ショートカット", color: "#FDBA74", type: "shortcuts" },
];

// ---------------------------------------------------------------------------
// Re-export shared utility
// ---------------------------------------------------------------------------

export { matchesQuery };
