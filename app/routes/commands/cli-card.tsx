import { BaseCard } from "~/components/base-card";
import type { Command } from "./constants";
import { CLI_ACCENT } from "./constants";

export function CLICard({
  cmd,
  kind,
  onClick,
}: {
  cmd: Command;
  kind: "command" | "flag";
  onClick: () => void;
}): React.JSX.Element {
  return (
    <BaseCard
      accentColor={CLI_ACCENT}
      onClick={onClick}
      className="gap-2.5 h-[200px] px-5 py-[18px]"
    >
      <div className="flex items-baseline gap-2">
        <code className="font-mono text-sm font-bold whitespace-nowrap text-purple-300">
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
        style={{ padding: "2px 8px", background: "rgba(139, 92, 246, 0.15)", color: CLI_ACCENT }}
      >
        {kind === "command" ? "Command" : "Flag"}
      </span>
    </BaseCard>
  );
}
