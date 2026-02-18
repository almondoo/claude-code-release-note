import { DetailModalShell } from "~/components/detail-modal";
import { CodeBlockView } from "~/components/code-block-view";
import { CalloutBox } from "~/components/callout-box";

import type { CustomizationItem } from "./constants";
import { DEFAULT_TAG_COLOR, TAB_ICONS, TAG_COLORS } from "./constants";

export function DetailModal({
  item,
  tabId,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: CustomizationItem;
  tabId: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const IconComponent = TAB_ICONS[tabId];

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="680px"
      icon={IconComponent ? <IconComponent /> : null}
      headerContent={
        <>
          <div className="font-sans text-base font-bold text-slate-100 leading-snug">
            {item.title}
          </div>
          <div className="text-[13px] text-slate-400 mt-1 font-sans leading-[1.6]">
            {item.description}
          </div>
          {item.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {item.tags.map((tag) => {
                const colors = TAG_COLORS[tag] ?? DEFAULT_TAG_COLOR;
                return (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold rounded px-2 py-0.5"
                    style={{ color: colors.color, background: colors.bg }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-2.5">
        <div
          className="text-[12px] font-bold tracking-wide uppercase font-mono"
          style={{ color: accentColor }}
        >
          詳細説明
        </div>
        <p className="m-0 text-[14px] leading-[1.8] text-slate-400 font-sans whitespace-pre-line">
          {item.content}
        </p>
      </div>

      {item.code.length > 0 && (
        <div className="flex flex-col gap-3">
          <div
            className="text-[12px] font-bold tracking-wide uppercase font-mono"
            style={{ color: accentColor }}
          >
            コード例
          </div>
          {item.code.map((block, i) => (
            <CodeBlockView key={i} block={block} />
          ))}
        </div>
      )}

      {item.callouts.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {item.callouts.map((callout, i) => (
            <CalloutBox key={i} callout={callout} />
          ))}
        </div>
      )}
    </DetailModalShell>
  );
}
