import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import directoryData from "~/data/directory-structure.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Entry {
  path: string;
  type: "file" | "directory";
  name: string;
  description: string;
  detail: string;
  usage: string;
  vcs: boolean | null;
  recommended: "recommended" | "optional" | "advanced";
}

interface Section {
  id: string;
  name: string;
  basePath: string;
  description: string;
  entries: Entry[];
  bestPractices: string[];
}

interface PrecedenceItem {
  level: number;
  name: string;
  description: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const COLORS = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceHover: "#263548",
  surfaceActive: "#2D3F56",
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
  yellow: "#FDE68A",
  yellowBg: "rgba(234, 179, 8, 0.15)",
  red: "#FCA5A5",
  redBg: "rgba(239, 68, 68, 0.15)",
  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace" as const;
const FONT_SANS =
  "'IBM Plex Sans', 'Noto Sans JP', system-ui, -apple-system, sans-serif" as const;

// ---------------------------------------------------------------------------
// Section colors & icons
// ---------------------------------------------------------------------------

const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  global: { color: COLORS.purple, bg: COLORS.purpleBg },
  "project-root": { color: COLORS.green, bg: COLORS.greenBg },
  "project-claude": { color: COLORS.cyan, bg: COLORS.cyanBg },
  home: { color: COLORS.orange, bg: COLORS.orangeBg },
  managed: { color: COLORS.red, bg: COLORS.redBg },
};

const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  global: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  "project-root": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  "project-claude": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  home: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  managed: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Recommend / VCS badge colors
// ---------------------------------------------------------------------------

const RECOMMEND_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  recommended: { label: "推奨", color: COLORS.green, bg: COLORS.greenBg },
  optional: { label: "任意", color: COLORS.textMuted, bg: "rgba(100,116,139,0.15)" },
  advanced: { label: "上級", color: COLORS.purple, bg: COLORS.purpleBg },
};

const VCS_CONFIG = {
  true: { label: "VCS ○", color: COLORS.green, bg: COLORS.greenBg },
  false: { label: "VCS ×", color: COLORS.textMuted, bg: "rgba(100,116,139,0.15)" },
  null: { label: "OS 管理", color: COLORS.orange, bg: COLORS.orangeBg },
};

// ---------------------------------------------------------------------------
// SVG Icons
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

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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

function LightbulbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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
    { title: "Claude Code ディレクトリ構成ガイド" },
    { name: "description", content: "Claude Code の設定ファイル・ディレクトリ構成のベストプラクティスガイド" },
  ];
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const SECTIONS: Section[] = directoryData.sections as unknown as Section[];
const PRECEDENCE: PrecedenceItem[] = directoryData.precedence as PrecedenceItem[];
const COMMIT_GUIDE = directoryData.commitGuide;
const SKILLS_VS_AGENTS = directoryData.skillsVsAgents;

const ALL_ENTRIES = SECTIONS.flatMap((s) => s.entries);
const TOTAL = ALL_ENTRIES.length;

const PRECEDENCE_COLORS: Record<string, { color: string; bg: string }> = {
  red: { color: COLORS.red, bg: COLORS.redBg },
  orange: { color: COLORS.orange, bg: COLORS.orangeBg },
  yellow: { color: COLORS.yellow, bg: COLORS.yellowBg },
  green: { color: COLORS.green, bg: COLORS.greenBg },
  blue: { color: COLORS.accent, bg: COLORS.accentGlow },
};

// Tab IDs: section tabs + special info tabs
const SPECIAL_TABS = ["precedence", "commit-guide", "skills-agents"] as const;

// ---------------------------------------------------------------------------
// EntryCard — compact grid card
// ---------------------------------------------------------------------------

