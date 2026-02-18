---
name: update-directory
description: Use when updating the Claude Code settings guide page (/directory) with new or changed configuration files, settings keys, environment variables, or directory structure. Also use when the user mentions "設定ガイド更新", "ディレクトリ構成更新", "update directory", or "update settings guide".
---

# 設定ガイド更新スキル

## Overview

Claude Code の設定ファイル・ディレクトリ構成の情報を、公式ドキュメントと照合して `directory-structure.json` に追加・更新するスキル。

**データファイル:** `app/data/directory/directory-structure.json`

## When to Use

- 新しい設定ファイルやディレクトリが Claude Code に追加されたとき
- 既存エントリの説明・usage・bestPractice が変更されたとき
- 設定の優先順位（precedence）やコミットガイドが変更されたとき
- スキル vs エージェントの比較情報を更新するとき

**使わないケース:** UI/デザインの修正、既に正確に存在するエントリの再追加

## 情報ソースと優先順位

**公式ドキュメントが最優先。推測や AI の知識のみでの追加は禁止。**

設定ファイルの説明は不正確だとユーザーに誤解を与えるため、必ず公式ドキュメントで裏取りすること。

| ステップ | 内容 | ソース URL |
|---------|------|-----------|
| 1. 設定全般 | settings.json のキー、優先順位 | `https://code.claude.com/docs/en/settings` |
| 2. メモリ・CLAUDE.md | CLAUDE.md, rules/, auto memory | `https://code.claude.com/docs/en/memory` |
| 3. フック | hooks の種類・設定 | `https://code.claude.com/docs/en/hooks` |
| 4. MCP 設定 | MCP サーバー設定方法 | `https://code.claude.com/docs/en/mcp` |
| 5. スキル | skills の構造・フロントマター | `https://code.claude.com/docs/en/skills` |
| 6. エージェント | agents の構造・フロントマター | `https://code.claude.com/docs/en/sub-agents` |
| 7. 概要・全体像 | ディレクトリ全体の構成 | `https://code.claude.com/docs/en/overview` |
| 8. CHANGELOG | 新機能で追加された設定 | `https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md` |
| 9. 差分確認 | 既存データとの比較 | ローカルの `directory-structure.json` |

**CHANGELOG のみに記載の設定:** 公式ドキュメントに未掲載の場合は、確証が得られない限り `AskUserQuestion` でユーザーに確認する。

## directory-structure.json の構造

### 全体構造

```json
{
  "sections": [...],        // セクション配列（5つ: global, project-root, project-claude, home, managed）
  "precedence": [...],      // 設定の優先順位（5レベル）
  "commitGuide": {...},     // VCS コミットガイド
  "skillsVsAgents": {...}   // スキル vs エージェント比較
}
```

### セクション

```json
{
  "id": "global | project-root | project-claude | home | managed",
  "name": "表示名",
  "basePath": "ベースパス（例: ~/.claude/）",
  "description": "セクションの説明",
  "entries": [...],
  "bestPractices": ["ベストプラクティス1", "..."]
}
```

### エントリ（個別設定項目）

```json
{
  "path": "相対パス（例: settings.json）",
  "type": "file | directory",
  "name": "日本語の表示名",
  "description": "1行の説明",
  "detail": "詳細解説（改行は \\n\\n で段落分け）",
  "usage": "使用例・パターン",
  "bestPractice": "ベストプラクティス",
  "vcs": true | false | null,
  "recommended": "recommended | optional | advanced"
}
```

#### フィールドの意味

| フィールド | 説明 | 注意点 |
|-----------|------|--------|
| `path` | basePath からの相対パス | ディレクトリは末尾 `/` 付き |
| `type` | `file` または `directory` | |
| `name` | 日本語の表示名（短く） | |
| `description` | 1行の説明（20〜40文字目安） | |
| `detail` | 技術的背景含む詳細解説 | `\n\n` で段落分け。2〜3段落程度 |
| `usage` | 具体的な使用例 | 実際のコマンドや設定例を含む |
| `bestPractice` | ベストプラクティスの推奨事項 | |
| `vcs` | `true`=コミット推奨, `false`=ローカル専用, `null`=OS管理 | |
| `recommended` | `recommended`=ほぼ必須, `optional`=必要に応じて, `advanced`=上級者向け | |

### 優先順位（precedence）

```json
{ "level": 1, "name": "Managed", "description": "説明", "color": "red | orange | yellow | green | blue" }
```

### コミットガイド（commitGuide）

```json
{ "commit": ["コミットすべきもの"], "noCommit": ["コミットしないもの"] }
```

## セクション別の配置ルール

| エントリのパス | 配置先セクション ID |
|--------------|-------------------|
| `~/.claude/` 配下 | `global` |
| `<project>/` 直下 | `project-root` |
| `<project>/.claude/` 配下 | `project-claude` |
| `~/` 直下 | `home` |
| OS 固有パス | `managed` |

## 翻訳ルール

- 自然な日本語に翻訳する（直訳ではなく読みやすい表現）
- 技術用語・固有名詞はそのまま維持: OAuth, MCP, CLI, SDK, API, JSON, YAML, VCS, MDM, CLAUDE.md 等
- `detail` は2〜3段落で、何ができるか・設定例・他の設定との関係を記述

## 検証チェックリスト

1. **公式ドキュメントで裏取り** — 各エントリが公式ドキュメントに記載されているか
2. **セクション配置の正確性** — 正しいセクション ID に配置されているか
3. **vcs の正確性** — コミット推奨/ローカル専用/OS管理が正しいか
4. **recommended の妥当性** — 推奨レベルが適切か
5. **JSON 構文チェック** — `node -e "require('./app/data/directory/directory-structure.json')"`
6. **型チェック** — `pnpm run typecheck`
7. **commitGuide の整合性** — 新エントリが commit/noCommit に反映されているか

## Common Mistakes

| ミス | 対処 |
|------|------|
| 公式ドキュメントにない設定を追加 | 必ず公式ドキュメントで裏取り。不明な場合は `AskUserQuestion` で確認 |
| `detail` が短すぎる | 技術的背景・設定例・他の設定との関係を含めて2〜3段落にする |
| `detail` の段落分けに `\n` のみ使用 | `\n\n` で段落分けする（`\n` 1つだと改行にならない） |
| `vcs` を間違える | ローカル専用（gitignore 対象）は `false`、チーム共有は `true`、OS 管理は `null` |
| 新エントリ追加時に commitGuide を未更新 | `commit` / `noCommit` のどちらに該当するか判断して追加 |
| precedence の変更を見落とす | 設定の優先順位が変わった場合は precedence 配列も更新 |
| 同じ設定ファイルを複数セクションに配置してしまう | 同名ファイルが複数スコープにある場合（例: settings.json）は各セクションに正しく配置する。これはミスではなく正常 |
