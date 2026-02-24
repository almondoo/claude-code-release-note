---
name: add-release
description: Use when a new Claude Code version is released and needs to be added to the release notes site, or when the user mentions "リリースノートに追加", "add version X.Y.Z", or "update release notes".
---

# リリースノート追加スキル

## Overview

Claude Code の新バージョンのリリース情報を CHANGELOG と Docs から取得し、日本語に翻訳して `releases-X.Y.x.json` と `version-details-X.Y.x.json` に追加するスキル。

**データファイルの場所:** `app/data/releases/`
- `releases-2.0.x.json`, `releases-2.1.x.json` — バージョン範囲ごとのリリース一覧
- `version-details-2.1.x.json` — バージョン範囲ごとの詳細情報

## When to Use

- 新しい Claude Code バージョンがリリースされたとき
- ユーザーが特定のバージョン番号を指定して追加を依頼したとき
- CHANGELOG に未反映のバージョンがあるとき

**使わないケース:**
- `releases.json` に既に存在するバージョン（重複チェックで防止）
- Claude Code 以外のプロダクトのリリースノート
- リリースノートの表示・UI の修正（それはコード変更）

## Quick Reference

| ステップ | 内容 | ソース |
|---|---|---|
| 1. 重複チェック | `releases-X.Y.x.json` の末尾で最新バージョン確認 | ローカル |
| 2. 変更項目取得 | CHANGELOG から対象バージョンを抽出 | GitHub |
| 3. 詳細情報取得 | Docs から技術的背景を補完し、リンク先 URL も特定 | Anthropic Docs |
| 4. 翻訳・タグ付与 | 日本語に翻訳し、タグ・カテゴリを付与。detail にドキュメントリンクを埋め込み | — |
| 5. JSON 更新 | `releases-X.Y.x.json` と `version-details-X.Y.x.json` に追記 | ローカル |
| 6. 報告 | 追加内容をユーザーに報告 | — |

## 情報ソースの決定

ユーザーがバージョン番号と変更内容を直接提供した場合はそちらを使用する。提供されていない場合は以下の2段階で情報を取得する。

### ステップ1: CHANGELOG から変更項目を取得

```
WebFetch https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
```

対象バージョンのセクションから変更項目を抽出する。CHANGELOG 全体は大きいため、必要なバージョンの情報だけを抽出すること。ここで得た情報は主に `releases-X.Y.x.json` の `t`（1行要約）に使用する。

### ステップ2: Claude Code Docs から詳細情報を取得

```
WebFetch https://docs.anthropic.com/en/docs/claude-code/overview
```

CHANGELOG の各変更項目について、該当する機能の技術的背景・使い方・影響範囲を Docs から補完する。ここで得た情報は `version-details-X.Y.x.json` の `detail` フィールドの記述に活用する。

- CHANGELOG だけでは1行の要約しか得られないため、Docs を参照して詳細な解説を書くこと
- Docs に該当情報がない場合は、CHANGELOG の内容と一般的な技術知識から `detail` を構成する
- 各変更項目に関連する公式ドキュメントページの URL を特定し、`detail` テキスト末尾にインラインリンクとして埋め込む（後述のリンク記法参照）
- URL にはフラグメント（`#section-name`）を付与し、該当セクションに直接遷移できるようにする
- URL が存在しない・アクセスできない場合はリンクを追加しない

## releases-X.Y.x.json のフォーマット

対応するバージョン範囲のファイル（例: `releases-2.1.x.json`）の配列 **末尾** に追加。新しいマイナーバージョン（例: 2.2.x）の場合は新ファイルを作成し、`constants.tsx` の import も追加すること:

```json
{
  "v": "X.Y.Z",
  "items": [{ "t": "日本語の変更要約（1行）", "tags": ["タグ1", "タグ2"] }]
}
```

## version-details-X.Y.x.json のフォーマット

対応するバージョン範囲のファイル（例: `version-details-2.1.x.json`）のオブジェクトにキーを追加。新しいマイナーバージョンの場合は新ファイルを作成し、`constants.ts` の import も追加すること:

```json
"X.Y.Z": [
  {
    "t": "releases-X.Y.x.json の t と同一",
    "tags": ["タグ1", "タグ2"],
    "detail": "技術的背景・影響範囲・ユーザーメリットを含む詳細解説。詳しくは[公式ドキュメント](https://docs.anthropic.com/en/docs/claude-code/hooks#worktreecreate)を参照してください。",
    "category": "分類カテゴリ"
  }
]
```

`detail` 内では Markdown のインラインリンク記法 `[ラベル](URL#fragment)` が使用可能。レンダリング時にシアン色の下線付きリンクとして表示される。

**フラグメント付き URL を使うこと:** ページ全体ではなく該当セクションに直接遷移できるよう、URL にはフラグメント（`#section-name`）を付与する。Docs ページの見出しから適切なフラグメントを特定し、`https://docs.anthropic.com/en/docs/claude-code/hooks#worktreecreate` のように記述する。

### ドキュメントリンクを入れる基準

**リンクを入れる:** ユーザーが detail を読んだ後に「具体的な使い方・設定方法を知りたい」と思うアイテム

