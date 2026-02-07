import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import releases from "~/data/releases.json";
import versionDetails from "~/data/version-details.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReleaseItem {
  t: string;
  tags: string[];
}

interface ReleaseVersion {
  v: string;
  items: ReleaseItem[];
}

interface TagColor {
  bg: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code リリースノート" },
    { name: "description", content: "Claude Code の全バージョンのリリースノートを閲覧できます" },
  ];
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const RELEASES: ReleaseVersion[] = [...releases].reverse();

const TAG_COLORS: Record<string, TagColor> = {
  "新機能": { bg: "rgba(16, 185, 129, 0.15)", text: "#6EE7B7" },
  "バグ修正": { bg: "rgba(239, 68, 68, 0.15)", text: "#FCA5A5" },
  "改善": { bg: "rgba(59, 130, 246, 0.15)", text: "#93C5FD" },
  "SDK": { bg: "rgba(139, 92, 246, 0.15)", text: "#C4B5FD" },
  "IDE": { bg: "rgba(249, 115, 22, 0.15)", text: "#FDBA74" },
  "Platform": { bg: "rgba(107, 114, 128, 0.15)", text: "#D1D5DB" },
  "Security": { bg: "rgba(220, 38, 38, 0.15)", text: "#FCA5A5" },
  "Perf": { bg: "rgba(234, 179, 8, 0.15)", text: "#FDE68A" },
  "非推奨": { bg: "rgba(120, 113, 108, 0.15)", text: "#D6D3D1" },
  "Plugin": { bg: "rgba(6, 182, 212, 0.15)", text: "#67E8F9" },
  "MCP": { bg: "rgba(20, 184, 166, 0.15)", text: "#5EEAD4" },
  "Agent": { bg: "rgba(99, 102, 241, 0.15)", text: "#A5B4FC" },
};

const TAG_LABELS: Record<string, string> = {
  "新機能": "新機能",
  "バグ修正": "バグ修正",
  "改善": "改善",
  "SDK": "SDK",
  "IDE": "IDE",
  "Platform": "プラットフォーム",
  "Security": "セキュリティ",
  "Perf": "パフォーマンス",
  "非推奨": "非推奨",
  "Plugin": "プラグイン",
  "MCP": "MCP",
  "Agent": "エージェント",
};

const ALL_TAGS = Object.keys(TAG_COLORS);

const VERSION_DETAILS_AVAILABLE = new Set(Object.keys(versionDetails));

const totalAll = RELEASES.reduce((sum, r) => sum + r.items.length, 0);

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
  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace" as const;
const FONT_SANS = "'IBM Plex Sans', 'Noto Sans JP', system-ui, -apple-system, sans-serif" as const;

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

interface TabDef {
  id: string;
  label: string;
  color: string;
}

const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: COLORS.accent },
  ...ALL_TAGS.map((tag) => ({
    id: tag,
    label: TAG_LABELS[tag] ?? tag,
    color: TAG_COLORS[tag]?.text ?? COLORS.accent,
  })),
];

// ---------------------------------------------------------------------------
// Tag icons
// ---------------------------------------------------------------------------

const TAG_ICONS: Record<string, () => React.JSX.Element> = {
  "新機能": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  "バグ修正": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  "改善": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  "SDK": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  "IDE": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  "Platform": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  "Security": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  "Perf": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  "非推奨": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  "Plugin": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3" />
    </svg>
  ),
  "MCP": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  "Agent": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09c-.658.003-1.25.396-1.51 1z" />
    </svg>
  ),
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

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Badge (small inline tag)
// ---------------------------------------------------------------------------

function Badge({ tag, small }: { tag: string; small?: boolean }): React.JSX.Element {
  const colors = TAG_COLORS[tag];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: small ? "1px 7px" : "2px 9px",
        borderRadius: "6px",
        fontSize: small ? "10px" : "11px",
        fontWeight: 600,
        background: colors?.bg ?? "rgba(100,116,139,0.15)",
        color: colors?.text ?? COLORS.textSecondary,
        whiteSpace: "nowrap",
        lineHeight: 1.6,
        letterSpacing: "0.2px",
      }}
    >
      {TAG_LABELS[tag] ?? tag}
    </span>
  );
}

// ---------------------------------------------------------------------------
// VersionCard — Grid card for each version
// ---------------------------------------------------------------------------

