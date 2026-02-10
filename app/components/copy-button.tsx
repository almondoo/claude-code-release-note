import { useState } from "react";

import { CheckIcon, CopyIcon } from "~/components/icons";

export function CopyButton({ text }: { text: string }): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[12px] cursor-pointer transition-all shrink-0"
      style={{
        borderColor: copied ? "#6EE7B740" : "#334155",
        background: copied ? "rgba(16, 185, 129, 0.15)" : "#0F172A",
        color: copied ? "#6EE7B7" : "#64748B",
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
