import { CheckDocIcon, CodeIcon, LinkIcon, TeamIcon, WrenchIcon } from "~/components/icons";
import pluginsData from "~/data/plugins/plugins.json";
import { PALETTE } from "~/theme/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CATEGORIES: Category[] = pluginsData.categories;

export const SECTIONS = CATEGORIES.map((c) => ({
  id: c.id,
  name: c.name,
  items: c.plugins,
}));

export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  "code-intelligence": PALETTE.cyan,
  "dev-tools": PALETTE.purple,
  "code-review-git": PALETTE.green,
  "external-integrations": PALETTE.teal,
  "output-styles": PALETTE.orange,
  community: PALETTE.pinkBright,
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
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

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  LSP: PALETTE.cyan,
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
  for (const p of cat.plugins) {
    ITEM_SECTION_MAP.set(p.name, { sectionName: cat.name, sectionId: cat.id });
  }
}
