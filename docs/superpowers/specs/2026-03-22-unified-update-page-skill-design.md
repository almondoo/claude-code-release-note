# 統合スキル `update-page` 設計スペック

## 概要

既存の3つのスキル（`add-release`, `update-commands`, `update-directory`）を1つの統合スキル `update-page` に統合し、公式ドキュメントから情報を取得・裏取りして更新できる全10ページを対象とする。

## 目的

- 3つの独立スキルに分散していた共通ロジック（情報取得→裏取り→翻訳→JSON更新→検証）を統合
- 未対応だった7ページ（plugins, env-vars, setup, best-practices, prompting, skill-best-practices, hooks-best-practices）にも同じ品質保証プロセスを適用
- トークン効率を最適化（ページ別設定を分離し、必要な分だけ読み込む）

## インターフェース

```
/update-page <page-id>     # 特定ページを更新
/update-page               # 引数なし → 全ページスキャン（後述）
```

### page-id 一覧

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

### 対象外ページ

以下のページは公式ドキュメントに対応するソースがなく、独自コンテンツのためスキルの対象外とする:

| ページ | 除外理由 |
|--------|---------|
| `token-usage` | 独自調査・実測データに基づくコンテンツ |
| `llm-infra-guide` | 独自のインフラ解説コンテンツ |
| `hands-on` / `hands-on/:topic` | 独自のハンズオン教材 |
| `harness-engineering` | 複数ドキュメントの横断的な独自解説 |

### 全ページスキャンの動作仕様

引数なしで実行した場合:

1. 全10ページの `pages/<page-id>.md` を順次確認
2. 各ページについて、主要なソースURL 1つを WebFetch して最新情報を取得
3. 既存JSONとの差分を簡易チェック（新規追加・変更がありそうなページを特定）
4. 差分がありそうなページの一覧をユーザーに提示し、どのページを更新するか `AskUserQuestion` で確認
5. ユーザーが選択したページについて、通常のワークフロー（Step 1-6）を実行

**注意**: 全ページスキャンは概要レベルの差分チェックであり、詳細な裏取りは個別ページ更新時に行う。

### 並列実行戦略

複数ページの更新が必要な場合、Agent ツールでサブエージェントを並列起動して効率的に処理する。

#### 並列化の原則

- 各ページのデータファイルは独立しているため、異なるページの更新は並列実行可能
- ただし `pnpm run typecheck` は全ページの更新完了後に1回だけ実行する（並列実行中は各エージェントが JSON 構文チェックのみ実施）

#### 並列数の目安

| 更新ページ数 | 推奨並列数 | 理由 |
|-------------|-----------|------|
| 1 | 1（直列） | 並列化不要 |
| 2-3 | 2-3（全並列） | エージェント数が少なくオーバーヘッドなし |
| 4-6 | 3 | WebFetch の同時実行数とコンテキスト効率のバランス |
| 7-10 | 3-4 | 過度な並列はトークンコストが増大するため上限4を推奨 |

#### 並列実行フロー

```
1. 差分チェック結果から更新対象ページのリストを確定
2. Agent ツールで並列数分のサブエージェントを同時起動
   - 各エージェントに page-id と pages/<page-id>.md の内容を渡す
   - 各エージェントは Step 2-5（既存データ確認〜JSON更新）を独立実行
3. 全エージェント完了後、メインで一括検証
   - pnpm run typecheck（1回）
   - git diff で全変更を確認
   - 更新結果を統合して報告
```

## アーキテクチャ

### ファイル構成

```
.claude/skills/update-page/
  ├── SKILL.md                          # 共通ワークフロー + ページレジストリ
  └── pages/
      ├── release-note.md               # ← add-release から移行
      ├── commands.md                   # ← update-commands から移行
      ├── directory.md                  # ← update-directory から移行
      ├── plugins.md                    # 新規
      ├── env-vars.md                   # 新規
      ├── setup.md                      # 新規
      ├── best-practices.md             # 新規
      ├── prompting.md                  # 新規
      ├── skill-best-practices.md       # 新規
      └── hooks-best-practices.md       # 新規
```

### 削除対象

```
.claude/skills/add-release/SKILL.md         # 削除
.claude/skills/update-commands/SKILL.md     # 削除
.claude/skills/update-directory/SKILL.md    # 削除
```

## SKILL.md の構成

### フロントマター

```yaml
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
```

### 共通ワークフロー（6ステップ）

