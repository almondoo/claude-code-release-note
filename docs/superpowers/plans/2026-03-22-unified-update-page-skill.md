# 統合スキル `update-page` 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 既存3スキル（add-release, update-commands, update-directory）を1つの `update-page` スキルに統合し、全10ページの公式Docs連動更新をサポートする

**Architecture:** `.claude/skills/update-page/SKILL.md` に共通ワークフロー・冪等性チェック・並列実行戦略を配置し、`pages/<page-id>.md` にページ固有のデータスキーマ・情報ソース・ルールを分離。スキル起動時は SKILL.md + 該当ページの .md のみ読み込み、トークン効率を最適化する。

**Tech Stack:** Claude Code Skills（Markdown ベース）、フロントマター YAML

**Spec:** `docs/superpowers/specs/2026-03-22-unified-update-page-skill-design.md`

---

## ファイル構成

### 作成するファイル

| ファイル | 責務 |
|---------|------|
| `.claude/skills/update-page/SKILL.md` | 共通ワークフロー、ページレジストリ、冪等性チェック、並列実行戦略、翻訳ルール、検証チェックリスト |
| `.claude/skills/update-page/pages/release-note.md` | リリースノートのデータスキーマ・情報ソース・タグ体系・URL一覧（← add-release から移行） |
| `.claude/skills/update-page/pages/commands.md` | コマンド一覧のデータスキーマ・情報ソース・分類ルール・カテゴリ（← update-commands から移行） |
| `.claude/skills/update-page/pages/directory.md` | 設定ガイドのデータスキーマ・情報ソース・セクション配置ルール（← update-directory から移行） |
| `.claude/skills/update-page/pages/plugins.md` | プラグインのデータスキーマ・情報ソース（新規） |
| `.claude/skills/update-page/pages/env-vars.md` | 環境変数のデータスキーマ・情報ソース（新規） |
| `.claude/skills/update-page/pages/setup.md` | セットアップのデータスキーマ・情報ソース（新規） |
| `.claude/skills/update-page/pages/best-practices.md` | ベストプラクティスのデータスキーマ・情報ソース（新規） |
| `.claude/skills/update-page/pages/prompting.md` | プロンプトのデータスキーマ・情報ソース（新規） |
| `.claude/skills/update-page/pages/skill-best-practices.md` | スキル設計のデータスキーマ・情報ソース（新規） |
| `.claude/skills/update-page/pages/hooks-best-practices.md` | Hooksのデータスキーマ・情報ソース（新規） |

### 削除するファイル

| ファイル | 理由 |
|---------|------|
| `.claude/skills/add-release/SKILL.md` | update-page に統合済み |
| `.claude/skills/update-commands/SKILL.md` | update-page に統合済み |
| `.claude/skills/update-directory/SKILL.md` | update-page に統合済み |

---

## Task 1: SKILL.md の作成

**Files:**
- Create: `.claude/skills/update-page/SKILL.md`

- [ ] **Step 1: SKILL.md を作成**

以下の内容で `.claude/skills/update-page/SKILL.md` を作成する。

````markdown
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

## 共通ワークフロー（6ステップ）

1. **ページ特定**: 引数から page-id を決定。`Read` ツールで `.claude/skills/update-page/pages/<page-id>.md` を読み込む
2. **既存データ確認**: 現在の JSON ファイルの内容を確認し最新状態を把握。release-note の場合は既存の最新バージョンを確認して重複追加を防止
3. **公式情報取得**: `pages/*.md` に記載のソース URL から WebFetch で情報取得。**ユーザーが直接情報を提供した場合はこのステップを省略可能**（ただし Step 4 の裏取りは実施する）
4. **差分特定＋裏取り**: 既存データと公式情報の差分を特定。公式ドキュメントで裏取り。CHANGELOG のみの情報は確証がなければ `AskUserQuestion` で確認
5. **翻訳＋JSON更新**: 差分を日本語に翻訳し、ページ固有の JSON スキーマに従ってファイルを更新。冪等性チェックリスト（後述）に従って安全に適用
6. **検証＋報告**: JSON 構文チェック + `pnpm run typecheck` + 更新内容をユーザーに報告

## 冪等性チェックリスト

Step 5 の前に必ず実施する。

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

### 報告フォーマット

```
更新結果:
- 追加: N件（新規追加したアイテム一覧）
- 更新: N件（内容を更新したアイテム一覧）
- スキップ: N件（既に最新のため変更なし）
- 削除: N件（公式から削除されたアイテム。削除前にユーザー確認必須）
```

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
````

