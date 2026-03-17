import { BaseCard } from "~/components/base-card";
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
    <BaseCard accentColor={SHORTCUT_ACCENT} onClick={onClick} className="gap-2.5 h-[200px] px-5 py-[18px]">
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
    </BaseCard>
  );
}
