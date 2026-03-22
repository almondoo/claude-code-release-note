# skill-best-practices — スキル設計

## データファイル

`app/data/skill-best-practices/skill-best-practices.json`

## 情報ソース

| ステップ | 内容 | ソース URL |
|---------|------|-----------|
| 1. 公式ドキュメント取得 | スキルの仕様・ベストプラクティス | `https://code.claude.com/docs/en/skills` |
| 2. 差分確認 | 既存データとの比較 | ローカルの `skill-best-practices.json` |

## データスキーマ

### 全体構造

```json
{
  "sections": [
    {
      "id": "section-id",
      "name": "セクション名",
      "description": "セクションの説明",
      "items": [...]
    }
  ]
}
```

### アイテム

```json
{
  "id": "item-id",
  "title": "日本語タイトル",
  "summary": "1〜2行の要約",
  "content": "詳細解説（\\n\\n で段落分け）",
  "tags": ["タグ"],
  "examples": [
    {
      "strategy": "戦略名",
      "detail": "補足説明（オプショナル）",
      "before": "悪い例",
      "after": "良い例"
    }
  ],
  "tips": ["ヒント1", "ヒント2"],
  "code": "マークダウンコードブロック文字列"
}
```

#### フィールド詳細

| フィールド | 必須 | 型 | 説明 |
|-----------|------|-----|------|
| `id` | 必須 | string | 一意識別子 |
| `title` | 必須 | string | 日本語タイトル |
| `summary` | 必須 | string | 1〜2行の要約 |
| `content` | 必須 | string | 詳細解説。`\n\n` で段落分け |
| `tags` | 必須 | string[] | タグ配列（空配列可） |
| `examples` | オプショナル | array | before/after 形式の比較例 |
| `tips` | オプショナル | string[] | 実践的なヒントのリスト |
| `code` | オプショナル | **string** | マークダウンコードブロック文字列。prompting の配列オブジェクト形式とは異なる |

**注意:** `code` フィールドは string 型（マークダウンコードブロック文字列）であり、prompting の配列オブジェクト形式 `[{ lang, label, value }]` とは異なる。

## ページ固有ルール

### スキル仕様の正確性

- フロントマターのフィールド名はハイフン区切りに統一: `user-invocable`, `disable-model-invocation`, `argument-hint` 等（アンダースコアではない）
- サポートされるフロントマターフィールド: `name`, `description`, `user-invocable`, `disable-model-invocation`, `argument-hint`, `allowed-tools`, `model`, `context`, `agent`, `hooks`
- スキルのディレクトリ構成は `.claude/skills/<skill-name>/SKILL.md` が必須（フラットファイルではない）
- 公式 Docs の仕様と一致しない記述があれば修正する

### 固有翻訳ルール

- `content` は2〜3段落で、設計原則・具体例・適用時の注意点を記述
- コード例内のファイルパス・フロントマターキー名はそのまま英語で記述
- `code` フィールド内のコメントは日本語に翻訳

## 使用条件・注意事項

### 使用条件

- スキルの仕様（フロントマター、ディレクトリ構成等）が変更されたとき
- スキル設計のベストプラクティスが追加・更新されたとき

### 使わないケース

- UI/デザインの修正
- 既に正確に存在するアイテムの再追加

## Common Mistakes

| ミス | 対処 |
|------|------|
| フロントマターのフィールド名をアンダースコアで記述 | ハイフン区切りに統一（`user-invocable`、`disable-model-invocation` 等） |
| `code` を配列オブジェクト形式で記述 | skill-best-practices では string 型（マークダウンコードブロック文字列）を使用 |
| スキルのディレクトリ構成を間違える | `.claude/skills/<skill-name>/SKILL.md` が正しい構成 |
| `content` の段落を `\n` で区切る | `\n\n` を使用（ParagraphList の仕様） |
| 公式 Docs に存在しないフロントマターフィールドを追加 | サポートされるフィールドのみ記述 |
