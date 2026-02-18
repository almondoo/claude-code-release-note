export function SummaryPanel(): React.JSX.Element {
  const items = [
    {
      label: "CLAUDE.md",
      desc: "プロジェクトの指示とコンテキストを定義。チームで共有してワークフローを統一",
      color: "#C4B5FD",
    },
    {
      label: "settings.json",
      desc: "権限・フック・MCP の設定。プロジェクトスコープで共有可能",
      color: "#FDE68A",
    },
    {
      label: ".claudeignore",
      desc: "不要ファイルを除外してパフォーマンスとコストを最適化",
      color: "#6EE7B7",
    },
    {
      label: "カスタムコマンド",
      desc: ".claude/commands/ でチーム独自のワークフローをコマンド化",
      color: "#F472B6",
    },
    {
      label: "フック",
      desc: "ツール呼び出し前後に自動処理を挿入。フォーマット、通知、セキュリティチェックに活用",
      color: "#FDBA74",
    },
    {
      label: "MCP サーバー",
      desc: "外部ツールやデータソースを接続して Claude Code の機能を拡張",
      color: "#5EEAD4",
    },
  ];

  return (
    <div className="bg-surface rounded-xl border border-indigo-500/20 p-6">
      <h2 className="text-lg font-bold text-slate-100 m-0 mb-1">セットアップまとめ</h2>
      <p className="text-sm text-slate-400 m-0 mb-5">
        Claude Code を最大限に活用するための主要な設定項目
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-slate-700 p-4 flex flex-col gap-1.5"
          >
            <code className="font-mono text-sm font-bold" style={{ color: item.color }}>
              {item.label}
            </code>
            <span className="text-xs text-slate-400 leading-relaxed">{item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
