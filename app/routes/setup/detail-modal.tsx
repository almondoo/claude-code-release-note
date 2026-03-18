import { CalloutBox } from "~/components/callout-box";
import { CodeBlockView } from "~/components/code-block-view";
import { DetailModalShell } from "~/components/detail-modal";
import { HeaderTags } from "~/components/header-tags";
import { ParagraphList } from "~/components/paragraph-list";

import type { Step } from "./constants";
import { SECTIONS, SECTION_ICONS, TAG_COLORS } from "./constants";

export const DetailModal = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: Step;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element => {
  const sectionIcon = SECTION_ICONS[
    SECTIONS.find((s) => s.steps.some((st) => st.id === item.id))?.id ?? ""
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
          <p className="text-[14px] text-slate-400 mt-1.5 font-sans leading-[1.6] m-0">
            {item.description}
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

      {/* Code blocks */}
      {item.code.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            コード
          </h3>
          {item.code.map((block, i) => (
            <CodeBlockView key={i} block={block} />
          ))}
        </div>
      )}

      {/* Callouts */}
      {item.callouts.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {item.callouts.map((callout, i) => (
            <CalloutBox key={i} callout={callout} />
          ))}
        </div>
      )}
    </DetailModalShell>
  );
};
