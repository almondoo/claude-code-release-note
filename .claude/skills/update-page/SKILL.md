---
name: update-page
description: >
  Claude Code の公式ドキュメントや CHANGELOG から最新情報を取得し、各ページのデータを更新する統合スキル。
  "ページ更新", "update-page", "リリースノートに追加", "add version",
  "コマンド更新", "コマンド追加", "update commands",
  "設定ガイド更新", "ディレクトリ構成更新", "update directory",
  "プラグイン更新", "環境変数更新", "セットアップ更新",
  "ベストプラクティス更新", "プロンプト更新", "スキル設計更新", "Hooks更新"
  等で起動。
user-invocable: true
argument-hint: "<page-id> (例: release-note, commands, directory, plugins, env-vars, setup, best-practices, prompting, skill-best-practices, hooks-best-practices)"
---

# ページデータ更新スキル

公式ドキュメント・CHANGELOG から最新情報を取得し、裏取りした上で各ページの JSON データを更新する。

## ページレジストリ

| page-id | ページ名 | データディレクトリ |
|---------|---------|-------------------|
| `release-note` | リリースノート | `app/data/releases/` |
| `commands` | コマンド一覧 | `app/data/commands/` |
| `directory` | 設定ガイド | `app/data/directory/` |
| `plugins` | 公式プラグイン | `app/data/plugins/` |
| `env-vars` | 環境変数 | `app/data/env-vars/` |
| `setup` | セットアップ | `app/data/setup/` |
| `best-practices` | ベストプラクティス | `app/data/best-practices/` |
| `prompting` | プロンプト | `app/data/prompting/` |
| `skill-best-practices` | スキル設計 | `app/data/skill-best-practices/` |
| `hooks-best-practices` | Hooks | `app/data/hooks-best-practices/` |

## 共通ワークフロー

- [ ] **Step 1: ページ特定** — 引数から page-id を決定。`Read` ツールで `.claude/skills/update-page/pages/<page-id>.md` を読み込む
- [ ] **Step 2: 既存データ確認** — 現在の JSON ファイルの内容を確認し最新状態を把握。release-note の場合は既存の最新バージョンを確認して重複追加を防止
- [ ] **Step 3: 公式情報取得** — `pages/*.md` に記載のソース URL から WebFetch で情報取得。**ユーザーが直接情報を提供した場合はこのステップを省略可能**（ただし Step 4 の裏取りは実施する）
- [ ] **Step 4: 差分特定＋裏取り** — 既存データと公式情報の差分を特定。公式ドキュメントで裏取り。CHANGELOG のみの情報は確証がなければ `AskUserQuestion` で確認
- [ ] **Step 5: 翻訳＋JSON更新** — 差分を日本語に翻訳し、ページ固有の JSON スキーマに従ってファイルを更新。重複検出・操作判定・実行前後確認を実施
- [ ] **Step 6: 検証＋報告** — JSON 構文チェック + `pnpm run typecheck` + 以下の形式で報告

```
更新結果:
- 追加: N件（新規追加したアイテム一覧）
- 更新: N件（内容を更新したアイテム一覧）
- スキップ: N件（既に最新のため変更なし）
- 削除: N件（公式から削除されたアイテム。削除前にユーザー確認必須）
```

### 重複検出

更新対象のアイテムが既存データに存在するかを、ページ固有のキーで判定:

| page-id | 一意キー | 判定方法 |
|---------|---------|---------|
| `release-note` | `v`（バージョン番号） | `releases-*.json` 内に同一 `v` が存在するか |
| `commands` | `name`（コマンド名） | 各 JSON 内に同一 `name` が存在するか |
| `directory` | `path`（ファイルパス） | `sections[].entries[]` 内に同一 `path` が存在するか |
| `plugins` | `name`（プラグイン名） | `categories[].plugins[]` 内に同一 `name` が存在するか |
| `env-vars` | `name`（変数名） | `categories[].vars[]` 内に同一 `name` が存在するか |
| `setup` | ファイル単位 | 該当する `setup-*.json` の内容を比較 |
| `best-practices` | `id` | `sections[].items[]` 内に同一 `id` が存在するか |
| `prompting` | `id` | `sections[].items[]` 内に同一 `id` が存在するか |
| `skill-best-practices` | `id` | `sections[].items[]` 内に同一 `id` が存在するか |
| `hooks-best-practices` | `id` | `sections[].items[]` 内に同一 `id` が存在するか |

