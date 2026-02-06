import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

import releases from "~/data/releases.json";

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
  light: string;
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
}

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code リリースノート" },
    { name: "description", content: "Claude Code の全バージョンのリリースノートを閲覧できます" },
  ];
}

const RELEASES: ReleaseVersion[] = releases;

const TAG_COLORS: Record<string, TagColor> = {
  "新機能": { bg: "#10b981", light: "#d1fae5", text: "#065f46" },
  "バグ修正": { bg: "#ef4444", light: "#fee2e2", text: "#991b1b" },
  "改善": { bg: "#3b82f6", light: "#dbeafe", text: "#1e40af" },
  "SDK": { bg: "#8b5cf6", light: "#ede9fe", text: "#5b21b6" },
  "IDE": { bg: "#f97316", light: "#ffedd5", text: "#9a3412" },
  "Platform": { bg: "#6b7280", light: "#f3f4f6", text: "#374151" },
  "Security": { bg: "#dc2626", light: "#fecaca", text: "#7f1d1d" },
  "Perf": { bg: "#eab308", light: "#fef9c3", text: "#854d0e" },
  "非推奨": { bg: "#78716c", light: "#e7e5e4", text: "#44403c" },
  "Plugin": { bg: "#06b6d4", light: "#cffafe", text: "#155e75" },
};

const TAG_LABELS: Record<string, string> = {
  "新機能": "🆕 新機能",
  "バグ修正": "🐛 バグ修正",
  "改善": "⬆️ 改善",
  "SDK": "🔌 SDK",
  "IDE": "💻 IDE",
  "Platform": "🖥️ プラットフォーム",
  "Security": "🔒 セキュリティ",
  "Perf": "⚡ パフォーマンス",
  "非推奨": "🗑️ 非推奨",
  "Plugin": "🧩 プラグイン",
};

const ALL_TAGS = Object.keys(TAG_COLORS);

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const FONT_MONO = "'JetBrains Mono', 'Fira Code', monospace" as const;
const FONT_SANS = "'Noto Sans JP', system-ui, -apple-system, sans-serif" as const;

const cardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: "14px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

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
        gap: "3px",
        padding: small ? "1px 6px" : "2px 8px",
        borderRadius: "6px",
        fontSize: small ? "10px" : "11px",
        fontWeight: 600,
        background: colors.light,
        color: colors.text,
        border: `1px solid ${colors.bg}30`,
        whiteSpace: "nowrap",
        lineHeight: 1.6,
      }}
    >
      {TAG_LABELS[tag] ?? tag}
    </span>
  );
}

// ---------------------------------------------------------------------------
// VersionCard
// ---------------------------------------------------------------------------

