# Harness Engineering ページ設計仕様

## 概要

Claude Code のハーネスとコンテキストエンジニアリングを包括的にカバーする日本語リファレンスページを新規追加する。

- **パス**: `/harness-engineering`
- **タイトル**: ハーネスエンジニアリング
- **説明**: Claude Code のハーネスとコンテキストを最適化するための包括的リファレンス
- **アクセントカラー**: シアン (`#06b6d4`)
- **参考ページ**: `/best-practices`（同じ UI パターン）

## データ構造

### TypeScript インターフェース

```typescript
interface HETable {
  title: string;
  headers: string[];
  rows: string[][];
}

interface HEItem {
  id: string;
  title: string;
  summary: string; // SummaryCard の description に表示
  content: string; // \n\n で段落分割（モーダル本文）
  tags: string[];
  tables?: HETable[];
  code?: string;
  tips?: string[];
  gotchas?: string[]; // 警告アイコン付きリスト（フラット文字列）
  realWorld?: string[]; // フラット文字列。企業名等はテキスト内に含める
}

interface HESection {
  id: string;
  name: string;
  description: string;
  items: HEItem[];
}
```

best-practices の `BPItem` を参考に、ハーネスリファレンス向けに `tables`（構造化テーブル）、`gotchas`（既知の問題）、`realWorld`（実例）フィールドを追加。`subtitle` は削除し `summary` に統一（`SummaryCard` の `description` prop にマッピング）。

## 5タブ × 15セクション構成

### TAB_SECTION_MAP（タブ→セクションID マッピング）

`index.tsx` で `usePageState({ sections: SECTIONS, searchFields: ..., tabSectionMap: TAB_SECTION_MAP })` として渡す。タブIDがセクションIDと1:1ではないため必須（best-practices は1:1のため `tabSectionMap` 未使用だが、本ページでは必ず渡すこと）。

```typescript
const TAB_SECTION_MAP: Record<string, string[]> = {
  "config-files": ["claude-md", "rules", "memory", "environment"],
  "execution-control": ["hooks", "permissions", "mcp"],
  agents: ["subagents", "skills", "agent-teams"],
  context: ["context-window", "ci-cd", "git-worktree"],
  practices: ["patterns", "anti-patterns"],
};
```

### TAB_DEFS（静的タブ定義）

best-practices では `SECTIONS.map()` で動的生成しているが、本ページはタブとセクションが1:1ではないため静的に定義する。

```typescript
const TAB_DEFS = [
  { id: "all", label: "すべて", color: "#06b6d4" },
  { id: "config-files", label: "設定ファイル", color: PALETTE.orange.color },
  { id: "execution-control", label: "実行制御", color: PALETTE.red.color },
  { id: "agents", label: "エージェント", color: PALETTE.purple.color },
  { id: "context", label: "コンテキスト", color: PALETTE.cyan.color },
  { id: "practices", label: "実践ガイド", color: PALETTE.green.color },
];
```

### ITEM_SECTION_MAP

best-practices と同様に、アイテムID → 所属セクションのマップを `constants.tsx` で生成する。モーダルに `sectionName` と `accentColor` を渡すために必須。

```typescript
const ITEM_SECTION_MAP = new Map<string, { sectionId: string; sectionName: string }>();
for (const section of SECTIONS) {
  for (const item of section.items) {
    ITEM_SECTION_MAP.set(item.id, { sectionId: section.id, sectionName: section.name });
  }
}
```

### タブ1: 設定ファイル

| セクション | アイテム数 | 主な内容                                                 |
| ---------- | ---------- | -------------------------------------------------------- |
| CLAUDE.md  | 5          | 階層・@import・トークン予算・/init・excludes             |
| Rules      | 2          | Frontmatter・読み込み順序                                |
| メモリ     | 2          | 自動メモリ・MEMORY.md vs CLAUDE.md                       |
| 環境と設定 | 4          | ディレクトリ構造・settings.json・優先順位・.claudeignore |

