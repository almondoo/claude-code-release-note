import { BeforeAfterExamples } from "~/components/before-after-examples";
import { CodeBlockView } from "~/components/code-block-view";
import { DetailModalShell } from "~/components/detail-modal";
import { HeaderTags } from "~/components/header-tags";
import { ParagraphList, renderInlineMarkdown } from "~/components/paragraph-list";
import { TipsList } from "~/components/tips-list";

import type { BPItem } from "./constants";
import { SECTIONS, SECTION_ICONS, TAG_COLORS } from "./constants";

export const DetailModal = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: BPItem;
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="700px"
      icon={sectionIcon}
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

      {/* Before/After examples table */}
      {item.examples && item.examples.length > 0 && (
        <BeforeAfterExamples examples={item.examples} />
      )}

      {/* Steps (workflow phases) */}
      {item.steps && item.steps.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            フェーズ
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
                  <div className="text-sm font-semibold text-slate-100 mb-1">{step.phase}</div>
                  <div className="text-[13px] text-slate-300 leading-relaxed mb-2">
                    {renderInlineMarkdown(step.description)}
                  </div>
                  <CodeBlockView block={{ lang: "text", label: step.phase, value: step.example }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips list */}
      {item.tips && item.tips.length > 0 && <TipsList tips={item.tips} />}

      {/* Code block */}
      {item.code && <CodeBlockView block={{ lang: "text", label: "コード", value: item.code }} />}
    </DetailModalShell>
  );
};
