# プロンプトベストプラクティス ページ設計

## 概要

Claude の最新モデル（Claude Opus 4.6, Sonnet 4.6, Haiku 4.5）向けのプロンプトエンジニアリング技法を日本語で閲覧できるページを新規作成する。

公式ドキュメント「Prompting best practices」の内容を、サイト既存の skill-best-practices ページと同じスタイル（セクション見出し付きカードグリッド + モーダル詳細）で構築する。

## ルーティング

- **パス**: `/prompting`
- **ルート定義**: `app/routes.ts` に追加
- **ナビゲーション**: `app/components/page-header.tsx` の `ALL_PAGES` に追加

## ページ情報

- **タイトル**: プロンプト ベストプラクティス
- **説明**: Claude の最新モデルにおけるプロンプトエンジニアリングの包括的ガイド。明確さ、例示、XMLタグ、thinking、エージェントシステムなどを網羅。
- **ヘッダーグラデーション**: 青系（他ページと差別化）

## タブ構成（5タブ + 全て）

| タブID | ラベル | セクション | 項目数 |
|--------|--------|-----------|--------|
| all | すべて | — | 29 |
| foundations | 基礎 | 一般原則 | 7 |
| output | 出力 | 出力とフォーマット | 5 |
| tools-thinking | ツール・思考 | ツール使用 + 思考と推論 | 4 |
| agentic | エージェント | エージェントシステム | 9 |
| tips-migration | Tips・移行 | 機能別Tips + マイグレーション | 4 |

## セクションと項目一覧

### セクション1: 一般原則 (foundations)

| ID | タイトル | 概要 |
|----|---------|------|
| clear-direct | 明確で直接的な指示 | 具体的な出力形式を指定し、順序が重要な場合は番号付きリストを使う |
| add-context | コンテキストで性能を向上 | 指示の動機や背景を説明することで、Claude の理解と応答品質が向上 |
| use-examples | 効果的な例示（few-shot） | 関連性・多様性・構造化された例を3〜5個提供する |
| xml-tags | XMLタグで構造化 | 指示・コンテキスト・入力を個別のタグで囲み、誤解を防ぐ |
| give-role | ロール設定 | システムプロンプトでロールを設定し、振る舞いとトーンを集中させる |
| long-context | 長文コンテキスト | 長文データはプロンプト上部に配置、XMLタグで構造化、引用で根拠を示す |
| model-identity | モデルの自己認識 | モデル名やモデル文字列を正しく識別させるプロンプト |

### セクション2: 出力とフォーマット (output-formatting)

| ID | タイトル | 概要 |
|----|---------|------|
| communication-style | コミュニケーションスタイル | 最新モデルはより簡潔で自然。要約が必要なら明示的に指示 |
| format-control | レスポンス形式制御 | 否定形でなく肯定形で指示。XMLタグやプロンプトスタイルの一致で制御 |
| latex-output | LaTeX出力 | Opus 4.6 はデフォルトで LaTeX 出力。プレーンテキスト希望時は明示指示 |
| document-creation | ドキュメント作成 | プレゼンやアニメーション文書に優れる。デザイン要素を明示的にリクエスト |
| prefill-migration | prefill からの移行 | 4.6 以降は最終アシスタントターンの prefill が非対応。代替手段の案内 |

### セクション3: ツール使用 (tool-use)

| ID | タイトル | 概要 |
|----|---------|------|
| tool-usage | ツール使用の指示 | 「提案して」ではなく「変更して」と明示的に指示。プロアクティブ/慎重の制御 |
| parallel-tools | 並列ツール呼び出し | 依存関係のないツール呼び出しを並列化。指示で積極度を調整可能 |

### セクション4: 思考と推論 (thinking)

| ID | タイトル | 概要 |
|----|---------|------|
| overthinking | 過剰思考の制御 | Opus 4.6 は過剰に探索する場合あり。指示の調整か effort 設定で制御 |
| thinking-capabilities | thinking 機能の活用 | adaptive thinking、interleaved thinking、手動 CoT の使い分けガイド |

### セクション5: エージェントシステム (agentic)

