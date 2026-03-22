# setup — セットアップガイド

## メタデータ

| 項目 | 値 |
|------|-----|
| ページ種別 | 構造型 |
| アイテム数目安 | 9セクション、各セクション2〜8ステップ |
| WebFetch 欠落リスク | 中 |

### 高リスクフィールド

- `code[].value`: インストールコマンド。OS やパッケージマネージャによって異なるため、WebFetch で一部が省略されやすい
- `callouts`: 警告・注意事項。WebFetch の要約で省略されやすい

## データファイル

`app/data/setup/` 配下の9ファイル。`app/data/setup/index.ts` で `SECTIONS` 配列として結合・エクスポート。

| ファイル | 内容 |
|---------|------|
| `setup-intro.json` | 導入・概要 |
| `setup-installation.json` | インストール手順 |
| `setup-authentication.json` | 認証・ログイン |
| `setup-first-steps.json` | 最初のステップ |
| `setup-claude-md.json` | CLAUDE.md の設定 |
| `setup-ide.json` | IDE 連携 |
| `setup-tips.json` | 便利な使い方・Tips |
| `setup-permissions.json` | パーミッション設定 |
| `setup-troubleshooting.json` | トラブルシューティング |

## 情報ソース

| ステップ | 内容 | ソース URL |
|---------|------|-----------|
| 1. セットアップガイド | インストール・アップデート・アンインストール手順 | `https://code.claude.com/docs/en/setup` |
| 2. 概要 | インストール方法の概要・各環境の始め方 | `https://code.claude.com/docs/en/overview` |
| 3. 設定詳細 | settings.json、パーミッション等 | `https://code.claude.com/docs/en/settings` |
| 4. 差分確認 | 既存データとの比較 | ローカルの `app/data/setup/setup-*.json` |

## データスキーマ

全9ファイル共通構造:

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "phase": "number",
  "order": "number",
  "steps": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "content": "string",
      "tags": ["string"],
      "code": [
        {
          "lang": "string",
          "label": "string",
          "value": "string",
          "recommended?": "boolean"
        }
      ],
      "callouts": [
        {
          "type": "warning | important | tip",
          "text": "string"
        }
      ]
    }
  ]
}
```

### フィールド詳細

| フィールド | 説明 | 注意点 |
|-----------|------|--------|
| `id` | セクション/ステップの一意識別子 | ケバブケースで命名 |
| `name` | セクションの日本語表示名 | |
| `description` | セクションの1行説明 | |
| `phase` | フェーズ番号（1〜） | セクション間の大きなグループ分け |
| `order` | セクション内の表示順序 | 同一フェーズ内の並び順 |
| `steps[].content` | ステップの詳細解説 | `\n\n` で段落分け（ParagraphList 対応） |
| `steps[].tags` | ステップの分類タグ | 例: `必須`, `初心者向け` |
| `steps[].code` | コードブロック配列 | `lang` は `bash`, `powershell`, `cmd` 等 |
| `steps[].code[].recommended` | 推奨コマンドかどうか（省略可） | `true` の場合 UI で強調表示 |
| `steps[].callouts` | 注意・Tips 表示（省略可） | `type` は `warning`, `important`, `tip` のいずれか |

## ページ固有ルール

### ステップ順序の論理的整合性

- 各セクション内の `steps` は、ユーザーが上から順に実行する前提で並べる
- 前のステップの結果に依存するステップは、必ず後に配置する（例: インストール → バージョン確認）

### フェーズ構成

- `phase` はセットアップの大きな段階を表す（例: phase 1 = インストール、phase 2 = 設定）
- `order` は同一フェーズ内の表示順序。フェーズをまたいで order が重複しても問題ない
- 新セクション追加時は既存の phase/order 体系と整合性を保つ

### コードブロックルール

- 1つのステップに複数の代替コマンドがある場合、`code` 配列に全てを列挙する
- 推奨コマンドには `"recommended": true` を付与する
- `lang` はシンタックスハイライト用。`bash`, `powershell`, `cmd`, `json` 等
- `label` はコードブロックの見出し（日本語）

### callout ルール

- `warning`: 破壊的操作や非推奨事項の警告
- `important`: 必ず知っておくべき前提条件
- `tip`: 便利な情報・推奨事項

## 使用条件・注意事項

### 使用条件

- インストール手順が変更されたとき（新しいインストール方法の追加、既存方法の廃止等）
- 認証フローや設定手順が変更されたとき
- 新しいセットアップ関連の機能が追加されたとき（新しい IDE 連携、パーミッション設定等）
- トラブルシューティング項目の追加・更新時

### 使わないケース

- UI/デザインの修正
- 既に正確に存在する手順の再追加
- セットアップに関係しない機能の説明

## Common Mistakes

| ミス | 対処 |
|------|------|
| ステップ順序が論理的に矛盾 | 前提条件を満たすステップが先に来るよう並べる（例: インストール前にバージョン確認を配置しない） |
| 古い手順が残存 | 公式ドキュメントで廃止・変更された手順は更新または削除する |
| `content` を `\n` で区切る | `\n\n` を使用（ParagraphList の仕様） |
| phase/order の不整合 | 新セクション追加時に既存の番号体系を確認し、重複や飛びがないようにする |
| callout の type を間違える | `warning`=破壊的/非推奨、`important`=前提条件、`tip`=便利情報 |
| コードブロックの `lang` が不正確 | シェルコマンドは `bash`、PowerShell は `powershell`、CMD は `cmd` を指定 |
