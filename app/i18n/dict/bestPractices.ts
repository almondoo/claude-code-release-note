// ベストプラクティスページ(/best-practices) で使う翻訳。
const ja = {
  // ---- Page / meta ----
  metaTitle: "Claude Code ベストプラクティス",
  metaDescription: "Claude Code を最大限に活用するためのヒントとパターン",
  pageTitle: "ベストプラクティス",

  // ---- Category tab labels ----
  categoryBestPractices: "ベストプラクティス",
  categoryPrompting: "プロンプト",
  categorySkills: "スキル",
  categoryHooks: "Hooks",
  categoryDynamicWorkflows: "ダイナミックワークフロー",

  // ---- Category descriptions ----
  descBestPractices:
    "環境設定から並列セッションでのスケーリングまで、Claude Code を最大限に活用するためのヒントとパターン。",
  descPrompting:
    "Claude の最新モデルにおけるプロンプトエンジニアリングの包括的ガイド。明確さ、例示、XMLタグ、thinking、エージェントシステムなどを網羅。",
  descSkills: "Claude が発見・活用できる効果的な Agent Skills を作成するためのヒントとパターン。",
  descHooks:
    "Claude Code のライフサイクルに Hooks を組み込み、自動フォーマット・セキュリティチェック・通知・監査ログを決定論的に実行するためのガイド。",
  descDynamicWorkflows:
    "Claude Code の動的ワークフロー（Workflow ツールによるマルチエージェント・オーケストレーション）を実務で使いこなすための Do/Don't・判断基準・チューニング・運用。公式ガイダンスと一次ソースで裏取り。",

  // ---- Tab labels ----
  tabAll: "すべて",
  tabFoundations: "基礎",
  tabOutput: "出力",
  tabToolsThinking: "ツール・思考",
  tabAgentic: "エージェント",
  tabTipsMigration: "Tips・移行",

  // ---- Item / search labels ----
  itemLabelPractice: "プラクティス",
  itemLabelTopic: "トピック",
  searchPlaceholderPractice: "プラクティスを検索...",
  searchPlaceholderHooks: "Hooks を検索...",
  searchPlaceholderWorkflow: "ワークフローを検索...",

  // ---- Stats ----
  statCategory: "カテゴリ",

  // ---- Count / empty state ----
  count: (n: number) => `${n} 件`,
  emptyMessage: (label: string) => `条件に一致する${label}はありません`,

  // ---- Tag display labels (内部キーは日本語のまま; ここは表示用 mapping) ----
  tagImportant: "重要",
  tagTest: "テスト",
  tagDebug: "デバッグ",
  tagAutomate: "自動化",
  tagNotify: "通知",
  tagFormat: "フォーマット",
  tagAudit: "監査",
  tagVision: "ビジョン",
  tagDesign: "デザイン",
  tagOfficial: "公式",
  tagSpec: "仕様",
  tagResearch: "研究",

  // ---- Detail modal section headings ----
  sectionPhase: "フェーズ",
  sectionDetail: "詳細",
  sectionCode: "コード",
  sectionScript: "スクリプト",
  sectionInclude: "含めるもの",
  sectionExclude: "除外するもの",
  sectionLocations: "配置場所",
  sectionWriterReviewer: "Writer / Reviewer パターン",
  sessionWriter: "Session A（ライター）",
  sessionReviewer: "Session B（レビュアー）",
  sectionSamplePrompt: "サンプルプロンプト",

  // ---- Sub-section tab labels (section id → display label) ----
  // Used in getCategoryConfigs tabDefs for the 4 categories that use s.name directly.
  // ja: current s.name values from JSON; en: English translations.
  sectionLabels: {
    // best-practices
    "core-principle": "基本原則",
    verification: "作業の検証",
    workflow: "ワークフロー",
    prompting: "プロンプトのコツ",
    environment: "環境設定",
    "session-management": "セッション管理",
    scaling: "自動化とスケール",
    "opus-4-7": "Opus 4.7 のコツ",
    "opus-4-8": "Opus 4.8 のコツ",
    "anti-patterns": "アンチパターン",
    intuition: "直感を養う",
    // skills
    "bundled-skills": "バンドルスキル",
    "core-principles": "コア原則",
    "skill-structure": "スキル構成",
    "progressive-disclosure": "段階的開示",
    workflows: "ワークフロー",
    "content-guidelines": "コンテンツガイドライン",
    "common-patterns": "共通パターン",
    evaluation: "評価と改善",
    "advanced-code": "上級: 実行コード",
    troubleshooting: "トラブルシューティング",
    // hooks
    overview: "概要",
    events: "イベント一覧",
    configuration: "設定と構造",
    "best-practices": "ベストプラクティス",
    recipes: "レシピ集",
    security: "セキュリティ",
    // dynamic-workflows
    "when-to-use": "使いどき・判断",
    "do-practices": "やるべきこと (Do)",
    tuning: "チューニング",
    operations: "運用",
    notes: "注記・出典",
    // セクション ID は JSON データ由来の任意文字列でアクセスされるため Record<string, string> 扱い。
  } as Record<string, string>,
};

