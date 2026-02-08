import { CopyButton } from "~/components/copy-button";
import type { Plugin } from "./constants";

interface PluginCardProps {
  plugin: Plugin;
  accentColor: string;
  onClick: () => void;
}

export function PluginCard({ plugin, accentColor, onClick }: PluginCardProps): React.JSX.Element {
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
        <code className="font-mono text-sm font-bold whitespace-nowrap" style={{ color: accentColor }}>
          {plugin.displayName}
        </code>
        {plugin.binary && (
          <span className="text-[10px] text-slate-500 font-mono bg-slate-900 whitespace-nowrap px-1.5 py-px rounded-sm">
            LSP
          </span>
        )}
      </div>
      <p className="m-0 text-xs leading-relaxed text-slate-400 font-sans flex-1 line-clamp-2">
        {plugin.description}
      </p>
      <div className="flex items-center gap-2 mt-auto">
        <code className="font-mono text-[10px] text-slate-500 bg-slate-900 rounded overflow-hidden text-ellipsis whitespace-nowrap flex-1 px-2 py-[2px]">
          {plugin.install}
        </code>
        <CopyButton text={plugin.install} />
      </div>
    </div>
  );
}