1. **ページ特定**: 引数から page-id を決定。`Read` ツールで `.claude/skills/update-page/pages/<page-id>.md` を読み込む
2. **既存データ確認**: 現在のJSONファイルの内容を確認し、最新の状態を把握。release-note の場合は既存の最新バージョンを確認して重複追加を防止する
3. **公式情報取得**: `pages/*.md` に記載のソースURLから WebFetch で情報取得。**ユーザーが直接情報を提供した場合はこのステップを省略可能**（ただし Step 4 の裏取りは実施する）
4. **差分特定＋裏取り**: 既存データと公式情報の差分を特定。公式ドキュメントで裏取り。CHANGELOG のみの情報は確証がなければ `AskUserQuestion` で確認
5. **翻訳＋JSON更新**: 差分を日本語に翻訳し、ページ固有のJSONスキーマに従ってファイルを更新。冪等性チェックリスト（後述）に従って安全に適用する
6. **検証＋報告**: JSON構文チェック + `pnpm run typecheck` + 更新内容をユーザーに報告

### 冪等性チェックリスト

スキルの各実行は何度実行しても同じ結果を生む（冪等性を持つ）こと。以下のチェックを Step 5 の前に必ず実施する。

#### 1. 重複検出（全ページ共通）

更新対象のアイテムが既存データに存在するかを、ページ固有のキーで判定する:

| page-id | 一意キー | 判定方法 |
|---------|---------|---------|
| `release-note` | `v`（バージョン番号） | `releases-*.json` 内に同一 `v` が存在するか |
| `commands` | `name`（コマンド名） | 各 JSON 内に同一 `name` が存在するか |
| `directory` | `path`（ファイルパス） | `sections[].entries[]` 内に同一 `path` が存在するか |
| `plugins` | `name`（プラグイン名） | `categories[].plugins[]` 内に同一 `name` が存在するか |
| `env-vars` | `name`（変数名） | `categories[].vars[]` 内に同一 `name` が存在するか |
| `setup` | ファイル単位 | 該当する `setup-*.json` の内容を比較 |
| `best-practices` | `id`（アイテムID） | `sections[].items[]` 内に同一 `id` が存在するか |
| `prompting` | `id`（アイテムID） | `sections[].items[]` 内に同一 `id` が存在するか |
| `skill-best-practices` | `id`（アイテムID） | `sections[].items[]` 内に同一 `id` が存在するか |
| `hooks-best-practices` | `id`（アイテムID） | `sections[].items[]` 内に同一 `id` が存在するか |

#### 2. 操作の判定

重複検出の結果に応じて、以下の3パターンのいずれかを適用する:

| 状態 | 操作 | 説明 |
|------|------|------|
| **存在しない** | 追加 | 新規アイテムとしてJSONに追加 |
| **存在し、内容が異なる** | 更新 | 既存アイテムを上書き更新 |
| **存在し、内容が同一** | スキップ | 変更なし。ログに「変更なし」と報告 |

#### 3. 実行前後の確認

- **実行前**: `git diff` で現在の未コミット変更がないか確認。ある場合はユーザーに通知
- **実行後**: `git diff` で変更内容を確認し、意図しない変更がないか検証
- **エラー時**: JSON構文エラーや型エラーが発生した場合、変更を元に戻す（`git checkout -- <file>`）前にユーザーに確認

#### 4. 報告フォーマット

Step 6 の報告では以下を明示する:

```
更新結果:
- 追加: N件（新規追加したアイテム一覧）
- 更新: N件（内容を更新したアイテム一覧）
- スキップ: N件（既に最新のため変更なし）
- 削除: N件（公式から削除されたアイテム。削除前にユーザー確認必須）
```

### 共通翻訳ルール

- 自然な日本語に翻訳する（直訳ではなく読みやすい表現）
- 技術用語・固有名詞はそのまま維持: OAuth, MCP, CLI, SDK, API, PR, vim, bash 等
- `detail` / `content` フィールドは `\n\n` で段落分け（ParagraphList 対応）
- `detail` フィールドでは Markdown インラインリンク記法 `[ラベル](URL#fragment)` が使用可能。該当する公式ドキュメントページがある場合はリンクを埋め込む（全ページ共通）

### 共通 URL ルール

- 全ページで公式ドキュメント URL は `https://code.claude.com/docs/en/` 形式に統一する
- 旧 URL（`https://docs.anthropic.com/en/docs/claude-code/`）は使用しない（2026年3月時点で 301 リダイレクト済み）

### 共通検証チェックリスト