- 新しい CLI コマンド・サブコマンドの追加（例: `claude auth login` → CLI リファレンス）
- 新しい設定項目・環境変数の追加（例: `CLAUDE_CODE_SIMPLE` → settings の環境変数セクション）
- hooks の新イベント追加・動作変更（例: `WorktreeCreate` → hooks の該当イベントセクション）
- MCP・プラグインの設定や機能追加（例: MCP コネクター対応 → MCP 設定ドキュメント）
- パーミッション・セキュリティモデルの変更（例: パーミッション分類器改善 → セキュリティドキュメント）
- 新しいプラットフォーム対応（例: Windows ARM64 → インストール手順）

**リンクを入れない:**

- 内部的なバグ修正（ユーザーが追加の設定や操作を必要としない）
- パフォーマンス最適化・メモリリーク修正
- レンダリング・表示の修正
- 特定の Docs ページ・セクションに対応しない変更
- 対応する Docs URL が存在しない・アクセスできない場合

## タグ一覧

| タグ       | 用途                                 |
| ---------- | ------------------------------------ |
| `新機能`   | 新機能の追加                         |
| `バグ修正` | バグの修正                           |
| `改善`     | 既存機能の改善・変更                 |
| `SDK`      | Claude Agent SDK 関連                |
| `IDE`      | VS Code 拡張機能関連                 |
| `Platform` | Bedrock / Vertex / Windows など      |
| `Security` | セキュリティ関連                     |
| `Perf`     | パフォーマンス改善                   |
| `非推奨`   | 非推奨化・削除                       |
| `Plugin`   | プラグイン関連                       |
| `Agent`    | エージェント・マルチエージェント関連 |

## category の例

`IDE`, `入力`, `パーミッション`, `レンダリング`, `セキュリティ`, `パフォーマンス`, `コマンド`, `UX`, `API`, `セッション管理`, `SDK`, `サンドボックス`, `設定`, `ツール改善`, `MCP 連携`, `Git 連携`, `プラットフォーム互換性`, `国際化`, `安定性`, `マルチエージェント`, `エージェント設定`, `メモリ`, `会話管理`, `ネットワーク`

## 翻訳ルール

- 自然な日本語に翻訳する（直訳ではなく読みやすい表現）
- 技術用語・固有名詞はそのまま維持: VS Code, OAuth, MCP, heredoc, bash, SDK, API, streaming, sandbox, PR, CLI コマンド名等
- 変更種別の接頭辞: `Fixed` → `修正:`, `Added` → `追加:`, `Improved` → `改善:`, `Changed` → `変更:`, `Removed` → `削除:`
- `t` フィールドは1行で簡潔に
- `detail` フィールドでは: 何が問題だったか、どう変わったか、ユーザーへのメリット、技術的背景を記述
- `detail` 内のドキュメントリンクのラベルは日本語で記述（例:「公式ドキュメント」「hooks のドキュメント」「CLI リファレンス」「セキュリティドキュメント」）

### 公式ドキュメント URL 一覧（リンク先候補）

| 機能領域 | ベース URL | 主なフラグメント |
|---|---|---|
| 概要・インストール | `.../overview` | `#get-started` |
| CLI リファレンス | `.../cli-usage` | `#cli-commands`, `#cli-flags` |
| Hooks | `.../hooks` | `#hook-events`, `#sessionstart`, `#pretooluse`, `#posttooluse`, `#stop`, `#worktreecreate`, `#configchange`, `#exit-code-output` |
| MCP | `.../mcp` | `#installing-mcp-servers`, `#use-mcp-servers-from-claudeai`, `#managed-mcp-configuration` |
| 設定 | `.../settings` | `#environment-variables`, `#permission-settings`, `#plugin-settings` |
| セキュリティ | `.../security` | `#permission-based-architecture`, `#mcp-security` |
| IDE 連携 | `.../ide-integrations` | — |
| プラグイン（作成） | `.../plugins` | `#share-your-plugins`, `#quickstart` |
| プラグイン（利用） | `.../discover-plugins` | `#install-plugins`, `#manage-installed-plugins` |

ベース URL のプレフィックスは `https://docs.anthropic.com/en/docs/claude-code`。

> 実装時に URL の有効性を確認すること。無効な URL はリンクとして追加しない。フラグメントは Docs ページの見出しから特定する（見出しテキストを lowercase + ハイフン区切りに変換）。

## Common Mistakes

| ミス | 対処 |
|---|---|
| 配列の途中に挿入してしまう | `releases-X.Y.x.json` は必ず配列の **末尾** に追加。途中挿入は表示順序を壊す |
| タグの付け忘れ・誤分類 | 1つの項目に複数タグ可。迷ったらタグ一覧を再確認 |
| CHANGELOG の項目を見落とす | バージョンセクション内の全項目を数えて確認 |
| `t` と `detail` の `t` が不一致 | `version-details-X.Y.x.json` の `t` は `releases-X.Y.x.json` の `t` と完全一致させる |
| 既存バージョンを重複追加 | 追加前に `releases-X.Y.x.json` の末尾で最新バージョンを必ず確認 |
| `detail` が CHANGELOG の丸写し | Docs から背景情報を補完し、ユーザーメリットまで踏み込んだ解説にする |