function VersionCard({ version, items, isOpen, onToggle }: VersionCardProps): React.JSX.Element {
  const tagCounts: Record<string, number> = {};
  for (const item of items) {
    for (const tag of item.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const sortedTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: isOpen
          ? "0 20px 40px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(59,130,246,0.1)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div
        onClick={onToggle}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.background = "#fafbfc";
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.background = "#fff";
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          cursor: "pointer",
          background: isOpen ? "linear-gradient(135deg, #f8fafc, #f1f5f9)" : "#fff",
          borderBottom: isOpen ? "1px solid #e2e8f0" : "none",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontFamily: FONT_MONO,
                fontSize: "18px",
                fontWeight: 800,
                background: "linear-gradient(135deg, #1e293b, #475569)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.5px",
              }}
            >
              v{version}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                fontFamily: "'JetBrains Mono', monospace",
                background: "#f1f5f9",
                padding: "2px 8px",
                borderRadius: "20px",
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
                  borderRadius: "20px",
                  fontSize: "10px",
                  fontWeight: 700,
                  background: TAG_COLORS[tag].bg + "14",
                  color: TAG_COLORS[tag].bg,
                  letterSpacing: "0.2px",
                }}
              >
                {TAG_LABELS[tag] ?? tag}
                <span style={{ opacity: 0.6, marginLeft: "2px" }}>{count}</span>
              </span>
            ))}
          </div>
        </div>

        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: isOpen ? "#3b82f6" : "#f1f5f9",
            color: isOpen ? "#fff" : "#94a3b8",
            fontSize: "12px",
            fontWeight: 700,
            transition: "all 0.2s",
            flexShrink: 0,
          }}
        >
          {isOpen ? "\u2212" : "+"}
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: "8px 12px 16px" }}>
          {items.map((item, index) => (
            <div
              key={index}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              style={{
                display: "flex",
                gap: "10px",
                padding: "10px 8px",
                borderBottom: index < items.length - 1 ? "1px solid #f1f5f9" : "none",
                alignItems: "flex-start",
                borderRadius: "8px",
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
                  color: "#334155",
                  fontSize: "13px",
                  lineHeight: 1.6,
                  wordBreak: "break-word",
                  fontFamily: FONT_SANS,
                }}
              >
                {item.t}
              </span>
            </div>
          ))}
        </div>
      )}
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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f0f4f8 0%, #e2e8f0 50%, #f0f4f8 100%)",
        fontFamily: FONT_SANS,
      }}
    >
      <div style={{ maxWidth: "920px", margin: "0 auto", padding: "32px 16px" }}>
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
            padding: "40px 24px",
            background: "linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%)",
            borderRadius: "24px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
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
                "radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.15), transparent 60%), " +
                "radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.1), transparent 60%)",
            }}
          />
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#94a3b8",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: "12px",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              CLAUDE CODE
            </div>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                margin: "0 0 12px",
                color: "#f8fafc",
                letterSpacing: "-0.5px",
              }}
            >
              リリースノート
            </h1>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "24px",
                fontSize: "14px",
                color: "#94a3b8",
              }}
            >
              <span>
                <strong style={{ color: "#e2e8f0" }}>{RELEASES.length}</strong> バージョン
              </span>
              <span>
                <strong style={{ color: "#e2e8f0" }}>{totalAll}</strong> 件の変更
              </span>
              <span style={{ fontFamily: "monospace" }}>v2.0.0 〜 v2.1.33</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ ...cardStyle, padding: "4px", marginBottom: "16px" }}>
          <input
            type="text"
            placeholder="🔍 キーワードで検索..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "none",
              background: "transparent",
              fontSize: "14px",
              color: "#1e293b",
              outline: "none",
              fontFamily: FONT_SANS,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Tag filters */}
        <div
          style={{
            ...cardStyle,
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "16px",
            padding: "16px",
          }}
        >
          {ALL_TAGS.map((tag) => {
            const active = activeTags.has(tag);
            const colors = TAG_COLORS[tag];
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: `1.5px solid ${active ? colors.bg : "#e2e8f0"}`,
                  background: active ? colors.bg : "#fff",
                  color: active ? "#fff" : "#64748b",
                  transition: "all 0.15s",
                  fontFamily: FONT_SANS,
                }}
              >
                {TAG_LABELS[tag]}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            padding: "0 4px",
          }}
        >
          <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
            {filtered.length} バージョン ・ {totalItems} 件表示中
          </span>
          <button
            onClick={toggleAll}
            style={{
              padding: "6px 16px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid #e2e8f0",
              background: "#fff",
              color: "#475569",
              fontFamily: FONT_SANS,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            {allExpanded ? "📁 すべて閉じる" : "📂 すべて開く"}
          </button>
        </div>

        {/* Version cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((release) => (
            <VersionCard
              key={release.v}
              version={release.v}
              items={release.items}
              isOpen={openVersions.has(release.v)}
              onToggle={() => toggleVersion(release.v)}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <p style={{ color: "#94a3b8", fontSize: "15px", margin: 0 }}>
              条件に一致する変更はありません
            </p>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            padding: "24px",
            marginTop: "24px",
            color: "#94a3b8",
            fontSize: "12px",
          }}
        >
          Claude Code Release Notes Viewer
        </div>
      </div>
    </div>
  );
}
