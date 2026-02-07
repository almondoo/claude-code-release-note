import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import pluginsData from "~/data/plugins.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Plugin {
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

interface Category {
  id: string;
  name: string;
  description: string;
  plugins: Plugin[];
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
  teal: "#5EEAD4",
  tealBg: "rgba(20, 184, 166, 0.15)",
  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace" as const;
const FONT_SANS = "'IBM Plex Sans', 'Noto Sans JP', system-ui, -apple-system, sans-serif" as const;

// ---------------------------------------------------------------------------
// Category colors & icons
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  "code-intelligence": { color: COLORS.cyan, bg: COLORS.cyanBg },
  "dev-tools": { color: COLORS.purple, bg: COLORS.purpleBg },
  "code-review-git": { color: COLORS.green, bg: COLORS.greenBg },
  "external-integrations": { color: COLORS.teal, bg: COLORS.tealBg },
  "output-styles": { color: COLORS.orange, bg: COLORS.orangeBg },
  "community": { color: "#F472B6", bg: "rgba(244, 114, 182, 0.15)" },
};

const CATEGORY_ICONS: Record<string, () => React.JSX.Element> = {
  "code-intelligence": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  "dev-tools": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  "code-review-git": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  "external-integrations": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  "output-styles": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  "community": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

function SetupIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code 公式プラグイン一覧" },
    { name: "description", content: "Claude Code の公式プラグインの詳細と使い方" },
  ];
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const CATEGORIES: Category[] = pluginsData.categories;
const ALL_PLUGINS = CATEGORIES.flatMap((c) => c.plugins);
const TOTAL = ALL_PLUGINS.length;

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

interface TabDef {
  id: string;
  label: string;
  color: string;
  type: "category" | "quickstart";
}

const TAB_DEFS: TabDef[] = [
  ...CATEGORIES.map((c) => ({
    id: c.id,
    label: c.name,
    color: CATEGORY_COLORS[c.id]?.color || COLORS.accent,
    type: "category" as const,
  })),
  { id: "quickstart", label: "クイックスタート", color: COLORS.teal, type: "quickstart" },
];

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleCopy();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        borderRadius: "4px",
        border: `1px solid ${copied ? COLORS.green + "40" : COLORS.border}`,
        background: copied ? COLORS.greenBg : COLORS.bg,
        color: copied ? COLORS.green : COLORS.textMuted,
        fontSize: "11px",
        fontFamily: FONT_MONO,
        cursor: "pointer",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// PluginCard
// ---------------------------------------------------------------------------

