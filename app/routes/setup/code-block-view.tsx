import { CopyButton } from "~/components/copy-button";

import type { CodeBlock } from "./constants";

export function CodeBlockView({ block }: { block: CodeBlock }): React.JSX.Element {
  return (
    <div
      className="rounded-lg overflow-hidden border"
      style={{
        borderColor: block.recommended ? "rgba(16, 185, 129, 0.3)" : "#334155",
      }}
    >
      <div
        className="flex items-center justify-between px-3.5 py-2"
        style={{
          background: block.recommended ? "rgba(16, 185, 129, 0.08)" : undefined,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[12px] text-slate-400 font-mono truncate">{block.label}</span>
          {block.recommended && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-bold rounded px-1.5 py-[1px] shrink-0"
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                color: "#6EE7B7",
              }}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              推奨
            </span>
          )}
        </div>
        <CopyButton text={block.value} />
      </div>
      <pre className="m-0 p-3.5 bg-[#0B1120] overflow-x-auto text-[14px] leading-relaxed">
        <code className="font-mono text-slate-300 whitespace-pre">{block.value}</code>
      </pre>
    </div>
  );
}
