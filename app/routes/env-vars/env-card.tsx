import type { EnvVar } from "./constants";

export function EnvCard({
  envVar,
  categoryName,
  accentColor,
  categoryBg,
  onClick,
}: {
  envVar: EnvVar;
  categoryName: string;
  accentColor: string;
  categoryBg: string;
  onClick: () => void;
}): React.JSX.Element {
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
      className="hover-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden h-[160px]"
      style={{ padding: "18px 20px", ["--accent" as string]: accentColor }}
    >
      <div
        className="absolute top-0 left-0 right-0 rounded-t-xl"
        style={{
          height: "3px",
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
        }}
      />

      <code
        className="font-mono text-[13px] font-bold overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ color: accentColor }}
      >
        {envVar.name}
      </code>

      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 line-clamp-2">
        {envVar.description}
      </p>

      <div className="flex gap-1.5 mt-auto flex-wrap">
        <span
          className="text-[11px] font-semibold whitespace-nowrap rounded"
          style={{ padding: "2px 8px", background: categoryBg, color: accentColor }}
        >
          {categoryName}
        </span>
        {envVar.deprecated && (
          <span
            className="text-[11px] font-semibold whitespace-nowrap rounded"
            style={{ padding: "2px 8px", background: "rgba(239, 68, 68, 0.15)", color: "#FCA5A5" }}
          >
            非推奨
          </span>
        )}
      </div>
    </div>
  );
}
