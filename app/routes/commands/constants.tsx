import commandsData from "~/data/commands.json";

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
  type: "slash-category" | "cli" | "shortcuts";
}

export type ModalData =
  | { type: "command"; cmd: Command; categoryName: string; accentColor: string }
  | { type: "cli"; cmd: Command; kind: "command" | "flag" }
  | { type: "shortcut"; shortcut: Shortcut };

export const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  essential: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  session: { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  config: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  memory: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
  integration: { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  agent: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  utility: { color: "#F472B6", bg: "rgba(244, 114, 182, 0.15)" },
  account: { color: "#FDE68A", bg: "rgba(234, 179, 8, 0.15)" },
};

export const CATEGORY_ICONS: Record<string, () => React.JSX.Element> = {
  essential: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  session: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 10 20 15 15 20" />
      <path d="M4 4v7a4 4 0 0 0 4 4h12" />
    </svg>
  ),
  config: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  memory: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  integration: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  agent: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  utility: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  account: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

export const CATEGORIES: Category[] = commandsData.categories;
export const CLI_COMMANDS: Command[] = commandsData.cli.commands;
export const CLI_FLAGS: Command[] = commandsData.cli.flags;
export const SHORTCUTS: Shortcut[] = commandsData.shortcuts;

export const TOTAL_SLASH = CATEGORIES.flatMap((c) => c.commands).length;
export const TOTAL_CLI = CLI_COMMANDS.length + CLI_FLAGS.length;

export const TAB_DEFS: TabDef[] = [
  { id: "all", label: "\u3059\u3079\u3066", color: "#3B82F6", type: "slash-category" },
  ...CATEGORIES.map((c) => ({
    id: c.id,
    label: c.name,
    color: CATEGORY_COLORS[c.id]?.color || "#3B82F6",
    type: "slash-category" as const,
  })),
  { id: "cli", label: "CLI", color: "#C4B5FD", type: "cli" },
  { id: "shortcuts", label: "\u30B7\u30E7\u30FC\u30C8\u30AB\u30C3\u30C8", color: "#FDBA74", type: "shortcuts" },
];

export const CMD_CATEGORY_MAP = new Map<string, { name: string; color: string }>();
for (const cat of CATEGORIES) {
  for (const cmd of cat.commands) {
    CMD_CATEGORY_MAP.set(cmd.name, {
      name: cat.name,
      color: CATEGORY_COLORS[cat.id]?.color || "#3B82F6",
    });
  }
}

export function matchesQuery(fields: (string | null)[], lowerQuery: string): boolean {
  if (!lowerQuery) return true;
  return fields.some((f) => f != null && f.toLowerCase().includes(lowerQuery));
}

export const CLI_ACCENT = "#C4B5FD";
export const SHORTCUT_ACCENT = "#FDBA74";
