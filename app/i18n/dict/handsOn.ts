// ハンズオンページ(/hands-on, /hands-on/:topic) で使う翻訳。
const ja = {
  // /hands-on index
  metaTitle: "Claude Code ハンズオン",
  statLabel: "お題",
  searchPlaceholder: "お題を検索...",
  countSummary: (filtered: number, total: number) => `${filtered} / ${total} お題`,
  noResults: "条件に一致するお題はありません",

  // /hands-on/:topic
  backToList: "ハンズオン一覧",
  backToListFull: "ハンズオン一覧へ戻る",
  steps: (n: number) => `${n} ステップ`,
  approaches: (n: number) => `× ${n} アプローチ`,
  learned: "このハンズオンで学んだこと",
  metaTitleSuffix: " - Claude Code ハンズオン",
  metaTitleFallback: "ハンズオン",

  // topic-card
  prerequisitePrefix: "前提: ",

  // difficulty labels (shared by both constants files)
  difficulty: {
    easy: "初級",
    medium: "中級",
    hard: "上級",
  },
};

const en: typeof ja = {
  metaTitle: "Claude Code Hands-On",
  statLabel: "topics",
  searchPlaceholder: "Search topics...",
  countSummary: (filtered: number, total: number) => `${filtered} / ${total} topics`,
  noResults: "No matching topics found",

  backToList: "Hands-On List",
  backToListFull: "Back to Hands-On List",
  steps: (n: number) => `${n} steps`,
  approaches: (n: number) => `× ${n} approaches`,
  learned: "What you learned in this hands-on",
  metaTitleSuffix: " - Claude Code Hands-On",
  metaTitleFallback: "Hands-On",

  prerequisitePrefix: "Prerequisites: ",

  difficulty: {
    easy: "Beginner",
    medium: "Intermediate",
    hard: "Advanced",
  },
};

export const handsOn = { ja, en };