| ID | タイトル | 概要 |
|----|---------|------|
| long-horizon | 長期推論と状態追跡 | コンテキスト認識、マルチウィンドウワークフロー、状態管理のベストプラクティス |
| autonomy-safety | 自律性と安全性のバランス | 不可逆な操作の前に確認を求める指示パターン |
| research | リサーチと情報収集 | 成功基準の明確化、ソース検証、構造化リサーチのアプローチ |
| subagent | サブエージェント制御 | ネイティブなサブエージェント機能の活用と過剰使用の抑制 |
| prompt-chaining | プロンプトチェーン | 自己修正パターン（生成→レビュー→改善）の実装 |
| reduce-files | ファイル作成の抑制 | 一時ファイルの作成を許可しつつ、後始末を指示 |
| overeagerness | 過剰対応の抑制 | オーバーエンジニアリング防止の具体的な指示パターン |
| test-focus | テスト偏重の防止 | テストケースだけでなく汎用解を実装させる指示 |
| hallucination | ハルシネーション削減 | コードを確認してから回答させる指示パターン |

### セクション6: 機能別Tips (capability-tips)

| ID | タイトル | 概要 |
|----|---------|------|
| vision | ビジョン機能 | 画像処理・データ抽出の改善。クロップツールで性能向上 |
| frontend-design | フロントエンドデザイン | AI slop を避け、タイポグラフィ・色・モーションにこだわる指示 |

### セクション7: マイグレーション (migration)

| ID | タイトル | 概要 |
|----|---------|------|
| migration-4-6 | Claude 4.6 への移行 | 6つの移行ポイント: 明確な指示、修飾子、thinking設定、prefill廃止等 |
| sonnet-migration | Sonnet 4.5→4.6 移行 | effort パラメータ、extended thinking、adaptive thinking の設定ガイド |

## データ構造

### 型定義

```typescript
interface PromptExample {
  strategy: string;      // 比較のタイトル
  detail?: string;       // 補足説明
  before: string;        // 非効率な例
  after: string;         // 改善例
}

interface PromptCode {
  lang: string;          // "text", "python", "xml" 等
  label: string;         // コードブロックのラベル
  value: string;         // コード内容
}

interface PromptItem {
  id: string;
  title: string;
  summary: string;       // カード上の概要テキスト（1-2文）
  content: string;       // モーダル本文（\n\n区切り）
  tags: string[];        // フィルタ・表示用タグ
  examples?: PromptExample[];   // Before/After比較
  tips?: string[];               // ポイントリスト
  code?: PromptCode[];           // プロンプト例・コード例（複数対応）
}

interface PromptSection {
  id: string;
  name: string;
  description: string;
  items: PromptItem[];
}
```

### タグ体系

| タグ | 色 | 用途 |
|------|-----|------|
| 基礎 | red | 基本テクニック |
| 出力 | blue | フォーマット制御 |
| ツール | cyan | ツール使用 |
| 思考 | purple | thinking系 |
| エージェント | orange | エージェントシステム |
| 移行 | teal | マイグレーション |
| ビジョン | green | 画像系 |
| デザイン | indigo | フロントエンド |

## ファイル構成

```
app/data/prompting/
  prompting.json          # 全セクションデータ（7セクション、29項目）
  index.ts                # エクスポート

app/routes/prompting/
  index.tsx               # メインページコンポーネント
  constants.tsx           # 型定義・定数・マッピング
  item-card.tsx           # カードコンポーネント
  detail-modal.tsx        # モーダルコンポーネント
```

## コンポーネント設計

### index.tsx（メインページ）

skill-best-practices/index.tsx と同一構造:
- `usePageState` でタブ・検索・モーダル状態管理
- `PageHeader` → `TabBar` → `SearchInput` → セクション別 `ItemGrid` → `EmptyState` → `Footer`
- セクション見出し（アイコン + セクション名 + 件数）付き
- `AnimatePresence` でモーダル表示

### item-card.tsx（カード）

skill-best-practices/item-card.tsx と同一構造:
- `BaseCard` ラッパー（h-[200px]）
- タイトル + summary + セクションバッジ + タグバッジ

### detail-modal.tsx（モーダル）

