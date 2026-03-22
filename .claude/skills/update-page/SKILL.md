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

## チェックリスト

**開始時**: 以下のチェックリストを `TaskCreate` ツールで全てタスク化してから、Step 1 から順に1ステップずつ進める。各ステップ完了時に `TaskUpdate` で完了にマークすること。

1. **ページ特定** — 引数から page-id を決定。`Read` ツールで `.claude/skills/update-page/pages/<page-id>.md` を読み込む
2. **公式情報取得＋既存データ読み込み＋完全性チェック** — `pages/*.md` に記載のソース URL から WebFetch で公式情報を取得すると同時に、現在の JSON ファイルを読み込む
  - **完全性チェック**: `pages/*.md` に記載のアイテム数目安と WebFetch 結果のアイテム数を突合する。大きく乖離（目安の70%未満）している場合は、別のソース URL を追加で WebFetch するか、同じ URL のセクション別取得で補完する
  - **ユーザーが直接情報を提供した場合**: WebFetch を省略可能（ただし Step 3 の裏取りは実施する）
3. **差分検出＋裏取り** — 取得した公式情報と現在の JSON データを比較し、差分を特定する。**差分の種別に応じた裏取りを実施する**
  - 比較キー: release-note→`v`, commands→`name`, directory→`path`, plugins→`name`, env-vars→`name`, setup→ファイル単位, best-practices/prompting/skill-best-practices/hooks-best-practices→`id`
  - **差分種別ごとの裏取りルール**:

    | 差分種別 | 判定 | 裏取りレベル |
    |---------|------|------------|
    | 公式にあり JSON にない | 追加 | 公式ドキュメントで該当項目を確認すれば OK |
    | 公式と JSON で内容が異なる | 更新 | WebFetch の要約誤りの可能性あり。該当フィールドを公式ドキュメントの原文と照合し、本当に変更されたか確認 |
    | JSON にあり WebFetch にない | **削除候補（最高リスク）** | WebFetch の情報欠落の可能性が高い。**別のソース URL でも検索し、本当に公式から削除されたか二重検証必須**。確証がなければ削除しない |

  - `pages/*.md` に記載の高リスクフィールドは特に慎重に照合する
  - CHANGELOG のみの情報で確証がなければ `AskUserQuestion` で確認
4. **翻訳＋JSON修正** — 裏取り済みの差分を日本語に翻訳し、ページ固有の JSON スキーマに従ってファイルを更新
  - 実行前: `git diff` で未コミット変更がないか確認（ある場合はユーザーに通知）
  - 実行後: `git diff` で意図しない変更がないか検証
  - エラー時: JSON 構文エラーや型エラーが発生した場合、変更を元に戻す前にユーザーに確認
5. **検証＋報告** — JSON 構文チェック + `pnpm run typecheck` + 以下の形式で報告

```
更新結果:
- 追加: N件（新規追加したアイテム一覧）
- 更新: N件（内容を更新したアイテム一覧）
- スキップ: N件（既に最新のため変更なし）
- 削除: N件（公式から削除されたアイテム）
```

## ページ種別と比較戦略

ページの性質によって有効な比較方法が異なる。各ページの種別は `pages/*.md` に記載。

| 種別 | 該当ページ | 比較戦略 |
|------|-----------|---------|
| **リファレンス型** | commands, env-vars, plugins | アイテムが離散的で数えられる。name で 1:1 マッチングし、全フィールドを機械的に比較 |
| **ガイド型** | best-practices, prompting, skill-best-practices, hooks-best-practices | 概念的な内容。id でマッチングするが、content の意味的同一性は機械的に判定困難。構造（セクション数・アイテム数）の変化を優先的にチェック |
| **構造型** | directory, setup | path/id で比較可能だが detail の情報量が多い。構造の追加・削除を優先し、既存項目の内容変更は高リスクフィールドに絞って確認 |
| **履歴型** | release-note | 既存データは不変。最新バージョンの有無チェックのみ。既存バージョンの修正は行わない |

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

### サブエージェント委任時のルール

- サブエージェントには **ソース URL のリスト** と **`pages/*.md` の内容**（アイテム数目安・高リスクフィールド含む）を渡す
- サブエージェント自身が WebFetch で公式ソースを取得し、完全性チェック・裏取りを実施すること。メインが事前に取得・要約した情報のみを渡して「これを追加して」と指示するのは禁止
- サブエージェントも差分種別ごとの裏取りルール（Step 3 の表）に従う

## 全ページスキャン（引数なし時）

**注意**: 全ページスキャンは主要ソース1つの簡易チェックであり、WebFetch の AI 要約による検出漏れが起きうる。特にリファレンス型ページ（commands: ~70件、env-vars: ~100件）は1回の WebFetch でアイテムが欠落しやすい。

1. 全10ページの `pages/<page-id>.md` を順次確認
2. 各ページの主要ソース URL 1つを WebFetch して最新情報を取得
3. 既存 JSON との差分を簡易チェック（アイテム数の比較 + 主要な追加・削除の検出）
4. 差分が検出されたページについて通常ワークフロー（並列実行）で修正を実行
5. 検出漏れの可能性をユーザーに報告し、特定ページの詳細チェックが必要か確認

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
| WebFetch にないアイテムを「公式から削除された」と判定する | WebFetch の AI 要約は情報を欠落させる。削除判定は別ソースで二重検証必須 |
| WebFetch 結果の完全性を検証しない | `pages/*.md` のアイテム数目安と突合。70%未満なら追加取得 |
| `\n` で段落を区切る | `\n\n` を使用（ParagraphList の仕様） |
| 公式ドキュメントにない情報を追加 | 推測で追加しない。不明な場合は `AskUserQuestion` |
| 旧 URL 形式を使用 | `https://code.claude.com/docs/en/` 形式に統一 |
