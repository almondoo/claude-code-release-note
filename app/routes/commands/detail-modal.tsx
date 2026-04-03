import { InfoIcon, TerminalIcon, TimingIcon } from "~/components/icons";
import { DetailModalShell } from "~/components/detail-modal";
import { SectionHeading } from "~/components/section-heading";
import { ParagraphList } from "~/components/paragraph-list";

import type { CommandItem } from "./constants";

export const DetailModal = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: CommandItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element => {
  const isShortcut = item.itemType === "shortcut";

  const icon = isShortcut ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  ) : (
    <TerminalIcon />
  );

  const typeLabel =
    item.itemType === "slash"
      ? "スラッシュコマンド"
      : item.itemType === "cli-command"
        ? "CLI Command"
        : item.itemType === "cli-flag"
          ? "CLI Flag"
          : "ショートカット";

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      icon={icon}
      headerContent={
        <>
          <div className="flex items-baseline gap-2 flex-wrap">
            <code className="font-mono text-base font-bold" style={{ color: accentColor }}>
              {item.title}
            </code>
            {item.args && <span className="text-xs text-slate-500 font-mono">{item.args}</span>}
          </div>
          <div className="text-[14px] text-slate-300 mt-1.5 font-sans leading-[1.6]">
            {item.description}
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <span
              className="text-[11px] font-semibold rounded"
              style={{ padding: "2px 8px", background: accentColor + "18", color: accentColor }}
            >
              {sectionName}
            </span>
            <span
              className="text-[11px] font-semibold rounded"
              style={{
                padding: "2px 8px",
                background: "rgba(100, 116, 139, 0.15)",
                color: "#94A3B8",
              }}
            >
              {typeLabel}
            </span>
          </div>
        </>
      }
    >
      {/* Detail */}
      <div className="flex flex-col gap-2.5">
        <SectionHeading icon={<InfoIcon />} label="詳細説明" color="#67E8F9" />
        <ParagraphList content={item.detail} />
      </div>

      {/* When to use */}
      <div className="flex flex-col gap-2.5">
        <SectionHeading icon={<TimingIcon />} label="使うタイミング" color="#FDBA74" />
        <ParagraphList content={item.whenToUse} />
      </div>
    </DetailModalShell>
  );
};
