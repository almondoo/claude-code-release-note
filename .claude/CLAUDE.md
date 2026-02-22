# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Claude Code のリリースノートを日本語で閲覧できる Web アプリケーション。React Router v7 (SSR モード) で構築された単一ページアプリ。

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

- `app/routes.ts` — ルート定義。インデックスルートとして `release-note.tsx` を1つだけ登録
- `app/root.tsx` — ルートレイアウト (lang="ja"、Google Fonts: Noto Sans JP + JetBrains Mono)

### UI

- CSS フレームワーク不使用。すべてインラインスタイル (`CSSProperties`) で記述
- 主要コンポーネント: `ReleaseNote` (ページ本体)、`VersionCard` (バージョンごとの折りたたみカード)、`Badge` (タグバッジ)
- タグによるフィルタリングとキーワード検索機能あり

### パスエイリアス

`~/` は `./app/` にマッピング (`tsconfig.json` の paths + vite-tsconfig-paths)

### 新バージョン追加時の手順

1. 該当する10刻みの `releases-2.1.Nx.json` にバージョンデータを追加
2. 詳細データがある場合は `version-details-2.1.Nx.json` にも追加
3. 新しい10刻みが必要な場合（例: v2.1.50〜）は新ファイルを作成し `app/data/releases/index.ts` にインポートを1行追加
4. コード（`constants.tsx`）の変更は基本不要

**ファイルサイズの目安**: JSONファイルは50KB以下を維持すること

## 作業ルール

- 仕様が不明確な場合や、複数の選択肢があって判断に迷う場合は、自己判断で進めずに必ず `AskUserQuestion` ツールを使ってユーザーに確認すること

## 実装原則（YAGNI / KISS）

**今必要なものだけをシンプルに実装する。**

- JSONデータの追加・変更が主な作業。コード変更が不要なら変更しない
- インラインスタイルで表現できるUIを、新しいコンポーネントに切り出さない
- 同じロジックが3箇所以上で使われるまで関数化・コンポーネント化しない
- 「将来使うかもしれない」タグ・フィルタ・フィールドをデータに追加しない
- 実装を追加する前に確認する: **今この瞬間、実際のUIで使われるか？** → No なら作らない

## 参考リンク

- Claude Code の公式 Changelog: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
