---
paths:
  - "app/data/**/*.json"
---
<!-- generated-by: sync-rules, last-synced: 2026-03-20 -->

# データファイル

<!-- sync-rules:begin:language -->
## 言語ルール

- **JSON データ内の説明文・例示・コードブロックのコメントはすべて日本語で記述する**
  - Rationale: サイトは日本語閲覧用であり、表示されるテキストの言語を統一する
- **コード構文（Python, bash 等）やファイル名・パス名はそのまま英語で記述する**
  - Rationale: コード識別子は英語のまま保持し、可読性を維持する

### Examples

```json
// Good: 説明文は日本語、コード部分は英語
{
  "t": "Claude Code が `~/.claude/settings.json` の設定を自動的に読み込むようになりました",
  "tags": ["新機能"]
}

// Bad: 説明文が英語
{
  "t": "Claude Code now automatically loads settings from ~/.claude/settings.json",
  "tags": ["新機能"]
}
```
<!-- sync-rules:end:language -->

<!-- sync-rules:begin:paragraph-splitting -->
## 段落分割

- **content フィールド内のリストや手順は `\n\n` で区切って1項目1段落にする**
  - Rationale: `ParagraphList` コンポーネントが `\n\n` で段落分割するため、`\n` 単体では改行されない

### Examples

```json
// Good: \n\n で段落を分割
{
  "content": "1. pnpm install を実行する\n\n2. 設定ファイルを編集する\n\n3. サーバーを起動する"
}

// Bad: \n で区切り（HTML の <p> 内で空白扱いになり改行されない）
{
  "content": "1. pnpm install を実行する\n2. 設定ファイルを編集する\n3. サーバーを起動する"
}
```
<!-- sync-rules:end:paragraph-splitting -->

<!-- sync-rules:begin:file-size -->
## ファイルサイズ

- **JSON ファイルは 50KB 以下を維持する**
  - Rationale: ファイルの管理性とレビューのしやすさを保つ
- **リリースデータはバージョン範囲ごとに10刻みで分割する**
  - Rationale: `releases-2.1.0x.json`（v2.1.0〜2.1.9）のように分割し、1ファイルあたりのサイズを抑える

### Examples

```
// Good: 10刻みで分割
app/data/releases/
  ├── releases-2.1.0x.json   (v2.1.0〜2.1.9)
  ├── releases-2.1.1x.json   (v2.1.10〜2.1.19)
  └── releases-2.1.2x.json   (v2.1.20〜2.1.29)

// Bad: 全バージョンを1ファイルに
app/data/releases/
  └── all-releases.json       (100KB超)
```
<!-- sync-rules:end:file-size -->

<!-- sync-rules:begin:release-tags -->
## リリースデータのタグ体系

**注意: このルールは `releases-*.json` と `version-details-*.json` のみに適用される**

- **一覧データ（releases-*.json）と詳細データ（version-details-*.json）は同じタグ体系を使用する**
  - Rationale: フィルタリング機能の一貫性を保つ
- **タグは2軸構造（全12種類）を使用する**
  - 変更タイプ (4種): `新機能`, `バグ修正`, `改善`, `非推奨`
  - 対象領域 (8種): `SDK`, `IDE`, `Platform`, `Security`, `Perf`, `Plugin`, `MCP`, `Agent`
  - Rationale: タグの定義は `app/components/badge.tsx` と `app/routes/release-note/constants.tsx` で管理されている

### Examples

```json
// Good: 2軸タグを適切に付与（releases-*.json）
{
  "v": "2.1.80",
  "items": [
    { "t": "MCP サーバーの接続安定性が向上", "tags": ["改善", "MCP"] },
    { "t": "IDE 拡張で設定が保存されない問題を修正", "tags": ["バグ修正", "IDE"] }
  ]
}

// Bad: 定義外のタグを使用
{
  "v": "2.1.80",
  "items": [
    { "t": "MCP サーバーの接続安定性が向上", "tags": ["enhancement"] },
    { "t": "IDE 拡張で設定が保存されない問題を修正", "tags": ["fix", "ide"] }
  ]
}
```
<!-- sync-rules:end:release-tags -->
