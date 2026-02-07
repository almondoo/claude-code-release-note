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
// Category colors (raw hex values, used dynamically via inline style)
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  essential: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  session: { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  config: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  memory: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
  integration: { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  agent: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
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
    color: CATEGORY_COLORS[c.id]?.color || "#3B82F6",
    type: "slash-category" as const,
  })),
  { id: "cli", label: "CLI", color: "#C4B5FD", type: "cli" },
  { id: "shortcuts", label: "ショートカット", color: "#FDBA74", type: "shortcuts" },
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
      className="bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer transition-all relative overflow-hidden hover:-translate-y-0.5 hover:bg-surface-hover"
      style={{ padding: "18px 20px" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor + "60";
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${accentColor}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` }}
      />
      <div className="flex items-baseline gap-2">
        <code
          className="font-mono text-sm font-bold whitespace-nowrap"
          style={{ color: accentColor }}
        >
          {cmd.name}
        </code>
        {cmd.args && (
          <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
            {cmd.args}
          </span>
        )}
      </div>
      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {cmd.description}
      </p>
      <span
        className="text-[10px] font-semibold rounded self-start whitespace-nowrap"
        style={{
          padding: "2px 8px",
          background: accentColor + "18",
          color: accentColor,
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
      className="bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer transition-all relative overflow-hidden hover:-translate-y-0.5 hover:bg-surface-hover"
      style={{ padding: "18px 20px" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#C4B5FD60";
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px #C4B5FD20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, #C4B5FD, #C4B5FD40)` }}
      />
      <div className="flex items-baseline gap-2">
        <code className="font-mono text-sm font-bold whitespace-nowrap text-purple-300">
          {cmd.name}
        </code>
        {cmd.args && (
          <span className="text-[11px] text-slate-500 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
            {cmd.args}
          </span>
        )}
      </div>
      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
        {cmd.description}
      </p>
      <span className="text-[10px] font-semibold rounded self-start whitespace-nowrap" style={{ padding: "2px 8px", background: "rgba(139, 92, 246, 0.15)", color: "#C4B5FD" }}>
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
      className="bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer transition-all relative overflow-hidden hover:-translate-y-0.5 hover:bg-surface-hover"
      style={{ padding: "18px 20px" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#FDBA7460";
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px #FDBA7420`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, #FDBA74, #FDBA7440)` }}
      />
      <kbd
        className="font-mono text-[13px] font-semibold inline-block whitespace-nowrap w-fit"
        style={{
          color: "#FDBA74",
          background: "rgba(249, 115, 22, 0.15)",
          padding: "4px 12px",
          borderRadius: "6px",
          border: "1px solid #FDBA7430",
        }}
      >
        {shortcut.key}
      </kbd>
      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
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
      <div className="flex items-baseline gap-2 flex-wrap">
        <code className="font-mono text-base font-bold" style={{ color: accentColor }}>{data.cmd.name}</code>
        {data.cmd.args && (
          <span className="text-xs text-slate-500 font-mono">{data.cmd.args}</span>
        )}
      </div>
    );
    extraHeader = (
      <div className="flex gap-1.5 mt-2 flex-wrap">
        <span
          className="text-[10px] font-semibold rounded"
          style={{
            padding: "2px 8px",
            background: accentColor + "18",
            color: accentColor,
          }}
        >
          {data.categoryName}
        </span>
        <span
          className="text-[10px] font-semibold rounded"
          style={{
            padding: "2px 8px",
            background: "rgba(16, 185, 129, 0.15)",
            color: "#6EE7B7",
          }}
        >
          スラッシュコマンド
        </span>
      </div>
    );
  } else if (data.type === "cli") {
    accentColor = "#C4B5FD";
    detail = data.cmd.detail;
    whenToUse = data.cmd.whenToUse;
    title = (
      <div className="flex items-baseline gap-2 flex-wrap">
        <code className="font-mono text-base font-bold" style={{ color: accentColor }}>{data.cmd.name}</code>
        {data.cmd.args && (
          <span className="text-xs text-slate-500 font-mono">{data.cmd.args}</span>
        )}
      </div>
    );
    extraHeader = (
      <div className="flex gap-1.5 mt-2">
        <span
          className="text-[10px] font-semibold rounded"
          style={{
            padding: "2px 8px",
            background: "rgba(139, 92, 246, 0.15)",
            color: "#C4B5FD",
          }}
        >
          CLI {data.kind === "command" ? "Command" : "Flag"}
        </span>
      </div>
    );
  } else {
    accentColor = "#FDBA74";
    detail = data.shortcut.detail;
    whenToUse = data.shortcut.whenToUse;
    title = (
      <kbd
        className="font-mono text-sm font-semibold"
        style={{
          color: "#FDBA74",
          background: "rgba(249, 115, 22, 0.15)",
          padding: "4px 14px",
          borderRadius: "6px",
          border: "1px solid #FDBA7430",
        }}
      >
        {data.shortcut.key}
      </kbd>
    );
    extraHeader = (
      <div className="flex gap-1.5 mt-2">
        <span
          className="text-[10px] font-semibold rounded"
          style={{
            padding: "2px 8px",
            background: "rgba(249, 115, 22, 0.15)",
            color: "#FDBA74",
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
      className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[4px] flex items-center justify-center p-6"
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-surface rounded-2xl w-full max-w-[640px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}15`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-start gap-3.5 relative border-b border-slate-700"
          style={{
            padding: "20px 24px",
            background: `linear-gradient(135deg, #1E293B 0%, #0F172A 100%)`,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` }}
          />
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              background: accentColor + "18",
              color: accentColor,
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
          <div className="flex-1 min-w-0">
            {title}
            <div className="text-[13px] text-slate-400 mt-1.5 font-sans leading-[1.6]">
              {description}
            </div>
            {extraHeader}
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="bg-transparent border-none text-slate-500 cursor-pointer p-1 rounded-md flex items-center justify-center transition-colors shrink-0 hover:text-slate-100 hover:bg-slate-900"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          {/* Detail */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-bold tracking-wide uppercase font-mono">
              <DetailInfoIcon />
              詳細説明
            </div>
            <p className="m-0 text-[13px] leading-[1.8] text-slate-400 font-sans">
              {detail}
            </p>
          </div>

          {/* When to use */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-1.5 text-orange-300 text-[11px] font-bold tracking-wide uppercase font-mono">
              <TimingIcon />
              使うタイミング
            </div>
            <p className="m-0 text-[13px] leading-[1.8] text-slate-400 font-sans">
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
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={m ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-7 relative overflow-hidden rounded-2xl border border-slate-700"
          style={{
            padding: "36px 24px",
            background: `linear-gradient(135deg, #1E293B 0%, #0F172A 100%)`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.08), transparent 60%), " +
                "radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.05), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="text-xs font-semibold text-slate-500 tracking-[3px] uppercase mb-3 font-mono">
              CLAUDE CODE
            </div>
            <h1 className="text-[28px] font-bold m-0 mb-2.5 text-slate-100 tracking-tight">
              コマンド一覧
            </h1>
            <div className="flex justify-center gap-6 text-[13px] text-slate-400 flex-wrap">
              <span>
                <strong className="text-slate-100">{TOTAL_SLASH}</strong> スラッシュコマンド
              </span>
              <span>
                <strong className="text-slate-100">{TOTAL_CLI}</strong> CLI オプション
              </span>
              <span>
                <strong className="text-slate-100">{SHORTCUTS.length}</strong> ショートカット
              </span>
            </div>
            <div className="flex justify-center gap-3 mt-3.5">
              {[
                { to: "/", label: "リリースノート", icon: <ArrowLeftIcon />, trailing: false },
                { to: "/plugins", label: "公式プラグイン", icon: null, trailing: true },
                { to: "/directory", label: "ディレクトリ構成", icon: null, trailing: true },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="inline-flex items-center gap-1.5 text-slate-500 no-underline text-xs font-sans border border-slate-700 transition-all hover:text-slate-100 hover:border-blue-500/60"
                  style={{ padding: "4px 12px", borderRadius: "6px" }}
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
          className="flex gap-1 mb-5 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
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
                className="shrink-0 rounded-[10px] text-[13px] font-sans cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5"
                style={{
                  padding: "10px 16px",
                  border: isActive ? `1px solid ${tab.color}40` : `1px solid transparent`,
                  background: isActive ? tab.color + "18" : "transparent",
                  color: isActive ? tab.color : "#64748B",
                  fontWeight: isActive ? 600 : 500,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "#263548";
                    e.currentTarget.style.color = "#F1F5F9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#64748B";
                  }
                }}
              >
                {tab.type === "slash-category" && CATEGORY_ICONS[tab.id] && (
                  <span className="flex items-center scale-[0.8]">
                    {CATEGORY_ICONS[tab.id]()}
                  </span>
                )}
                {tab.type === "cli" && (
                  <span className="flex items-center">
                    <TerminalIcon />
                  </span>
                )}
                {tab.type === "shortcuts" && (
                  <span className="flex items-center">
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
          className="bg-surface rounded-[10px] mb-4 flex items-center gap-2.5 transition-all"
          style={{
            border: `1px solid ${searchFocused ? "#3B82F6" : "#334155"}`,
            boxShadow: searchFocused ? "0 0 0 3px rgba(59, 130, 246, 0.25)" : "none",
            padding: "2px 14px",
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
            className="w-full border-none bg-transparent text-sm text-slate-100 outline-none font-sans"
            style={{ padding: "11px 0" }}
          />
        </motion.div>

        {/* Count */}
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[13px] text-slate-500 font-medium">
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
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
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
                      accentColor={CATEGORY_COLORS[activeTab]?.color || "#3B82F6"}
                      categoryName={activeCategory?.name || ""}
                      onClick={() => openModal({
                        type: "command",
                        cmd,
                        categoryName: activeCategory?.name || "",
                        accentColor: CATEGORY_COLORS[activeTab]?.color || "#3B82F6",
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
                className="text-center bg-surface rounded-xl border border-slate-700"
                style={{ padding: "64px 24px" }}
              >
                <div className="mb-4">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-slate-500"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm m-0">
                  条件に一致するコマンドはありません
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center p-6 mt-6 text-slate-500 text-xs border-t border-slate-700">
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
