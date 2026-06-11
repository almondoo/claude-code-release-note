import { ParagraphList } from "~/components/paragraph-list";
import { useLocale } from "~/i18n/context";
import { useL } from "~/i18n/localize";
import { useT } from "~/i18n/useT";
import { PATTERN_DIAGRAMS } from "./workflow-diagram";
import type { Block } from "./constants";
import { ACCENT } from "./constants";

// ── Callout ────────────────────────────────────────────────────────────────

const CALLOUT_STYLES: Record<
  "info" | "warning" | "tip",
  { border: string; bg: string; titleColor: string; icon: string }
> = {
  info: {
    border: "border-blue-500/40",
    bg: "rgba(59,130,246,0.08)",
    titleColor: "#93c5fd",
    icon: "ℹ",
  },
  warning: {
    border: "border-amber-400/40",
    bg: "rgba(251,191,36,0.08)",
    titleColor: "#fcd34d",
    icon: "⚠",
  },
  tip: {
    border: "border-emerald-500/40",
    bg: "rgba(16,185,129,0.08)",
    titleColor: "#6ee7b7",
    icon: "✦",
  },
};

const Callout = ({
  variant,
  title,
  title_en,
  content,
  content_en,
}: {
  variant: "info" | "warning" | "tip";
  title?: string;
  title_en?: string;
  content: string;
  content_en?: string;
}): React.JSX.Element => {
  const L = useL();
  const s = CALLOUT_STYLES[variant];
  return (
    <div
      className={`rounded-xl border ${s.border} px-4 py-3 flex flex-col gap-1.5`}
      style={{ background: s.bg }}
    >
      {title && (
        <div
          className="flex items-center gap-1.5 text-[13px] font-semibold"
          style={{ color: s.titleColor }}
        >
          <span aria-hidden="true">{s.icon}</span>
          {L(title, title_en)}
        </div>
      )}
      <div className="text-[13px] text-slate-300 leading-[1.75]">
        <ParagraphList
          content={L(content, content_en)}
          className="m-0 text-[13px] leading-[1.75] text-slate-300 font-sans"
        />
      </div>
    </div>
  );
};

// ── Pattern card ───────────────────────────────────────────────────────────

const PatternCard = ({
  patternId,
  name,
  name_en,
  tagline,
  tagline_en,
  content,
  content_en,
}: {
  patternId: string;
  name: string;
  name_en?: string;
  tagline?: string;
  tagline_en?: string;
  content: string;
  content_en?: string;
}): React.JSX.Element => {
  const t = useT();
  const L = useL();
  const DiagramComponent = PATTERN_DIAGRAMS[patternId];
  const localizedName = L(name, name_en);

  return (
    <div
      className="rounded-xl border border-slate-700 flex flex-col gap-4 p-5"
      style={{ background: "rgba(15,23,42,0.6)" }}
    >
      {/* Diagram */}
      {DiagramComponent && (
        <div
          className="overflow-x-auto rounded-lg"
          aria-label={t.workflows.diagramAria(localizedName)}
        >
          <DiagramComponent />
        </div>
      )}

      {/* Name */}
      <h3 className="text-[15px] font-bold m-0" style={{ color: ACCENT }}>
        {localizedName}
      </h3>

      {/* Tagline */}
      {tagline && (
        <p className="text-[13px] text-slate-400 m-0 font-medium italic">
          {L(tagline, tagline_en)}
        </p>
      )}

      {/* Content */}
      <ParagraphList content={L(content, content_en)} />
    </div>
  );
};

// ── List ───────────────────────────────────────────────────────────────────

const BlockList = ({
  ordered,
  items,
  items_en,
}: {
  ordered?: boolean;
  items: string[];
  items_en?: string[];
}): React.JSX.Element => {
  const L = useL();
  const Tag = ordered ? "ol" : "ul";
  const listStyle = ordered ? "list-decimal" : "list-disc";
  const localizedItems = L(items, items_en);
  return (
    <Tag
      className={`${listStyle} pl-5 m-0 flex flex-col gap-2 text-[14px] text-slate-300 leading-[1.8]`}
    >
      {localizedItems.map((item, i) => (
        <li key={i}>
          <ParagraphList
            content={item}
            className="m-0 text-[14px] leading-[1.8] text-slate-300 font-sans inline"
          />
        </li>
      ))}
    </Tag>
  );
};

// ── Table ──────────────────────────────────────────────────────────────────

const BlockTable = ({
  headers,
  headers_en,
  rows,
  rows_en,
  caption,
  caption_en,
}: {
  headers: string[];
  headers_en?: string[];
  rows: string[][];
  rows_en?: string[][];
  caption?: string;
  caption_en?: string;
}): React.JSX.Element => {
  const { locale } = useLocale();
  const L = useL();
  const localizedHeaders = L(headers, headers_en);
  const localizedRows: string[][] =
    locale === "en" && rows_en && rows_en.length > 0 ? rows_en : rows;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px] border-collapse">
        {caption && (
          <caption className="text-[12px] text-slate-500 mb-1 text-left">
            {L(caption, caption_en)}
          </caption>
        )}
        <thead>
          <tr>
            {localizedHeaders.map((h, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 text-slate-300 font-semibold border-b border-slate-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {localizedRows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? "bg-slate-800/30" : ""}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-slate-300 border-b border-slate-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Subsection ─────────────────────────────────────────────────────────────

const Subsection = ({
  title,
  title_en,
  blocks,
}: {
  title: string;
  title_en?: string;
  blocks: Block[];
}): React.JSX.Element => {
  const L = useL();
  return (
    <div className="flex flex-col gap-4 pt-1">
      <h3
        className="text-[14px] font-semibold text-slate-300 m-0 pl-3 border-l-2"
        style={{ borderColor: ACCENT }}
      >
        {L(title, title_en)}
      </h3>
      <div className="flex flex-col gap-3 pl-1">
        {blocks.map((b, i) => (
          <RenderBlock key={i} block={b} />
        ))}
      </div>
    </div>
  );
};

// ── Main renderer ──────────────────────────────────────────────────────────

export const RenderBlock = ({ block }: { block: Block }): React.JSX.Element | null => {
  const L = useL();
  switch (block.type) {
    case "paragraph":
      return <ParagraphList content={L(block.content, block.content_en)} />;

    case "list":
      return <BlockList ordered={block.ordered} items={block.items} items_en={block.items_en} />;

    case "callout":
      return (
        <Callout
          variant={block.variant}
          title={block.title}
          title_en={block.title_en}
          content={block.content}
          content_en={block.content_en}
        />
      );

    case "table":
      return (
        <BlockTable
          headers={block.headers}
          headers_en={block.headers_en}
          rows={block.rows}
          rows_en={block.rows_en}
          caption={block.caption}
          caption_en={block.caption_en}
        />
      );

    case "pattern":
      return (
        <PatternCard
          patternId={block.patternId}
          name={block.name}
          name_en={block.name_en}
          tagline={block.tagline}
          tagline_en={block.tagline_en}
          content={block.content}
          content_en={block.content_en}
        />
      );

    case "subsection":
      return <Subsection title={block.title} title_en={block.title_en} blocks={block.blocks} />;

    default:
      return null;
  }
};
