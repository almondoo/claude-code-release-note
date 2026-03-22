# directory — 設定ガイド

## データファイル

`app/data/directory/directory-structure.json`

## 情報ソース

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

## データスキーマ

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

#### フィールド詳細

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

## ページ固有ルール

### セクション配置ルール

| エントリのパス | 配置先セクション ID |
|--------------|-------------------|
| `~/.claude/` 配下 | `global` |
| `<project>/` 直下 | `project-root` |
| `<project>/.claude/` 配下 | `project-claude` |
| `~/` 直下 | `home` |
| OS 固有パス | `managed` |

### 固有翻訳ルール

- `detail` は2〜3段落で、何ができるか・設定例・他の設定との関係を記述

### 固有検証項目

- `vcs` の正確性 — コミット推奨/ローカル専用/OS管理が正しいか
- `recommended` の妥当性 — 推奨レベルが適切か
- `commitGuide` の整合性 — 新エントリが `commit` / `noCommit` に反映されているか

## 使用条件・注意事項

### 使用条件

- 新しい設定ファイルやディレクトリが Claude Code に追加されたとき
- 既存エントリの説明・usage・bestPractice が変更されたとき
- 設定の優先順位（precedence）やコミットガイドが変更されたとき
- スキル vs エージェントの比較情報を更新するとき

### 使わないケース

- UI/デザインの修正
- 既に正確に存在するエントリの再追加

## Common Mistakes

| ミス | 対処 |
|------|------|
| `detail` が短すぎる | 技術的背景・設定例・他の設定との関係を含めて2〜3段落にする |
| `vcs` を間違える | ローカル専用（gitignore 対象）は `false`、チーム共有は `true`、OS 管理は `null` |
| 新エントリ追加時に commitGuide を未更新 | `commit` / `noCommit` のどちらに該当するか判断して追加 |
| precedence の変更を見落とす | 設定の優先順位が変わった場合は precedence 配列も更新 |
| 同じ設定ファイルを複数セクションに配置してしまう | 同名ファイルが複数スコープにある場合（例: settings.json）は各セクションに正しく配置する。これはミスではなく正常 |
