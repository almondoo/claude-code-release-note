import { PRECEDENCE, PRECEDENCE_COLORS } from "./constants";

export function PrecedencePanel(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface rounded-xl border border-slate-700 p-6">
        <div
          className="text-[14px] font-bold tracking-wide uppercase font-mono mb-5 flex items-center gap-2"
          style={{ color: "#FDBA74" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          設定の優先順位
        </div>
        <div className="flex flex-col gap-2.5">
          {PRECEDENCE.map((item) => {
            const pc = PRECEDENCE_COLORS[item.color] || {
              color: "#F1F5F9",
              bg: "#0F172A",
            };
            return (
              <div key={item.level} className="flex gap-3 items-center">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-mono shrink-0"
                  style={{ background: pc.bg, color: pc.color }}
                >
                  {item.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold" style={{ color: pc.color }}>
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500 font-sans">{item.description}</span>
                  </div>
                </div>
                {item.level === 1 && (
                  <span
                    className="text-[11px] font-semibold rounded whitespace-nowrap shrink-0"
                    style={{
                      padding: "2px 8px",
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "#FCA5A5",
                    }}
                  >
                    最優先
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div
          className="mt-4 rounded-lg text-xs leading-[1.7] text-slate-400 font-sans"
          style={{
            padding: "12px 14px",
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(51, 65, 85, 0.25)",
          }}
        >
          上位の設定が下位の設定を上書きします。同じキーが複数の階層で定義されている場合、番号の小さい方が優先されます。
        </div>
      </div>
    </div>
  );
}