- [ ] **Step 2: ディレクトリ構造を確認**

Run: `ls -la .claude/skills/update-page/ && ls -la .claude/skills/update-page/pages/ 2>/dev/null || echo "pages/ not yet created"`

SKILL.md が正しく配置されていること、pages/ ディレクトリがまだ存在しないことを確認。

---

## Task 2: 既存3スキルの移行（pages/release-note.md, commands.md, directory.md）

**この3ファイルは独立しているため、サブエージェント3並列で実行可能。**

**Files:**
- Create: `.claude/skills/update-page/pages/release-note.md`
- Create: `.claude/skills/update-page/pages/commands.md`
- Create: `.claude/skills/update-page/pages/directory.md`
- Reference: `.claude/skills/add-release/SKILL.md`（移行元）
- Reference: `.claude/skills/update-commands/SKILL.md`（移行元）
- Reference: `.claude/skills/update-directory/SKILL.md`（移行元）
- Reference: `app/components/badge.tsx`（タグ定義確認用）
- Reference: `app/routes/commands/constants.tsx`（SECTION_COLORS/SECTION_ICONS 確認用）

- [ ] **Step 1: pages/release-note.md を作成**

`.claude/skills/add-release/SKILL.md` の内容を移行する。以下の変更を適用:

1. 共通部分（翻訳ルールの一般的な部分、検証チェックリスト）は SKILL.md に移動済みなので含めない
2. タグ一覧を `app/components/badge.tsx` の `TAG_COLORS` と一致させる（13種: 新機能, バグ修正, 改善, 非推奨, SDK, IDE, Platform, Windows, Security, Perf, Plugin, MCP, Agent）。注: CLAUDE.md には「12種類」と記載があるが、実際は13種（Windows を含む）。CLAUDE.md の更新は本タスクのスコープ外
3. 全 URL を `https://code.claude.com/docs/en/` 形式に更新。具体的な変換対象: 公式ドキュメント URL 一覧セクション全体のベース URL プレフィックス `https://docs.anthropic.com/en/docs/claude-code` → `https://code.claude.com/docs/en`、およびステップ2 の WebFetch URL、detail 内のリンク例。移行後に `grep -r "docs.anthropic.com" .claude/skills/update-page/` で旧 URL が残っていないことを検証する
4. 新ファイル作成時の参照先を `constants.tsx` → `app/data/releases/index.ts` に修正
5. 「使用条件・注意事項」セクションを追加

含めるセクション:
- データファイル（releases-*.json, version-details-*.json の構造とファイル分割ルール）
- 情報ソース（CHANGELOG + Docs の2段階。ユーザー直接提供パスの記載）
- データスキーマ（releases-*.json と version-details-*.json の JSON フォーマット）
- タグ一覧（13種、badge.tsx 準拠）
- category の例一覧
- ドキュメントリンクルール（入れる/入れない基準、フラグメント付き URL）
- 公式ドキュメント URL 一覧（code.claude.com 形式に更新）
- release-note 固有の翻訳ルール（変更種別の接頭辞: Fixed→修正:, Added→追加: 等）
- 新ファイル作成時の index.ts インポート追加ルール
- 使用条件・注意事項
- Common Mistakes

- [ ] **Step 2: pages/commands.md を作成**

`.claude/skills/update-commands/SKILL.md` の内容を移行する。以下の変更を適用:

1. 共通部分は含めない
2. `CATEGORY_COLORS`/`CATEGORY_ICONS` → `SECTION_COLORS`/`SECTION_ICONS` に修正（実際の `app/routes/commands/constants.tsx` に合わせる）
3. 「使用条件・注意事項」セクションを追加

含めるセクション:
- データファイル（3ファイル構造: categories, cli, shortcuts）
- 情報ソース（interactive-mode + cli-reference + CHANGELOG）
- データスキーマ（3ファイルそれぞれの JSON フォーマット）
- コマンドの分類ルール（スラッシュコマンド/CLI/ショートカット/スキル）
- カテゴリ一覧（9カテゴリ + cli + shortcuts）
- コマンドの削除・リネームルール
- 新カテゴリ追加時の constants.tsx 更新ルール（SECTION_COLORS, SECTION_ICONS）
- commands 固有の翻訳ルール（ショートカットは Description 列を忠実に翻訳）
- 使用条件・注意事項
- Common Mistakes

- [ ] **Step 3: pages/directory.md を作成**

`.claude/skills/update-directory/SKILL.md` の内容を移行する。以下の変更を適用:

1. 共通部分は含めない
2. 「使用条件・注意事項」セクションを追加

