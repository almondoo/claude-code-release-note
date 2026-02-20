import { DetailModalShell } from "~/components/detail-modal";
import { CodeBlockView } from "~/components/code-block-view";
import { CalloutBox } from "~/components/callout-box";

import type { TUItem } from "./constants";
import { SECTIONS, SECTION_ICONS, TAG_COLORS, DIFFICULTY_LABELS } from "./constants";

export function DetailModal({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: TUItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const sectionId = SECTIONS.find((s) => s.items.some((i) => i.id === item.id))?.id ?? "";
  const sectionIcon = SECTION_ICONS[sectionId]?.() ?? (
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
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );

  const difficulty = DIFFICULTY_LABELS[item.difficulty];

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
          <div className="flex gap-1.5 mt-2 flex-wrap items-center">
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
            <span
              className="text-[11px] font-semibold rounded"
              style={{
                padding: "2px 8px",
                background: difficulty.color + "15",
                color: difficulty.color,
              }}
            >
              {difficulty.label}
            </span>
          </div>
          {item.targetUsers && (
            <p className="text-[12px] text-slate-500 mt-1.5 m-0 font-sans">
              対象: {item.targetUsers}
            </p>
          )}
        </>
      }
    >
      {/* Content paragraphs */}
      {item.content.split("\n\n").map((paragraph, i) => (
        <p key={i} className="m-0 text-[14px] leading-[1.8] text-slate-300 font-sans">
          {paragraph}
        </p>
      ))}

      {/* Callouts */}
      {item.callouts.map((callout, i) => (
        <CalloutBox key={i} callout={callout} />
      ))}

      {/* Code blocks */}
      {item.code.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            コマンド・コード
          </h3>
          {item.code.map((block, i) => (
            <CodeBlockView key={i} block={block} />
          ))}
        </div>
      )}

      {/* Tips list */}
      {item.tips.length > 0 && (
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

      {/* External links */}
      {item.links.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-slate-400 font-mono m-0">
            リンク
          </h3>
          <div className="flex flex-col gap-1.5">
            {item.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] no-underline rounded-md border border-slate-700 px-3 py-1.5 transition-colors"
                style={{ color: accentColor }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </DetailModalShell>
  );
}
