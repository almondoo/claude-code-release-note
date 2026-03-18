/**
 * インライン Markdown をレンダリングする。
 * 対応: **太字**, `コード`, [リンク](url)
 */
export function renderInlineMarkdown(text: string): React.ReactNode[] {
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
}

/**
 * 段落が "- " で始まるリスト項目かどうかを判定し、
 * リスト項目ならインデント付きで表示する。
 */
function isListItem(paragraph: string): boolean {
  return paragraph.startsWith("- ");
}

const HEADING_STYLES: Record<number, string> = {
  1: "text-[18px] font-bold text-slate-100 m-0",
  2: "text-[16px] font-bold text-slate-200 m-0",
  3: "text-[14px] font-semibold text-slate-300 m-0",
};

function parseHeading(paragraph: string): { level: number; text: string } | null {
  const match = paragraph.match(/^(#{1,3})\s+(.+)$/);
  if (!match) return null;
  return { level: match[1].length, text: match[2] };
}

export function ParagraphList({
  content,
  className,
  renderText,
}: {
  content: string;
  className?: string;
  renderText?: (paragraph: string) => React.ReactNode;
}): React.JSX.Element {
  const baseClass = className ?? "m-0 text-[14px] leading-[1.8] text-slate-400 font-sans";

  return (
    <>
      {content.split("\n\n").map((p, i) => {
        if (renderText) {
          return (
            <p key={i} className={baseClass}>
              {renderText(p)}
            </p>
          );
        }
        const heading = parseHeading(p);
        if (heading) {
          const Tag = `h${heading.level + 1}` as "h2" | "h3" | "h4";
          return (
            <Tag key={i} className={HEADING_STYLES[heading.level]}>
              {renderInlineMarkdown(heading.text)}
            </Tag>
          );
        }
        if (isListItem(p)) {
          return (
            <p key={i} className={`${baseClass} pl-4`}>
              <span className="text-slate-500 mr-1.5">•</span>
              {renderInlineMarkdown(p.slice(2))}
            </p>
          );
        }
        return (
          <p key={i} className={baseClass}>
            {renderInlineMarkdown(p)}
          </p>
        );
      })}
    </>
  );
}
