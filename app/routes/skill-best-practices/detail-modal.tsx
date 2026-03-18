import { DetailModalShell } from "~/components/detail-modal";
import { HeaderTags } from "~/components/header-tags";
import { ParagraphList } from "~/components/paragraph-list";

import type { BPItem } from "./constants";
import { SECTIONS, SECTION_ICONS, TAG_COLORS } from "./constants";

export function DetailModal({
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
}): React.JSX.Element {
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
          <p className="text-[14px] text-slate-400 mt-1.5 font-sans leading-[1.6] m-0">
            {item.summary}
          </p>
          <HeaderTags sectionName={sectionName} accentColor={accentColor} tags={item.tags} tagColors={TAG_COLORS} />
        </>
      }
    >
      {/* Content paragraphs */}
      <ParagraphList content={item.content} />

      {/* Before/After examples table */}
      {item.examples && item.examples.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            具体例（Before → After）
          </h3>
          <div className="flex flex-col gap-2.5">
            {item.examples.map((ex, i) => (
              <div key={i} className="rounded-lg border border-slate-700 overflow-hidden">
                <div className="px-4 py-2 bg-slate-800 text-[12px] font-semibold text-slate-300">
                  {ex.strategy}
                  {ex.detail ? ` — ${ex.detail}` : ""}
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-700">
                  <div className="p-3">
                    <span className="block text-[11px] font-bold text-red-400 mb-1 uppercase tracking-wider">
                      Before
                    </span>
                    <span className="text-[13px] text-slate-400 leading-relaxed italic whitespace-pre-wrap">
                      {ex.before}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="block text-[11px] font-bold text-green-400 mb-1 uppercase tracking-wider">
                      After
                    </span>
                    <span className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {ex.after}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
                  <div className="text-[13px] text-slate-400 leading-relaxed mb-2">
                    {step.description}
                  </div>
                  <pre className="m-0 p-3 bg-[#0B1120] rounded-md overflow-x-auto text-[13px] leading-relaxed border border-slate-800">
                    <code className="font-mono text-slate-300 whitespace-pre-wrap">
                      {step.example}
                    </code>
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips list */}
      {item.tips && item.tips.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-orange-300 font-mono m-0">
            ポイント
          </h3>
          <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
            {item.tips.map((tip, i) => (
              <li
                key={i}
                className="flex gap-2 items-start text-[14px] text-slate-300 leading-relaxed"
              >
                <span className="text-slate-500 shrink-0 mt-[2px]">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Code block */}
      {item.code && (
        <div className="rounded-lg overflow-hidden border border-slate-700">
          <pre className="m-0 p-4 bg-[#0B1120] overflow-x-auto text-[14px] leading-relaxed">
            <code className="font-mono text-slate-300 whitespace-pre-wrap">{item.code}</code>
          </pre>
        </div>
      )}
    </DetailModalShell>
  );
}
