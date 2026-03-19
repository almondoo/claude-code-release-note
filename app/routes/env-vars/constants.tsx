import {
  LockIcon,
  ServerIcon,
  LinkIcon,
  TerminalIcon,
  PluginIcon,
  MonitorIcon,
  TrendingUpIcon,
  ShieldIcon,
  SettingsIcon,
} from "~/components/icons";
import envData from "~/data/env-vars/env-vars.json";
import { PALETTE } from "~/theme/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EnvLink {
  label: string;
  url: string;
}

export interface EnvVar {
  name: string;
  description: string;
  detail: string;
  values: string | null;
  default: string | null;
  example: string | null;
  links: EnvLink[];
  deprecated: boolean;
}

export interface EnvCategory {
  id: string;
  name: string;
  description: string;
  vars: EnvVar[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CATEGORIES: EnvCategory[] = envData.categories as unknown as EnvCategory[];

export const SECTIONS = CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  items: c.vars,
}));

export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  auth: PALETTE.purple,
  model: { color: "#93C5FD", bg: "rgba(59, 130, 246, 0.15)" },
  provider: PALETTE.green,
  "bash-context": PALETTE.teal,
  mcp: PALETTE.cyan,
  ui: PALETTE.orange,
  telemetry: PALETTE.red,
  proxy: PALETTE.yellow,
  misc: PALETTE.slate,
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  auth: () => <LockIcon width={18} height={18} />,
  model: () => <ServerIcon />,
  provider: () => <LinkIcon />,
  "bash-context": () => <TerminalIcon width={18} height={18} />,
  mcp: () => <PluginIcon />,
  ui: () => <MonitorIcon />,
  telemetry: () => <TrendingUpIcon />,
  proxy: () => <ShieldIcon />,
  misc: () => <SettingsIcon width={18} height={18} />,
};

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  非推奨: PALETTE.red,
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
for (const cat of CATEGORIES) {
  for (const v of cat.vars) {
    ITEM_SECTION_MAP.set(v.name, { sectionName: cat.name, sectionId: cat.id });
  }
}
