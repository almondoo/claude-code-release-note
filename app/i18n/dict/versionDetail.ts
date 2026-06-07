// バージョン詳細ページ(/version/:version) で使う翻訳。
const ja = {
  notFound: "バージョンが見つかりません",
  backToList: "一覧に戻る",
  backLinkLabel: "リリースノート一覧",
  changes: (n: number) => `${n} 件の変更`,
  statChanges: "件の変更",
  hasDetail: "詳細情報あり",
  prevVersion: "前のバージョン",
  nextVersion: "次のバージョン",
  metaTitle: (v: string) => `v${v} のリリース詳細 - Claude Code リリースノート`,
  metaDescription: (v: string) => `Claude Code v${v} の変更内容・詳細情報を日本語で確認できます。`,
};

const en: typeof ja = {
  notFound: "Version not found",
  backToList: "Back to list",
  backLinkLabel: "Release Notes",
  changes: (n: number) => `${n} changes`,
  statChanges: "changes",
  hasDetail: "Detail available",
  prevVersion: "Previous version",
  nextVersion: "Next version",
  metaTitle: (v: string) => `Release details for v${v} - Claude Code Release Notes`,
  metaDescription: (v: string) =>
    `Browse the full changelog and release details for Claude Code v${v}.`,
};

export const versionDetail = { ja, en };
