// リリースノート(/) で使う翻訳。
const ja = {
  metaTitle: "Claude Code リリースノート",
  metaDescription: "Claude Code の全バージョンのリリースノートを閲覧できます",
  pageTitle: "リリースノート",
  statVersions: "バージョン",
  statChanges: "件の変更",
  changes: (n: number) => `${n}件の変更`,
  tabAll: "すべて",
  searchPlaceholder: "キーワードで検索...",
  countSummary: (ver: number, items: number) => `${ver}ver / ${items}件`,
  noResults: "条件に一致する変更はありません",
  itemCount: (n: number) => `${n}件`,
  moreItems: (n: number) => `他 ${n} 件...`,
  hasDetail: "詳細あり",
  modalChanges: (n: number) => `${n}件の変更`,
  toDetailPage: "バージョン詳細ページへ →",
  toVersionPage: "バージョンページへ →",
};

const en: typeof ja = {
  metaTitle: "Claude Code Release Notes",
  metaDescription: "Browse release notes for all versions of Claude Code",
  pageTitle: "Release Notes",
  statVersions: "versions",
  statChanges: "changes",
  changes: (n: number) => `${n} changes`,
  tabAll: "All",
  searchPlaceholder: "Search by keyword...",
  countSummary: (ver: number, items: number) => `${ver} ver / ${items} items`,
  noResults: "No matching changes found",
  itemCount: (n: number) => `${n} items`,
  moreItems: (n: number) => `+${n} more...`,
  hasDetail: "Has Details",
  modalChanges: (n: number) => `${n} changes`,
  toDetailPage: "Go to Version Detail →",
  toVersionPage: "Go to Version Page →",
};

export const releaseNote = { ja, en };