skill-best-practices/detail-modal.tsx をベースに拡張:
- `DetailModalShell` ラッパー（maxWidth="700px"）
- ヘッダー: タイトル + summary + `HeaderTags`
- 本文: `ParagraphList`（content）
- Before/After比較: examples 配列をテーブル表示
- ポイントリスト: tips 配列をブレット表示
- コード例: code 配列を `CodeBlockView` で表示（複数対応）

### constants.tsx（定数）

- `SECTIONS`, `TOTAL_ITEMS` — データ読み込み
- `SECTION_COLORS` — 7セクションの色定義
- `SECTION_ICONS` — 7セクションのアイコン定義
- `TAG_COLORS` — 8タグの色定義
- `TAB_DEFS` — 5タブ定義（グループタブ: セクションをタブにマッピング）
- `ITEM_SECTION_MAP` — アイテム→セクション逆引き
- `TAB_SECTION_MAP` — タブ→セクションID配列のマッピング

### タブのフィルタリング

skill-best-practices は1セクション=1タブだが、本ページは1タブ=複数セクション。
`usePageState` の `sections` パラメータにタブ選択時のフィルタリングロジックを追加:

```typescript
// constants.tsx
export const TAB_SECTION_MAP: Record<string, string[]> = {
  foundations: ["general-principles"],
  output: ["output-formatting"],
  "tools-thinking": ["tool-use", "thinking"],
  agentic: ["agentic"],
  "tips-migration": ["capability-tips", "migration"],
};

// index.tsx 内
// activeTab に応じて sections をフィルタしてから usePageState に渡す
```

## usePageState の拡張

### 問題

現在の `usePageState` は `s.id === activeTab` でフィルタリングしており、1タブ=1セクションの前提。
本ページは1タブ=複数セクション（例: "tools-thinking" タブ → "tool-use" + "thinking" セクション）を必要とする。

### 解決策

`usePageState` に optional な `tabSectionMap` パラメータを追加:

```typescript
interface UsePageStateOptions<T> {
  sections: Section<T>[];
  searchFields: (item: T) => string[];
  tabSectionMap?: Record<string, string[]>;  // 追加
}
```

フィルタリングロジックを変更:

```typescript
const target = isAllTab
  ? sections
  : tabSectionMap && tabSectionMap[activeTab]
    ? sections.filter((s) => tabSectionMap[activeTab].includes(s.id))
    : sections.filter((s) => s.id === activeTab);
```

既存ページには影響なし（`tabSectionMap` 未指定時は従来通り）。

## ナビゲーション

`ALL_PAGES` 配列のインデックス 7（「ベストプラクティス」の直後）に追加:
```typescript
{ to: "/prompting", label: "プロンプト" }
```

## セクションIDの明確化

JSON データ内のセクション `id` フィールドとタブ `id` は別物:

| セクション名 | セクションID（JSON） | 所属タブID |
|-------------|---------------------|-----------|
| 一般原則 | `general-principles` | `foundations` |
| 出力とフォーマット | `output-formatting` | `output` |
| ツール使用 | `tool-use` | `tools-thinking` |
| 思考と推論 | `thinking` | `tools-thinking` |
| エージェントシステム | `agentic` | `agentic` |
| 機能別Tips | `capability-tips` | `tips-migration` |
| マイグレーション | `migration` | `tips-migration` |

## 設計判断の補足

- **`code` フィールド**: skill-best-practices の `string` 型ではなく、setup ページと同じ `CodeBlock[]`（配列）パターンを採用。プロンプト例が複数あるアイテムが多いため。`CodeBlockView` コンポーネントを使用してレンダリング。
- **`steps` フィールド**: skill-best-practices にある `{ phase, description, example }[]` は本ページでは不要のため除外。
- **番号バッジ**: `SECTION_INDEX_MAP` は不要（セットアップページのような番号付きバッジは使わない）。

## 翻訳方針

- 説明文・概要はすべて日本語
- コード構文（Python, XML, JSON）はそのまま英語
- API パラメータ名（`thinking`, `effort`, `budget_tokens` 等）はそのまま英語
- 公式用語（adaptive thinking, extended thinking, few-shot 等）は原語のまま使用
- プロンプト例（Sample prompt）内の英文はそのまま英語で記載（実際に使うプロンプトのため）
