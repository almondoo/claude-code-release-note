import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import releases from "~/data/releases.json";
import versionDetails from "~/data/version-details.json";

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

interface BadgeProps {
  tag: string;
  small?: boolean;
}

interface VersionCardProps {
  version: string;
  items: ReleaseItem[];
  isOpen: boolean;
  onToggle: () => void;
  reducedMotion: boolean | null;
}

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code リリースノート" },
    { name: "description", content: "Claude Code の全バージョンのリリースノートを閲覧できます" },
  ];
}

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
};

const ALL_TAGS = Object.keys(TAG_COLORS);

const VERSION_DETAILS_AVAILABLE = new Set(Object.keys(versionDetails));

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

const COLORS = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceHover: "#263548",
  border: "#334155",
  borderSubtle: "#1E293B",
  accent: "#3B82F6",
  accentGlow: "rgba(59, 130, 246, 0.25)",
  text: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#64748B",
} as const;

const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace" as const;
const FONT_SANS = "'IBM Plex Sans', 'Noto Sans JP', system-ui, -apple-system, sans-serif" as const;

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

function FolderIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        <line x1="9" y1="14" x2="15" y2="14" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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

// ---------------------------------------------------------------------------
// Badge
// ---------------------------------------------------------------------------

function Badge({ tag, small }: BadgeProps): React.JSX.Element {
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
// VersionCard
// ---------------------------------------------------------------------------

function VersionCard({ version, items, isOpen, onToggle, reducedMotion }: VersionCardProps): React.JSX.Element {
  const tagCounts: Record<string, number> = {};
  for (const item of items) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

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
        onKeyDown={handleKeyDown}
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
          padding: "14px 18px",
          cursor: "pointer",
          background: isOpen ? `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceHover})` : "transparent",
          borderBottom: isOpen ? `1px solid ${COLORS.border}` : "1px solid transparent",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: "17px",
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
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {sortedTags.slice(0, 5).map(([tag, count]) => (
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
                  letterSpacing: "0.2px",
                }}
              >
                {TAG_LABELS[tag] ?? tag}
                <span style={{ opacity: 0.5, marginLeft: "2px" }}>{count}</span>
              </span>
            ))}
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
            <div style={{ padding: "6px 10px 14px" }}>
              {items.map((item, index) => (
                <div
                  key={index}
                  onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.surfaceHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "9px 8px",
                    borderBottom: index < items.length - 1 ? `1px solid ${COLORS.border}40` : "none",
                    alignItems: "flex-start",
                    borderRadius: "6px",
                    transition: "background 0.15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "3px",
                      flexWrap: "wrap",
                      minWidth: "100px",
                      flexShrink: 0,
                      paddingTop: "1px",
                    }}
                  >
                    {item.tags.map((tag) => (
                      <Badge key={tag} tag={tag} small />
                    ))}
                  </div>
                  <span
                    style={{
                      color: COLORS.textSecondary,
                      fontSize: "13px",
                      lineHeight: 1.7,
                      wordBreak: "break-word",
                      fontFamily: FONT_SANS,
                    }}
                  >
                    {item.t}
                  </span>
                </div>
              ))}
              <Link
                to={`/version/${version}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  marginTop: "10px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: VERSION_DETAILS_AVAILABLE.has(version) ? COLORS.accent : COLORS.textMuted,
                  background: VERSION_DETAILS_AVAILABLE.has(version)
                    ? "rgba(59, 130, 246, 0.08)"
                    : "transparent",
                  border: `1px solid ${VERSION_DETAILS_AVAILABLE.has(version) ? COLORS.accent + "40" : COLORS.border}`,
                  textDecoration: "none",
                  fontFamily: FONT_SANS,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = VERSION_DETAILS_AVAILABLE.has(version)
                    ? "rgba(59, 130, 246, 0.15)"
                    : COLORS.surfaceHover;
                  e.currentTarget.style.color = VERSION_DETAILS_AVAILABLE.has(version) ? COLORS.accent : COLORS.textSecondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = VERSION_DETAILS_AVAILABLE.has(version)
                    ? "rgba(59, 130, 246, 0.08)"
                    : "transparent";
                  e.currentTarget.style.color = VERSION_DETAILS_AVAILABLE.has(version) ? COLORS.accent : COLORS.textMuted;
                }}
              >
                {VERSION_DETAILS_AVAILABLE.has(version) ? "詳細を見る →" : "バージョンページへ →"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------

export default function ReleaseNote(): React.JSX.Element {
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [openVersions, setOpenVersions] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const filtered = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return RELEASES
      .map((release) => ({
        ...release,
        items: release.items.filter((item) => {
          const tagMatch = activeTags.size === 0 || item.tags.some((t) => activeTags.has(t));
          const queryMatch = !query || item.t.toLowerCase().includes(lowerQuery);
          return tagMatch && queryMatch;
        }),
      }))
      .filter((release) => release.items.length > 0);
  }, [activeTags, query]);

  const totalItems = filtered.reduce((sum, release) => sum + release.items.length, 0);
  const totalAll = RELEASES.reduce((sum, release) => sum + release.items.length, 0);

  const allTagsSelected = activeTags.size === ALL_TAGS.length;

  function toggleAllTags(): void {
    if (allTagsSelected) {
      setActiveTags(new Set());
    } else {
      setActiveTags(new Set(ALL_TAGS));
    }
  }

  function toggleTag(tag: string): void {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  function toggleVersion(version: string): void {
    setOpenVersions((prev) => {
      const next = new Set(prev);
      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }
      return next;
    });
  }

  function toggleAll(): void {
    if (allExpanded) {
      setOpenVersions(new Set());
    } else {
      setOpenVersions(new Set(filtered.map((release) => release.v)));
    }
    setAllExpanded(!allExpanded);
  }

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
              <span style={{ fontFamily: FONT_MONO, fontSize: "12px" }}>v{RELEASES[0]?.v} 〜 v{RELEASES[RELEASES.length - 1]?.v}</span>
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/commands"
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
                コマンド一覧 →
              </Link>
              <Link
                to="/plugins"
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
                公式プラグイン →
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
            placeholder="キーワードで検索..."
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

        {/* Tag filters */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          style={{
            background: COLORS.surface,
            borderRadius: "10px",
            border: `1px solid ${COLORS.border}`,
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "14px",
            padding: "14px",
          }}
        >
          <motion.button
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            onClick={toggleAllTags}
            style={{
              padding: "5px 12px",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              border: `1px solid ${allTagsSelected ? COLORS.accent + "60" : COLORS.border}`,
              background: allTagsSelected ? COLORS.accentGlow : "transparent",
              color: allTagsSelected ? COLORS.accent : COLORS.textMuted,
              transition: "all 0.15s",
              fontFamily: FONT_SANS,
            }}
          >
            {allTagsSelected ? "全解除" : "全選択"}
          </motion.button>
          <span style={{ width: "1px", height: "20px", background: COLORS.border, flexShrink: 0 }} />
          {ALL_TAGS.map((tag) => {
            const active = activeTags.has(tag);
            const colors = TAG_COLORS[tag];
            return (
              <motion.button
                key={tag}
                whileTap={reducedMotion ? undefined : { scale: 0.95 }}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `1px solid ${active ? colors.text + "60" : COLORS.border}`,
                  background: active ? colors.bg : "transparent",
                  color: active ? colors.text : COLORS.textMuted,
                  transition: "all 0.15s",
                  fontFamily: FONT_SANS,
                }}
              >
                {TAG_LABELS[tag]}
              </motion.button>
            );
          })}
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
            {filtered.length} バージョン ・ {totalItems} 件表示中
          </span>
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
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <FolderIcon open={allExpanded} />
            {allExpanded ? "すべて閉じる" : "すべて開く"}
          </button>
        </motion.div>

        {/* Version cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((release, i) => (
              <motion.div
                key={release.v}
                layout={!reducedMotion}
                initial={m ? false : hasMounted.current ? { opacity: 0 } : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={m ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25, delay: reducedMotion || hasMounted.current ? 0 : Math.min(i * 0.06, 0.6) }}
              >
                <VersionCard
                  version={release.v}
                  items={release.items}
                  isOpen={openVersions.has(release.v)}
                  onToggle={() => toggleVersion(release.v)}
                  reducedMotion={reducedMotion}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

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
    </div>
  );
}
