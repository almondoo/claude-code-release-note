// ハーネス＆コンテキストエンジニアリングページ(/harness-engineering) で使う翻訳。
const ja = {
  // ---- Page / meta ----
  metaTitle: "ハーネス＆コンテキストエンジニアリング — Claude Code",
  metaDescription:
    "Claude Code のハーネス設計（コンテキスト管理含む）を最適化するための包括的リファレンス",

  // ---- Page header ----
  pageTitle: "ハーネス＆コンテキストエンジニアリング",
  pageDescription:
    "CLAUDE.md・Hooks・サブエージェント・Skills・コンテキストウィンドウ管理 — Claude Code のハーネスエンジニアリング（コンテキストエンジニアリング含む）の包括的リファレンス。",

  // ---- Stats labels ----
  statSection: "セクション",
  statTopic: "トピック",

  // ---- Tab labels ----
  tabAll: "すべて",
  tabConfigFiles: "設定ファイル",
  tabExecutionControl: "実行制御",
  tabAgents: "エージェント",
  tabContext: "コンテキスト",
  tabPractices: "実践ガイド",

  // ---- Search ----
  searchPlaceholder: "トピックを検索...",

  // ---- Count ----
  topicCount: (visible: number, total: number) => `${visible} / ${total} トピック`,
  itemCount: (n: number) => `${n} 件`,

  // ---- Empty state ----
  emptyMessage: "条件に一致するトピックはありません",

  // ---- Detail modal ----
  gotchasLabel: "注意点",
  realWorldLabel: "実例",
  codeLabel: "コード",
};

const en: typeof ja = {
  // ---- Page / meta ----
  metaTitle: "Harness & Context Engineering — Claude Code",
  metaDescription:
    "A comprehensive reference for optimizing Claude Code harness design including context management.",

  // ---- Page header ----
  pageTitle: "Harness & Context Engineering",
  pageDescription:
    "CLAUDE.md, Hooks, Sub-agents, Skills, Context Window Management — a comprehensive reference for Claude Code harness engineering (including context engineering).",

  // ---- Stats labels ----
  statSection: "Sections",
  statTopic: "Topics",

  // ---- Tab labels ----
  tabAll: "All",
  tabConfigFiles: "Config Files",
  tabExecutionControl: "Execution Control",
  tabAgents: "Agents",
  tabContext: "Context",
  tabPractices: "Practical Guide",

  // ---- Search ----
  searchPlaceholder: "Search topics...",

  // ---- Count ----
  topicCount: (visible: number, total: number) => `${visible} / ${total} topics`,
  itemCount: (n: number) => `${n} items`,

  // ---- Empty state ----
  emptyMessage: "No topics match your criteria",

  // ---- Detail modal ----
  gotchasLabel: "Gotchas",
  realWorldLabel: "Real-World Examples",
  codeLabel: "Code",
};

export const harness = { ja, en };