### 操作の判定

| 状態 | 操作 |
|------|------|
| 存在しない | 追加 |
| 存在し、内容が異なる | 更新 |
| 存在し、内容が同一 | スキップ |

### 実行前後の確認

- **実行前**: `git diff` で現在の未コミット変更がないか確認。ある場合はユーザーに通知
- **実行後**: `git diff` で変更内容を確認し、意図しない変更がないか検証
- **エラー時**: JSON 構文エラーや型エラーが発生した場合、変更を元に戻す前にユーザーに確認

## 並列実行戦略

複数ページの更新が必要な場合、Agent ツールでサブエージェントを並列起動して効率的に処理する。

- 各ページのデータファイルは独立しているため、異なるページの更新は並列実行可能
- `pnpm run typecheck` は全ページの更新完了後に1回だけ実行（並列実行中は JSON 構文チェックのみ）

| 更新ページ数 | 推奨並列数 |
|-------------|-----------|
| 1 | 1（直列） |
| 2-3 | 2-3（全並列） |
| 4-6 | 3 |
| 7-10 | 3-4 |

並列実行フロー:
1. 差分チェック結果から更新対象ページのリストを確定
2. Agent ツールで並列数分のサブエージェントを同時起動（各エージェントに page-id と pages/*.md の内容を渡す）
3. 全エージェント完了後、メインで一括検証（typecheck + git diff + 統合報告）

### サブエージェント委任時の裏取りルール

サブエージェントには **ソース URL のリスト** を渡し、サブエージェント自身が WebFetch で公式ソースを取得して裏取りすること。メインが事前に取得・要約した情報のみを渡して「これを追加して」と指示するのは禁止。WebFetch の AI 要約で情報が欠落するリスクがあるため、サブエージェントが独立して一次ソースを確認する。

## 全ページスキャン（引数なし時）

1. 全10ページの `pages/<page-id>.md` を順次確認
2. 各ページの主要ソース URL 1つを WebFetch して最新情報を取得
3. 既存 JSON との差分を簡易チェック
4. 差分がありそうなページの一覧を `AskUserQuestion` でユーザーに提示
5. 選択されたページについて通常ワークフロー（並列実行）を実行

## 共通翻訳ルール

- 自然な日本語に翻訳（直訳ではなく読みやすい表現）
- 技術用語・固有名詞はそのまま維持: OAuth, MCP, CLI, SDK, API, PR, vim, bash 等
- `detail` / `content` フィールドは `\n\n` で段落分け（ParagraphList 対応）
- `detail` では Markdown インラインリンク記法 `[ラベル](URL#fragment)` が使用可能。該当する公式ドキュメントページがある場合はリンクを埋め込む

## 共通 URL ルール

- 全 URL は `https://code.claude.com/docs/en/` 形式に統一
- 旧 URL（`https://docs.anthropic.com/en/docs/claude-code/`）は使用しない（301 リダイレクト済み）

## 共通検証チェックリスト

1. 公式ドキュメントで裏取り済み
2. JSON 構文が正しい: `node -e "require('<file-path>')"`
3. 型チェック通過: `pnpm run typecheck`
4. 翻訳が自然な日本語

## スキル対象外

- UI/デザインの修正（コード変更が必要）
- 既に正確に存在するデータの再追加
- 対象外ページ（token-usage, llm-infra-guide, hands-on, harness-engineering）の更新

## 共通 Common Mistakes

| ミス | 対処 |
|------|------|
| CHANGELOG の AI 要約を鵜呑みにする | 必ず公式ドキュメントで裏取り |
| `\n` で段落を区切る | `\n\n` を使用（ParagraphList の仕様） |
| 公式ドキュメントにない情報を追加 | 推測で追加しない。不明な場合は `AskUserQuestion` |
| 旧 URL 形式を使用 | `https://code.claude.com/docs/en/` 形式に統一 |
