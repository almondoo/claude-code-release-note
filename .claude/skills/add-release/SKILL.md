---
name: add-release
description: Use when a new Claude Code version is released and needs to be added to the release notes site, or when the user mentions "リリースノートに追加", "add version X.Y.Z", or "update release notes".
---

# リリースノート追加スキル

## Overview

Claude Code の新バージョンのリリース情報を CHANGELOG と Docs から取得し、日本語に翻訳して `releases.json` と `version-details.json` に追加するスキル。

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
| 1. 重複チェック | `releases.json` の末尾で最新バージョン確認 | ローカル |
| 2. 変更項目取得 | CHANGELOG から対象バージョンを抽出 | GitHub |
| 3. 詳細情報取得 | Docs から技術的背景を補完 | Anthropic Docs |
| 4. 翻訳・タグ付与 | 日本語に翻訳し、タグ・カテゴリを付与 | — |
| 5. JSON 更新 | `releases.json` と `version-details.json` に追記 | ローカル |
| 6. 報告 | 追加内容をユーザーに報告 | — |

## 情報ソースの決定

ユーザーがバージョン番号と変更内容を直接提供した場合はそちらを使用する。提供されていない場合は以下の2段階で情報を取得する。

### ステップ1: CHANGELOG から変更項目を取得

```
WebFetch https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md
```

対象バージョンのセクションから変更項目を抽出する。CHANGELOG 全体は大きいため、必要なバージョンの情報だけを抽出すること。ここで得た情報は主に `releases.json` の `t`（1行要約）に使用する。

### ステップ2: Claude Code Docs から詳細情報を取得

```
WebFetch https://docs.anthropic.com/en/docs/claude-code/overview
```

CHANGELOG の各変更項目について、該当する機能の技術的背景・使い方・影響範囲を Docs から補完する。ここで得た情報は `version-details.json` の `detail` フィールドの記述に活用する。

- CHANGELOG だけでは1行の要約しか得られないため、Docs を参照して詳細な解説を書くこと
- Docs に該当情報がない場合は、CHANGELOG の内容と一般的な技術知識から `detail` を構成する

## releases.json のフォーマット

配列の **末尾** に追加:

```json
{
  "v": "X.Y.Z",
  "items": [{ "t": "日本語の変更要約（1行）", "tags": ["タグ1", "タグ2"] }]
}
```

## version-details.json のフォーマット

オブジェクトにキーを追加:

```json
"X.Y.Z": [
  {
    "t": "releases.json の t と同一",
    "tags": ["タグ1", "タグ2"],
    "detail": "技術的背景・影響範囲・ユーザーメリットを含む詳細解説",
    "category": "分類カテゴリ"
  }
]
```

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

## Common Mistakes

| ミス | 対処 |
|---|---|
| 配列の途中に挿入してしまう | `releases.json` は必ず配列の **末尾** に追加。途中挿入は表示順序を壊す |
| タグの付け忘れ・誤分類 | 1つの項目に複数タグ可。迷ったらタグ一覧を再確認 |
| CHANGELOG の項目を見落とす | バージョンセクション内の全項目を数えて確認 |
| `t` と `detail` の `t` が不一致 | `version-details.json` の `t` は `releases.json` の `t` と完全一致させる |
| 既存バージョンを重複追加 | 追加前に `releases.json` の末尾で最新バージョンを必ず確認 |
| `detail` が CHANGELOG の丸写し | Docs から背景情報を補完し、ユーザーメリットまで踏み込んだ解説にする |