1. 公式ドキュメントで裏取り済み
2. JSON構文が正しい: `node -e "require('<file-path>')"`
3. 型チェック通過: `pnpm run typecheck`
4. 翻訳が自然な日本語

### スキル対象外の作業

- UI/デザインの修正（コード変更が必要）
- 既に正確に存在するデータの再追加
- 対象外ページ（token-usage, llm-infra-guide, hands-on, harness-engineering）の更新

### 共通 Common Mistakes

| ミス | 対処 |
|------|------|
| CHANGELOG の AI 要約を鵜呑みにする | 必ず公式ドキュメントで裏取り |
| `\n` で段落を区切る | `\n\n` を使用（ParagraphList の仕様） |
| 公式ドキュメントにない情報を追加 | 推測で追加しない。不明な場合は `AskUserQuestion` |
| 旧 URL 形式を使用 | `https://code.claude.com/docs/en/` 形式に統一 |

## ページ別設定ファイル（pages/*.md）の共通テンプレート

```markdown
# <ページ名>

## データファイル

| ファイル | 内容 |
|---------|------|
（ファイルパスと役割）

## 情報ソース

| ステップ | 内容 | ソースURL |
|---------|------|-----------|
（ページ固有のソースURL一覧。全URLは https://code.claude.com/docs/en/ 形式）

## データスキーマ

（JSON構造の定義とフィールド説明）

## ページ固有ルール

（タグ体系、カテゴリ分類、配置ルール等）

## 使用条件・注意事項

（このページの更新が必要なケース、不要なケース）

## Common Mistakes

（ページ固有のよくあるミス）
```

## 既存スキルからの移行詳細

### release-note.md（← add-release）

移行する内容:
- 情報ソース（CHANGELOG + Docs の2段階取得）
- releases-*.json と version-details-*.json のJSONフォーマット
- タグ一覧（`badge.tsx` と一致する全タグに更新。既存スキルの11種から実際のコードベースに合わせる）
- category の例一覧
- ドキュメントリンクの記述ルール（リンクを入れる/入れない基準、フラグメント付き URL の書き方）
- 公式ドキュメントURL一覧（全URLを `https://code.claude.com/docs/en/` 形式に更新）
- 新ファイル作成時の `app/data/releases/index.ts` インポート追加ルール（既存スキルでは `constants.tsx` と誤記されていたのを修正）
- 重複追加防止の確認ルール
- 使用条件（新バージョンリリース時、CHANGELOG に未反映のバージョンがあるとき）
- 使わないケース（既存バージョンの再追加、UI修正）
- ページ固有の Common Mistakes（配列途中挿入、t不一致、detail丸写し、重複追加等）

共通部分として SKILL.md に移動:
- 翻訳ルール（技術用語維持、変更種別の接頭辞）
- 検証チェックリスト
- ドキュメントリンクの Markdown 記法（detail 内でのインラインリンク使用）

### commands.md（← update-commands）

移行する内容:
- 情報ソース（interactive-mode + cli-reference + CHANGELOG）
- 3ファイル構造（commands-categories.json, commands-cli.json, commands-shortcuts.json）
- コマンドの分類ルール（スラッシュコマンド/CLIサブコマンド/ショートカット/スキル）
- カテゴリ一覧（9カテゴリ）
- 新カテゴリ追加時の `app/routes/commands/constants.tsx` 更新ルール（SECTION_COLORS, SECTION_ICONS）（既存スキルでは CATEGORY_COLORS/CATEGORY_ICONS と誤記されていたのを修正）
- コマンドの削除・リネームルール
- 使用条件（新コマンド追加時、既存コマンドの説明変更時、コマンド削除・リネーム時）
- 使わないケース（UI/デザイン修正、既に正確に存在するコマンドの再追加）
- ページ固有の Common Mistakes（CLI をスラッシュコマンドに分類、constants.tsx 更新忘れ等）

共通部分として SKILL.md に移動:
- 翻訳ルール
- 検証チェックリスト

### directory.md（← update-directory）

移行する内容:
- 情報ソース（settings, memory, hooks, mcp, skills, sub-agents, overview, CHANGELOG, 差分確認の9ステップ）
- directory-structure.json の全体構造（sections, precedence, commitGuide, skillsVsAgents）
- エントリのフィールド定義（path, type, name, description, detail, usage, bestPractice, vcs, recommended）
- セクション別配置ルール（global, project-root, project-claude, home, managed）
- 使用条件（新設定ファイル・ディレクトリ追加時、説明変更時、優先順位変更時）
- 使わないケース（UI/デザイン修正、既に正確に存在するエントリの再追加）
- ページ固有の Common Mistakes（公式Docsにない設定追加、vcs 間違い、commitGuide 未更新等）

