/**
 * インライン Markdown をレンダリングする。
 * 対応: **太字**, `コード`, [リンク](url)
 */
export const renderInlineMarkdown = (text: string): React.ReactNode[] => {
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-slate-100 font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded text-[13px] font-mono bg-slate-700/60 text-cyan-300"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const isExternal = linkMatch[2].startsWith("http");
      return (
        <a
          key={i}
          href={linkMatch[2]}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          style={{ color: "#67E8F9", textDecoration: "underline", textUnderlineOffset: 2 }}
        >
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
};

/* ------------------------------------------------------------------ */
/*  リスト項目パーサー                                                  */
/* ------------------------------------------------------------------ */

type ParsedListItem = {
  type: "ul" | "ol";
  depth: number;
  text: string;
};

/** 段落が箇条書き / 番号リストなら解析して返す */
const parseListLine = (text: string): ParsedListItem | null => {
  // Unordered: - or ・ (optional leading spaces for nesting)
  const ulMatch = text.match(/^(\s*)(?:[-・])\s*(.+)$/s);
  if (ulMatch) {
    return { type: "ul", depth: Math.floor(ulMatch[1].length / 2), text: ulMatch[2].trim() };
  }
  // Ordered: 1. 2. ... (optional leading spaces for nesting)
  const olMatch = text.match(/^(\s*)\d+\.\s+(.+)$/s);
  if (olMatch) {
    return { type: "ol", depth: Math.floor(olMatch[1].length / 2), text: olMatch[2].trim() };
  }
  return null;
};

/** ParsedListItem[] → ネスト対応の <ul>/<ol> を再帰的に生成 */
const renderNestedList = (
  items: ParsedListItem[],
  startIdx: number,
  minDepth: number,
  textClass: string,
  keyPrefix: string,
): { element: React.ReactNode; endIdx: number } => {
  const lis: React.ReactNode[] = [];
  let i = startIdx;
  const listType = items[i]?.type ?? "ul";

  while (i < items.length && items[i].depth >= minDepth) {
    if (items[i].depth === minDepth) {
      const text = items[i].text;
      i++;

      let childList: React.ReactNode = null;
      if (i < items.length && items[i].depth > minDepth) {
        const child = renderNestedList(items, i, items[i].depth, textClass, `${keyPrefix}-${lis.length}`);
        childList = child.element;
        i = child.endIdx;
      }

      lis.push(
        <li key={`${keyPrefix}-${lis.length}`} className={textClass}>
          {renderInlineMarkdown(text)}
          {childList}
        </li>,
      );
    } else {
      break;
    }
  }

  const Tag = listType === "ol" ? "ol" : "ul";
  const listStyle = listType === "ol" ? "list-decimal" : "list-disc";

  return {
    element: (
      <Tag className={`${listStyle} pl-5 m-0 flex flex-col gap-1`}>{lis}</Tag>
    ),
    endIdx: i,
  };
};

/* ------------------------------------------------------------------ */
/*  見出しパーサー                                                      */
/* ------------------------------------------------------------------ */

const HEADING_STYLES: Record<number, string> = {
  1: "text-[18px] font-bold text-slate-100 m-0",
  2: "text-[16px] font-bold text-slate-200 m-0",
  3: "text-[14px] font-semibold text-slate-300 m-0",
};

const parseHeading = (paragraph: string): { level: number; text: string } | null => {
  const match = paragraph.match(/^(#{1,3})\s+(.+)$/);
  if (!match) return null;
  return { level: match[1].length, text: match[2] };
};

/* ------------------------------------------------------------------ */
/*  ブロック解析 & ParagraphList                                        */
/* ------------------------------------------------------------------ */

type Block =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; level: number; text: string }
  | { kind: "list"; items: ParsedListItem[] };

/** content を \n\n で分割し、連続するリスト項目をグルーピングしたブロック列を返す */
const parseBlocks = (content: string): Block[] => {
  const paragraphs = content.split("\n\n");
  const blocks: Block[] = [];
  let currentList: ParsedListItem[] | null = null;

  for (const p of paragraphs) {
    const heading = parseHeading(p);
    if (heading) {
      if (currentList) {
        blocks.push({ kind: "list", items: currentList });
        currentList = null;
      }
      blocks.push({ kind: "heading", ...heading });
      continue;
    }

    const listItem = parseListLine(p);
    if (listItem) {
      if (!currentList) currentList = [];
      currentList.push(listItem);
      continue;
    }

    if (currentList) {
      blocks.push({ kind: "list", items: currentList });
      currentList = null;
    }
    blocks.push({ kind: "paragraph", text: p });
  }

  if (currentList) {
    blocks.push({ kind: "list", items: currentList });
  }

  return blocks;
};

export const ParagraphList = ({
  content,
  className,
  renderText,
}: {
  content: string;
  className?: string;
  renderText?: (paragraph: string) => React.ReactNode;
}): React.JSX.Element => {
  const baseClass = className ?? "m-0 text-[14px] leading-[1.8] text-slate-300 font-sans";

  if (renderText) {
    return (
      <>
        {content.split("\n\n").map((p, i) => (
          <p key={i} className={baseClass}>
            {renderText(p)}
          </p>
        ))}
      </>
    );
  }

  const blocks = parseBlocks(content);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          const Tag = `h${block.level + 1}` as "h2" | "h3" | "h4";
          return (
            <Tag key={i} className={HEADING_STYLES[block.level]}>
              {renderInlineMarkdown(block.text)}
            </Tag>
          );
        }
        if (block.kind === "list") {
          const textClass = "text-[14px] leading-[1.8] text-slate-300 font-sans";
          return (
            <div key={i} className="m-0">
              {renderNestedList(block.items, 0, block.items[0].depth, textClass, `list-${i}`).element}
            </div>
          );
        }
        return (
          <p key={i} className={baseClass}>
            {renderInlineMarkdown(block.text)}
          </p>
        );
      })}
    </>
  );
};
