/**
 * インライン Markdown をレンダリングする。
 * 対応: **太字**, `コード`, [リンク](url)
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
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

export function ParagraphList({
  content,
  className,
  renderText,
}: {
  content: string;
  className?: string;
  renderText?: (paragraph: string) => React.ReactNode;
}): React.JSX.Element {
  const baseClass =
    className ?? "m-0 text-[14px] leading-[1.8] text-slate-300 font-sans";

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
