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
  TerminalIcon,
  UserIcon,
  WrenchIcon,
} from "~/components/icons";
import { PALETTE } from "~/theme/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommandItem {
  id: string;
  title: string;
  description: string;
  detail: string;
  whenToUse: string;
  args?: string | null;
  itemType: "slash" | "cli-command" | "cli-flag" | "shortcut";
}

export interface CommandSection {
  id: string;
  name: string;
  items: CommandItem[];
}

// ---------------------------------------------------------------------------
// Raw data
// ---------------------------------------------------------------------------

interface RawCommand {
  name: string;
  description: string;
  args: string | null;
  detail: string;
  whenToUse: string;
}

interface RawCategory {
  id: string;
  name: string;
  description: string;
  commands: RawCommand[];
}

interface RawShortcut {
  key: string;
  description: string;
  detail: string;
  whenToUse: string;
}

const RAW_CATEGORIES: RawCategory[] = categoriesData.categories;
const RAW_CLI_COMMANDS: RawCommand[] = cliData.cli.commands;
const RAW_CLI_FLAGS: RawCommand[] = cliData.cli.flags;
const RAW_SHORTCUTS: RawShortcut[] = shortcutsData.shortcuts;

// ---------------------------------------------------------------------------
// Unified sections
// ---------------------------------------------------------------------------

const slashSections: CommandSection[] = RAW_CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  items: c.commands.map((cmd) => ({
    id: cmd.name,
    title: cmd.name,
    description: cmd.description,
    detail: cmd.detail,
    whenToUse: cmd.whenToUse,
    args: cmd.args,
    itemType: "slash" as const,
  })),
}));

const cliSection: CommandSection = {
  id: "cli",
  name: "CLI",
  items: [
    ...RAW_CLI_COMMANDS.map((cmd) => ({
      id: `cli:${cmd.name}`,
      title: cmd.name,
      description: cmd.description,
      detail: cmd.detail,
      whenToUse: cmd.whenToUse,
      args: cmd.args,
      itemType: "cli-command" as const,
    })),
    ...RAW_CLI_FLAGS.map((cmd) => ({
      id: `flag:${cmd.name}`,
      title: cmd.name,
      description: cmd.description,
      detail: cmd.detail,
      whenToUse: cmd.whenToUse,
      args: cmd.args,
      itemType: "cli-flag" as const,
    })),
  ],
};

const shortcutsSection: CommandSection = {
  id: "shortcuts",
  name: "ショートカット",
  items: RAW_SHORTCUTS.map((s) => ({
    id: `shortcut:${s.key}`,
    title: s.key,
    description: s.description,
    detail: s.detail,
    whenToUse: s.whenToUse,
    itemType: "shortcut" as const,
  })),
};

export const SECTIONS: CommandSection[] = [...slashSections, cliSection, shortcutsSection];

export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

// ---------------------------------------------------------------------------
// Colors & Icons
// ---------------------------------------------------------------------------

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  essential: PALETTE.green,
  session: PALETTE.cyan,
  config: PALETTE.orange,
  memory: PALETTE.blueDark,
  integration: PALETTE.teal,
  agent: PALETTE.purple,
  utility: PALETTE.pinkBright,
  account: PALETTE.yellow,
  cli: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  shortcuts: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  essential: () => <StarIcon />,
  session: () => <CornerDownRightIcon />,
  config: () => <SettingsIcon width={18} height={18} />,
  memory: () => <BookOpenIcon width={18} height={18} />,
  integration: () => <LinkIcon />,
  agent: () => <LockIcon />,
  utility: () => <WrenchIcon />,
  account: () => <UserIcon />,
  cli: () => <TerminalIcon width={18} height={18} />,
  shortcuts: () => (
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
      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  ),
};

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  Command: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  Flag: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
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

export const ITEM_SECTION_MAP = new Map<string, { sectionName: string; sectionId: string }>();
for (const section of SECTIONS) {
  for (const item of section.items) {
    ITEM_SECTION_MAP.set(item.id, { sectionName: section.name, sectionId: section.id });
  }
}
