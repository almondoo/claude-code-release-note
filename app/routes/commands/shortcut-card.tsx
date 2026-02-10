import type { Shortcut } from "./constants";
import { SHORTCUT_ACCENT } from "./constants";

export function ShortcutCard({
  shortcut,
  onClick,
}: {
  shortcut: Shortcut;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="hover-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden h-[200px] px-5 py-[18px]"
      style={{ "--accent": SHORTCUT_ACCENT } as React.CSSProperties}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${SHORTCUT_ACCENT}, ${SHORTCUT_ACCENT}40)` }}
      />
      <kbd
        className="font-mono text-[14px] font-semibold inline-block whitespace-nowrap w-fit"
        style={{
          color: SHORTCUT_ACCENT,
          background: "rgba(249, 115, 22, 0.15)",
          padding: "4px 12px",
          borderRadius: "6px",
          border: "1px solid #FDBA7430",
        }}
      >
        {shortcut.key}
      </kbd>
      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 line-clamp-2">
        {shortcut.description}
      </p>
    </div>
  );
}
