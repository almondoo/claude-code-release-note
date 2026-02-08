export function QuickStartPanel(): React.JSX.Element {
  const steps = [
    { num: "1", title: "インストール", cmd: "npm install -g @anthropic-ai/claude-code", desc: "npm でグローバルインストール" },
    { num: "2", title: "認証", cmd: "claude", desc: "初回起動でブラウザ認証" },
    { num: "3", title: "CLAUDE.md 作成", cmd: "/init", desc: "プロジェクト設定を自動生成" },
    { num: "4", title: "使い始める", cmd: "claude", desc: "プロジェクトディレクトリで起動" },
  ];

  return (
    <div className="bg-surface rounded-xl border border-teal-500/20 p-6">
      <h2 className="text-lg font-bold text-slate-100 m-0 mb-1">
        クイックスタート
      </h2>
      <p className="text-sm text-slate-400 m-0 mb-5">
        4 ステップで Claude Code を使い始められます
      </p>
      <div className="flex flex-col gap-4">
        {steps.map((step) => (
          <div key={step.num} className="flex items-start gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
              style={{ background: "rgba(20, 184, 166, 0.15)", color: "#5EEAD4" }}
            >
              {step.num}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-100">{step.title}</span>
                <code className="font-mono text-[11px] rounded-sm px-1.5 py-px bg-teal-500/15 text-teal-300">
                  {step.cmd}
                </code>
              </div>
              <span className="text-[13px] text-slate-400 font-sans leading-relaxed">
                {step.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
