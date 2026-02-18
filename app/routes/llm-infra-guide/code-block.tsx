import { CopyButton } from "~/components/copy-button";

interface CodeBlockProps {
  language: string;
  title?: string;
  code: string;
  filename?: string;
  caption?: string;
}

export function CodeBlock({
  language,
  title,
  code,
  filename,
  caption,
}: CodeBlockProps): React.JSX.Element {
  const lines = code.split("\n");
  const lineNumberWidth = lines.length >= 100 ? 40 : 28;

  return (
    <div className="flex flex-col gap-1.5">
      {title && <span className="text-[13px] font-bold text-slate-300 px-1">{title}</span>}

      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#0A0E27", border: "1px solid #1E293B" }}
      >
        <div
          className="flex items-center justify-between px-4 py-2"
          style={{ borderBottom: "1px solid #1E293B", background: "rgba(15,23,42,0.6)" }}
        >
          <span className="text-[12px] font-mono font-medium" style={{ color: "#94A3B8" }}>
            {filename ?? language}
          </span>
          <div className="flex items-center gap-2">
            {filename && (
              <span
                className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(100,116,139,0.15)",
                  color: "#64748B",
                  border: "1px solid #334155",
                }}
              >
                {language}
              </span>
            )}
            <CopyButton text={code} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <pre
            className="m-0 px-4 py-4"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              lineHeight: 1.7,
              background: "transparent",
            }}
          >
            <code>
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span
                    className="select-none text-right shrink-0 pr-4"
                    style={{ color: "#475569", minWidth: lineNumberWidth, userSelect: "none" }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ color: "#E2E8F0" }}>{line || "\u00A0"}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>

      {caption && (
        <span className="text-[12px] italic px-1" style={{ color: "#64748B" }}>
          {caption}
        </span>
      )}
    </div>
  );
}
