# env-vars — 環境変数

## データファイル

`app/data/env-vars/env-vars.json`

## 情報ソース

| ステップ | 内容 | ソース URL |
|---------|------|-----------|
| 1. 公式ドキュメント | 環境変数の一覧・説明・デフォルト値 | `https://code.claude.com/docs/en/settings` (#environment-variables セクション) |
| 2. CHANGELOG で補完 | 新環境変数追加・変更・非推奨化の発見用 | `https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md` |
| 3. 差分確認 | 既存データとの比較 | ローカルの `env-vars.json` |

## データスキーマ

### 全体構造

```json
{
  "categories": [
    {
      "id": "カテゴリID（例: auth）",
      "name": "日本語カテゴリ名",
      "description": "カテゴリの説明",
      "vars": [...]
    }
  ]
}
```

### 環境変数エントリ

```json
{
  "name": "VARIABLE_NAME",
  "description": "1行の説明",
  "detail": "詳細解説（\\n\\n で段落分け）",
  "values": "取りうる値の説明",
  "default": null | "デフォルト値",
  "example": "export VARIABLE_NAME=value",
  "links": [
    { "label": "リンクラベル", "url": "https://..." }
  ],
  "deprecated": false | true
}
```

#### フィールド詳細

| フィールド | 説明 | 注意点 |
|-----------|------|--------|
| `name` | 環境変数名（大文字スネークケース） | 公式ドキュメントと完全一致させる |
| `description` | 1行の要約（20〜40文字目安） | |
| `detail` | 技術的背景含む詳細解説 | `\n\n` で段落分け。動作・影響範囲・他の変数との関係を記述 |
| `values` | 取りうる値の型や範囲 | 例: `true \| false`、`APIキー文字列`、`パス文字列` |
| `default` | デフォルト値 | 未設定時の値。デフォルトがない場合は `null` |
| `example` | `export` 形式の使用例 | 実際にシェルで実行できる形式 |
| `links` | 関連ドキュメントへのリンク配列 | 空配列 `[]` も可。URL は `https://code.claude.com/docs/en/` 形式 |
| `deprecated` | 非推奨フラグ | `true` = 非推奨。公式ドキュメントで確認してから設定 |

## ページ固有ルール

### deprecated フラグの正確性

- `deprecated: true` は公式ドキュメントで明示的に非推奨と記載されている場合のみ設定
- CHANGELOG で「removed」「deprecated」と記載されていても、公式ドキュメントで裏取りする
- 非推奨化された変数には `description` に「（非推奨）」を付記

### default 値の検証

- `default` は公式ドキュメントに記載されたデフォルト値と一致させる
- 暗黙のデフォルト（未設定時の動作）と明示的なデフォルト値を区別する
- デフォルト値がない場合は `null` を設定（空文字列 `""` ではない）

### カテゴリ分類

環境変数の機能に基づいて適切なカテゴリに配置する。新カテゴリが必要な場合は `id` を kebab-case で命名する。

| 判断基準 | カテゴリ |
|---------|---------|
| API キー・トークン・認証 | `auth` 系 |
| モデル・プロバイダ設定 | モデル・接続系 |
| 動作制御・フラグ | 動作設定系 |
| パス・ディレクトリ | パス・ストレージ系 |

### 固有翻訳ルール

- `values` は値の型・範囲を日本語で簡潔に記述（例: `APIキー文字列`、`true | false`、`パス文字列`）
- `example` の `export` コマンド部分は英語のまま
- `links[].label` は日本語で記述

## 使用条件・注意事項

### 使用条件

- 新しい環境変数が追加されたとき
- 既存環境変数の説明・デフォルト値が変更されたとき
- 環境変数が非推奨化されたとき

### 使わないケース

- UI/デザインの修正
- 既に正確に存在する環境変数の再追加
- 内部専用（ユーザーが設定しない）環境変数の追加

## Common Mistakes

| ミス | 対処 |
|------|------|
| `deprecated` を誤設定する | 公式ドキュメントで明示的に非推奨と記載されているか確認 |
| `default` 値が公式と不一致 | 公式ドキュメントのデフォルト値と照合。未設定時の動作とデフォルト値を区別 |
| 環境変数を誤ったカテゴリに配置 | 変数の機能（認証/モデル/動作制御/パス）に基づいて分類 |
| `default` を空文字列にする | デフォルトがない場合は `null` を使用 |
| `links` の URL が旧形式 | `https://code.claude.com/docs/en/` 形式に統一 |
| 非推奨変数の `description` に注記がない | `deprecated: true` の場合は description に「（非推奨）」を付記 |
