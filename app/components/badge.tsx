// ---------------------------------------------------------------------------
// Shared tag color/label constants and Badge component.
// Used by release-note.tsx and version-detail.tsx.
// ---------------------------------------------------------------------------

export interface TagColor {
  bg: string;
  text: string;
}

export const TAG_COLORS: Record<string, TagColor> = {
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

export const TAG_LABELS: Record<string, string> = {
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

interface BadgeProps {
  tag: string;
  small?: boolean;
}

export function Badge({ tag, small }: BadgeProps): React.JSX.Element {
  const colors = TAG_COLORS[tag];
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap font-semibold tracking-wide ${
        small ? "px-[7px] py-px text-[11px]" : "px-[9px] py-[2px] text-[12px]"
      }`}
      style={{
        borderRadius: "6px",
        background: colors?.bg ?? "rgba(100,116,139,0.15)",
        color: colors?.text ?? "#94A3B8",
        lineHeight: 1.6,
        letterSpacing: "0.2px",
      }}
    >
      {TAG_LABELS[tag] ?? tag}
    </span>
  );
}