共通部分として SKILL.md に移動:
- 翻訳ルール
- 検証チェックリスト

## 新規7ページの設定概要

### plugins.md

- **ソースURL**: `https://code.claude.com/docs/en/plugins`, `https://code.claude.com/docs/en/discover-plugins`
- **データファイル**: `app/data/plugins/plugins.json`
- **スキーマ**: categories[].plugins[] — name, displayName, description, binary, install, detail, whenToUse, setup
- **固有ルール**: install コマンドの形式統一、binary の正確性確認
- **使用条件**: 新プラグイン追加時、既存プラグインの説明変更時

### env-vars.md

- **ソースURL**: `https://code.claude.com/docs/en/settings` (#environment-variables セクション)
- **データファイル**: `app/data/env-vars/env-vars.json`
- **スキーマ**: categories[].vars[] — name, description, detail, values, default, example, links, deprecated
- **固有ルール**: deprecated フラグの正確性、default 値の検証
- **使用条件**: 新環境変数追加時、既存の説明・デフォルト値変更時、非推奨化時

### setup.md

- **ソースURL**: `https://code.claude.com/docs/en/overview`, `https://code.claude.com/docs/en/settings`
- **データファイル**: `app/data/setup/setup-*.json`（複数ファイル: installation, authentication, first-steps, claude-md, ide, permissions, tips, troubleshooting, intro）
- **スキーマ**: フェーズ別ステップ構造（ファイルごとに異なる）
- **固有ルール**: ステップ順序の論理的整合性
- **使用条件**: インストール手順・設定手順が変更されたとき

### best-practices.md

- **ソースURL**: `https://code.claude.com/docs/en/best-practices`
- **データファイル**: `app/data/best-practices/best-practices.json`
- **スキーマ**: sections[].items[] — id, title, summary, content, tags, examples[]{strategy, before, after, detail}
- **固有ルール**: before/after 例は日本語で記述
- **使用条件**: 公式ベストプラクティスに新項目追加・変更があったとき

### prompting.md

- **ソースURL**: `https://code.claude.com/docs/en/best-practices`（プロンプト関連セクション）
- **データファイル**: `app/data/prompting/prompting.json`
- **スキーマ**: sections[].items[] — id, title, summary, content, tags, examples[]{strategy, before, after}
- **固有ルール**: before/after 例は実際のプロンプト例。コード部分は英語のまま
- **使用条件**: 公式のプロンプトガイダンスに新項目追加・変更があったとき

### skill-best-practices.md

- **ソースURL**: `https://code.claude.com/docs/en/skills`
- **データファイル**: `app/data/skill-best-practices/skill-best-practices.json`
- **スキーマ**: sections[].items[] — id, title, summary, content, tags, examples[]{strategy, detail, before, after}, tips[]
- **固有ルール**: スキルのフロントマターやディレクトリ構成は公式Docsの仕様と一致させる
- **使用条件**: スキルの仕様・ベストプラクティスに変更があったとき

### hooks-best-practices.md

- **ソースURL**: `https://code.claude.com/docs/en/hooks`
- **データファイル**: `app/data/hooks-best-practices/hooks-best-practices.json`
- **スキーマ**: sections[].items[] — id, title, summary, content, tags, tips[], steps[]{title, content, code}, code[]{lang, label, value}
- **固有ルール**: フックイベント名やハンドラタイプは公式Docsと一致させる
- **使用条件**: フックの仕様・イベント・ベストプラクティスに変更があったとき

## 実装順序

1. `.claude/skills/update-page/SKILL.md` を作成
2. `pages/release-note.md`, `pages/commands.md`, `pages/directory.md` を既存スキルから移行
3. `pages/plugins.md` ～ `pages/hooks-best-practices.md` の7ファイルを新規作成
4. 既存3スキルディレクトリを削除
5. 動作確認（1ページ指定で実行してみる）

## 成功基準

- `/update-page <page-id>` で全10ページの更新が可能
- 引数なしで全ページスキャンが動作
- 既存スキルの機能が失われていない（特に release-note のタグ体系、commands の分類ルール、directory のセクション配置）
- 各ページ更新時に公式ドキュメントでの裏取りが必須フローに組み込まれている
- 全URLが `https://code.claude.com/docs/en/` 形式に統一されている