const en: typeof ja = {
  // ---- Page / meta ----
  metaTitle: "Claude Code Best Practices",
  metaDescription: "Tips and patterns to get the most out of Claude Code",
  pageTitle: "Best Practices",

  // ---- Category tab labels ----
  categoryBestPractices: "Best Practices",
  categoryPrompting: "Prompting",
  categorySkills: "Skills",
  categoryHooks: "Hooks",
  categoryDynamicWorkflows: "Dynamic Workflows",

  // ---- Category descriptions ----
  descBestPractices:
    "Tips and patterns to get the most out of Claude Code, from environment setup to scaling with parallel sessions.",
  descPrompting:
    "A comprehensive guide to prompt engineering for Claude's latest models, covering clarity, examples, XML tags, thinking, and agentic systems.",
  descSkills:
    "Tips and patterns for creating effective Agent Skills that Claude can discover and leverage.",
  descHooks:
    "A guide to integrating Hooks into the Claude Code lifecycle for deterministic execution of auto-formatting, security checks, notifications, and audit logs.",
  descDynamicWorkflows:
    "Do/Don't, decision criteria, tuning, and operations for mastering dynamic workflows in Claude Code (multi-agent orchestration via the Workflow tool). Backed by official guidance and primary sources.",

  // ---- Tab labels ----
  tabAll: "All",
  tabFoundations: "Foundations",
  tabOutput: "Output",
  tabToolsThinking: "Tools & Thinking",
  tabAgentic: "Agentic",
  tabTipsMigration: "Tips & Migration",

  // ---- Item / search labels ----
  itemLabelPractice: "practices",
  itemLabelTopic: "topics",
  searchPlaceholderPractice: "Search practices...",
  searchPlaceholderHooks: "Search Hooks...",
  searchPlaceholderWorkflow: "Search workflows...",

  // ---- Stats ----
  statCategory: "Categories",

  // ---- Count / empty state ----
  count: (n: number) => `${n} items`,
  emptyMessage: (label: string) => `No ${label} match your criteria`,

  // ---- Tag display labels ----
  tagImportant: "Important",
  tagTest: "Test",
  tagDebug: "Debug",
  tagAutomate: "Automation",
  tagNotify: "Notification",
  tagFormat: "Formatting",
  tagAudit: "Audit",
  tagVision: "Vision",
  tagDesign: "Design",
  tagOfficial: "Official",
  tagSpec: "Spec",
  tagResearch: "Research",

  // ---- Detail modal section headings ----
  sectionPhase: "Phases",
  sectionDetail: "Details",
  sectionCode: "Code",
  sectionScript: "Script",
  sectionInclude: "Include",
  sectionExclude: "Exclude",
  sectionLocations: "Locations",
  sectionWriterReviewer: "Writer / Reviewer Pattern",
  sessionWriter: "Session A (Writer)",
  sessionReviewer: "Session B (Reviewer)",
  sectionSamplePrompt: "Sample Prompts",

  // ---- Sub-section tab labels ----
  sectionLabels: {
    // best-practices
    "core-principle": "Core Principles",
    verification: "Verification",
    workflow: "Workflow",
    prompting: "Prompting Tips",
    environment: "Environment",
    "session-management": "Session Management",
    scaling: "Automation & Scaling",
    "opus-4-7": "Opus 4.7 Tips",
    "opus-4-8": "Opus 4.8 Tips",
    "anti-patterns": "Anti-Patterns",
    intuition: "Building Intuition",
    // skills
    "bundled-skills": "Bundled Skills",
    "core-principles": "Core Principles",
    "skill-structure": "Skill Structure",
    "progressive-disclosure": "Progressive Disclosure",
    workflows: "Workflows",
    "content-guidelines": "Content Guidelines",
    "common-patterns": "Common Patterns",
    evaluation: "Evaluation & Improvement",
    "advanced-code": "Advanced: Executable Code",
    troubleshooting: "Troubleshooting",
    // hooks
    overview: "Overview",
    events: "Event Reference",
    configuration: "Configuration",
    "best-practices": "Best Practices",
    recipes: "Recipes",
    security: "Security",
    // dynamic-workflows
    "when-to-use": "When to Use",
    "do-practices": "Do Practices",
    tuning: "Tuning",
    operations: "Operations",
    notes: "Notes & Sources",
  },
};

export const bestPractices = { ja, en };
