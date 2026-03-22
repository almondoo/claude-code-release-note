# commands ページ設定

## データファイル

| ファイル | 内容 |
|---------|------|
| `app/data/commands/commands-categories.json` | スラッシュコマンド（カテゴリ別） |
| `app/data/commands/commands-cli.json` | CLI コマンド・フラグ |
| `app/data/commands/commands-shortcuts.json` | キーボードショートカット |

これらは `app/routes/commands/constants.tsx` で個別にインポートされる。

## 情報ソース

| ステップ | 内容 | ソース |
|---------|------|--------|
| 1. コマンドリファレンス | ビルトインコマンドの一覧・説明（最も権威的） | `https://code.claude.com/docs/en/commands` |
| 2. 公式ドキュメント補完 | ショートカット・入力モード詳細 | `https://code.claude.com/docs/en/interactive-mode` |
| | CLI コマンド・フラグ | `https://code.claude.com/docs/en/cli-reference` |
| 3. CHANGELOG で補完 | 公式に未掲載の新コマンド発見用 | `https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md` |
| 4. 差分確認 | 各 JSON ファイルと公式リストを比較 | ローカル |

**CHANGELOG のみに記載のコマンド:** 公式ドキュメントに未掲載かつ CHANGELOG にのみ記載のコマンドは、バグ修正・機能追加として実際に言及されている場合のみ追加候補とする。確証が得られない場合は `AskUserQuestion` でユーザーに確認する。

## データスキーマ

### commands-categories.json（スラッシュコマンド）

```json
{
  "categories": [
    {
      "id": "essential",
      "name": "基本コマンド",
      "description": "カテゴリの説明",
      "commands": [
        { "name": "/cmd", "description": "1行説明", "args": "引数 or null", "detail": "詳細解説", "whenToUse": "使用シーン" }
      ]
    }
  ]
}
```

### commands-cli.json（CLI コマンド・フラグ）

```json
{
  "cli": {
    "commands": [
      { "name": "claude", "description": "1行説明", "args": "引数 or null", "detail": "詳細解説", "whenToUse": "使用シーン" }
    ],
    "flags": [
      { "name": "--flag", "description": "1行説明", "args": "引数 or null", "detail": "詳細解説", "whenToUse": "使用シーン" }
    ]
  }
}
```

### commands-shortcuts.json（ショートカット）

```json
{
  "shortcuts": [
    { "key": "Ctrl + X", "description": "1行説明", "detail": "詳細解説", "whenToUse": "使用シーン" }
  ]
}
```

## ページ固有ルール

### 分類ルール

| 種別 | 判定基準 | 配置先 |
|------|---------|--------|
| スラッシュコマンド | `/name` で対話セッション内から実行 | `commands-categories.json` の `categories[].commands` |
| CLI コマンド | `claude name` でシェルから実行 | `commands-cli.json` の `cli.commands` |
| CLI フラグ | `claude --flag` でシェルから実行 | `commands-cli.json` の `cli.flags` |
| ショートカット | キーボードショートカット | `commands-shortcuts.json` の `shortcuts` |
| スキル | CHANGELOG で「skill」と明記 | `commands-categories.json`（説明にスキルと明記） |

**よくある混同:**
- `claude auth login` → CLI サブコマンド（`commands-cli.json`）。`/auth` ではない
- `/commit-push-pr` → ビルトインスキル。説明に明記する

### カテゴリ一覧

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

### 削除・リネームルール

- **削除:** 公式ドキュメントから削除されたコマンドは該当 JSON からも削除する
- **リネーム:** 旧エントリを削除し、新名称で追加する
- **非推奨化:** 公式に deprecated と記載されている場合、description に「（非推奨）」を付記

### SECTION_COLORS / SECTION_ICONS 更新ルール

新カテゴリ追加時は `app/routes/commands/constants.tsx` の `SECTION_COLORS` と `SECTION_ICONS` にも追加が必要。

### 固有翻訳ルール

- ショートカットの説明は公式ドキュメントの Description 列を忠実に翻訳する

## 使用条件・注意事項

- 新しい Claude Code のコマンドやショートカットが追加されたとき
- 既存コマンドの説明や動作が変更されたとき
- コマンドが削除・リネームされたとき

**使わないケース:** UI/デザインの修正、既に正確に存在するコマンドの再追加

## Common Mistakes

| ミス | 対処 |
|------|------|
| CLI サブコマンドをスラッシュコマンドに分類 | `claude auth` は CLI、`/auth` ではない |
| ショートカットの動作説明が不正確 | 公式ドキュメントの Description 列を翻訳 |
| 新カテゴリ追加時に constants.tsx を更新し忘れ | `SECTION_COLORS` と `SECTION_ICONS` にも追加 |
| 間違ったファイルに追加 | スラッシュコマンド→categories、CLI→cli、ショートカット→shortcuts |
