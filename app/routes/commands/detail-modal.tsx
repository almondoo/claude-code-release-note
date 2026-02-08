import {
  DetailInfoIcon,
  TerminalIcon,
  TimingIcon,
} from "~/components/icons";
import { DetailModalShell } from "~/components/detail-modal";

import type { ModalData } from "./constants";
import { CLI_ACCENT, SHORTCUT_ACCENT } from "./constants";

export function getModalFields(data: ModalData): {
  accentColor: string;
  detail: string;
  whenToUse: string;
  description: string;
  title: React.ReactNode;
  extraHeader: React.ReactNode;
} {
  if (data.type === "command") {
    const { accentColor } = data;
    return {
      accentColor,
      detail: data.cmd.detail,
      whenToUse: data.cmd.whenToUse,
      description: data.cmd.description,
      title: (
        <div className="flex items-baseline gap-2 flex-wrap">
          <code className="font-mono text-base font-bold" style={{ color: accentColor }}>{data.cmd.name}</code>
          {data.cmd.args && (
            <span className="text-xs text-slate-500 font-mono">{data.cmd.args}</span>
          )}
        </div>
      ),
      extraHeader: (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          <span
            className="text-[10px] font-semibold rounded"
            style={{ padding: "2px 8px", background: accentColor + "18", color: accentColor }}
          >
            {data.categoryName}
          </span>
          <span
            className="text-[10px] font-semibold rounded"
            style={{ padding: "2px 8px", background: "rgba(16, 185, 129, 0.15)", color: "#6EE7B7" }}
          >
            スラッシュコマンド
          </span>
        </div>
      ),
    };
  }

  if (data.type === "cli") {
    return {
      accentColor: CLI_ACCENT,
      detail: data.cmd.detail,
      whenToUse: data.cmd.whenToUse,
      description: data.cmd.description,
      title: (
        <div className="flex items-baseline gap-2 flex-wrap">
          <code className="font-mono text-base font-bold" style={{ color: CLI_ACCENT }}>{data.cmd.name}</code>
          {data.cmd.args && (
            <span className="text-xs text-slate-500 font-mono">{data.cmd.args}</span>
          )}
        </div>
      ),
      extraHeader: (
        <div className="flex gap-1.5 mt-2">
          <span
            className="text-[10px] font-semibold rounded"
            style={{ padding: "2px 8px", background: "rgba(139, 92, 246, 0.15)", color: CLI_ACCENT }}
          >
            CLI {data.kind === "command" ? "Command" : "Flag"}
          </span>
        </div>
      ),
    };
  }

  // data.type === "shortcut"
  return {
    accentColor: SHORTCUT_ACCENT,
    detail: data.shortcut.detail,
    whenToUse: data.shortcut.whenToUse,
    description: data.shortcut.description,
    title: (
      <kbd
        className="font-mono text-sm font-semibold"
        style={{
          color: SHORTCUT_ACCENT,
          background: "rgba(249, 115, 22, 0.15)",
          padding: "4px 14px",
          borderRadius: "6px",
          border: "1px solid #FDBA7430",
        }}
      >
        {data.shortcut.key}
      </kbd>
    ),
    extraHeader: (
      <div className="flex gap-1.5 mt-2">
        <span
          className="text-[10px] font-semibold rounded"
          style={{ padding: "2px 8px", background: "rgba(249, 115, 22, 0.15)", color: SHORTCUT_ACCENT }}
        >
          ショートカット
        </span>
      </div>
    ),
  };
}

export function DetailModal({
  data,
  onClose,
  reducedMotion,
}: {
  data: ModalData;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const { accentColor, detail, whenToUse, description, title, extraHeader } = getModalFields(data);

  const icon = data.type === "shortcut" ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  ) : (
    <TerminalIcon />
  );

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      icon={icon}
      headerContent={
        <>
          {title}
          <div className="text-[13px] text-slate-400 mt-1.5 font-sans leading-[1.6]">
            {description}
          </div>
          {extraHeader}
        </>
      }
    >
      {/* Detail */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-cyan-300 text-[11px] font-bold tracking-wide uppercase font-mono">
          <DetailInfoIcon />
          詳細説明
        </div>
        <p className="m-0 text-[13px] leading-[1.8] text-slate-400 font-sans">
          {detail}
        </p>
      </div>

      {/* When to use */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-1.5 text-orange-300 text-[11px] font-bold tracking-wide uppercase font-mono">
          <TimingIcon />
          使うタイミング
        </div>
        <p className="m-0 text-[13px] leading-[1.8] text-slate-400 font-sans">
          {whenToUse}
        </p>
      </div>
    </DetailModalShell>
  );
}
