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

**注意**: `pnpm run dev` や `pnpm run start` で起動したサーバーは、作業完了時に必ず停止すること。プロセスを残したままにしない。

## アーキテクチャ

### データフロー

`https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md` (英語の元データ) → `app/data/releases.json` (日本語に翻訳済みの JSON) → `app/routes/release-note.tsx` (表示)

- `releases.json` はバージョンごとのリリース情報を配列で保持。各アイテムは `t` (テキスト) と `tags` (カテゴリタグ配列) を持つ
- タグ種別: `新機能`, `バグ修正`, `改善`, `SDK`, `IDE`, `Platform`, `Security`, `Perf`, `非推奨`, `Plugin`

### ルーティング

- `app/routes.ts` — ルート定義。インデックスルートとして `release-note.tsx` を1つだけ登録
- `app/root.tsx` — ルートレイアウト (lang="ja"、Google Fonts: Noto Sans JP + JetBrains Mono)

### UI

- CSS フレームワーク不使用。すべてインラインスタイル (`CSSProperties`) で記述
- 主要コンポーネント: `ReleaseNote` (ページ本体)、`VersionCard` (バージョンごとの折りたたみカード)、`Badge` (タグバッジ)
- タグによるフィルタリングとキーワード検索機能あり

### パスエイリアス

`~/` は `./app/` にマッピング (`tsconfig.json` の paths + vite-tsconfig-paths)

## 作業ルール

- 仕様が不明確な場合や、複数の選択肢があって判断に迷う場合は、自己判断で進めずに必ず `AskUserQuestion` ツールを使ってユーザーに確認すること

## 参考リンク

- Claude Code の公式 Changelog: https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