### タブ2: 実行制御

| セクション     | アイテム数 | 主な内容                                                                         |
| -------------- | ---------- | -------------------------------------------------------------------------------- |
| Hooks          | 6          | イベント一覧・入力スキーマ・ハンドラ4タイプ・出力フォーマット・環境変数・Gotchas |
| パーミッション | 3          | 権限モード・評価順序・パターン構文                                               |
| MCP            | 3          | .mcp.json・Tool Search・最適化                                                   |

### タブ3: エージェント

| セクション       | アイテム数 | 主な内容                                                   |
| ---------------- | ---------- | ---------------------------------------------------------- |
| サブエージェント | 3          | Frontmatter・スコーピング・組み込み型                      |
| Skills           | 4          | SKILL.md・プログレッシブ開示・Commands統合・組み込みスキル |
| Agent Teams      | 2          | アーキテクチャ・使い分け                                   |

### タブ4: コンテキスト

| セクション             | アイテム数 | 主な内容                                                |
| ---------------------- | ---------- | ------------------------------------------------------- |
| コンテキストウィンドウ | 4          | モデル別サイズ・コンパクション・トークンコスト・40%戦略 |
| CI/CD                  | 3          | -p フラグ・GitHub Actions・コスト管理                   |
| Git Worktree           | 2          | 組み込みサポート・並列セッション                        |

### タブ5: 実践ガイド

| セクション     | アイテム数 | 主な内容                                                   |
| -------------- | ---------- | ---------------------------------------------------------- |
| 実践パターン   | 4          | Plan Mode・80/20 プランニング・TDD・大規模リファクタリング |
| アンチパターン | 4          | コンテキスト汚染・ツール過多・KVキャッシュ・フック設定ミス |

**合計: 15セクション、約50アイテム**

## ファイル構成

```
app/routes/harness-engineering/
├── index.tsx              # メインルート（best-practices/index.tsx を参考）
├── constants.tsx           # セクション色・アイコン・タブ定義・タグ色
└── detail-modal.tsx        # モーダル（tables, gotchas, realWorld 対応を追加）
# SummaryCard を直接使用（専用カードコンポーネントは不要）

app/data/harness-engineering/
├── config-files.json       # タブ1: CLAUDE.md, Rules, Memory, 環境
├── execution-control.json  # タブ2: Hooks, Permissions, MCP
├── agents.json             # タブ3: Subagents, Skills, Agent Teams
├── context.json            # タブ4: Context管理, CI/CD, Worktree
└── practices.json          # タブ5: パターン, アンチパターン
```

## モーダル表示

best-practices の `DetailModal` をベースに以下を追加:

- **テーブル描画**: `tables` フィールドのデータを `<table>` でレンダリング。Tailwind スタイル: `border-slate-700`, `text-sm`, 偶数行 `bg-slate-800/30`, ヘッダー `bg-slate-800 font-medium`, セル `px-3 py-2`
- **Gotchas セクション**: 警告アイコン付きリスト（`realWorld` と同様フラット `string[]`）
- **実例セクション**: `bg-slate-800/50 border-l-2 border-cyan-500 pl-4` スタイルのブロック引用

既存の `ParagraphList`、`CodeBlockView`、`TipsList` を再利用。

## ルーティング・ナビゲーション

- `app/routes.ts` に `/harness-engineering` ルート追加
- `app/components/page-header.tsx` の `ALL_PAGES` 配列に追加

## 既存ページとの差別化

- `/directory`: 「何がどこにあるか」→ このページは「なぜそう設計すべきか」
- `/best-practices`: 一般的なプラクティス → このページはハーネス最適化に特化
- `/env-vars`: 環境変数リスト → このページはコンテキスト予算管理の視点

## 制約

- JSON ファイルは各50KB以下を維持
- すべての説明文は日本語（コード構文・パス名は英語のまま）
- `content` フィールドは `\n\n` で段落分割
- アロー関数コンポーネントで統一
