import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import commandsData from "~/data/commands.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Command {
  name: string;
  description: string;
  args: string | null;
  detail: string;
  whenToUse: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  commands: Command[];
}

interface CLICommand {
  name: string;
  description: string;
  args: string | null;
  detail: string;
  whenToUse: string;
}

interface Shortcut {
  key: string;
  description: string;
  detail: string;
  whenToUse: string;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const COLORS = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceHover: "#263548",
  border: "#334155",
  accent: "#3B82F6",
  accentGlow: "rgba(59, 130, 246, 0.25)",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
  green: "#6EE7B7",
  greenBg: "rgba(16, 185, 129, 0.15)",
  purple: "#C4B5FD",
  purpleBg: "rgba(139, 92, 246, 0.15)",
  orange: "#FDBA74",
  orangeBg: "rgba(249, 115, 22, 0.15)",
  cyan: "#67E8F9",
  cyanBg: "rgba(6, 182, 212, 0.15)",
  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace" as const;
const FONT_SANS = "'IBM Plex Sans', 'Noto Sans JP', system-ui, -apple-system, sans-serif" as const;

// ---------------------------------------------------------------------------
// Category colors
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  essential: { color: COLORS.green, bg: COLORS.greenBg },
  session: { color: COLORS.cyan, bg: COLORS.cyanBg },
  config: { color: COLORS.orange, bg: COLORS.orangeBg },
  memory: { color: COLORS.accent, bg: COLORS.accentGlow },
  integration: { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  agent: { color: COLORS.purple, bg: COLORS.purpleBg },
  utility: { color: "#F472B6", bg: "rgba(244, 114, 182, 0.15)" },
  account: { color: "#FDE68A", bg: "rgba(234, 179, 8, 0.15)" },
};

// ---------------------------------------------------------------------------
// Category icons
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<string, () => React.JSX.Element> = {
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

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function DetailInfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function TimingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function TerminalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code コマンド一覧" },
    { name: "description", content: "Claude Code の全スラッシュコマンドと CLI オプションのリファレンス" },
  ];
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CATEGORIES: Category[] = commandsData.categories;
const CLI_COMMANDS: CLICommand[] = commandsData.cli.commands;
const CLI_FLAGS: CLICommand[] = commandsData.cli.flags;
const SHORTCUTS: Shortcut[] = commandsData.shortcuts;

const TOTAL_SLASH = CATEGORIES.flatMap((c) => c.commands).length;
const TOTAL_CLI = CLI_COMMANDS.length + CLI_FLAGS.length;

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

interface TabDef {
  id: string;
  label: string;
  color: string;
  type: "slash-category" | "cli" | "shortcuts";
}

const TAB_DEFS: TabDef[] = [
  ...CATEGORIES.map((c) => ({
    id: c.id,
    label: c.name,
    color: CATEGORY_COLORS[c.id]?.color || COLORS.accent,
    type: "slash-category" as const,
  })),
  { id: "cli", label: "CLI", color: COLORS.purple, type: "cli" },
  { id: "shortcuts", label: "ショートカット", color: COLORS.orange, type: "shortcuts" },
];

// ---------------------------------------------------------------------------
// CommandCard — compact grid card for slash commands
// ---------------------------------------------------------------------------

function CommandCard({
  cmd,
  accentColor,
  categoryName,
  onClick,
}: {
  cmd: Command;
  accentColor: string;
  categoryName: string;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      style={{
        background: COLORS.surface,
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = COLORS.surfaceHover;
        e.currentTarget.style.borderColor = accentColor + "60";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${accentColor}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = COLORS.surface;
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
          borderRadius: "12px 12px 0 0",
        }}
      />
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <code
          style={{
            fontFamily: FONT_MONO,
            fontSize: "14px",
            fontWeight: 700,
            color: accentColor,
            whiteSpace: "nowrap",
          }}
        >
          {cmd.name}
        </code>
        {cmd.args && (
          <span
            style={{
              fontSize: "11px",
              color: COLORS.textMuted,
              fontFamily: FONT_MONO,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {cmd.args}
          </span>
        )}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          lineHeight: 1.6,
          color: COLORS.textSecondary,
          fontFamily: FONT_SANS,
          flex: 1,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {cmd.description}
      </p>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: "4px",
          background: accentColor + "18",
          color: accentColor,
          whiteSpace: "nowrap",
          alignSelf: "flex-start",
        }}
      >
        {categoryName}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CLICard — card for CLI commands/flags
// ---------------------------------------------------------------------------

function CLICard({
  cmd,
  kind,
  onClick,
}: {
  cmd: CLICommand;
  kind: "command" | "flag";
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      style={{
        background: COLORS.surface,
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = COLORS.surfaceHover;
        e.currentTarget.style.borderColor = COLORS.purple + "60";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${COLORS.purple}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = COLORS.surface;
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${COLORS.purple}, ${COLORS.purple}40)`,
          borderRadius: "12px 12px 0 0",
        }}
      />
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <code
          style={{
            fontFamily: FONT_MONO,
            fontSize: "14px",
            fontWeight: 700,
            color: COLORS.purple,
            whiteSpace: "nowrap",
          }}
        >
          {cmd.name}
        </code>
        {cmd.args && (
          <span
            style={{
              fontSize: "11px",
              color: COLORS.textMuted,
              fontFamily: FONT_MONO,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {cmd.args}
          </span>
        )}
      </div>
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          lineHeight: 1.6,
          color: COLORS.textSecondary,
          fontFamily: FONT_SANS,
          flex: 1,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {cmd.description}
      </p>
      <span
        style={{
          fontSize: "10px",
          fontWeight: 600,
          padding: "2px 8px",
          borderRadius: "4px",
          background: COLORS.purpleBg,
          color: COLORS.purple,
          whiteSpace: "nowrap",
          alignSelf: "flex-start",
        }}
      >
        {kind === "command" ? "Command" : "Flag"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ShortcutCard
// ---------------------------------------------------------------------------

function ShortcutCard({
  shortcut,
  onClick,
}: {
  shortcut: Shortcut;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      style={{
        background: COLORS.surface,
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = COLORS.surfaceHover;
        e.currentTarget.style.borderColor = COLORS.orange + "60";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${COLORS.orange}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = COLORS.surface;
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${COLORS.orange}, ${COLORS.orange}40)`,
          borderRadius: "12px 12px 0 0",
        }}
      />
      <kbd
        style={{
          fontFamily: FONT_MONO,
          fontSize: "13px",
          fontWeight: 600,
          color: COLORS.orange,
          background: COLORS.orangeBg,
          padding: "4px 12px",
          borderRadius: "6px",
          border: `1px solid ${COLORS.orange}30`,
          display: "inline-block",
          whiteSpace: "nowrap",
          width: "fit-content",
        }}
      >
        {shortcut.key}
      </kbd>
      <p
        style={{
          margin: 0,
          fontSize: "12px",
          lineHeight: 1.6,
          color: COLORS.textSecondary,
          fontFamily: FONT_SANS,
          flex: 1,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {shortcut.description}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetailModal — shared modal for command/CLI/shortcut details
// ---------------------------------------------------------------------------

type ModalData =
  | { type: "command"; cmd: Command; categoryName: string; accentColor: string }
  | { type: "cli"; cmd: CLICommand; kind: "command" | "flag" }
  | { type: "shortcut"; shortcut: Shortcut };

function DetailModal({
  data,
  onClose,
  reducedMotion,
}: {
  data: ModalData;
  onClose: () => void;
  reducedMotion: boolean | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [onClose]);

  let title: React.ReactNode;
  let accentColor: string;
  let detail: string;
  let whenToUse: string;
  let extraHeader: React.ReactNode = null;

  if (data.type === "command") {
    accentColor = data.accentColor;
    detail = data.cmd.detail;
    whenToUse = data.cmd.whenToUse;
    title = (
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
        <code style={{ fontFamily: FONT_MONO, fontSize: "16px", fontWeight: 700, color: accentColor }}>{data.cmd.name}</code>
        {data.cmd.args && (
          <span style={{ fontSize: "12px", color: COLORS.textMuted, fontFamily: FONT_MONO }}>{data.cmd.args}</span>
        )}
      </div>
    );
    extraHeader = (
      <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "4px",
            background: accentColor + "18",
            color: accentColor,
          }}
        >
          {data.categoryName}
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "4px",
            background: COLORS.greenBg,
            color: COLORS.green,
          }}
        >
          スラッシュコマンド
        </span>
      </div>
    );
  } else if (data.type === "cli") {
    accentColor = COLORS.purple;
    detail = data.cmd.detail;
    whenToUse = data.cmd.whenToUse;
    title = (
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
        <code style={{ fontFamily: FONT_MONO, fontSize: "16px", fontWeight: 700, color: accentColor }}>{data.cmd.name}</code>
        {data.cmd.args && (
          <span style={{ fontSize: "12px", color: COLORS.textMuted, fontFamily: FONT_MONO }}>{data.cmd.args}</span>
        )}
      </div>
    );
    extraHeader = (
      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "4px",
            background: COLORS.purpleBg,
            color: COLORS.purple,
          }}
        >
          CLI {data.kind === "command" ? "Command" : "Flag"}
        </span>
      </div>
    );
  } else {
    accentColor = COLORS.orange;
    detail = data.shortcut.detail;
    whenToUse = data.shortcut.whenToUse;
    title = (
      <kbd
        style={{
          fontFamily: FONT_MONO,
          fontSize: "14px",
          fontWeight: 600,
          color: COLORS.orange,
          background: COLORS.orangeBg,
          padding: "4px 14px",
          borderRadius: "6px",
          border: `1px solid ${COLORS.orange}30`,
        }}
      >
        {data.shortcut.key}
      </kbd>
    );
    extraHeader = (
      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "4px",
            background: COLORS.orangeBg,
            color: COLORS.orange,
          }}
        >
          ショートカット
        </span>
      </div>
    );
  }

  const description = data.type === "command" ? data.cmd.description : data.type === "cli" ? data.cmd.description : data.shortcut.description;

  return (
    <motion.div
      ref={overlayRef}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: COLORS.overlay,
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          background: COLORS.surface,
          borderRadius: "16px",
          border: `1px solid ${accentColor}30`,
          width: "100%",
          maxWidth: "640px",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}15`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.bg} 100%)`,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
            }}
          />
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: accentColor + "18",
              color: accentColor,
              flexShrink: 0,
            }}
          >
            {data.type === "shortcut" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
              </svg>
            ) : (
              <TerminalIcon />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {title}
            <div
              style={{
                fontSize: "13px",
                color: COLORS.textSecondary,
                marginTop: "6px",
                fontFamily: FONT_SANS,
                lineHeight: 1.6,
              }}
            >
              {description}
            </div>
            {extraHeader}
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            style={{
              background: "none",
              border: "none",
              color: COLORS.textMuted,
              cursor: "pointer",
              padding: "4px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.15s, background 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLORS.text;
              e.currentTarget.style.background = COLORS.bg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLORS.textMuted;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Detail */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: COLORS.cyan,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontFamily: FONT_MONO,
              }}
            >
              <DetailInfoIcon />
              詳細説明
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: 1.8,
                color: COLORS.textSecondary,
                fontFamily: FONT_SANS,
              }}
            >
              {detail}
            </p>
          </div>

          {/* When to use */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: COLORS.orange,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontFamily: FONT_MONO,
              }}
            >
              <TimingIcon />
              使うタイミング
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: 1.8,
                color: COLORS.textSecondary,
                fontFamily: FONT_SANS,
              }}
            >
              {whenToUse}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Commands(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("essential");
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const lowerQuery = query.toLowerCase();

  const activeCategory = CATEGORIES.find((c) => c.id === activeTab);

  const filteredSlashCommands = useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.commands.filter(
      (cmd) =>
        !query ||
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery) ||
        (cmd.args && cmd.args.toLowerCase().includes(lowerQuery)) ||
        cmd.detail.toLowerCase().includes(lowerQuery) ||
        cmd.whenToUse.toLowerCase().includes(lowerQuery)
    );
  }, [activeCategory, query, lowerQuery]);

  const filteredCLICommands = useMemo(() => {
    return CLI_COMMANDS.filter(
      (cmd) =>
        !query ||
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery) ||
        cmd.detail.toLowerCase().includes(lowerQuery) ||
        cmd.whenToUse.toLowerCase().includes(lowerQuery)
    );
  }, [query, lowerQuery]);

  const filteredCLIFlags = useMemo(() => {
    return CLI_FLAGS.filter(
      (cmd) =>
        !query ||
        cmd.name.toLowerCase().includes(lowerQuery) ||
        cmd.description.toLowerCase().includes(lowerQuery) ||
        cmd.detail.toLowerCase().includes(lowerQuery) ||
        cmd.whenToUse.toLowerCase().includes(lowerQuery)
    );
  }, [query, lowerQuery]);

  const filteredShortcuts = useMemo(() => {
    return SHORTCUTS.filter(
      (s) =>
        !query ||
        s.key.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        s.detail.toLowerCase().includes(lowerQuery) ||
        s.whenToUse.toLowerCase().includes(lowerQuery)
    );
  }, [query, lowerQuery]);

  const isCLITab = activeTab === "cli";
  const isShortcutsTab = activeTab === "shortcuts";
  const isSlashTab = !isCLITab && !isShortcutsTab;

  const currentCount = isSlashTab
    ? filteredSlashCommands.length
    : isCLITab
      ? filteredCLICommands.length + filteredCLIFlags.length
      : filteredShortcuts.length;

  const openModal = useCallback((data: ModalData) => {
    setModalData(data);
  }, []);

  const closeModal = useCallback(() => {
    setModalData(null);
  }, []);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        fontFamily: FONT_SANS,
        color: COLORS.text,
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 16px" }}>
        {/* Header */}
        <motion.div
          initial={m ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            textAlign: "center",
            marginBottom: "28px",
            padding: "36px 24px",
            background: `linear-gradient(135deg, ${COLORS.surface} 0%, ${COLORS.bg} 100%)`,
            borderRadius: "16px",
            position: "relative",
            overflow: "hidden",
            border: `1px solid ${COLORS.border}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.08), transparent 60%), " +
                "radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.05), transparent 60%)",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: COLORS.textMuted,
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: "12px",
                fontFamily: FONT_MONO,
              }}
            >
              CLAUDE CODE
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                margin: "0 0 10px",
                color: COLORS.text,
                letterSpacing: "-0.5px",
              }}
            >
              コマンド一覧
            </h1>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "24px",
                fontSize: "13px",
                color: COLORS.textSecondary,
                flexWrap: "wrap",
              }}
            >
              <span>
                <strong style={{ color: COLORS.text }}>{TOTAL_SLASH}</strong> スラッシュコマンド
              </span>
              <span>
                <strong style={{ color: COLORS.text }}>{TOTAL_CLI}</strong> CLI オプション
              </span>
              <span>
                <strong style={{ color: COLORS.text }}>{SHORTCUTS.length}</strong> ショートカット
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "14px",
              }}
            >
              {[
                { to: "/", label: "リリースノート", icon: <ArrowLeftIcon />, trailing: false },
                { to: "/plugins", label: "公式プラグイン", icon: null, trailing: true },
                { to: "/directory", label: "ディレクトリ構成", icon: null, trailing: true },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    color: COLORS.textMuted,
                    textDecoration: "none",
                    fontSize: "12px",
                    fontFamily: FONT_SANS,
                    padding: "4px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${COLORS.border}`,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = COLORS.text;
                    e.currentTarget.style.borderColor = COLORS.accent + "60";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = COLORS.textMuted;
                    e.currentTarget.style.borderColor = COLORS.border;
                  }}
                >
                  {link.icon}
                  {link.label}
                  {link.trailing && " →"}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          ref={tabScrollRef}
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "20px",
            overflowX: "auto",
            paddingBottom: "4px",
            scrollbarWidth: "none",
          }}
        >
          {TAB_DEFS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setQuery("");
                }}
                style={{
                  flexShrink: 0,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: isActive ? `1px solid ${tab.color}40` : `1px solid transparent`,
                  background: isActive ? tab.color + "18" : "transparent",
                  color: isActive ? tab.color : COLORS.textMuted,
                  fontSize: "13px",
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: FONT_SANS,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = COLORS.surfaceHover;
                    e.currentTarget.style.color = COLORS.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = COLORS.textMuted;
                  }
                }}
              >
                {tab.type === "slash-category" && CATEGORY_ICONS[tab.id] && (
                  <span style={{ display: "flex", alignItems: "center", transform: "scale(0.8)" }}>
                    {CATEGORY_ICONS[tab.id]()}
                  </span>
                )}
                {tab.type === "cli" && (
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <TerminalIcon />
                  </span>
                )}
                {tab.type === "shortcuts" && (
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <InfoIcon />
                  </span>
                )}
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          style={{
            background: COLORS.surface,
            borderRadius: "10px",
            border: `1px solid ${searchFocused ? COLORS.accent : COLORS.border}`,
            boxShadow: searchFocused ? `0 0 0 3px ${COLORS.accentGlow}` : "none",
            padding: "2px 14px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          <SearchIcon />
          <input
            type="text"
            placeholder="コマンドを検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: "100%",
              padding: "11px 0",
              border: "none",
              background: "transparent",
              fontSize: "14px",
              color: COLORS.text,
              outline: "none",
              fontFamily: FONT_SANS,
            }}
          />
        </motion.div>

        {/* Count */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
            padding: "0 4px",
          }}
        >
          <span style={{ fontSize: "13px", color: COLORS.textMuted, fontWeight: 500 }}>
            {currentCount} 件表示中
          </span>
        </div>

        {/* Card grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "14px",
              }}
            >
              <AnimatePresence mode="popLayout">
                {isSlashTab && filteredSlashCommands.map((cmd, i) => (
                  <motion.div
                    key={cmd.name}
                    layout={!reducedMotion}
                    initial={reducedMotion ? false : hasMounted.current ? { opacity: 0 } : { opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2, delay: reducedMotion || hasMounted.current ? 0 : Math.min(i * 0.04, 0.4) }}
                  >
                    <CommandCard
                      cmd={cmd}
                      accentColor={CATEGORY_COLORS[activeTab]?.color || COLORS.accent}
                      categoryName={activeCategory?.name || ""}
                      onClick={() => openModal({
                        type: "command",
                        cmd,
                        categoryName: activeCategory?.name || "",
                        accentColor: CATEGORY_COLORS[activeTab]?.color || COLORS.accent,
                      })}
                    />
                  </motion.div>
                ))}

                {isCLITab && (
                  <>
                    {filteredCLICommands.map((cmd, i) => (
                      <motion.div
                        key={`cli-cmd-${cmd.name}`}
                        layout={!reducedMotion}
                        initial={reducedMotion ? false : hasMounted.current ? { opacity: 0 } : { opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.2, delay: reducedMotion || hasMounted.current ? 0 : Math.min(i * 0.04, 0.4) }}
                      >
                        <CLICard
                          cmd={cmd}
                          kind="command"
                          onClick={() => openModal({ type: "cli", cmd, kind: "command" })}
                        />
                      </motion.div>
                    ))}
                    {filteredCLIFlags.map((cmd, i) => (
                      <motion.div
                        key={`cli-flag-${cmd.name}`}
                        layout={!reducedMotion}
                        initial={reducedMotion ? false : hasMounted.current ? { opacity: 0 } : { opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.2, delay: reducedMotion || hasMounted.current ? 0 : Math.min((filteredCLICommands.length + i) * 0.04, 0.4) }}
                      >
                        <CLICard
                          cmd={cmd}
                          kind="flag"
                          onClick={() => openModal({ type: "cli", cmd, kind: "flag" })}
                        />
                      </motion.div>
                    ))}
                  </>
                )}

                {isShortcutsTab && filteredShortcuts.map((s, i) => (
                  <motion.div
                    key={s.key}
                    layout={!reducedMotion}
                    initial={reducedMotion ? false : hasMounted.current ? { opacity: 0 } : { opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.2, delay: reducedMotion || hasMounted.current ? 0 : Math.min(i * 0.04, 0.4) }}
                  >
                    <ShortcutCard
                      shortcut={s}
                      onClick={() => openModal({ type: "shortcut", shortcut: s })}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Empty state */}
            {currentCount === 0 && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  textAlign: "center",
                  padding: "64px 24px",
                  background: COLORS.surface,
                  borderRadius: "12px",
                  border: `1px solid ${COLORS.border}`,
                }}
              >
                <div style={{ marginBottom: "16px" }}>
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={COLORS.textMuted}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <p style={{ color: COLORS.textMuted, fontSize: "14px", margin: 0 }}>
                  条件に一致するコマンドはありません
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "24px",
            marginTop: "24px",
            color: COLORS.textMuted,
            fontSize: "12px",
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          Claude Code Release Notes Viewer
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalData && (
          <DetailModal
            data={modalData}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
