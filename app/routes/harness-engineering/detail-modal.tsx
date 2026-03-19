import { CodeBlockView } from "~/components/code-block-view";
import { DetailModalShell } from "~/components/detail-modal";
import { HeaderTags } from "~/components/header-tags";
import { ParagraphList, renderInlineMarkdown } from "~/components/paragraph-list";
import { TipsList } from "~/components/tips-list";

import type { HEItem } from "./constants";
import { SECTIONS, SECTION_ICONS, TAG_COLORS } from "./constants";

// ---------------------------------------------------------------------------
// Table renderer
// ---------------------------------------------------------------------------

const DataTable = ({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
      {title}
    </h3>
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-800">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-slate-200 border-b border-slate-700">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 1 ? "bg-slate-800/30" : ""}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-slate-300 border-b border-slate-700/50">
                  {renderInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Gotchas list
// ---------------------------------------------------------------------------

const GotchasList = ({ items }: { items: string[] }) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-[12px] font-bold uppercase tracking-wider text-amber-300 font-mono m-0">
      注意点
    </h3>
    <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
      {items.map((g, i) => (
        <li key={i} className="flex gap-2 items-start text-[13px] text-slate-300 leading-relaxed">
          <span className="text-amber-400 shrink-0 mt-0.5">⚠</span>
          <span>{renderInlineMarkdown(g)}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ---------------------------------------------------------------------------
// Real-world examples
// ---------------------------------------------------------------------------

const RealWorldList = ({ items }: { items: string[] }) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
      実例
    </h3>
    <div className="flex flex-col gap-2">
      {items.map((rw, i) => (
        <div
          key={i}
          className="bg-slate-800/50 border-l-2 border-cyan-500 pl-4 pr-3 py-2.5 rounded-r-lg"
        >
          <p className="m-0 text-[13px] text-slate-300 leading-relaxed">
            {renderInlineMarkdown(rw)}
          </p>
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Detail modal
// ---------------------------------------------------------------------------

export const DetailModal = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: HEItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element => {
  const sectionIcon = SECTION_ICONS[
    SECTIONS.find((s) => s.items.some((i) => i.id === item.id))?.id ?? ""
  ]?.() ?? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

      {/* Tables */}
      {item.tables?.map((table, i) => (
        <DataTable key={i} title={table.title} headers={table.headers} rows={table.rows} />
      ))}

      {/* Code block */}
      {item.code && <CodeBlockView block={{ lang: "text", label: "コード", value: item.code }} />}

      {/* Tips */}
      {item.tips && item.tips.length > 0 && <TipsList tips={item.tips} />}

      {/* Gotchas */}
      {item.gotchas && item.gotchas.length > 0 && <GotchasList items={item.gotchas} />}

      {/* Real-world examples */}
      {item.realWorld && item.realWorld.length > 0 && <RealWorldList items={item.realWorld} />}
    </DetailModalShell>
  );
};
