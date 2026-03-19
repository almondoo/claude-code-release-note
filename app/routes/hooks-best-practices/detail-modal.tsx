import { BeforeAfterExamples } from "~/components/before-after-examples";
import { CodeBlockView } from "~/components/code-block-view";
import { DetailModalShell } from "~/components/detail-modal";
import { HeaderTags } from "~/components/header-tags";
import { ParagraphList, renderInlineMarkdown } from "~/components/paragraph-list";
import { TipsList } from "~/components/tips-list";

import type { HooksItem } from "./constants";
import { SECTIONS, SECTION_ICONS, TAG_COLORS } from "./constants";

export const DetailModal = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: HooksItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element => {
  const sectionIcon = SECTION_ICONS[
    SECTIONS.find((s) => s.items.some((i) => i.id === item.id))?.id ?? ""
  ]?.() ?? (
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
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="700px"
      icon={sectionIcon}
      bodyClassName="p-6 overflow-y-auto flex-1 min-h-0 flex flex-col gap-5"
      headerContent={
        <>
          <h2 className="text-base font-bold text-slate-100 m-0 leading-snug">{item.title}</h2>
          <p className="text-[14px] text-slate-300 mt-1.5 font-sans leading-[1.6] m-0">
            {item.summary}
          </p>
          <HeaderTags
            sectionName={sectionName}
            accentColor={accentColor}
            tags={item.tags}
            tagColors={TAG_COLORS}
          />
        </>
      }
    >
      {/* Content paragraphs */}
      <ParagraphList content={item.content} />

      {/* Before/After examples */}
      {item.examples && item.examples.length > 0 && (
        <BeforeAfterExamples examples={item.examples} />
      )}

      {/* Steps (handler types / phases) */}
      {item.steps && item.steps.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            詳細
          </h3>
          <div className="flex flex-col gap-2.5">
            {item.steps.map((step, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-700 p-4 flex gap-3 items-start"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: accentColor + "18", color: accentColor }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-100 mb-1">
                    <code className="font-mono text-[13px] bg-slate-700/50 px-1.5 py-0.5 rounded">
                      {step.phase}
                    </code>
                  </div>
                  <div className="text-[13px] text-slate-300 leading-relaxed mb-2">
                    {renderInlineMarkdown(step.description)}
                  </div>
                  <div className="text-[12px] text-slate-400 italic">
                    {step.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips list */}
      {item.tips && item.tips.length > 0 && <TipsList tips={item.tips} />}

      {/* Single code block */}
      {item.code && (
        <div className="shrink-0">
          <CodeBlockView
            block={{
              lang: item.code.trimStart().startsWith("{") ? "json" : "bash",
              label: item.code.trimStart().startsWith("{") ? "settings.json" : "スクリプト",
              value: item.code,
            }}
          />
        </div>
      )}

      {/* Multiple code blocks */}
      {item.codeBlocks && item.codeBlocks.length > 0 && (
        <div className="flex flex-col gap-3">
          {item.codeBlocks.map((block, i) => (
            <CodeBlockView
              key={i}
              block={{
                lang: block.lang,
                label: block.label,
                value: block.value,
                recommended: block.recommended,
              }}
            />
          ))}
        </div>
      )}

      {/* Config locations */}
      {item.locations && item.locations.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-purple-300 font-mono m-0">
            配置場所
          </h3>
          <div className="flex flex-col gap-1.5">
            {item.locations.map((loc, i) => (
              <div
                key={i}
                className="flex gap-3 items-start rounded-lg border border-slate-700 p-3"
              >
                <code className="font-mono text-[13px] text-purple-300 shrink-0 bg-purple-500/10 px-2 py-0.5 rounded">
                  {loc.path}
                </code>
                <span className="text-[13px] text-slate-300 leading-relaxed">
                  {renderInlineMarkdown(loc.description)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DetailModalShell>
  );
};
