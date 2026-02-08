import { FileIcon, FolderIcon } from "~/components/icons";
import { DetailModalShell } from "~/components/detail-modal";
import type { Entry, Section } from "./constants";
import {
  MODAL_SECTION_META,
  RECOMMEND_CONFIG,
  SECTION_COLORS,
  VCS_CONFIG,
  getVcsKey,
} from "./constants";
import { BadgeWithTooltip } from "./entry-card";

export function DetailModal({
  entry,
  section,
  accentColor,
  onClose,
  reducedMotion,
}: {
  entry: Entry;
  section: Section;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const recommendCfg = RECOMMEND_CONFIG[entry.recommended];
  const vcsCfg = VCS_CONFIG[getVcsKey(entry.vcs)];

  const fullPath = section.basePath + entry.path;
  const detailParagraphs = entry.detail.split("\n\n").filter(Boolean);
  const usageParagraphs = entry.usage
    ? entry.usage.split("\n\n").filter(Boolean)
    : [];

  function ModalSection({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }): React.JSX.Element {
    const meta = MODAL_SECTION_META[id];
    return (
      <div className="flex flex-col gap-2.5">
        <div
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase font-mono"
          style={{ color: accentColor }}
        >
          {meta?.icon}
          {meta?.label}
        </div>
        {children}
      </div>
    );
  }

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      icon={entry.type === "directory" ? <FolderIcon /> : <FileIcon />}
      iconBackground={SECTION_COLORS[section.id]?.bg || "rgba(59, 130, 246, 0.25)"}
      bodyClassName="p-6 overflow-y-auto flex-1 flex flex-col gap-6"
      headerContent={
        <>
          <code
            className="font-mono text-[15px] font-bold break-all"
            style={{ color: accentColor }}
          >
            {entry.path}
          </code>
          <div className="text-sm font-semibold text-slate-100 mt-1 font-sans">
            {entry.name}
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <BadgeWithTooltip {...recommendCfg} />
            <BadgeWithTooltip {...vcsCfg} />
            <span
              className="text-[10px] font-semibold bg-slate-900 text-slate-500 rounded"
              style={{ padding: "2px 8px" }}
            >
              {entry.type === "directory" ? "ディレクトリ" : "ファイル"}
            </span>
          </div>
        </>
      }
    >
      <ModalSection id="detail">
        {detailParagraphs.map((p, i) => (
          <p
            key={i}
            className="m-0 text-[13px] leading-[1.8] text-slate-400 font-sans"
          >
            {p}
          </p>
        ))}
      </ModalSection>

      {usageParagraphs.length > 0 && (
        <ModalSection id="usage">
          <div
            className="rounded-[10px] flex flex-col gap-2"
            style={{
              background: "rgba(20, 184, 166, 0.15)",
              border: "1px solid rgba(94, 234, 212, 0.125)",
              padding: "14px 16px",
            }}
          >
            {usageParagraphs.map((p, i) => (
              <p
                key={i}
                className="m-0 text-xs leading-[1.8] text-slate-400 font-sans"
              >
                {p}
              </p>
            ))}
          </div>
        </ModalSection>
      )}

      <ModalSection id="location">
        <div
          className="bg-slate-900 rounded-[10px] border border-slate-700 flex flex-col gap-2"
          style={{ padding: "14px 16px" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">
              パス:
            </span>
            <code
              className="font-mono text-[13px] font-semibold"
              style={{ color: accentColor }}
            >
              {fullPath}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">
              スコープ:
            </span>
            <span className="text-xs text-slate-100 font-sans">
              {section.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-mono">
              ベースパス:
            </span>
            <code className="font-mono text-xs text-slate-400">
              {section.basePath}
            </code>
          </div>
        </div>
      </ModalSection>

      {entry.bestPractice && (
        <ModalSection id="bestPractices">
          <div
            className="rounded-[10px]"
            style={{
              background: "rgba(15, 23, 42, 0.5)",
              border: "1px solid rgba(51, 65, 85, 0.375)",
              padding: "14px 16px",
            }}
          >
            <p className="m-0 text-xs leading-[1.7] text-slate-400 font-sans">
              {entry.bestPractice}
            </p>
          </div>
        </ModalSection>
      )}
    </DetailModalShell>
  );
}
