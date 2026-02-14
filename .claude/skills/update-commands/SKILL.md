---
name: update-commands
description: Use when updating the commands list page with new or changed Claude Code slash commands, CLI flags, or keyboard shortcuts. Also use when the user mentions "コマンド追加", "コマンド更新", "update commands", or "add new commands".
---

# コマンド一覧更新スキル

## Overview

Claude Code のスラッシュコマンド・CLI フラグ・キーボードショートカットの情報を、公式ドキュメントと CHANGELOG を照合して `commands.json` に追加・更新するスキル。

**データファイル:** `app/data/commands/commands.json`

## When to Use

- 新しい Claude Code のコマンドやショートカットが追加されたとき
- 既存コマンドの説明や動作が変更されたとき
- コマンドが削除・リネームされたとき

**使わないケース:** UI/デザインの修正、既に正確に存在するコマンドの再追加

## 情報ソースと優先順位

**公式ドキュメントが最優先。CHANGELOG は補助的に使用する。**

AI による CHANGELOG の要約は不正確な場合がある（存在しないコマンドの捏造、説明の誤りなど）。必ず公式ドキュメントで裏取りすること。

| ステップ | 内容 | ソース |
|---------|------|--------|
| 1. 公式ドキュメント取得 | スラッシュコマンド・ショートカット | `https://code.claude.com/docs/en/interactive-mode` |
| | CLI コマンド・フラグ | `https://code.claude.com/docs/en/cli-reference` |
| 2. CHANGELOG で補完 | 公式に未掲載の新コマンド発見用 | `https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md` |
| 3. 差分確認 | `commands.json` と公式リストを比較 | ローカル |

**CHANGELOG のみに記載のコマンド:** 公式ドキュメントに未掲載かつ CHANGELOG にのみ記載のコマンドは、バグ修正・機能追加として実際に言及されている場合のみ追加候補とする。確証が得られない場合は `AskUserQuestion` でユーザーに確認する。

## commands.json の構造

```
{
  "categories": [{ "id": "...", "name": "...", "commands": [...] }],
  "cli": { "commands": [...], "flags": [...] },
  "shortcuts": [...]
}
```

カテゴリ色・アイコンの定義: `app/routes/commands/constants.tsx` の `CATEGORY_COLORS` と `CATEGORY_ICONS`。新カテゴリ追加時はここにも追加が必要。

## コマンドの分類ルール

| 種別 | 判定基準 | 配置先 |
|------|---------|--------|
| スラッシュコマンド | `/name` で対話セッション内から実行 | `categories[].commands` |
| CLI コマンド | `claude name` でシェルから実行 | `cli.commands` |
| CLI フラグ | `claude --flag` でシェルから実行 | `cli.flags` |
| ショートカット | キーボードショートカット | `shortcuts` |
| スキル | CHANGELOG で「skill」と明記 | `categories[].commands`（説明にスキルと明記） |

**よくある混同:**
- `claude auth login` → CLI サブコマンド（`cli.commands`）。`/auth` ではない
- `/commit-push-pr` → ビルトインスキル。説明に明記する

## カテゴリ一覧

| ID | 名前 | 例 |
|----|------|-----|
| `essential` | 基本コマンド | /help, /clear, /compact, /cost |
| `session` | セッション管理 | /resume, /rename, /rewind, /tag |
| `config` | 設定 | /config, /model, /theme, /fast |
| `memory` | メモリ・プロジェクト | /memory, /todos |
| `integration` | 連携・統合 | /mcp, /ide, /plugin |
| `agent` | エージェント・自動化 | /agents, /plan, /skills, /tasks |
| `utility` | ユーティリティ | /doctor, /debug, /copy, /feedback |
| `account` | アカウント | /login, /usage, /desktop |
| `terminal` | ターミナル・リモート | /terminal-setup, /teleport |

## JSON フォーマット

### コマンド / フラグ
```json
{ "name": "/cmd", "description": "1行説明", "args": "引数 or null", "detail": "詳細解説", "whenToUse": "使用シーン" }
```

### ショートカット
```json
{ "key": "Ctrl + X", "description": "1行説明", "detail": "詳細解説", "whenToUse": "使用シーン" }
```

## コマンドの削除・リネーム

- **削除:** 公式ドキュメントから削除されたコマンドは `commands.json` からも削除する
- **リネーム:** 旧エントリを削除し、新名称で追加する
- **非推奨化:** 公式に deprecated と記載されている場合、description に「（非推奨）」を付記

## 翻訳ルール

- 自然な日本語に翻訳する（直訳ではなく読みやすい表現）
- 技術用語・固有名詞はそのまま維持: OAuth, MCP, CLI, SDK, API, PR, vim, bash, tmux 等
- ショートカットの説明は公式ドキュメントの Description 列を忠実に翻訳する

## 検証チェックリスト

1. **公式ドキュメントで裏取り** — 各コマンドが公式ドキュメントまたは CHANGELOG に記載されているか
2. **分類の正確性** — スラッシュコマンド / CLI サブコマンド / スキルを正しく区別
3. **説明の正確性** — 公式ドキュメントの説明と齟齬がないか
4. **JSON 構文チェック** — `node -e "require('./app/data/commands/commands.json')"`
5. **型チェック** — `pnpm run typecheck`

## Common Mistakes

| ミス | 対処 |
|------|------|
| CHANGELOG の AI 要約を鵜呑み | 必ず公式ドキュメントで裏取りする |
| CLI サブコマンドをスラッシュコマンドに分類 | `claude auth` は CLI、`/auth` ではない |
| ショートカットの動作説明が不正確 | 公式ドキュメントの Description 列を翻訳 |
| 新カテゴリ追加時に constants.tsx を更新し忘れ | `CATEGORY_COLORS` と `CATEGORY_ICONS` にも追加 |
