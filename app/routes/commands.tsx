import { useState, useMemo, useRef, useEffect } from "react";
import type { CSSProperties } from "react";
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
// Design tokens (shared with release-note)
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
} as const;

const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace" as const;
const FONT_SANS = "'IBM Plex Sans', 'Noto Sans JP', system-ui, -apple-system, sans-serif" as const;

// ---------------------------------------------------------------------------
// Category icons (inline SVG)
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
  terminal: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
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

function TerminalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s ease",
      }}
    >
      <polyline points="6 9 12 15 18 9" />
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

const ALL_COMMANDS = CATEGORIES.flatMap((c) => c.commands);
const TOTAL_SLASH = ALL_COMMANDS.length;
const TOTAL_CLI = CLI_COMMANDS.length + CLI_FLAGS.length;

// ---------------------------------------------------------------------------
// CommandRow
// ---------------------------------------------------------------------------

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

function CommandRow({
  cmd,
  isExpanded,
  onToggle,
  reducedMotion,
  accentColor = COLORS.green,
}: {
  cmd: Command | CLICommand;
  isExpanded: boolean;
  onToggle: () => void;
  reducedMotion: boolean | null;
  accentColor?: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        borderRadius: "8px",
        background: isExpanded ? COLORS.bg + "80" : "transparent",
        border: isExpanded ? `1px solid ${COLORS.border}60` : "1px solid transparent",
        transition: "all 0.2s",
        margin: "2px 0",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(160px, auto) 1fr auto",
          gap: "12px",
          padding: "10px 14px",
          borderRadius: "8px",
          background: hovered && !isExpanded ? COLORS.surfaceHover : "transparent",
          transition: "background 0.15s",
          alignItems: "baseline",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", minWidth: 0 }}>
          <code
            style={{
              fontFamily: FONT_MONO,
              fontSize: "13px",
              fontWeight: 600,
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
        <span
          style={{
            color: COLORS.textSecondary,
            fontSize: "13px",
            lineHeight: 1.6,
            fontFamily: FONT_SANS,
          }}
        >
          {cmd.description}
        </span>
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isExpanded ? accentColor : COLORS.textMuted,
            opacity: hovered || isExpanded ? 1 : 0.4,
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          <ChevronIcon isOpen={isExpanded} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "4px 14px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {/* 詳細説明 */}
              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: "8px",
                  padding: "12px 14px",
                  border: `1px solid ${COLORS.border}40`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
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
                    lineHeight: 1.75,
                    color: COLORS.textSecondary,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {cmd.detail}
                </p>
              </div>

              {/* 使うタイミング */}
              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: "8px",
                  padding: "12px 14px",
                  border: `1px solid ${COLORS.border}40`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
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
                    lineHeight: 1.75,
                    color: COLORS.textSecondary,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {cmd.whenToUse}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CategorySection
// ---------------------------------------------------------------------------

function CategorySection({
  category,
  isOpen,
  onToggle,
  reducedMotion,
  filteredCommands,
  expandedCommands,
  onToggleCommand,
}: {
  category: Category;
  isOpen: boolean;
  onToggle: () => void;
  reducedMotion: boolean | null;
  filteredCommands: Command[];
  expandedCommands: Set<string>;
  onToggleCommand: (name: string) => void;
}) {
  const IconComponent = CATEGORY_ICONS[category.id];

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: "12px",
        border: `1px solid ${isOpen ? COLORS.accent + "40" : COLORS.border}`,
        overflow: "hidden",
        boxShadow: isOpen
          ? `0 0 0 1px ${COLORS.accent}20, 0 8px 32px -8px rgba(0,0,0,0.4)`
          : "0 1px 3px rgba(0,0,0,0.2)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = COLORS.surfaceHover;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = "transparent";
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          cursor: "pointer",
          background: isOpen ? `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceHover})` : "transparent",
          borderBottom: isOpen ? `1px solid ${COLORS.border}` : "1px solid transparent",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isOpen ? COLORS.accentGlow : COLORS.bg,
              color: isOpen ? COLORS.accent : COLORS.textMuted,
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            {IconComponent && <IconComponent />}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: COLORS.text,
                  letterSpacing: "-0.2px",
                }}
              >
                {category.name}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: COLORS.textMuted,
                  fontFamily: FONT_MONO,
                  background: COLORS.bg,
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {filteredCommands.length}
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                color: COLORS.textMuted,
                fontFamily: FONT_SANS,
              }}
            >
              {category.description}
            </span>
          </div>
        </div>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isOpen ? COLORS.accent : COLORS.bg,
            color: isOpen ? "#fff" : COLORS.textMuted,
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          <ChevronIcon isOpen={isOpen} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "8px 6px 14px" }}>
              {filteredCommands.map((cmd) => (
                <CommandRow
                  key={cmd.name}
                  cmd={cmd}
                  isExpanded={expandedCommands.has(cmd.name)}
                  onToggle={() => onToggleCommand(cmd.name)}
                  reducedMotion={reducedMotion}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CLISection
// ---------------------------------------------------------------------------

function CLISection({
  isOpen,
  onToggle,
  reducedMotion,
  filteredCommands,
  filteredFlags,
  expandedCommands,
  onToggleCommand,
}: {
  isOpen: boolean;
  onToggle: () => void;
  reducedMotion: boolean | null;
  filteredCommands: CLICommand[];
  filteredFlags: CLICommand[];
  expandedCommands: Set<string>;
  onToggleCommand: (name: string) => void;
}) {
  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: "12px",
        border: `1px solid ${isOpen ? COLORS.purple + "40" : COLORS.border}`,
        overflow: "hidden",
        boxShadow: isOpen
          ? `0 0 0 1px ${COLORS.purple}20, 0 8px 32px -8px rgba(0,0,0,0.4)`
          : "0 1px 3px rgba(0,0,0,0.2)",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = COLORS.surfaceHover;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = "transparent";
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 18px",
          cursor: "pointer",
          background: isOpen ? `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceHover})` : "transparent",
          borderBottom: isOpen ? `1px solid ${COLORS.border}` : "1px solid transparent",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isOpen ? COLORS.purpleBg : COLORS.bg,
              color: isOpen ? COLORS.purple : COLORS.textMuted,
              transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            <TerminalIcon />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: COLORS.text,
                  letterSpacing: "-0.2px",
                }}
              >
                CLI コマンド & フラグ
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: COLORS.textMuted,
                  fontFamily: FONT_MONO,
                  background: COLORS.bg,
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {filteredCommands.length + filteredFlags.length}
              </span>
            </div>
            <span
              style={{
                fontSize: "12px",
                color: COLORS.textMuted,
                fontFamily: FONT_SANS,
              }}
            >
              ターミナルから直接実行するコマンドとオプション
            </span>
          </div>
        </div>
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isOpen ? COLORS.purple : COLORS.bg,
            color: isOpen ? "#fff" : COLORS.textMuted,
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          <ChevronIcon isOpen={isOpen} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: "8px 6px 14px" }}>
              {filteredCommands.length > 0 && (
                <>
                  <div
                    style={{
                      padding: "8px 14px 4px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: COLORS.textMuted,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontFamily: FONT_MONO,
                    }}
                  >
                    Commands
                  </div>
                  {filteredCommands.map((cmd) => (
                    <CommandRow
                      key={cmd.name}
                      cmd={cmd}
                      isExpanded={expandedCommands.has(cmd.name)}
                      onToggle={() => onToggleCommand(cmd.name)}
                      reducedMotion={reducedMotion}
                      accentColor={COLORS.purple}
                    />
                  ))}
                </>
              )}
              {filteredFlags.length > 0 && (
                <>
                  <div
                    style={{
                      padding: "16px 14px 4px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: COLORS.textMuted,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      fontFamily: FONT_MONO,
                      borderTop: filteredCommands.length > 0 ? `1px solid ${COLORS.border}40` : "none",
                      marginTop: filteredCommands.length > 0 ? "8px" : 0,
                    }}
                  >
                    Flags
                  </div>
                  {filteredFlags.map((cmd) => (
                    <CommandRow
                      key={cmd.name}
                      cmd={cmd}
                      isExpanded={expandedCommands.has(cmd.name)}
                      onToggle={() => onToggleCommand(cmd.name)}
                      reducedMotion={reducedMotion}
                      accentColor={COLORS.purple}
                    />
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ShortcutsSection
// ---------------------------------------------------------------------------

function ShortcutRow({
  shortcut,
  isExpanded,
  onToggle,
  reducedMotion,
}: {
  shortcut: Shortcut;
  isExpanded: boolean;
  onToggle: () => void;
  reducedMotion: boolean | null;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        borderRadius: "8px",
        background: isExpanded ? COLORS.bg + "80" : "transparent",
        border: isExpanded ? `1px solid ${COLORS.border}60` : "1px solid transparent",
        transition: "all 0.2s",
        margin: "2px 0",
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(160px, auto) 1fr auto",
          gap: "12px",
          padding: "10px 14px",
          borderRadius: "8px",
          background: hovered && !isExpanded ? COLORS.surfaceHover : "transparent",
          transition: "background 0.15s",
          alignItems: "baseline",
          cursor: "pointer",
        }}
      >
        <kbd
          style={{
            fontFamily: FONT_MONO,
            fontSize: "12px",
            fontWeight: 600,
            color: COLORS.orange,
            background: COLORS.orangeBg,
            padding: "3px 10px",
            borderRadius: "6px",
            border: `1px solid ${COLORS.orange}30`,
            display: "inline-block",
            whiteSpace: "nowrap",
            width: "fit-content",
          }}
        >
          {shortcut.key}
        </kbd>
        <span
          style={{
            color: COLORS.textSecondary,
            fontSize: "13px",
            lineHeight: 1.6,
            fontFamily: FONT_SANS,
          }}
        >
          {shortcut.description}
        </span>
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isExpanded ? COLORS.orange : COLORS.textMuted,
            opacity: hovered || isExpanded ? 1 : 0.4,
            transition: "all 0.15s",
            flexShrink: 0,
          }}
        >
          <ChevronIcon isOpen={isExpanded} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                padding: "4px 14px 14px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: "8px",
                  padding: "12px 14px",
                  border: `1px solid ${COLORS.border}40`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
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
                    lineHeight: 1.75,
                    color: COLORS.textSecondary,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {shortcut.detail}
                </p>
              </div>

              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: "8px",
                  padding: "12px 14px",
                  border: `1px solid ${COLORS.border}40`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
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
                    lineHeight: 1.75,
                    color: COLORS.textSecondary,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {shortcut.whenToUse}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ShortcutsSection({
  shortcuts,
  reducedMotion,
  expandedCommands,
  onToggleCommand,
}: {
  shortcuts: Shortcut[];
  reducedMotion: boolean | null;
  expandedCommands: Set<string>;
  onToggleCommand: (key: string) => void;
}) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        background: COLORS.surface,
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "8px 6px 14px" }}>
        {shortcuts.map((s) => (
          <ShortcutRow
            key={s.key}
            shortcut={s}
            isExpanded={expandedCommands.has(s.key)}
            onToggle={() => onToggleCommand(s.key)}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Tab button
// ---------------------------------------------------------------------------

function TabButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: 600,
        cursor: "pointer",
        border: `1px solid ${active ? COLORS.accent + "60" : COLORS.border}`,
        background: active ? COLORS.accentGlow : "transparent",
        color: active ? COLORS.accent : COLORS.textMuted,
        transition: "all 0.15s",
        fontFamily: FONT_SANS,
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}
    >
      {children}
      <span
        style={{
          fontSize: "11px",
          fontFamily: FONT_MONO,
          opacity: 0.7,
        }}
      >
        {count}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Commands(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [expandedCommands, setExpandedCommands] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"slash" | "cli" | "shortcuts">("slash");
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const lowerQuery = query.toLowerCase();

  const filteredCategories = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      ...cat,
      commands: cat.commands.filter(
        (cmd) =>
          !query ||
          cmd.name.toLowerCase().includes(lowerQuery) ||
          cmd.description.toLowerCase().includes(lowerQuery) ||
          (cmd.args && cmd.args.toLowerCase().includes(lowerQuery)) ||
          cmd.detail.toLowerCase().includes(lowerQuery) ||
          cmd.whenToUse.toLowerCase().includes(lowerQuery)
      ),
    })).filter((cat) => cat.commands.length > 0);
  }, [query, lowerQuery]);

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

  const totalFiltered =
    tab === "slash"
      ? filteredCategories.reduce((sum, c) => sum + c.commands.length, 0)
      : tab === "cli"
        ? filteredCLICommands.length + filteredCLIFlags.length
        : filteredShortcuts.length;

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleCommand(name: string) {
    setExpandedCommands((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function toggleAll() {
    if (tab === "slash") {
      const allIds = filteredCategories.map((c) => c.id);
      const allOpen = allIds.every((id) => openSections.has(id));
      if (allOpen) {
        setOpenSections(new Set());
      } else {
        setOpenSections(new Set([...openSections, ...allIds]));
      }
    } else {
      if (openSections.has("cli")) {
        setOpenSections((prev) => {
          const next = new Set(prev);
          next.delete("cli");
          return next;
        });
      } else {
        setOpenSections((prev) => new Set([...prev, "cli"]));
      }
    }
  }

  // Auto-expand all when searching
  useEffect(() => {
    if (query) {
      if (tab === "slash") {
        setOpenSections(new Set(filteredCategories.map((c) => c.id)));
      } else if (tab === "cli") {
        setOpenSections((prev) => new Set([...prev, "cli"]));
      }
    }
  }, [query, tab, filteredCategories]);

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
      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "32px 16px" }}>
        {/* Header */}
        <motion.div
          initial={m ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            textAlign: "center",
            marginBottom: "32px",
            padding: "40px 24px",
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
                fontSize: "32px",
                fontWeight: 700,
                margin: "0 0 12px",
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
            {/* Nav links */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <Link
                to="/"
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
                <ArrowLeftIcon />
                リリースノート
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: COLORS.surface,
            borderRadius: "10px",
            border: `1px solid ${searchFocused ? COLORS.accent : COLORS.border}`,
            boxShadow: searchFocused ? `0 0 0 3px ${COLORS.accentGlow}` : "none",
            padding: "2px 14px",
            marginBottom: "14px",
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

        {/* Tabs */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "14px",
          }}
        >
          <TabButton active={tab === "slash"} onClick={() => setTab("slash")} count={TOTAL_SLASH}>
            スラッシュコマンド
          </TabButton>
          <TabButton active={tab === "cli"} onClick={() => setTab("cli")} count={TOTAL_CLI}>
            CLI
          </TabButton>
          <TabButton active={tab === "shortcuts"} onClick={() => setTab("shortcuts")} count={SHORTCUTS.length}>
            ショートカット
          </TabButton>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px",
            padding: "0 4px",
          }}
        >
          <span style={{ fontSize: "13px", color: COLORS.textMuted, fontWeight: 500 }}>
            {totalFiltered} 件表示中
          </span>
          {tab !== "shortcuts" && (
            <button
              onClick={toggleAll}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: `1px solid ${COLORS.border}`,
                background: COLORS.surface,
                color: COLORS.textSecondary,
                fontFamily: FONT_SANS,
              }}
            >
              {tab === "slash"
                ? filteredCategories.every((c) => openSections.has(c.id))
                  ? "すべて閉じる"
                  : "すべて開く"
                : openSections.has("cli")
                  ? "閉じる"
                  : "開く"}
            </button>
          )}
        </motion.div>

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <AnimatePresence mode="popLayout">
            {tab === "slash" ? (
              filteredCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  layout={!reducedMotion}
                  initial={m ? false : hasMounted.current ? { opacity: 0 } : { opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={m ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.25,
                    delay: reducedMotion || hasMounted.current ? 0 : Math.min(i * 0.06, 0.6),
                  }}
                >
                  <CategorySection
                    category={cat}
                    isOpen={openSections.has(cat.id)}
                    onToggle={() => toggleSection(cat.id)}
                    reducedMotion={reducedMotion}
                    filteredCommands={cat.commands}
                    expandedCommands={expandedCommands}
                    onToggleCommand={toggleCommand}
                  />
                </motion.div>
              ))
            ) : tab === "cli" ? (
              <motion.div
                key="cli"
                layout={!reducedMotion}
                initial={m ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={m ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25 }}
              >
                <CLISection
                  isOpen={openSections.has("cli")}
                  onToggle={() => toggleSection("cli")}
                  reducedMotion={reducedMotion}
                  filteredCommands={filteredCLICommands}
                  filteredFlags={filteredCLIFlags}
                  expandedCommands={expandedCommands}
                  onToggleCommand={toggleCommand}
                />
              </motion.div>
            ) : (
              <ShortcutsSection
                key="shortcuts"
                shortcuts={filteredShortcuts}
                reducedMotion={reducedMotion}
                expandedCommands={expandedCommands}
                onToggleCommand={toggleCommand}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        <AnimatePresence>
          {totalFiltered === 0 && (
            <motion.div
              initial={m ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={m ? undefined : { opacity: 0, scale: 0.95 }}
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
    </div>
  );
}
