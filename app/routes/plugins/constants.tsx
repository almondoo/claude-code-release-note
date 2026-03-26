import {
  CheckDocIcon,
  CodeIcon,
  LinkIcon,
  LockIcon,
  ServerIcon,
  ShieldIcon,
  TeamIcon,
  WrenchIcon,
} from "~/components/icons";
import { pluginsData } from "~/data/plugins";
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
  security: PALETTE.red,
  "cloud-infra": PALETTE.blue,
  database: PALETTE.yellow,
  "external-integrations": PALETTE.teal,
  "data-ai": PALETTE.indigo,
  "web-content": PALETTE.pink,
  messaging: PALETTE.slate,
  "output-styles": PALETTE.orange,
  community: PALETTE.pinkBright,
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  "code-intelligence": () => <CodeIcon />,
  "dev-tools": () => <WrenchIcon />,
  "code-review-git": () => <CheckDocIcon />,
  security: () => <ShieldIcon />,
  "cloud-infra": () => <ServerIcon />,
  database: () => <LockIcon />,
  "external-integrations": () => <LinkIcon />,
  "data-ai": () => (
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
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  "web-content": () => (
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
  messaging: () => (
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
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
