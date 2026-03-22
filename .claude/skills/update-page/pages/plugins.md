# plugins — 公式プラグイン

## データファイル

`app/data/plugins/plugins.json`

## 情報ソース

| ステップ | 内容 | ソース URL |
|---------|------|-----------|
| 1. プラグイン作成ガイド | プラグインの仕組み・構造 | `https://code.claude.com/docs/en/plugins` |
| 2. プラグイン利用ガイド | インストール・管理方法、公式プラグイン一覧 | `https://code.claude.com/docs/en/discover-plugins` |
| 3. CHANGELOG で補完 | 新プラグイン追加・変更の発見用 | `https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md` |
| 4. 差分確認 | 既存データとの比較 | ローカルの `plugins.json` |

## データスキーマ

### 全体構造

```json
{
  "categories": [
    {
      "id": "カテゴリID（例: code-intelligence）",
      "name": "日本語カテゴリ名",
      "description": "カテゴリの説明",
      "plugins": [...]
    }
  ]
}
```

### プラグインエントリ

```json
{
  "name": "プラグイン名（例: typescript-lsp）",
  "displayName": "表示名（例: TypeScript）",
  "description": "1行の説明",
  "binary": "実行バイナリ名（例: typescript-language-server）",
  "install": "/plugin install <name>@claude-plugins-official",
  "detail": "詳細解説（\\n\\n で段落分け）",
  "whenToUse": "使用シーン・推奨場面",
  "setup": "セットアップ手順（バイナリのインストール方法）"
}
```

#### フィールド詳細

| フィールド | 説明 | 注意点 |
|-----------|------|--------|
| `name` | プラグインの識別名 | install コマンドの `<name>` 部分と一致させる |
| `displayName` | UI に表示される短い名前 | 言語名やツール名（日本語/英語どちらでも可） |
| `description` | 1行の要約（20〜40文字目安） | |
| `binary` | システムに必要な実行バイナリ名 | `which <binary>` で確認できる名前。公式ドキュメントで正確性を検証すること |
| `install` | インストールコマンド | 必ず `/plugin install <name>@claude-plugins-official` 形式 |
| `detail` | 技術的背景含む詳細解説 | `\n\n` で段落分け。対応ファイル拡張子・提供機能を記述 |
| `whenToUse` | どのような場面で使うべきか | プロジェクト種別やユースケースを具体的に |
| `setup` | バイナリのインストール手順 | npm/pip/brew 等の具体的なコマンドを含める |

## ページ固有ルール

### install コマンド形式

すべてのプラグインの `install` フィールドは以下の形式に統一する:

```
/plugin install <name>@claude-plugins-official
```

- `<name>` は `name` フィールドと完全一致させる
- サードパーティプラグインの場合はスコープが異なるため、公式ドキュメントで正確な形式を確認する

### binary の正確性確認

- `binary` はプラグインが内部で起動するバイナリ名（`which` で見つかる名前）
- 公式ドキュメントまたはプラグインのソースで確認し、推測で記載しない
- 例: TypeScript → `typescript-language-server`（`tsc` ではない）、Python → `pyright-langserver`（`pyright` ではない）

### カテゴリ分類

新プラグイン追加時は既存カテゴリへの配置を優先する。新カテゴリが必要な場合は `id` を kebab-case で命名する。

### 固有翻訳ルール

- `detail` は対応ファイル拡張子・提供機能・技術的背景を含めて記述
- `setup` のコマンド部分は英語のまま、説明文は日本語で記述

## 使用条件・注意事項

### 使用条件

- 新しい公式プラグインが追加されたとき
- 既存プラグインの説明・setup 手順・binary が変更されたとき
- プラグインが削除・非推奨化されたとき

### 使わないケース

- UI/デザインの修正
- 既に正確に存在するプラグインの再追加
- サードパーティプラグインの追加（公式プラグインのみ対象）

## Common Mistakes

| ミス | 対処 |
|------|------|
| `binary` 名を間違える | 公式ドキュメントで確認。`pyright` と `pyright-langserver` は異なる |
| install コマンド形式が不統一 | 必ず `/plugin install <name>@claude-plugins-official` 形式に統一 |
| `name` と install コマンドの `<name>` が不一致 | 両者を完全一致させる |
| `detail` に対応ファイル拡張子が未記載 | LSP プラグインでは対応する拡張子を明記する |
| 新プラグインを誤ったカテゴリに配置 | プラグインの機能に基づいて適切なカテゴリを選択 |
