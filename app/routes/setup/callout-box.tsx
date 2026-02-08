import type { Callout } from "./constants";
import { CALLOUT_STYLES } from "./constants";

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
        className="text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 font-mono"
        style={{ color: style.color }}
      >
        {style.label}
      </span>
      <span className="text-[13px] text-slate-300 leading-relaxed font-sans">{callout.text}</span>
    </div>
  );
}