function PluginCard({
  plugin,
  accentColor,
  onClick,
}: {
  plugin: Plugin;
  accentColor: string;
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
          {plugin.displayName}
        </code>
        {plugin.binary && (
          <span
            style={{
              fontSize: "10px",
              color: COLORS.textMuted,
              fontFamily: FONT_MONO,
              background: COLORS.bg,
              padding: "1px 6px",
              borderRadius: "3px",
              whiteSpace: "nowrap",
            }}
          >
            LSP
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
        {plugin.description}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "auto" }}>
        <code
          style={{
            fontFamily: FONT_MONO,
            fontSize: "10px",
            color: COLORS.textMuted,
            background: COLORS.bg,
            padding: "2px 8px",
            borderRadius: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {plugin.install}
        </code>
        <CopyButton text={plugin.install} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetailModal
// ---------------------------------------------------------------------------

function DetailModal({
  plugin,
  accentColor,
  onClose,
  reducedMotion,
}: {
  plugin: Plugin;
  accentColor: string;
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <code
              style={{
                fontFamily: FONT_MONO,
                fontSize: "16px",
                fontWeight: 700,
                color: accentColor,
                wordBreak: "break-all",
              }}
            >
              {plugin.displayName}
            </code>
            <div
              style={{
                fontSize: "13px",
                color: COLORS.textSecondary,
                marginTop: "6px",
                fontFamily: FONT_SANS,
                lineHeight: 1.6,
              }}
            >
              {plugin.description}
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
              {plugin.binary && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: COLORS.cyanBg,
                    color: COLORS.cyan,
                  }}
                >
                  LSP: {plugin.binary}
                </span>
              )}
              {plugin.homepage && (
                <a
                  href={plugin.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: COLORS.bg,
                    color: COLORS.textMuted,
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.text; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textMuted; }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                  <ExternalLinkIcon />
                </a>
              )}
            </div>
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
          {/* Install */}
          <div
            style={{
              background: COLORS.bg,
              borderRadius: "8px",
              padding: "10px 14px",
              border: `1px solid ${accentColor}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
              <DownloadIcon />
              <code
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: "12px",
                  color: accentColor,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {plugin.install}
              </code>
            </div>
            <CopyButton text={plugin.install} />
          </div>

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
              {plugin.detail}
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
              {plugin.whenToUse}
            </p>
          </div>

          {/* Setup */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: COLORS.teal,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontFamily: FONT_MONO,
              }}
            >
              <SetupIcon />
              セットアップ
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
              {plugin.setup}
            </p>
            {plugin.binary && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span style={{ fontSize: "11px", color: COLORS.textMuted, fontFamily: FONT_SANS }}>必要なバイナリ:</span>
                <code
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: "11px",
                    color: COLORS.cyan,
                    background: COLORS.cyanBg,
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {plugin.binary}
                </code>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// QuickStartPanel
// ---------------------------------------------------------------------------

function QuickStartPanel() {
  const steps = [
    {
      title: "ブラウズ",
      cmd: "/plugin",
      desc: "Discover タブで利用可能なプラグインを閲覧",
    },
    {
      title: "インストール",
      cmd: "/plugin install <name>@claude-plugins-official",
      desc: "プラグインをインストール（user / project / local スコープ選択可）",
    },
    {
      title: "管理",
      cmd: "/plugin",
      desc: "Installed タブでプラグインの有効化・無効化・削除",
    },
  ];

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        padding: "24px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: COLORS.teal,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          fontFamily: FONT_MONO,
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        クイックスタート
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: COLORS.tealBg,
                color: COLORS.teal,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: 700,
                fontFamily: FONT_MONO,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: COLORS.text }}>{step.title}</span>
                <code
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: "11px",
                    color: COLORS.teal,
                    background: COLORS.tealBg,
                    padding: "1px 6px",
                    borderRadius: "3px",
                  }}
                >
                  {step.cmd}
                </code>
              </div>
              <span style={{ fontSize: "13px", color: COLORS.textSecondary, fontFamily: FONT_SANS, lineHeight: 1.6 }}>
                {step.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Plugins(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(CATEGORIES[0]?.id || "");
  const [selectedPlugin, setSelectedPlugin] = useState<{ plugin: Plugin; accentColor: string } | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const lowerQuery = query.toLowerCase();

  const activeCategory = CATEGORIES.find((c) => c.id === activeTab);
  const isQuickStart = activeTab === "quickstart";

  const filteredPlugins = useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.plugins.filter(
      (p) =>
        !query ||
        p.name.toLowerCase().includes(lowerQuery) ||
        p.displayName.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.detail.toLowerCase().includes(lowerQuery) ||
        p.whenToUse.toLowerCase().includes(lowerQuery) ||
        (p.binary && p.binary.toLowerCase().includes(lowerQuery))
    );
  }, [activeCategory, query, lowerQuery]);

  const openModal = useCallback((plugin: Plugin, accentColor: string) => {
    setSelectedPlugin({ plugin, accentColor });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPlugin(null);
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
                "radial-gradient(ellipse at 30% 20%, rgba(6,182,212,0.08), transparent 60%), " +
                "radial-gradient(ellipse at 70% 80%, rgba(16,185,129,0.05), transparent 60%)",
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
              公式プラグイン
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: COLORS.textSecondary,
                margin: "0 0 14px",
                maxWidth: "520px",
                marginLeft: "auto",
                marginRight: "auto",
                lineHeight: 1.7,
              }}
            >
              Anthropic が公式マーケットプレイスで提供するプラグイン。
              コードインテリジェンス、外部サービス連携、開発ワークフローを拡張します。
            </p>
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
                <strong style={{ color: COLORS.text }}>{TOTAL}</strong> プラグイン
              </span>
              <span>
                <strong style={{ color: COLORS.text }}>{CATEGORIES.length}</strong> カテゴリ
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
                { to: "/commands", label: "コマンド一覧", icon: null, trailing: true },
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
                {tab.type === "category" && CATEGORY_ICONS[tab.id] && (
                  <span style={{ display: "flex", alignItems: "center", transform: "scale(0.8)" }}>
                    {CATEGORY_ICONS[tab.id]()}
                  </span>
                )}
                {tab.type === "quickstart" && (
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </span>
                )}
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Search — only for category tabs */}
        {!isQuickStart && (
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
              placeholder="プラグインを検索..."
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
        )}

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {isQuickStart ? (
            <motion.div
              key="quickstart"
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <QuickStartPanel />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
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
                  {filteredPlugins.length} 件表示中
                </span>
              </div>

              {/* Card grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "14px",
                }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredPlugins.map((plugin, i) => (
                    <motion.div
                      key={plugin.name}
                      layout={!reducedMotion}
                      initial={reducedMotion ? false : hasMounted.current ? { opacity: 0 } : { opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.2, delay: reducedMotion || hasMounted.current ? 0 : Math.min(i * 0.04, 0.4) }}
                    >
                      <PluginCard
                        plugin={plugin}
                        accentColor={CATEGORY_COLORS[activeTab]?.color || COLORS.accent}
                        onClick={() => openModal(plugin, CATEGORY_COLORS[activeTab]?.color || COLORS.accent)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty state */}
              {filteredPlugins.length === 0 && (
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
                    条件に一致するプラグインはありません
                  </p>
                </motion.div>
              )}
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
            fontFamily: FONT_SANS,
          }}
        >
          <p style={{ margin: "0 0 4px" }}>
            <a
              href="https://github.com/anthropics/claude-plugins-official"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.accent, textDecoration: "none" }}
            >
              公式プラグインリポジトリ
            </a>
            {" | "}
            <a
              href="https://code.claude.com/docs/en/discover-plugins"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.accent, textDecoration: "none" }}
            >
              プラグインドキュメント
            </a>
          </p>
          <p style={{ margin: 0, color: COLORS.textMuted + "80" }}>
            /plugin コマンドから最新のプラグイン一覧を確認できます
          </p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPlugin && (
          <DetailModal
            plugin={selectedPlugin.plugin}
            accentColor={selectedPlugin.accentColor}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
