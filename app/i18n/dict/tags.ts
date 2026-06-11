// タグの表示ラベル。
// キーは JSON データ内の tags 配列に格納された内部キー（日本語のまま不変）。
// 値だけをロケールごとに切り替える。
const ja = {
  新機能: "新機能",
  バグ修正: "バグ修正",
  改善: "改善",
  SDK: "SDK",
  IDE: "IDE",
  Platform: "プラットフォーム",
  Windows: "Windows",
  Security: "セキュリティ",
  Perf: "パフォーマンス",
  非推奨: "非推奨",
  Plugin: "プラグイン",
  MCP: "MCP",
  Agent: "エージェント",
};

const en: typeof ja = {
  新機能: "New",
  バグ修正: "Bug Fix",
  改善: "Improvement",
  SDK: "SDK",
  IDE: "IDE",
  Platform: "Platform",
  Windows: "Windows",
  Security: "Security",
  Perf: "Performance",
  非推奨: "Deprecated",
  Plugin: "Plugin",
  MCP: "MCP",
  Agent: "Agent",
};

// タグキーは JSON データ由来の任意文字列でアクセスされるため、
// 表示側からは Record<string, string> として扱う（ja/en のキー一致は上の const en: typeof ja で担保）。
export const tags: { ja: Record<string, string>; en: Record<string, string> } = { ja, en };