function EntryCard({
  entry,
  accentColor,
  onClick,
}: {
  entry: Entry;
  accentColor: string;
  onClick: () => void;
}) {
  const recommendCfg = RECOMMEND_CONFIG[entry.recommended];
  const vcsCfg = VCS_CONFIG[entry.vcs === null ? "null" : (String(entry.vcs) as "true" | "false")];

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
      {/* Top accent line */}
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

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: accentColor, flexShrink: 0, display: "flex", alignItems: "center" }}>
          {entry.type === "directory" ? <FolderIcon /> : <FileIcon />}
        </span>
        <code
          style={{
            fontFamily: FONT_MONO,
            fontSize: "13px",
            fontWeight: 700,
            color: accentColor,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {entry.path}
        </code>
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: COLORS.text,
          fontFamily: FONT_SANS,
          lineHeight: 1.4,
        }}
      >
        {entry.name}
      </div>

      {/* Description */}
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
        {entry.description}
      </p>

      {/* Badges */}
      <div style={{ display: "flex", gap: "6px", marginTop: "auto", flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "4px",
            background: recommendCfg.bg,
            color: recommendCfg.color,
            whiteSpace: "nowrap",
          }}
        >
          {recommendCfg.label}
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "4px",
            background: vcsCfg.bg,
            color: vcsCfg.color,
            whiteSpace: "nowrap",
          }}
        >
          {vcsCfg.label}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Modal — detail popup
// ---------------------------------------------------------------------------

