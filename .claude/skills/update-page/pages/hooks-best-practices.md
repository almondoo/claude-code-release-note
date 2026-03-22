# hooks-best-practices — Hooks

## データファイル

`app/data/hooks-best-practices/hooks-best-practices.json`

## 情報ソース

| ステップ | 内容 | ソース URL |
|---------|------|-----------|
| 1. Hooks リファレンス | Hooks の仕様・イベント・ハンドラタイプ | `https://code.claude.com/docs/en/hooks` |
| 2. Hooks ガイド | Hooks の実践的な使い方・ベストプラクティス | `https://code.claude.com/docs/en/hooks-guide` |
| 3. 差分確認 | 既存データとの比較 | ローカルの `hooks-best-practices.json` |

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
  "tips": ["ヒント1", "ヒント2"],
  "steps": [
    {
      "phase": "フェーズ名",
      "description": "説明",
      "example": "具体例"
    }
  ],
  "code": "JSON または シェルスクリプトのコード例（string型）"
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
| `tips` | オプショナル | string[] | 実践的なヒントのリスト |
| `steps` | オプショナル | object[] | フェーズごとの手順。`phase`, `description`, `example` を持つ |
| `code` | オプショナル | string | JSON 設定例やシェルスクリプトのコード例 |

**注意:** このページには `examples`（before/after）フィールドは存在しない。

## ページ固有ルール

### フックイベント名の正確性

公式 Docs と一致するイベント名を使用する。最新のイベント一覧は公式ドキュメント（`/en/hooks`）で確認すること。以下は参考用:

| イベント名 | タイミング | ブロッキング | マッチャー対象 |
|-----------|-----------|-------------|--------------|
| `SessionStart` | セッション開始/再開時 | No | startup, resume, clear, compact |
| `UserPromptSubmit` | ユーザーがプロンプト送信時 | Yes | なし |
| `PreToolUse` | ツール実行前 | Yes | ツール名 |
| `PermissionRequest` | パーミッションダイアログ表示時 | Yes | ツール名 |
| `PostToolUse` | ツール実行成功後 | No | ツール名 |
| `PostToolUseFailure` | ツール実行失敗後 | No | ツール名 |
| `Notification` | 通知送信時 | No | 通知タイプ |
| `SubagentStart` | サブエージェント起動時 | No | エージェントタイプ |
| `SubagentStop` | サブエージェント完了時 | Yes | エージェントタイプ |
| `Stop` | メインエージェント応答完了時 | Yes | なし |
| `StopFailure` | APIエラーでターン終了時 | No | エラータイプ |
| `TeammateIdle` | チームメンバーがアイドル状態時 | Yes | なし |
| `TaskCompleted` | タスク完了マーク時 | Yes | なし |
| `InstructionsLoaded` | CLAUDE.md等ロード時 | No | ロード理由 |
| `ConfigChange` | 設定変更時 | Yes | 設定ソース |
| `WorktreeCreate` | Worktree 作成時 | Yes | なし |
| `WorktreeRemove` | Worktree 削除時 | No | なし |
| `PreCompact` | コンテキスト圧縮前 | No | トリガー |
| `PostCompact` | 圧縮完了後 | No | トリガー |
| `Elicitation` | MCPサーバーがユーザー入力要求時 | Yes | MCPサーバー名 |
| `ElicitationResult` | ユーザーがエリシテーション応答時 | Yes | MCPサーバー名 |
| `SessionEnd` | セッション終了時 | No | 終了理由 |

### ハンドラタイプの正確性

4つのハンドラタイプを正しく区別する:

| タイプ | 説明 | 用途 |
|--------|------|------|
| `command` | シェルコマンド実行 | ファイル操作、フォーマット、バリデーション |
| `http` | HTTP エンドポイントへの POST | 外部サービス連携、監査 |
| `prompt` | Claude モデルへの単一ターン評価 | 判断が必要な条件評価 |
| `agent` | ツールアクセス付きサブエージェント | ファイル検査やテスト実行を伴う検証 |

### 固有翻訳ルール

- `content` は2〜3段落で、概念・ユースケース・設定方法を記述
- イベント名（`SessionStart` 等）やハンドラタイプ（`command` 等）はそのまま英語で記述
- `steps` の `phase` はイベント名やハンドラタイプをそのまま使用

## 使用条件・注意事項

### 使用条件

- フックの仕様（イベント、ハンドラタイプ等）が変更されたとき
- フック設計のベストプラクティスが追加・更新されたとき
- 新しいフックイベントが追加されたとき

### 使わないケース

- UI/デザインの修正
- 既に正確に存在するアイテムの再追加

## Common Mistakes

| ミス | 対処 |
|------|------|
| イベント名の誤記（例: `sessionStart` → `SessionStart`） | PascalCase で正確に記述。公式 Docs のイベント名と一致させる |
| ハンドラタイプの混同（例: `prompt` と `agent` の取り違え） | `prompt` は単一ターン評価、`agent` はツールアクセス付きサブエージェント |
| ブロッキング/ノンブロッキングの誤分類 | 上記イベント一覧表のブロッキング列を参照。公式ドキュメントで最新の分類を確認すること |
| `content` の段落を `\n` で区切る | `\n\n` を使用（ParagraphList の仕様） |
| 存在しない `code` や `examples` フィールドを追加 | このページでは `tips` と `steps` のみ使用 |
