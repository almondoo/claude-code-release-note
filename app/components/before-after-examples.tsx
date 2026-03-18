export interface BeforeAfterExample {
  strategy: string;
  detail?: string;
  before: string;
  after: string;
}

export const BeforeAfterExamples = ({
  examples,
}: {
  examples: BeforeAfterExample[];
}): React.JSX.Element => {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
        具体例（Before → After）
      </h3>
      <div className="flex flex-col gap-2.5">
        {examples.map((ex, i) => (
          <div key={i} className="rounded-lg border border-slate-700 overflow-hidden">
            <div className="px-4 py-2 bg-slate-800 text-[12px] font-semibold text-slate-300">
              {ex.strategy}
              {ex.detail ? ` — ${ex.detail}` : ""}
            </div>
            <div className="grid grid-cols-2 divide-x divide-slate-700">
              <div className="p-3">
                <span className="block text-[11px] font-bold text-red-400 mb-1 uppercase tracking-wider">
                  Before
                </span>
                <span className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {ex.before}
                </span>
              </div>
              <div className="p-3">
                <span className="block text-[11px] font-bold text-green-400 mb-1 uppercase tracking-wider">
                  After
                </span>
                <span className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {ex.after}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
