import { DetailModalShell } from "~/components/detail-modal";
import { ModalSection } from "~/components/modal-section";
import { ParagraphList } from "~/components/paragraph-list";
import type { EnvCategory, EnvVar } from "./constants";
import { CATEGORY_COLORS } from "./constants";

export function DetailModal({
  envVar,
  category,
  accentColor,
  onClose,
  reducedMotion,
}: {
  envVar: EnvVar;
  category: EnvCategory;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      }
      iconBackground={CATEGORY_COLORS[category.id]?.bg || "rgba(59, 130, 246, 0.25)"}
      bodyClassName="p-6 overflow-y-auto flex-1 flex flex-col gap-6"
      headerContent={
        <>
          <code
            className="font-mono text-[15px] font-bold break-all"
            style={{ color: accentColor }}
          >
            {envVar.name}
          </code>
          <div className="text-sm text-slate-400 mt-1 font-sans">{envVar.description}</div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <span
              className="text-[11px] font-semibold whitespace-nowrap rounded"
              style={{
                padding: "2px 8px",
                background: CATEGORY_COLORS[category.id]?.bg,
                color: accentColor,
              }}
            >
              {category.name}
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
        </>
      }
    >
      <ModalSection label="説明" accentColor={accentColor}>
        <ParagraphList
          content={envVar.detail}
          className="m-0 text-[14px] leading-[1.8] text-slate-400 font-sans"
        />
      </ModalSection>

      {envVar.values && (
        <ModalSection label="設定可能な値" accentColor={accentColor}>
          <div
            className="bg-slate-900 rounded-[10px] border border-slate-700"
            style={{ padding: "14px 16px" }}
          >
            <p className="m-0 text-sm text-slate-300 font-sans">{envVar.values}</p>
          </div>
        </ModalSection>
      )}

      {envVar.default && (
        <ModalSection label="デフォルト値" accentColor={accentColor}>
          <div
            className="bg-slate-900 rounded-[10px] border border-slate-700"
            style={{ padding: "14px 16px" }}
          >
            <code className="font-mono text-sm text-slate-300">{envVar.default}</code>
          </div>
        </ModalSection>
      )}

      {envVar.example && (
        <ModalSection label="設定例" accentColor={accentColor}>
          <div
            className="rounded-[10px]"
            style={{
              background: "rgba(20, 184, 166, 0.15)",
              border: "1px solid rgba(94, 234, 212, 0.125)",
              padding: "14px 16px",
            }}
          >
            <code className="font-mono text-xs text-slate-300 break-all">{envVar.example}</code>
          </div>
        </ModalSection>
      )}

      {envVar.links.length > 0 && (
        <ModalSection label="関連ドキュメント" accentColor={accentColor}>
          <div className="flex flex-col gap-2">
            {envVar.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-sans no-underline rounded-lg border border-slate-700 flex items-center gap-2 transition-colors"
                style={{ padding: "10px 14px", color: accentColor }}
              >
                <span>{link.label}</span>
                <span className="text-slate-500">&rarr;</span>
              </a>
            ))}
          </div>
        </ModalSection>
      )}
    </DetailModalShell>
  );
}
