import type { HighlightVariant } from "./constants";
import { HIGHLIGHT_STYLES } from "./constants";

interface HighlightBoxProps {
  variant: HighlightVariant;
  title?: string;
  content: React.ReactNode;
}

export function HighlightBox({ variant, title, content }: HighlightBoxProps): React.JSX.Element {
  const style = HIGHLIGHT_STYLES[variant];
  return (
    <div
      className="rounded-lg px-5 py-4 flex flex-col gap-2"
      style={{
        background: style.bg,
        borderLeft: `3px solid ${style.border}`,
      }}
    >
      {title && (
        <span
          className="text-[12px] font-bold uppercase tracking-wider font-mono"
          style={{ color: style.color }}
        >
          {title}
        </span>
      )}
      <span className="text-[14px] text-slate-300 leading-[1.8] font-sans">{content}</span>
    </div>
  );
}