含めるセクション:
- データファイル（directory-structure.json 1ファイル）
- 情報ソース（settings, memory, hooks, mcp, skills, sub-agents, overview, CHANGELOG, 差分確認の9ステップ）
- データスキーマ（全体構造: sections, precedence, commitGuide, skillsVsAgents。エントリのフィールド定義）
- セクション別配置ルール（global, project-root, project-claude, home, managed）
- directory 固有の翻訳ルール（detail は2-3段落）
- directory 固有の検証項目（vcs, recommended, commitGuide 整合性）
- 使用条件・注意事項
- Common Mistakes

- [ ] **Step 4: 3ファイルの存在確認**

Run: `ls -la .claude/skills/update-page/pages/`

`release-note.md`, `commands.md`, `directory.md` の3ファイルが存在すること。

---

## Task 3: 新規ページ設定（plugins.md, env-vars.md, setup.md, best-practices.md）

**この4ファイルは独立しているため、サブエージェント3-4並列で実行可能。**

**Files:**
- Create: `.claude/skills/update-page/pages/plugins.md`
- Create: `.claude/skills/update-page/pages/env-vars.md`
- Create: `.claude/skills/update-page/pages/setup.md`
- Create: `.claude/skills/update-page/pages/best-practices.md`
- Reference: `app/data/plugins/plugins.json`（スキーマ確認用）
- Reference: `app/data/env-vars/env-vars.json`（スキーマ確認用）
- Reference: `app/data/setup/index.ts`（インポート構造確認用）
- Reference: `app/data/best-practices/best-practices.json`（スキーマ確認用）

- [ ] **Step 1: pages/plugins.md を作成**

共通テンプレートに従い、以下の内容で作成:

- **データファイル**: `app/data/plugins/plugins.json`
- **情報ソース**: `https://code.claude.com/docs/en/plugins`, `https://code.claude.com/docs/en/discover-plugins`
- **データスキーマ**: 実際の `plugins.json` を読んで正確な構造を記載
  ```json
  {
    "categories": [{
      "id": "string", "name": "string", "description": "string",
      "plugins": [{
        "name": "string", "displayName": "string", "description": "string",
        "binary": "string", "install": "string",
        "detail": "string", "whenToUse": "string", "setup": "string"
      }]
    }]
  }
  ```
- **ページ固有ルール**: install コマンド形式統一 (`/plugin install <name>@claude-plugins-official`)、binary 正確性
- **使用条件**: 新プラグイン追加時、説明変更時。UI修正は対象外
- **Common Mistakes**: binary 名間違い、install コマンド形式不統一

- [ ] **Step 2: pages/env-vars.md を作成**

