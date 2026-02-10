import type { Command } from "./constants";

export function CommandCard({
  cmd,
  accentColor,
  categoryName,
  onClick,
}: {
  cmd: Command;
  accentColor: string;
  categoryName: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className="hover-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden h-[200px] px-5 py-[18px]"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` }}
      />
      <div className="flex items-baseline gap-2">
        <code
          className="font-mono text-sm font-bold whitespace-nowrap"
          style={{ color: accentColor }}
        >
          {cmd.name}
        </code>
        {cmd.args && (
          <span className="text-[12px] text-slate-500 font-mono whitespace-nowrap overflow-hidden text-ellipsis">
            {cmd.args}
          </span>
        )}
      </div>
      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 line-clamp-2">
        {cmd.description}
      </p>
      <span
        className="text-[11px] font-semibold rounded self-start whitespace-nowrap mt-auto"
        style={{
          padding: "2px 8px",
          background: accentColor + "18",
          color: accentColor,
        }}
      >
        {categoryName}
      </span>
    </div>
  );
}
