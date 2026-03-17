export function ParagraphList({
  content,
  className,
  renderText,
}: {
  content: string;
  className?: string;
  renderText?: (paragraph: string) => React.ReactNode;
}): React.JSX.Element {
  return (
    <>
      {content.split("\n\n").map((p, i) => (
        <p
          key={i}
          className={
            className ??
            "m-0 text-[14px] leading-[1.8] text-slate-300 font-sans"
          }
        >
          {renderText ? renderText(p) : p}
        </p>
      ))}
    </>
  );
}