function DetailModal({
  entry,
  section,
  accentColor,
  onClose,
  reducedMotion,
}: {
  entry: Entry;
  section: Section;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const recommendCfg = RECOMMEND_CONFIG[entry.recommended];
  const vcsCfg = VCS_CONFIG[entry.vcs === null ? "null" : (String(entry.vcs) as "true" | "false")];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const fullPath = section.basePath + entry.path;
  const detailParagraphs = entry.detail.split("\n\n").filter(Boolean);
  const usageParagraphs = entry.usage ? entry.usage.split("\n\n").filter(Boolean) : [];

  const sectionLabel = (id: string): string => {
    switch (id) {
      case "detail": return "詳細";
      case "usage": return "使い方";
      case "location": return "配置場所";
      case "bestPractices": return "ベストプラクティス";
      default: return "";
    }
  };
  const sectionIcon = (id: string) => {
    switch (id) {
      case "detail": return <BookOpenIcon />;
      case "usage": return <TerminalIcon />;
      case "location": return <MapPinIcon />;
      case "bestPractices": return <LightbulbIcon />;
      default: return null;
    }
  };

  const ModalSection = ({ id, children }: { id: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: accentColor,
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          fontFamily: FONT_MONO,
        }}
      >
        {sectionIcon(id)}
        {sectionLabel(id)}
      </div>
      {children}
    </div>
  );

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
        {/* Modal header */}
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
              background: SECTION_COLORS[section.id]?.bg || COLORS.accentGlow,
              color: accentColor,
              flexShrink: 0,
            }}
          >
            {entry.type === "directory" ? <FolderIcon /> : <FileIcon />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <code
              style={{
                fontFamily: FONT_MONO,
                fontSize: "15px",
                fontWeight: 700,
                color: accentColor,
                wordBreak: "break-all",
              }}
            >
              {entry.path}
            </code>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: COLORS.text,
                marginTop: "4px",
                fontFamily: FONT_SANS,
              }}
            >
              {entry.name}
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: recommendCfg.bg,
                  color: recommendCfg.color,
                }}
              >
                {recommendCfg.label}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: vcsCfg.bg,
                  color: vcsCfg.color,
                }}
              >
                {vcsCfg.label}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: COLORS.bg,
                  color: COLORS.textMuted,
                }}
              >
                {entry.type === "directory" ? "ディレクトリ" : "ファイル"}
              </span>
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

        {/* Modal body */}
        <div
          style={{
            padding: "24px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Detail */}
          <ModalSection id="detail">
            {detailParagraphs.map((p, i) => (
              <p
                key={i}
                style={{
                  margin: 0,
                  fontSize: "13px",
                  lineHeight: 1.8,
                  color: COLORS.textSecondary,
                  fontFamily: FONT_SANS,
                }}
              >
                {p}
              </p>
            ))}
          </ModalSection>

          {/* Usage */}
          {usageParagraphs.length > 0 && (
            <ModalSection id="usage">
              <div
                style={{
                  background: COLORS.tealBg,
                  borderRadius: "10px",
                  border: `1px solid ${COLORS.teal}20`,
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {usageParagraphs.map((p, i) => (
                  <p
                    key={i}
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      lineHeight: 1.8,
                      color: COLORS.textSecondary,
                      fontFamily: FONT_SANS,
                    }}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </ModalSection>
          )}

          {/* Location */}
          <ModalSection id="location">
            <div
              style={{
                background: COLORS.bg,
                borderRadius: "10px",
                border: `1px solid ${COLORS.border}`,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: COLORS.textMuted, fontFamily: FONT_MONO }}>
                  パス:
                </span>
                <code
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: "13px",
                    fontWeight: 600,
                    color: accentColor,
                  }}
                >
                  {fullPath}
                </code>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: COLORS.textMuted, fontFamily: FONT_MONO }}>
                  スコープ:
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: COLORS.text,
                    fontFamily: FONT_SANS,
                  }}
                >
                  {section.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: COLORS.textMuted, fontFamily: FONT_MONO }}>
                  ベースパス:
                </span>
                <code
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: "12px",
                    color: COLORS.textSecondary,
                  }}
                >
                  {section.basePath}
                </code>
              </div>
            </div>
          </ModalSection>

          {/* Best Practices */}
          {section.bestPractices.length > 0 && (
            <ModalSection id="bestPractices">
              <div
                style={{
                  background: COLORS.bg + "80",
                  borderRadius: "10px",
                  border: `1px solid ${COLORS.border}60`,
                  padding: "14px 16px",
                }}
              >
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {section.bestPractices.map((tip, i) => (
                    <li
                      key={i}
                      style={{
                        fontSize: "12px",
                        lineHeight: 1.7,
                        color: COLORS.textSecondary,
                        fontFamily: FONT_SANS,
                      }}
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </ModalSection>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// PrecedencePanel
// ---------------------------------------------------------------------------

function PrecedencePanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
            color: COLORS.orange,
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
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          設定の優先順位
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {PRECEDENCE.map((item) => {
            const pc = PRECEDENCE_COLORS[item.color] || { color: COLORS.text, bg: COLORS.bg };
            return (
              <div key={item.level} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: pc.bg,
                    color: pc.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    fontFamily: FONT_MONO,
                    flexShrink: 0,
                  }}
                >
                  {item.level}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 600, color: pc.color }}>{item.name}</span>
                    <span style={{ fontSize: "12px", color: COLORS.textMuted, fontFamily: FONT_SANS }}>{item.description}</span>
                  </div>
                </div>
                {item.level === 1 && (
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: COLORS.redBg,
                      color: COLORS.red,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    最優先
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: "16px",
            padding: "12px 14px",
            background: COLORS.bg + "80",
            borderRadius: "8px",
            border: `1px solid ${COLORS.border}40`,
            fontSize: "12px",
            lineHeight: 1.7,
            color: COLORS.textSecondary,
            fontFamily: FONT_SANS,
          }}
        >
          上位の設定が下位の設定を上書きします。同じキーが複数の階層で定義されている場合、番号の小さい方が優先されます。
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CommitGuidePanel
// ---------------------------------------------------------------------------

function CommitGuidePanel() {
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
          <circle cx="12" cy="12" r="4" />
          <line x1="1.05" y1="12" x2="7" y2="12" />
          <line x1="17.01" y1="12" x2="22.96" y2="12" />
        </svg>
        コミット判断ガイド
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "12px",
        }}
      >
        <div
          style={{
            background: COLORS.bg + "80",
            borderRadius: "10px",
            padding: "16px 18px",
            border: `1px solid ${COLORS.green}20`,
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: COLORS.green,
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: FONT_MONO,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            コミットする
          </div>
          <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {COMMIT_GUIDE.commit.map((item, i) => (
              <li key={i} style={{ fontSize: "12px", lineHeight: 1.7, color: COLORS.textSecondary, fontFamily: FONT_SANS }}>{item}</li>
            ))}
          </ul>
        </div>
        <div
          style={{
            background: COLORS.bg + "80",
            borderRadius: "10px",
            padding: "16px 18px",
            border: `1px solid ${COLORS.red}20`,
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: COLORS.red,
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: FONT_MONO,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            コミットしない
          </div>
          <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {COMMIT_GUIDE.noCommit.map((item, i) => (
              <li key={i} style={{ fontSize: "12px", lineHeight: 1.7, color: COLORS.textSecondary, fontFamily: FONT_SANS }}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkillsVsAgentsPanel
// ---------------------------------------------------------------------------

function SkillsVsAgentsPanel() {
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
          color: COLORS.purple,
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
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
        skills/ と agents/ の使い分け
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "12px",
        }}
      >
        <div
          style={{
            background: COLORS.bg + "80",
            borderRadius: "10px",
            padding: "16px 18px",
            border: `1px solid ${COLORS.cyan}20`,
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.cyan, marginBottom: "8px", fontFamily: FONT_MONO }}>skills/</div>
          <p style={{ fontSize: "12px", color: COLORS.textSecondary, margin: "0 0 10px", lineHeight: 1.6, fontFamily: FONT_SANS }}>
            {SKILLS_VS_AGENTS.skills.description}
          </p>
          <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {SKILLS_VS_AGENTS.skills.characteristics.map((c: string, i: number) => (
              <li key={i} style={{ fontSize: "11px", lineHeight: 1.6, color: COLORS.textMuted, fontFamily: FONT_SANS }}>{c}</li>
            ))}
          </ul>
        </div>
        <div
          style={{
            background: COLORS.bg + "80",
            borderRadius: "10px",
            padding: "16px 18px",
            border: `1px solid ${COLORS.purple}20`,
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 700, color: COLORS.purple, marginBottom: "8px", fontFamily: FONT_MONO }}>agents/</div>
          <p style={{ fontSize: "12px", color: COLORS.textSecondary, margin: "0 0 10px", lineHeight: 1.6, fontFamily: FONT_SANS }}>
            {SKILLS_VS_AGENTS.agents.description}
          </p>
          <ul style={{ margin: 0, paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {SKILLS_VS_AGENTS.agents.characteristics.map((c: string, i: number) => (
              <li key={i} style={{ fontSize: "11px", lineHeight: 1.6, color: COLORS.textMuted, fontFamily: FONT_SANS }}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

interface TabDef {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  type: "section" | "info";
}

const TAB_DEFS: TabDef[] = [
  ...SECTIONS.map((s) => ({
    id: s.id,
    label: s.name,
    shortLabel: s.name.replace("（企業管理者向け）", "").replace("マネージド設定", "マネージド"),
    color: SECTION_COLORS[s.id]?.color || COLORS.accent,
    type: "section" as const,
  })),
  { id: "precedence", label: "優先順位", shortLabel: "優先順位", color: COLORS.orange, type: "info" },
  { id: "commit-guide", label: "コミットガイド", shortLabel: "コミット", color: COLORS.teal, type: "info" },
  { id: "skills-agents", label: "Skills vs Agents", shortLabel: "Skills/Agents", color: COLORS.purple, type: "info" },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function Directory(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>("global");
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<{ entry: Entry; section: Section } | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const lowerQuery = query.toLowerCase();

  const activeSection = SECTIONS.find((s) => s.id === activeTab);

  const filteredEntries = useMemo(() => {
    if (!activeSection) return [];
    return activeSection.entries.filter(
      (e) =>
        !query ||
        e.path.toLowerCase().includes(lowerQuery) ||
        e.name.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery) ||
        e.detail.toLowerCase().includes(lowerQuery) ||
        e.usage.toLowerCase().includes(lowerQuery)
    );
  }, [activeSection, query, lowerQuery]);

  const isInfoTab = SPECIAL_TABS.includes(activeTab as (typeof SPECIAL_TABS)[number]);

  const openModal = useCallback((entry: Entry, section: Section) => {
    setSelectedEntry({ entry, section });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedEntry(null);
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
                "radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.08), transparent 60%), " +
                "radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.05), transparent 60%)",
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
              ディレクトリ構成ガイド
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
              設定ファイルの配置場所・使い方・ベストプラクティスを網羅したガイド
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
                <strong style={{ color: COLORS.text }}>{TOTAL}</strong> エントリ
              </span>
              <span>
                <strong style={{ color: COLORS.text }}>{SECTIONS.length}</strong> セクション
              </span>
            </div>
            {/* Nav links */}
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
                { to: "/plugins", label: "公式プラグイン", icon: null, trailing: true },
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
                {tab.type === "section" && SECTION_ICONS[tab.id] && (
                  <span style={{ display: "flex", alignItems: "center", transform: "scale(0.8)" }}>
                    {SECTION_ICONS[tab.id]()}
                  </span>
                )}
                {tab.type === "info" && (
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <InfoIcon />
                  </span>
                )}
                <span className="tab-full-label" style={{ display: "inline" }}>{tab.shortLabel}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Search — only for section tabs */}
        {!isInfoTab && (
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
              placeholder="ファイル名やキーワードで検索..."
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
          {isInfoTab ? (
            <motion.div
              key={activeTab}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "precedence" && <PrecedencePanel />}
              {activeTab === "commit-guide" && <CommitGuidePanel />}
              {activeTab === "skills-agents" && <SkillsVsAgentsPanel />}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {/* Section description */}
              {activeSection && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "16px",
                    padding: "0 4px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: SECTION_COLORS[activeSection.id]?.bg || COLORS.accentGlow,
                      color: SECTION_COLORS[activeSection.id]?.color || COLORS.accent,
                      flexShrink: 0,
                    }}
                  >
                    {SECTION_ICONS[activeSection.id]?.()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                      <code
                        style={{
                          fontSize: "12px",
                          color: COLORS.textMuted,
                          fontFamily: FONT_MONO,
                          background: COLORS.surface,
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {activeSection.basePath}
                      </code>
                      <span style={{ fontSize: "12px", color: COLORS.textMuted }}>
                        {filteredEntries.length} / {activeSection.entries.length} エントリ
                      </span>
                    </div>
                    <span style={{ fontSize: "12px", color: COLORS.textMuted, fontFamily: FONT_SANS }}>
                      {activeSection.description}
                    </span>
                  </div>
                </div>
              )}

              {/* Card grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "14px",
                }}
              >
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry, i) => (
                    <motion.div
                      key={entry.path}
                      layout={!reducedMotion}
                      initial={
                        reducedMotion
                          ? false
                          : hasMounted.current
                            ? { opacity: 0 }
                            : { opacity: 0, y: 15 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reducedMotion
                          ? undefined
                          : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }
                      }
                      transition={{
                        duration: 0.2,
                        delay: reducedMotion || hasMounted.current ? 0 : Math.min(i * 0.04, 0.4),
                      }}
                    >
                      <EntryCard
                        entry={entry}
                        accentColor={SECTION_COLORS[activeTab]?.color || COLORS.accent}
                        onClick={() => openModal(entry, activeSection!)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty state */}
              {filteredEntries.length === 0 && (
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
                    条件に一致するエントリはありません
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
            borderTop: `1px solid ${COLORS.border}`,
          }}
        >
          Claude Code Release Notes Viewer
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <DetailModal
            entry={selectedEntry.entry}
            section={selectedEntry.section}
            accentColor={SECTION_COLORS[selectedEntry.section.id]?.color || COLORS.accent}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