function VersionCard({
  version,
  items,
  accentColor,
  onClick,
}: {
  version: string;
  items: ReleaseItem[];
  accentColor: string;
  onClick: () => void;
}): React.JSX.Element {
  const tagCounts: Record<string, number> = {};
  for (const item of items) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
  const hasDetails = VERSION_DETAILS_AVAILABLE.has(version);

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
        transition: "all 0.2s",
        position: "relative",
        overflow: "hidden",
        height: "180px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = accentColor + "60";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px -8px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Accent line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)`,
        }}
      />

      {/* Version header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: "16px",
            fontWeight: 700,
            color: COLORS.text,
            letterSpacing: "-0.3px",
          }}
        >
          v{version}
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
          {items.length}件
        </span>
      </div>

      {/* Tag badges */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {sortedTags.slice(0, 4).map(([tag, count]) => (
          <span
            key={tag}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              padding: "2px 7px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: 600,
              background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
              color: TAG_COLORS[tag]?.text ?? COLORS.textSecondary,
              letterSpacing: "0.2px",
            }}
          >
            {TAG_LABELS[tag] ?? tag}
            <span style={{ opacity: 0.5 }}>{count}</span>
          </span>
        ))}
        {sortedTags.length > 4 && (
          <span
            style={{
              padding: "2px 7px",
              borderRadius: "4px",
              fontSize: "10px",
              fontWeight: 600,
              background: "rgba(100,116,139,0.1)",
              color: COLORS.textMuted,
            }}
          >
            +{sortedTags.length - 4}
          </span>
        )}
      </div>

      {/* Preview: first 2 items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minHeight: 0, overflow: "hidden" }}>
        {items.slice(0, 2).map((item, i) => (
          <span
            key={i}
            style={{
              color: COLORS.textSecondary,
              fontSize: "12px",
              lineHeight: 1.5,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: FONT_SANS,
            }}
          >
            {item.t}
          </span>
        ))}
        {items.length > 2 && (
          <span style={{ color: COLORS.textMuted, fontSize: "11px" }}>
            他 {items.length - 2} 件...
          </span>
        )}
      </div>

      {/* Detail availability indicator */}
      {hasDetails && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "10px",
            fontWeight: 600,
            color: COLORS.accent,
            marginTop: "auto",
          }}
        >
          <ExternalLinkIcon />
          詳細あり
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DetailModal — version detail popup
// ---------------------------------------------------------------------------

