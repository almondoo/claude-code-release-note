import { DetailModalShell } from "~/components/detail-modal";

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
  const sectionIcon = SECTION_ICONS[SECTIONS.find((s) => s.items.some((i) => i.id === item.id))?.id ?? ""]?.() ?? (
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
          <h2 className="text-base font-bold text-slate-100 m-0 leading-snug">
            {item.title}
          </h2>
          <p className="text-[14px] text-slate-400 mt-1.5 font-sans leading-[1.6] m-0">
            {item.summary}
          </p>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <span
              className="text-[11px] font-semibold rounded"
              style={{ padding: "2px 8px", background: accentColor + "18", color: accentColor }}
            >
              {sectionName}
            </span>
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold rounded"
                style={{
                  padding: "2px 8px",
                  background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
                  color: TAG_COLORS[tag]?.color ?? "#94A3B8",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </>
      }
    >
      {/* Content paragraphs */}
      {item.content.split("\n\n").map((paragraph, i) => (
        <p key={i} className="m-0 text-[14px] leading-[1.8] text-slate-300 font-sans">
          {paragraph}
        </p>
      ))}

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
                  {ex.strategy}{ex.detail ? ` — ${ex.detail}` : ""}
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-700">
                  <div className="p-3">
                    <span className="block text-[11px] font-bold text-red-400 mb-1 uppercase tracking-wider">Before</span>
                    <span className="text-[13px] text-slate-400 leading-relaxed italic">{ex.before}</span>
                  </div>
                  <div className="p-3">
                    <span className="block text-[11px] font-bold text-green-400 mb-1 uppercase tracking-wider">After</span>
                    <span className="text-[13px] text-slate-300 leading-relaxed">{ex.after}</span>
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
              <div key={i} className="rounded-lg border border-slate-700 p-4 flex gap-3 items-start">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: accentColor + "18", color: accentColor }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-100 mb-1">{step.phase}</div>
                  <div className="text-[13px] text-slate-400 leading-relaxed mb-2">{step.description}</div>
                  <pre className="m-0 p-3 bg-[#0B1120] rounded-md overflow-x-auto text-[13px] leading-relaxed border border-slate-800">
                    <code className="font-mono text-slate-300 whitespace-pre-wrap">{step.example}</code>
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
              <li key={i} className="flex gap-2 items-start text-[14px] text-slate-300 leading-relaxed">
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

      {/* Include/Exclude tables (for CLAUDE.md item) */}
      {item.include && item.exclude && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-green-500/20 p-4">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-green-400 font-mono m-0 mb-2.5">
              含めるもの
            </h4>
            <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
              {item.include.map((inc, i) => (
                <li key={i} className="flex gap-1.5 items-start text-[13px] text-slate-300 leading-relaxed">
                  <span className="text-green-400 shrink-0">+</span>
                  <span>{inc}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-red-500/20 p-4">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-red-400 font-mono m-0 mb-2.5">
              除外するもの
            </h4>
            <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
              {item.exclude.map((exc, i) => (
                <li key={i} className="flex gap-1.5 items-start text-[13px] text-slate-300 leading-relaxed">
                  <span className="text-red-400 shrink-0">-</span>
                  <span>{exc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* CLAUDE.md locations */}
      {item.locations && item.locations.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-purple-300 font-mono m-0">
            配置場所
          </h3>
          <div className="flex flex-col gap-1.5">
            {item.locations.map((loc, i) => (
              <div key={i} className="flex gap-3 items-start rounded-lg border border-slate-700 p-3">
                <code className="font-mono text-[13px] text-purple-300 shrink-0 bg-purple-500/10 px-2 py-0.5 rounded">
                  {loc.path}
                </code>
                <span className="text-[13px] text-slate-400 leading-relaxed">{loc.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Writer/Reviewer pattern */}
      {item.writerReviewer && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            Writer / Reviewer パターン
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-cyan-500/20 p-4">
              <h4 className="text-[12px] font-bold text-cyan-300 font-mono m-0 mb-2">
                Session A（ライター）
              </h4>
              {item.writerReviewer.writer.map((w, i) => (
                <p key={i} className="m-0 mt-1.5 text-[13px] text-slate-300 leading-relaxed italic">{w}</p>
              ))}
            </div>
            <div className="rounded-lg border border-orange-500/20 p-4">
              <h4 className="text-[12px] font-bold text-orange-300 font-mono m-0 mb-2">
                Session B（レビュアー）
              </h4>
              {item.writerReviewer.reviewer.map((r, i) => (
                <p key={i} className="m-0 mt-1.5 text-[13px] text-slate-300 leading-relaxed italic">{r}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Anti-pattern fix */}
      {item.fix && (
        <div className="rounded-lg px-4 py-3 flex gap-3 items-start" style={{ background: "rgba(16, 185, 129, 0.08)", borderLeft: "3px solid #10B981" }}>
          <span className="text-[11px] font-bold uppercase tracking-wider shrink-0 mt-0.5 font-mono text-green-400">
            Fix
          </span>
          <span className="text-[14px] text-slate-300 leading-relaxed font-sans">{item.fix}</span>
        </div>
      )}
    </DetailModalShell>
  );
}
