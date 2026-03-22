# best-practices — ベストプラクティス

## データファイル

`app/data/best-practices/best-practices.json`

## 情報ソース

| ステップ | 内容 | ソース URL |
|---------|------|-----------|
| 1. 公式ベストプラクティス | Claude Code の使い方のベストプラクティス | `https://code.claude.com/docs/en/best-practices` |
| 2. よくあるワークフロー | デバッグ・テスト・PR 等の実践パターン | `https://code.claude.com/docs/en/common-workflows` |
| 3. 差分確認 | 既存データとの比較 | ローカルの `best-practices.json` |

## データスキーマ

### 全体構造

```json
{
  "sections": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "items": [...]
    }
  ]
}
```

### items[] の基本フィールド

```json
{
  "id": "string",
  "title": "string",
  "summary": "string",
  "content": "string",
  "tags": ["string"]
}
```

### items[] のオプショナルフィールド

```json
{
  "examples": [
    {
      "strategy": "string",
      "before": "string",
      "after": "string",
      "detail?": "string"
    }
  ],
  "tips": ["string"],
  "steps": [
    {
      "phase": "string",
      "description": "string",
      "example": "string"
    }
  ]
}
```

### フィールド詳細

| フィールド | 説明 | 注意点 |
|-----------|------|--------|
| `id` | アイテムの一意識別子 | セクション内で一意。ケバブケース |
| `title` | 日本語の見出し | |
| `summary` | 1〜2行の要約 | カード表示に使用 |
| `content` | 詳細解説 | `\n\n` で段落分け（ParagraphList 対応） |
| `tags` | 分類タグ | 例: `重要` |
| `examples` | before/after 形式の改善例（省略可） | `strategy` は改善の方針、`detail` は補足説明 |
| `tips` | 箇条書きの Tips（省略可） | 文字列配列 |
| `steps` | フェーズごとの手順（省略可） | `phase` はフェーズ名、`example` は具体的なプロンプト例 |

## ページ固有ルール

### before/after 例の翻訳

- `examples[].strategy` — 日本語で記述
- `examples[].before` — 日本語で記述（プロンプト例であっても日本語に翻訳）
- `examples[].after` — 日本語で記述（プロンプト例であっても日本語に翻訳）
- `examples[].detail` — 日本語で記述

### steps の翻訳

- `steps[].phase` — 日本語で記述
- `steps[].description` — 日本語で記述
- `steps[].example` — 英語のまま（実際のプロンプト入力例のため）

### tips の翻訳

- `tips[]` の各項目は日本語で記述
- 技術用語・コマンド名・ファイル名はそのまま英語で維持

### content の記述

- `content` は `\n\n` で段落分け
- 技術的背景・具体的な理由・ユーザーメリットを含める

## 使用条件・注意事項

### 使用条件

- 公式ベストプラクティスに新しい項目が追加されたとき
- 既存の推奨事項が変更・更新されたとき
- 新しい examples, tips, steps が追加されたとき

### 使わないケース

- UI/デザインの修正
- 既に正確に存在する項目の再追加
- ベストプラクティスに関係しない機能の説明

## Common Mistakes

| ミス | 対処 |
|------|------|
| `examples` の `before`/`after` が英語のまま | before/after は日本語に翻訳する。コード部分（変数名、コマンド等）は英語のまま可 |
| `steps[].example` を日本語に翻訳する | `example` は実際のプロンプト入力例のため英語のまま維持 |
| `content` を `\n` で区切る | `\n\n` を使用（ParagraphList の仕様） |
| 新セクション追加時に `id` が既存と重複 | 既存の sections[].id と items[].id を確認してから命名 |
| `summary` が長すぎる | 1〜2行で簡潔に。詳細は `content` に記述 |
| 公式ドキュメントにない独自の推奨を追加 | 公式ベストプラクティスの内容に基づいて記述する |
