import type { FlowNode } from "./constants";

// ── Branch label styles ─────────────────────────────────────────────────

const BRANCH_STYLES = {
  yes: {
    labelBg: "rgba(16,185,129,0.15)",
    labelColor: "#34D399",
    resultBg: "rgba(16,185,129,0.1)",
    resultColor: "#34D399",
  },
  no: {
    labelBg: "rgba(239,68,68,0.15)",
    labelColor: "#F87171",
    resultBg: "rgba(239,68,68,0.08)",
    resultColor: "#FCA5A5",
  },
} as const;

interface BranchProps {
  type: "yes" | "no";
  targetId: string | undefined;
  target: FlowNode | undefined;
}

function Branch({ type, targetId, target }: BranchProps): React.JSX.Element | null {
  if (!targetId) return null;
  const s = BRANCH_STYLES[type];
  const label = type === "yes" ? "Yes" : "No";

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="text-[11px] font-bold px-1.5 py-0.5 rounded"
        style={{ background: s.labelBg, color: s.labelColor }}
      >
        {label}
      </span>
      <span className="text-slate-600">&rarr;</span>
      {target?.result ? (
        <span
          className="text-[12px] px-2 py-1 rounded-md"
          style={{ background: s.resultBg, color: s.resultColor }}
        >
          {target.result}
        </span>
      ) : (
        <span className="text-[12px] text-slate-500">{targetId}</span>
      )}
    </div>
  );
}

// ── Decision Flow ───────────────────────────────────────────────────────

interface DecisionFlowProps {
  nodes: FlowNode[];
}

export function DecisionFlow({ nodes }: DecisionFlowProps): React.JSX.Element {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const questions = nodes.filter((n) => n.question);
  const results = nodes.filter((n) => n.result);

  return (
    <div className="flex flex-col gap-3">
      {/* Flow nodes */}
      <div className="flex flex-col gap-2">
        {questions.map((node) => (
          <div key={node.id} className="flex flex-col gap-1.5">
            {/* Question node */}
            <div
              className="rounded-lg border-2 px-4 py-3 flex items-center gap-3"
              style={{
                borderColor: "#0EA5E9",
                background: "rgba(14,165,233,0.06)",
              }}
            >
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{ background: "rgba(14,165,233,0.2)", color: "#38BDF8" }}
              >
                {node.id.replace("q", "Q")}
              </span>
              <span className="text-[14px] text-slate-200 font-medium">{node.question}</span>
            </div>

            {/* Branches */}
            <div className="flex gap-2 pl-10">
              <Branch
                type="yes"
                targetId={node.yes}
                target={node.yes ? nodeMap.get(node.yes) : undefined}
              />
              <Branch
                type="no"
                targetId={node.no}
                target={node.no ? nodeMap.get(node.no) : undefined}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Result summary */}
      <div className="mt-2">
        <h4 className="text-[12px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
          判定結果一覧
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {results.map((node) => (
            <div
              key={node.id}
              className="flex items-center gap-2 rounded-md px-3 py-2"
              style={{ background: "rgba(30,41,59,0.4)", borderLeft: "3px solid #0EA5E9" }}
            >
              <span className="text-[13px] text-slate-300">{node.result}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
