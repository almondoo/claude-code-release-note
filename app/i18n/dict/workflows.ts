// 動的ワークフローページ(/workflows) で使う翻訳。
const ja = {
  // ---- Page / meta ----
  metaTitle: "動的ワークフロー（Dynamic Workflows）— Claude Code",
  metaDescription:
    "Claude Code がタスク専用のハーネスをその場で書き、複数のサブエージェントを協調させる動的ワークフローの解説。",

  // ---- Tab labels ----
  tabOverview: "概要",
  tabWhy: "なぜ使うか",
  tabPatterns: "6つのパターン",
  tabUseCases: "ユースケース",
  tabWhenNot: "使わない場合",
  tabTips: "Tips",
  tabReferences: "出典",

  // ---- Footer ----
  footerDate:
    "本ページの情報は2026年6月時点のもの（リサーチプレビュー段階）です。仕様は変更される可能性があります。",
  footerCredit: "動的ワークフロー（Dynamic Workflows）— Claude Code",

  // ---- Aria labels ----
  diagramAria: (name: string) => `${name} の図`,
  svgAriaClassify: "分類して行動パターン: task → classifier ひし形 → agent A / B / C への3分岐",
  svgAriaFanOut: "ファンアウトと統合パターン: task → 4ワーカー → barrier → synthesize",
  svgAriaAdversarial: "対立的検証パターン: worker と verifiers 3つが双方向矢印で接続",
  svgAriaGenerationFilter:
    "生成とフィルタリングパターン: generators → ideas → filter → best / discarded",
  svgAriaTournament: "トーナメントパターン: attempts → pairwise judges → final → winner",
  svgAriaLoopUntilDone:
    "完了まで繰り返すパターン: agent → new findings? ひし形 → done または yes ループで agent へ戻る",
};

const en: typeof ja = {
  // ---- Page / meta ----
  metaTitle: "Dynamic Workflows — Claude Code",
  metaDescription:
    "How Claude Code writes on-the-fly harnesses and orchestrates multiple sub-agents with dynamic workflows.",

  // ---- Tab labels ----
  tabOverview: "Overview",
  tabWhy: "Why Use It",
  tabPatterns: "6 Patterns",
  tabUseCases: "Use Cases",
  tabWhenNot: "When Not To Use",
  tabTips: "Tips",
  tabReferences: "References",

  // ---- Footer ----
  footerDate:
    "Information on this page is as of June 2026 (research preview stage). Specifications are subject to change.",
  footerCredit: "Dynamic Workflows — Claude Code",

  // ---- Aria labels ----
  diagramAria: (name: string) => `${name} diagram`,
  svgAriaClassify:
    "Classify and act pattern: task → classifier diamond → 3-way branch to agent A / B / C",
  svgAriaFanOut: "Fan-out and synthesize pattern: task → 4 workers → barrier → synthesize",
  svgAriaAdversarial:
    "Adversarial verification pattern: worker and 3 verifiers connected with bidirectional arrows",
  svgAriaGenerationFilter:
    "Generate and filter pattern: generators → ideas → filter → best / discarded",
  svgAriaTournament: "Tournament pattern: attempts → pairwise judges → final → winner",
  svgAriaLoopUntilDone:
    "Loop until done pattern: agent → new findings? diamond → done or yes loop back to agent",
};

export const workflows = { ja, en };
