import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link, useParams } from "react-router";
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

interface DetailItem {
  t: string;
  tags: string[];
  detail: string;
  category: string;
}

interface TagColor {
  bg: string;
  text: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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
// Data
// ---------------------------------------------------------------------------

const RELEASES = [...releases].reverse();
const VERSION_DETAILS: Record<string, DetailItem[]> = versionDetails;

function getAdjacentVersions(version: string): { prev: string | null; next: string | null } {
  const idx = RELEASES.findIndex((r) => r.v === version);
  return {
    prev: idx < RELEASES.length - 1 ? RELEASES[idx + 1].v : null,
    next: idx > 0 ? RELEASES[idx - 1].v : null,
  };
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function ArrowLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

function ChevronDownIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
// Badge
// ---------------------------------------------------------------------------

function Badge({ tag }: { tag: string }) {
  const colors = TAG_COLORS[tag];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "6px",
        fontSize: "11px",
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

function CategoryBadge({ category }: { category: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "6px",
        fontSize: "11px",
        fontWeight: 600,
        background: "rgba(59, 130, 246, 0.1)",
        color: COLORS.accent,
        whiteSpace: "nowrap",
        lineHeight: 1.6,
        letterSpacing: "0.2px",
        border: `1px solid ${COLORS.accent}30`,
      }}
    >
      {category}
    </span>
  );
}

// ---------------------------------------------------------------------------
// DetailCard
// ---------------------------------------------------------------------------

function DetailCard({
  item,
  index,
  reducedMotion,
}: {
  item: DetailItem;
  index: number;
  reducedMotion: boolean | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.5) }}
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
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = COLORS.surfaceHover;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = "transparent";
        }}
        style={{
          padding: "16px 18px",
          cursor: "pointer",
          background: isOpen ? `linear-gradient(135deg, ${COLORS.surface}, ${COLORS.surfaceHover})` : "transparent",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
              {item.tags.map((tag) => (
                <Badge key={tag} tag={tag} />
              ))}
              <CategoryBadge category={item.category} />
            </div>
            <p
              style={{
                color: COLORS.text,
                fontSize: "14px",
                lineHeight: 1.7,
                margin: 0,
                fontFamily: FONT_SANS,
                wordBreak: "break-word",
              }}
            >
              {item.t}
            </p>
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
              marginTop: "2px",
            }}
          >
            <ChevronDownIcon isOpen={isOpen} />
          </div>
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
            <div
              style={{
                padding: "0 18px 18px",
                borderTop: `1px solid ${COLORS.border}40`,
              }}
            >
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  background: COLORS.bg,
                  borderRadius: "8px",
                  border: `1px solid ${COLORS.border}60`,
                }}
              >
                <p
                  style={{
                    color: COLORS.textSecondary,
                    fontSize: "13px",
                    lineHeight: 1.9,
                    margin: 0,
                    fontFamily: FONT_SANS,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {item.detail}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FallbackCard (for versions without detailed data)
// ---------------------------------------------------------------------------

function FallbackCard({ item, index }: { item: ReleaseItem; index: number }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: "12px",
        border: `1px solid ${COLORS.border}`,
        padding: "16px 18px",
      }}
    >
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
        {item.tags.map((tag) => (
          <Badge key={tag} tag={tag} />
        ))}
      </div>
      <p
        style={{
          color: COLORS.textSecondary,
          fontSize: "14px",
          lineHeight: 1.7,
          margin: 0,
          fontFamily: FONT_SANS,
        }}
      >
        {item.t}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NavButton
// ---------------------------------------------------------------------------

function NavButton({ to, label, direction }: { to: string; label: string; direction: "prev" | "next" }) {
  return (
    <Link
      to={`/version/${to}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        borderRadius: "8px",
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        color: COLORS.textSecondary,
        textDecoration: "none",
        fontSize: "13px",
        fontFamily: FONT_SANS,
        transition: "all 0.15s",
        flexDirection: direction === "prev" ? "row" : "row-reverse",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = COLORS.accent + "60";
        e.currentTarget.style.color = COLORS.text;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.color = COLORS.textSecondary;
      }}
    >
      {direction === "prev" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      <div style={{ textAlign: direction === "prev" ? "left" : "right" }}>
        <div style={{ fontSize: "11px", color: COLORS.textMuted, marginBottom: "2px" }}>
          {direction === "prev" ? "前のバージョン" : "次のバージョン"}
        </div>
        <div style={{ fontFamily: FONT_MONO, fontWeight: 600 }}>v{label}</div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function VersionDetail() {
  const { version } = useParams();
  const reducedMotion = useReducedMotion();

  const release = RELEASES.find((r) => r.v === version);
  const details = version ? VERSION_DETAILS[version] : null;
  const { prev, next } = version ? getAdjacentVersions(version) : { prev: null, next: null };

  if (!release) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: COLORS.bg,
          fontFamily: FONT_SANS,
          color: COLORS.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 700 }}>バージョンが見つかりません</h1>
        <Link
          to="/"
          style={{
            color: COLORS.accent,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "14px",
          }}
        >
          <ArrowLeftIcon />
          一覧に戻る
        </Link>
      </div>
    );
  }

  const tagCounts: Record<string, number> = {};
  for (const item of release.items) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

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
        {/* Back link */}
        <motion.div
          initial={m ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: COLORS.textMuted,
              textDecoration: "none",
              fontSize: "13px",
              fontFamily: FONT_SANS,
              marginBottom: "24px",
              padding: "6px 12px",
              borderRadius: "6px",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = COLORS.text;
              e.currentTarget.style.background = COLORS.surface;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = COLORS.textMuted;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <ArrowLeftIcon />
            リリースノート一覧
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={m ? false : { opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          style={{
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
                fontSize: "36px",
                fontWeight: 800,
                margin: "0 0 16px",
                color: COLORS.text,
                letterSpacing: "-0.5px",
                fontFamily: FONT_MONO,
              }}
            >
              v{version}
            </h1>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: COLORS.textSecondary,
                }}
              >
                <strong style={{ color: COLORS.text }}>{release.items.length}</strong> 件の変更
              </span>
              {details && (
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#6EE7B7",
                    fontWeight: 600,
                  }}
                >
                  詳細情報あり
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {sortedTags.map(([tag, count]) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                    padding: "3px 10px",
                    borderRadius: "6px",
                    fontSize: "11px",
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
        </motion.div>

        {/* Items */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
          {details
            ? details.map((item, i) => (
                <DetailCard
                  key={i}
                  item={item}
                  index={i}
                  reducedMotion={reducedMotion}
                />
              ))
            : release.items.map((item, i) => (
                <FallbackCard key={i} item={item} index={i} />
              ))}
        </div>

        {/* Navigation */}
        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div>{prev && <NavButton to={prev} label={prev} direction="prev" />}</div>
          <div>{next && <NavButton to={next} label={next} direction="next" />}</div>
        </motion.div>

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