- **データファイル**: `app/data/env-vars/env-vars.json`
- **情報ソース**: `https://code.claude.com/docs/en/settings` (#environment-variables セクション)
- **データスキーマ**: 実際の `env-vars.json` を読んで正確な構造を記載
  ```json
  {
    "categories": [{
      "id": "string", "name": "string", "description": "string",
      "vars": [{
        "name": "string", "description": "string", "detail": "string",
        "values": "string", "default": "string | null",
        "example": "string", "links": [], "deprecated": false
      }]
    }]
  }
  ```
- **ページ固有ルール**: deprecated フラグ正確性、default 値検証、カテゴリ分類
- **使用条件**: 新環境変数追加時、説明・デフォルト変更時、非推奨化時
- **Common Mistakes**: deprecated 間違い、default 値不一致、カテゴリ誤配置

- [ ] **Step 3: pages/setup.md を作成**

- **データファイル**: `app/data/setup/` 配下の9ファイル（setup-intro.json, setup-installation.json, setup-authentication.json, setup-first-steps.json, setup-claude-md.json, setup-ide.json, setup-tips.json, setup-permissions.json, setup-troubleshooting.json）。`app/data/setup/index.ts` で結合
- **情報ソース**: `https://code.claude.com/docs/en/overview`, `https://code.claude.com/docs/en/settings`
- **データスキーマ**: 全9ファイルが同一の構造パターンを使用:
  ```json
  {
    "id": "string", "name": "string", "description": "string",
    "phase": "number", "order": "number",
    "steps": [{
      "id": "string", "title": "string", "description": "string",
      "content": "string", "tags": ["string"],
      "code": [{ "lang": "string", "label": "string", "value": "string", "recommended?": "boolean" }],
      "callouts": [{ "type": "string (warning|important|tip)", "text": "string" }]
    }]
  }
  ```
  `app/data/setup/index.ts` で9ファイルを `SECTIONS` 配列として結合
- **ページ固有ルール**: ステップ順序の論理的整合性、フェーズ構成（インストール→認証→初期設定→カスタマイズ→トラブルシュート）
- **使用条件**: インストール手順・設定手順変更時
- **Common Mistakes**: ステップ順序の矛盾、古い手順の残存

- [ ] **Step 4: pages/best-practices.md を作成**

- **データファイル**: `app/data/best-practices/best-practices.json`
- **情報ソース**: `https://code.claude.com/docs/en/best-practices`
- **データスキーマ**: 実際の `best-practices.json` を読んで正確な構造を記載
  ```json
  {
    "sections": [{
      "id": "string", "name": "string", "description": "string",
      "items": [{
        "id": "string", "title": "string", "summary": "string",
        "content": "string", "tags": ["string"],
        "examples?": [{ "strategy": "string", "before": "string", "after": "string", "detail?": "string" }],
        "tips?": ["string"],
        "steps?": [{ "phase": "string", "description": "string", "example": "string" }]
      }]
    }]
  }
  ```
  `?` 付きフィールドはオプショナル
- **ページ固有ルール**: before/after 例は日本語で記述（コード部分は英語のまま）
- **使用条件**: 公式ベストプラクティスに新項目追加・変更時
- **Common Mistakes**: examples の before/after が英語のまま

- [ ] **Step 5: 4ファイルの存在確認**

Run: `ls -la .claude/skills/update-page/pages/`

`plugins.md`, `env-vars.md`, `setup.md`, `best-practices.md` が追加されていること。

---

## Task 4: 新規ページ設定（prompting.md, skill-best-practices.md, hooks-best-practices.md）

**この3ファイルは独立しているため、サブエージェント3並列で実行可能。**

**Files:**
- Create: `.claude/skills/update-page/pages/prompting.md`
- Create: `.claude/skills/update-page/pages/skill-best-practices.md`
- Create: `.claude/skills/update-page/pages/hooks-best-practices.md`
- Reference: `app/data/prompting/prompting.json`（スキーマ確認用）
- Reference: `app/data/skill-best-practices/skill-best-practices.json`（スキーマ確認用）
- Reference: `app/data/hooks-best-practices/hooks-best-practices.json`（スキーマ確認用）

- [ ] **Step 1: pages/prompting.md を作成**

- **データファイル**: `app/data/prompting/prompting.json`
- **情報ソース**: `https://code.claude.com/docs/en/best-practices`（プロンプト関連セクション）
- **データスキーマ**: `sections[].items[]` 構造（code 配列あり）
  ```json
  {
    "sections": [{
      "id": "string", "name": "string", "description": "string",
      "items": [{
        "id": "string", "title": "string", "summary": "string",
        "content": "string", "tags": ["string"],
        "examples?": [{ "strategy": "string", "detail?": "string", "before": "string", "after": "string" }],
        "tips?": ["string"],
        "code?": [{ "lang": "string", "label": "string", "value": "string" }]
      }]
    }]
  }
  ```
  `?` 付きフィールドはオプショナル。`code` は配列オブジェクト形式（hooks-best-practices と異なる）
- **ページ固有ルール**: before/after は実際のプロンプト例。コード部分は英語のまま
- **使用条件**: 公式プロンプトガイダンスに変更時
- **Common Mistakes**: before/after のプロンプト例が不自然

- [ ] **Step 2: pages/skill-best-practices.md を作成**

- **データファイル**: `app/data/skill-best-practices/skill-best-practices.json`
- **情報ソース**: `https://code.claude.com/docs/en/skills`
- **データスキーマ**: 拡張 `sections[].items[]` 構造（examples, tips, code あり）
  ```json
  {
    "sections": [{
      "id": "string", "name": "string", "description": "string",
      "items": [{
        "id": "string", "title": "string", "summary": "string",
        "content": "string", "tags": ["string"],
        "examples?": [{ "strategy": "string", "detail?": "string", "before": "string", "after": "string" }],
        "tips?": ["string"],
        "code?": "string (マークダウンコードブロック形式)"
      }]
    }]
  }
  ```
  `?` 付きフィールドはオプショナル。`code` は string 型（prompting.json の配列形式と異なる）
- **ページ固有ルール**: フロントマターやディレクトリ構成は公式 Docs の仕様と一致させる
- **使用条件**: スキル仕様・ベストプラクティス変更時
- **Common Mistakes**: フロントマターのフィールド名をハイフン区切りに統一していない

- [ ] **Step 3: pages/hooks-best-practices.md を作成**

- **データファイル**: `app/data/hooks-best-practices/hooks-best-practices.json`
- **情報ソース**: `https://code.claude.com/docs/en/hooks`
- **データスキーマ**: `sections[].items[]` 構造（tips, steps あり）
  ```json
  {
    "sections": [{
      "id": "string", "name": "string", "description": "string",
      "items": [{
        "id": "string", "title": "string", "summary": "string",
        "content": "string", "tags": ["string"],
        "tips?": ["string"],
        "steps?": [{ "phase": "string", "description": "string", "example": "string" }]
      }]
    }]
  }
  ```
  `?` 付きフィールドはオプショナル
- **ページ固有ルール**: フックイベント名（SessionStart, PreToolUse, PostToolUse, Stop, WorktreeCreate, ConfigChange）やハンドラタイプ（command, http, prompt, agent）は公式 Docs と一致させる
- **使用条件**: フック仕様・イベント・ベストプラクティス変更時
- **Common Mistakes**: イベント名の誤記、ハンドラタイプの混同

- [ ] **Step 4: 3ファイルの存在確認**

Run: `ls -la .claude/skills/update-page/pages/`

全10ファイルが揃っていること（release-note, commands, directory, plugins, env-vars, setup, best-practices, prompting, skill-best-practices, hooks-best-practices）。

---

## Task 5: 既存スキルの削除

**Files:**
- Delete: `.claude/skills/add-release/SKILL.md`（+ ディレクトリ）
- Delete: `.claude/skills/update-commands/SKILL.md`（+ ディレクトリ）
- Delete: `.claude/skills/update-directory/SKILL.md`（+ ディレクトリ）

- [ ] **Step 1: 全ファイルが揃っていることを最終確認**

Run: `find .claude/skills/update-page/ -type f | wc -l && find .claude/skills/update-page/ -type f | sort`

11ファイル（SKILL.md + 10 pages/*.md）が存在すること。

- [ ] **Step 2: 既存スキルディレクトリを削除**

```bash
rm -rf .claude/skills/add-release/
rm -rf .claude/skills/update-commands/
rm -rf .claude/skills/update-directory/
```

- [ ] **Step 3: 削除確認**

Run: `ls .claude/skills/`

`update-page/` のみ残っていること（他のスキルディレクトリがある場合はそれらも残る）。旧3スキルが存在しないこと。

---

## Task 6: 検証

- [ ] **Step 1: スキルの構造を確認**

Run: `find .claude/skills/update-page/ -type f | sort`

期待する出力:
```
.claude/skills/update-page/SKILL.md
.claude/skills/update-page/pages/best-practices.md
.claude/skills/update-page/pages/commands.md
.claude/skills/update-page/pages/directory.md
.claude/skills/update-page/pages/env-vars.md
.claude/skills/update-page/pages/hooks-best-practices.md
.claude/skills/update-page/pages/plugins.md
.claude/skills/update-page/pages/prompting.md
.claude/skills/update-page/pages/release-note.md
.claude/skills/update-page/pages/setup.md
.claude/skills/update-page/pages/skill-best-practices.md
```

- [ ] **Step 2: SKILL.md のフロントマター構文確認**

SKILL.md を `Read` して、フロントマターが正しい YAML 構文であること（`---` で囲まれ、name, description, user-invocable, argument-hint が存在）を目視確認。

- [ ] **Step 3: 各 pages/*.md に必要セクションが含まれていることを確認**

各ページファイルに以下のセクションが含まれていることを確認:
- データファイル
- 情報ソース
- データスキーマ
- ページ固有ルール
- 使用条件・注意事項
- Common Mistakes

Run: 各ファイルをスポットチェックで `Read` する

- [ ] **Step 4: 移行元の情報が失われていないことを確認**

以下の重要項目が新スキルに含まれていることを確認:
- release-note: タグ13種（badge.tsx 準拠）、URL 一覧（code.claude.com 形式）、index.ts 更新ルール
- commands: SECTION_COLORS/SECTION_ICONS（旧 CATEGORY_* を修正）、分類ルール、9カテゴリ
- directory: セクション配置ルール（5セクション）、commitGuide 整合性ルール、vcs フィールド説明

- [ ] **Step 5: 旧 URL が残っていないことを検証**

Run: `grep -r "docs.anthropic.com" .claude/skills/update-page/ || echo "OK: 旧 URL なし"`

「OK: 旧 URL なし」と出力されること。

- [ ] **Step 6: コミット**

```bash
git add .claude/skills/
git commit -m "feat: 3つの個別スキルを統合スキル update-page に統合（全10ページ対応）"
```
