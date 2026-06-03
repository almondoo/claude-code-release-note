import { ParagraphList } from "~/components/paragraph-list";
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
  content,
}: {
  variant: "info" | "warning" | "tip";
  title?: string;
  content: string;
}): React.JSX.Element => {
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
          {title}
        </div>
      )}
      <div className="text-[13px] text-slate-300 leading-[1.75]">
        <ParagraphList
          content={content}
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
  tagline,
  content,
}: {
  patternId: string;
  name: string;
  tagline?: string;
  content: string;
}): React.JSX.Element => {
  const DiagramComponent = PATTERN_DIAGRAMS[patternId];

  return (
    <div
      className="rounded-xl border border-slate-700 flex flex-col gap-4 p-5"
      style={{ background: "rgba(15,23,42,0.6)" }}
    >
      {/* Diagram */}
      {DiagramComponent && (
        <div className="overflow-x-auto rounded-lg" aria-label={`${name} の図`}>
          <DiagramComponent />
        </div>
      )}

      {/* Name */}
      <h3 className="text-[15px] font-bold m-0" style={{ color: ACCENT }}>
        {name}
      </h3>

      {/* Tagline */}
      {tagline && <p className="text-[13px] text-slate-400 m-0 font-medium italic">{tagline}</p>}

      {/* Content */}
      <ParagraphList content={content} />
    </div>
  );
};

// ── List ───────────────────────────────────────────────────────────────────

const BlockList = ({
  ordered,
  items,
}: {
  ordered?: boolean;
  items: string[];
}): React.JSX.Element => {
  const Tag = ordered ? "ol" : "ul";
  const listStyle = ordered ? "list-decimal" : "list-disc";
  return (
    <Tag
      className={`${listStyle} pl-5 m-0 flex flex-col gap-2 text-[14px] text-slate-300 leading-[1.8]`}
    >
      {items.map((item, i) => (
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
  rows,
  caption,
}: {
  headers: string[];
  rows: string[][];
  caption?: string;
}): React.JSX.Element => (
  <div className="overflow-x-auto">
    <table className="w-full text-[13px] border-collapse">
      {caption && (
        <caption className="text-[12px] text-slate-500 mb-1 text-left">{caption}</caption>
      )}
      <thead>
        <tr>
          {headers.map((h, i) => (
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
        {rows.map((row, ri) => (
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

// ── Subsection ─────────────────────────────────────────────────────────────

const Subsection = ({ title, blocks }: { title: string; blocks: Block[] }): React.JSX.Element => (
  <div className="flex flex-col gap-4 pt-1">
    <h3
      className="text-[14px] font-semibold text-slate-300 m-0 pl-3 border-l-2"
      style={{ borderColor: ACCENT }}
    >
      {title}
    </h3>
    <div className="flex flex-col gap-3 pl-1">
      {blocks.map((b, i) => (
        <RenderBlock key={i} block={b} />
      ))}
    </div>
  </div>
);

// ── Main renderer ──────────────────────────────────────────────────────────

export const RenderBlock = ({ block }: { block: Block }): React.JSX.Element | null => {
  switch (block.type) {
    case "paragraph":
      return <ParagraphList content={block.content} />;

    case "list":
      return <BlockList ordered={block.ordered} items={block.items} />;

    case "callout":
      return <Callout variant={block.variant} title={block.title} content={block.content} />;

    case "table":
      return <BlockTable headers={block.headers} rows={block.rows} caption={block.caption} />;

    case "pattern":
      return (
        <PatternCard
          patternId={block.patternId}
          name={block.name}
          tagline={block.tagline}
          content={block.content}
        />
      );

    case "subsection":
      return <Subsection title={block.title} blocks={block.blocks} />;

    default:
      return null;
  }
};
