export interface Callout {
  type: "info" | "warning" | "tip" | "important";
  text: string;
}

export const CALLOUT_STYLES: Record<
  Callout["type"],
  { color: string; bg: string; border: string; label: string }
> = {
  info: { color: "#60A5FA", bg: "rgba(59, 130, 246, 0.08)", border: "#3B82F6", label: "Info" },
  warning: { color: "#FBBF24", bg: "rgba(234, 179, 8, 0.08)", border: "#EAB308", label: "Warning" },
  tip: { color: "#34D399", bg: "rgba(16, 185, 129, 0.08)", border: "#10B981", label: "Tip" },
  important: {
    color: "#F87171",
    bg: "rgba(239, 68, 68, 0.08)",
    border: "#EF4444",
    label: "Important",
  },
};

export function CalloutBox({ callout }: { callout: Callout }): React.JSX.Element {
  const style = CALLOUT_STYLES[callout.type] || CALLOUT_STYLES.info;
  return (
    <div
      className="rounded-lg px-4 py-3 flex gap-3 items-start"
      style={{
        background: style.bg,
        borderLeft: `3px solid ${style.border}`,
      }}
    >
      <span
        className="text-[11px] font-bold uppercase tracking-wider shrink-0 mt-0.5 font-mono"
        style={{ color: style.color }}
      >
        {style.label}
      </span>
      <span className="text-[14px] text-slate-300 leading-relaxed font-sans">{callout.text}</span>
    </div>
  );
}
