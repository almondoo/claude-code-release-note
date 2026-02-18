import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { FileIcon, FolderIcon } from "~/components/icons";
import type { Entry } from "./constants";
import { RECOMMEND_CONFIG, VCS_CONFIG, getVcsKey } from "./constants";

export function BadgeWithTooltip({
  label,
  color,
  bg,
  title,
}: {
  label: string;
  color: string;
  bg: string;
  title: string;
}): React.JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const show = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);
  const hide = useCallback(() => setPos(null), []);

  return (
    <>
      <span
        ref={ref}
        className="text-[11px] font-semibold whitespace-nowrap rounded cursor-help"
        style={{ padding: "2px 8px", background: bg, color }}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {label}
      </span>
      {pos &&
        createPortal(
          <span
            className="fixed pointer-events-none px-2.5 py-1.5 rounded-md bg-slate-800 text-slate-200 text-[12px] leading-snug whitespace-nowrap shadow-lg border border-slate-700 z-[9999] -translate-x-1/2"
            style={{
              left: pos.x,
              top: pos.y - 8,
              transform: "translate(-50%, -100%)",
            }}
          >
            {title}
          </span>,
          document.body,
        )}
    </>
  );
}

export function EntryCard({
  entry,
  accentColor,
  onClick,
}: {
  entry: Entry;
  accentColor: string;
  onClick: () => void;
}): React.JSX.Element {
  const recommendCfg = RECOMMEND_CONFIG[entry.recommended];
  const vcsCfg = VCS_CONFIG[getVcsKey(entry.vcs)];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="hover-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden h-[200px]"
      style={{ padding: "18px 20px", ["--accent" as string]: accentColor }}
    >
      <div
        className="absolute top-0 left-0 right-0 rounded-t-xl"
        style={{
          height: "3px",
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
        }}
      />

      <div className="flex items-center gap-2">
        <span className="shrink-0 flex items-center" style={{ color: accentColor }}>
          {entry.type === "directory" ? <FolderIcon /> : <FileIcon />}
        </span>
        <code
          className="font-mono text-[14px] font-bold overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: accentColor }}
        >
          {entry.path}
        </code>
      </div>

      <div className="text-sm font-semibold text-slate-100 font-sans leading-[1.4]">
        {entry.name}
      </div>

      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 line-clamp-2">
        {entry.description}
      </p>

      <div className="flex gap-1.5 mt-auto flex-wrap">
        <BadgeWithTooltip {...recommendCfg} />
        <BadgeWithTooltip {...vcsCfg} />
      </div>
    </div>
  );
}
