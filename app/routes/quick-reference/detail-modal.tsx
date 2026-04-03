import { CopyButton } from "~/components/copy-button";
import { DetailModalShell } from "~/components/detail-modal";
import { HeaderTags } from "~/components/header-tags";
import { ModalSection } from "~/components/modal-section";
import { ParagraphList } from "~/components/paragraph-list";

import type { AnyItem, CommandItem, PluginItem, EnvVarItem } from "./constants";
import { CATEGORY_CONFIGS } from "./constants";

// ---------------------------------------------------------------------------
// Helper: resolve section icon for a given category + item
// ---------------------------------------------------------------------------

const STAR_FALLBACK = () => (
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
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const resolveSectionIcon = (categoryId: string, itemId: string): React.JSX.Element => {
  const config = CATEGORY_CONFIGS[categoryId];
  return (
    config.sectionIcons[
      config.sections.find((s) => s.items.some((i) => i.id === itemId))?.id ?? ""
    ]?.() ?? STAR_FALLBACK()
  );
};

// ---------------------------------------------------------------------------
// CommandDetailContent
// ---------------------------------------------------------------------------

const CommandDetailContent = ({
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
}) => {
  const sectionIcon = resolveSectionIcon("commands", item.id);
  const tagColors = CATEGORY_CONFIGS["commands"].tagColors;

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="700px"
      icon={sectionIcon}
      headerContent={
        <>
          <code className="font-mono text-base font-bold break-all" style={{ color: accentColor }}>
            {item.title}
          </code>
          <p className="text-[14px] text-slate-300 mt-1.5 font-sans leading-[1.6] m-0">
            {item.summary}
          </p>
          <HeaderTags
            sectionName={sectionName}
            accentColor={accentColor}
            tags={item.tags}
            tagColors={tagColors}
          />
        </>
      }
    >
      <ParagraphList content={item.content} />
    </DetailModalShell>
  );
};

// ---------------------------------------------------------------------------
// PluginDetailContent
// ---------------------------------------------------------------------------

const PluginDetailContent = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: PluginItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}) => {
  const sectionIcon = resolveSectionIcon("plugins", item.id);
  const tagColors = CATEGORY_CONFIGS["plugins"].tagColors;

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="700px"
      icon={sectionIcon}
      headerContent={
        <>
          <code className="font-mono text-base font-bold break-all" style={{ color: accentColor }}>
            {item.title}
          </code>
          <p className="text-[14px] text-slate-300 mt-1.5 font-sans leading-[1.6] m-0">
            {item.summary}
          </p>
          <HeaderTags
            sectionName={sectionName}
            accentColor={accentColor}
            tags={item.tags}
            tagColors={tagColors}
          />
        </>
      }
    >
      {/* Install command */}
      {item.install && (
        <div
          className="bg-slate-900 rounded-lg flex items-center justify-between gap-3 px-3.5 py-2.5"
          style={{ border: `1px solid ${accentColor}20` }}
        >
          <code
            className="font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ color: accentColor }}
          >
            {item.install}
          </code>
          <CopyButton text={item.install} />
        </div>
      )}

      {/* Provider badge */}
      {item.provider && (
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-500 font-sans">提供元:</span>
          <span
            className="text-[11px] font-semibold rounded px-2 py-[2px]"
            style={{
              background:
                item.provider === "Anthropic公式"
                  ? "rgba(6,182,212,0.15)"
                  : "rgba(139,92,246,0.15)",
              color: item.provider === "Anthropic公式" ? "#67E8F9" : "#C4B5FD",
            }}
          >
            {item.provider}
          </span>
        </div>
      )}

      {/* Detail content */}
      <ParagraphList content={item.content} />
    </DetailModalShell>
  );
};

// ---------------------------------------------------------------------------
// EnvVarDetailContent
// ---------------------------------------------------------------------------

const EnvVarDetailContent = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: EnvVarItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}) => {
  const sectionIcon = resolveSectionIcon("env-vars", item.id);
  const tagColors = CATEGORY_CONFIGS["env-vars"].tagColors;

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="700px"
      icon={sectionIcon}
      headerContent={
        <>
          <code
            className="font-mono text-[15px] font-bold break-all"
            style={{ color: accentColor }}
          >
            {item.title}
          </code>
          <p className="text-sm text-slate-300 mt-1 font-sans">{item.summary}</p>
          <HeaderTags
            sectionName={sectionName}
            accentColor={accentColor}
            tags={item.tags}
            tagColors={tagColors}
          />
        </>
      }
    >
      {/* Description */}
      <ModalSection label="説明" accentColor={accentColor}>
        <ParagraphList content={item.content} />
      </ModalSection>

      {/* Possible values */}
      {item.values && (
        <ModalSection label="設定可能な値" accentColor={accentColor}>
          <div
            className="bg-slate-900 rounded-[10px] border border-slate-700"
            style={{ padding: "14px 16px" }}
          >
            <p className="m-0 text-sm text-slate-300 font-sans">{item.values}</p>
          </div>
        </ModalSection>
      )}

      {/* Default value */}
      {item.defaultValue && (
        <ModalSection label="デフォルト値" accentColor={accentColor}>
          <div
            className="bg-slate-900 rounded-[10px] border border-slate-700"
            style={{ padding: "14px 16px" }}
          >
            <code className="font-mono text-sm text-slate-300">{item.defaultValue}</code>
          </div>
        </ModalSection>
      )}

      {/* Example */}
      {item.example && (
        <ModalSection label="設定例" accentColor={accentColor}>
          <div
            className="rounded-[10px] flex items-center justify-between gap-3"
            style={{
              background: "rgba(20, 184, 166, 0.15)",
              border: "1px solid rgba(94, 234, 212, 0.125)",
              padding: "14px 16px",
            }}
          >
            <code className="font-mono text-xs text-slate-300 break-all">{item.example}</code>
            <CopyButton text={item.example} />
          </div>
        </ModalSection>
      )}
    </DetailModalShell>
  );
};

// ---------------------------------------------------------------------------
// Unified dispatcher
// ---------------------------------------------------------------------------

export const DetailModal = ({
  categoryId,
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  categoryId: string;
  item: AnyItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}) => {
  switch (categoryId) {
    case "commands":
      return (
        <CommandDetailContent
          item={item as CommandItem}
          sectionName={sectionName}
          accentColor={accentColor}
          onClose={onClose}
          reducedMotion={reducedMotion}
        />
      );
    case "plugins":
      return (
        <PluginDetailContent
          item={item as PluginItem}
          sectionName={sectionName}
          accentColor={accentColor}
          onClose={onClose}
          reducedMotion={reducedMotion}
        />
      );
    case "env-vars":
      return (
        <EnvVarDetailContent
          item={item as EnvVarItem}
          sectionName={sectionName}
          accentColor={accentColor}
          onClose={onClose}
          reducedMotion={reducedMotion}
        />
      );
    default:
      return null;
  }
};
