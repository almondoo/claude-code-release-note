# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Claude Code のリリースノートを日本語で閲覧できる Web アプリケーション。React Router v7 (SSR モード) で構築。

## コマンド

- `pnpm install` — 依存関係のインストール
- `pnpm run dev` — 開発サーバー起動 (http://localhost:5173)
- `pnpm run build` — プロダクションビルド
- `pnpm run start` — ビルド済みアプリの起動
- `pnpm run typecheck` — 型生成 + TypeScript 型チェック (`react-router typegen && tsc`)

テストフレームワークは未導入。

**注意**: `pnpm run dev` や `pnpm run start` で起動したサーバーは、作業完了時に必ず停止すること。プロセスを残したままにしない。ブラウザ操作（Chrome MCP）のためにサーバーを起動した場合も、操作完了後に必ずサーバーを停止すること。

## アーキテクチャ

### データフロー

`https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md` (英語の元データ) → `app/data/releases/` (日本語に翻訳済みの JSON) → `app/routes/release-note/` (表示)

- データファイルはページ単位のディレクトリで管理: `app/data/{ページ名}/`
- リリースデータはバージョン範囲ごとに分割（10刻み）:
  - `releases-2.0.x.json` (凍結済み)
  - `releases-2.1.0x.json` (v2.1.0〜2.1.9), `releases-2.1.1x.json` (v2.1.10〜2.1.19), ...
  - すべてのリリースファイルは `app/data/releases/index.ts` で結合・エクスポート
- 詳細データも10刻みで分割: `version-details-2.1.2x.json`, `version-details-2.1.3x.json`, ...
- 各アイテムは `t` (テキスト) と `tags` (カテゴリタグ配列) を持つ
- **一覧データ（releases-*.json）と詳細データ（version-details-*.json）は同じタグ体系を使用すること**
- タグは2軸構造（全12種類）:
  - 変更タイプ (4種): `新機能`, `バグ修正`, `改善`, `非推奨`
  - 対象領域 (8種): `SDK`, `IDE`, `Platform`, `Security`, `Perf`, `Plugin`, `MCP`, `Agent`
- タグの定義（色・ラベル・アイコン）: `app/components/badge.tsx` と `app/routes/release-note/constants.tsx`

### ルーティング

- `app/routes.ts` — 全ルート定義（インデックスは `release-note.tsx`）
- `app/root.tsx` — ルートレイアウト (lang="ja"、Google Fonts: IBM Plex Sans + Noto Sans JP + JetBrains Mono)

### コーディングスタイル

- React コンポーネントおよび関数は `function` 宣言ではなくアロー関数で統一: `export const Foo = () => { ... };`

### UI

- Tailwind CSS v4 を使用（`app/app.css` で `@import "tailwindcss"`）
- 動的な色指定（アクセントカラー等）のみ `style` 属性を使用
- 共通コンポーネント (`app/components/`): `PageHeader`, `TabBar`, `SearchInput`, `BaseCard`, `ItemGrid`, `DetailModalShell`, `EmptyState`, `Footer`, `ParagraphList`, `HeaderTags` 等
- 共通フック: `usePageState` — タブフィルタ・検索・モーダル状態を管理
- タグによるフィルタリングとキーワード検索機能あり

### パスエイリアス

`~/` は `./app/` にマッピング (`tsconfig.json` の paths + vite-tsconfig-paths)

### 新バージョン追加時の手順

1. 該当する10刻みの `releases-2.1.Nx.json` にバージョンデータを追加
2. 詳細データがある場合は `version-details-2.1.Nx.json` にも追加
3. 新しい10刻みが必要な場合（例: v2.1.50〜）は新ファイルを作成し `app/data/releases/index.ts` にインポートを1行追加
4. コード（`constants.tsx`）の変更は基本不要

**ファイルサイズの目安**: JSONファイルは50KB以下を維持すること

## JSONデータの記述ルール

- サイトは日本語閲覧用のため、JSONデータ内の説明文・例示（before/after）・コードブロックのコメントもすべて日本語で記述する
- コード構文（Python, bash 等）やファイル名・パス名はそのまま英語で可
- `ParagraphList` コンポーネントは `\n\n` で段落分割するため、content フィールド内のリストや手順は `\n\n` で区切って1項目1段落にする。`\n` 単体は HTML の `<p>` 内で空白扱いになり改行されない

## 新規ページ追加時の注意

- `app/routes.ts` にルート追加
- `app/components/page-header.tsx` の `ALL_PAGES` 配列にナビゲーションリンクを追加

## 参考リンク

- Claude Code の公式 Changelog: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