function DetailModal({
  version,
  items,
  onClose,
  reducedMotion,
}: {
  version: string;
  items: ReleaseItem[];
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const hasDetails = VERSION_DETAILS_AVAILABLE.has(version);

  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tagCounts: Record<string, number> = {};
  for (const item of items) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: COLORS.overlay,
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "24px",
      }}
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.surface,
          borderRadius: "16px",
          border: `1px solid ${COLORS.border}`,
          width: "100%",
          maxWidth: "680px",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 64px -16px rgba(0,0,0,0.5)",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${COLORS.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceHover})`,
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: "22px",
                  fontWeight: 700,
                  color: COLORS.text,
                  letterSpacing: "-0.5px",
                }}
              >
                v{version}
              </span>
              <span
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: "12px",
                  color: COLORS.textMuted,
                  background: COLORS.bg,
                  padding: "2px 8px",
                  borderRadius: "4px",
                }}
              >
                {items.length}件の変更
              </span>
            </div>
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {sortedTags.map(([tag, count]) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 600,
                    background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
                    color: TAG_COLORS[tag]?.text ?? COLORS.textSecondary,
                  }}
                >
                  {TAG_LABELS[tag] ?? tag}
                  <span style={{ opacity: 0.5 }}>{count}</span>
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              border: `1px solid ${COLORS.border}`,
              background: COLORS.bg,
              color: COLORS.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.surfaceHover;
              e.currentTarget.style.color = COLORS.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLORS.bg;
              e.currentTarget.style.color = COLORS.textMuted;
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ overflowY: "auto", padding: "16px 24px 24px", flex: 1 }}>
          {/* Items list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {items.map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.surfaceHover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", flexShrink: 0, paddingTop: "2px" }}>
                    {item.tags.map((tag) => (
                      <Badge key={tag} tag={tag} small />
                    ))}
                  </div>
                  <span
                    style={{
                      color: COLORS.text,
                      fontSize: "13px",
                      lineHeight: 1.7,
                      wordBreak: "break-word",
                      fontFamily: FONT_SANS,
                    }}
                  >
                    {item.t}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Version page link */}
          <Link
            to={`/version/${version}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              marginTop: "16px",
              padding: "10px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              color: hasDetails ? COLORS.accent : COLORS.textMuted,
              background: hasDetails ? "rgba(59, 130, 246, 0.08)" : "transparent",
              border: `1px solid ${hasDetails ? COLORS.accent + "40" : COLORS.border}`,
              textDecoration: "none",
              fontFamily: FONT_SANS,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = hasDetails
                ? "rgba(59, 130, 246, 0.15)"
                : COLORS.surfaceHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = hasDetails
                ? "rgba(59, 130, 246, 0.08)"
                : "transparent";
            }}
          >
            {hasDetails ? "バージョン詳細ページへ →" : "バージョンページへ →"}
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Nav links array
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { to: "/commands", label: "コマンド一覧" },
  { to: "/plugins", label: "公式プラグイン" },
  { to: "/directory", label: "ディレクトリ構成" },
];

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function ReleaseNote(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [modalVersion, setModalVersion] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const tabsRef = useRef<HTMLDivElement>(null);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  const closeModal = useCallback(() => setModalVersion(null), []);

  const filtered = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return RELEASES
      .map((release) => ({
        ...release,
        items: release.items.filter((item) => {
          const tagMatch = activeTab === "all" || item.tags.includes(activeTab);
          const queryMatch = !query || item.t.toLowerCase().includes(lowerQuery);
          return tagMatch && queryMatch;
        }),
      }))
      .filter((release) => release.items.length > 0);
  }, [activeTab, query]);

  const totalItems = filtered.reduce((sum, r) => sum + r.items.length, 0);

  const activeTabDef = TAB_DEFS.find((t) => t.id === activeTab) ?? TAB_DEFS[0];
  const accentColor = activeTabDef.color;

  const modalRelease = modalVersion
    ? RELEASES.find((r) => r.v === modalVersion)
    : null;
  // If tab-filtered, show only filtered items in modal; if "all" show everything
  const modalItems = modalRelease
    ? activeTab === "all"
      ? modalRelease.items
      : modalRelease.items.filter((item) => item.tags.includes(activeTab))
    : [];

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
              リリースノート
            </h1>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                gap: "24px",
                fontSize: "13px",
                color: COLORS.textSecondary,
                flexWrap: "wrap",
              }}
            >
              <span>
                <strong style={{ color: COLORS.text }}>{RELEASES.length}</strong> バージョン
              </span>
              <span>
                <strong style={{ color: COLORS.text }}>{totalAll}</strong> 件の変更
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: "12px" }}>
                v{RELEASES[0]?.v} 〜 v{RELEASES[RELEASES.length - 1]?.v}
              </span>
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              {NAV_LINKS.map((link) => (
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
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          ref={tabsRef}
          style={{
            display: "flex",
            gap: "6px",
            marginBottom: "14px",
            overflowX: "auto",
            padding: "4px 0",
            scrollbarWidth: "none",
          }}
        >
          {TAB_DEFS.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.id !== "all" ? TAG_ICONS[tab.id] : null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `1px solid ${active ? tab.color + "60" : COLORS.border}`,
                  background: active ? (TAG_COLORS[tab.id]?.bg ?? COLORS.accentGlow) : COLORS.surface,
                  color: active ? tab.color : COLORS.textMuted,
                  transition: "all 0.15s",
                  fontFamily: FONT_SANS,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = COLORS.surfaceHover;
                    e.currentTarget.style.color = COLORS.textSecondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = COLORS.surface;
                    e.currentTarget.style.color = COLORS.textMuted;
                  }
                }}
              >
                {Icon && (
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <Icon />
                  </span>
                )}
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Search + count */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              flex: 1,
              background: COLORS.surface,
              borderRadius: "10px",
              border: `1px solid ${searchFocused ? accentColor : COLORS.border}`,
              boxShadow: searchFocused ? `0 0 0 3px ${accentColor}25` : "none",
              padding: "2px 14px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <SearchIcon />
            <input
              type="text"
              placeholder="キーワードで検索..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: "100%",
                padding: "10px 0",
                border: "none",
                background: "transparent",
                fontSize: "14px",
                color: COLORS.text,
                outline: "none",
                fontFamily: FONT_SANS,
              }}
            />
          </div>
          <span
            style={{
              fontSize: "12px",
              color: COLORS.textMuted,
              fontWeight: 500,
              whiteSpace: "nowrap",
              fontFamily: FONT_MONO,
            }}
          >
            {filtered.length}ver / {totalItems}件
          </span>
        </motion.div>

        {/* Card grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "14px",
          }}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((release, i) => (
              <motion.div
                key={release.v}
                layout={!reducedMotion}
                initial={m ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={m ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25, delay: reducedMotion ? 0 : Math.min(i * 0.03, 0.3) }}
              >
                <VersionCard
                  version={release.v}
                  items={release.items}
                  accentColor={accentColor}
                  onClick={() => setModalVersion(release.v)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        <AnimatePresence>
          {filtered.length === 0 && (
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
                <EmptyIcon />
              </div>
              <p style={{ color: COLORS.textMuted, fontSize: "14px", margin: 0 }}>
                条件に一致する変更はありません
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

      {/* Modal */}
      <AnimatePresence>
        {modalVersion && modalRelease && (
          <DetailModal
            version={modalVersion}
            items={modalItems}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
