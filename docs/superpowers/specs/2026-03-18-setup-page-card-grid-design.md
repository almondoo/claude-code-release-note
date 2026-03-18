# Setup ページ カードグリッド化デザイン

## 概要

Setup ページ (`/setup`) のレイアウトを、タイムライン + アコーディオン形式から、best-practices ページと同じカテゴリ別カードグリッド形式に変更する。セクションヘッダーに番号バッジを付与して順序感を維持する。

## 決定事項

- レイアウト: タブ + カードグリッド（best-practices と同じパターン）
- セクションヘッダー: 番号バッジ付き（`1. インストール`, `2. 初期設定`, ...）
- QuickStartPanel / SummaryPanel: 廃止
- モーダル: best-practices の DetailModal をベースに code ブロックと callouts セクションを追加
- JSON データ構造: 変更なし（既存のまま活用）

## 現状

### ページ構造

- `app/routes/setup/index.tsx` — メインページ（タイムライン + アコーディオン）
- `app/routes/setup/constants.tsx` — 型定義、セクション色、タグ色
- `app/routes/setup/step-card.tsx` — アコーディオン展開カード
- `app/routes/setup/quick-start-panel.tsx` — クイックスタート 4 ステップ
- `app/routes/setup/summary-panel.tsx` — 主要設定一覧
- `app/routes/setup/timeline-sidebar.tsx` — 左サイドバータイムライン
- `app/routes/setup/mobile-timeline-marker.tsx` — モバイル用マーカー
- `app/routes/setup/section-icons.tsx` — セクションアイコン SVG

### データ構造

12 セクション × 各 N ステップ。各ステップの型:

```typescript
interface Step {
  id: string;
  title: string;
  description: string; // カード上の summary に使う
  content: string; // モーダルの本文
  code: CodeBlock[]; // モーダルのコードブロック
  callouts: Callout[]; // モーダルの注意書き
  tags: string[];
}
```

## 変更内容

### 削除するファイル

- `app/routes/setup/step-card.tsx`
- `app/routes/setup/quick-start-panel.tsx`
- `app/routes/setup/summary-panel.tsx`
- `app/routes/setup/timeline-sidebar.tsx`
- `app/routes/setup/mobile-timeline-marker.tsx`

### 新規作成するファイル

#### `app/routes/setup/item-card.tsx`

best-practices の `item-card.tsx` と同様のカードコンポーネント。

- `BaseCard` コンポーネントを使用
- `step.title`, `step.description` を表示
- セクション名バッジ + タグバッジを下部に表示
- クリックでモーダルを開く

#### `app/routes/setup/detail-modal.tsx`

best-practices の `detail-modal.tsx` をベースに、以下を追加:

- `DetailModalShell` を使用
- ヘッダー: アイコン、タイトル、description、タグ
- 本文: `content` のパラグラフ表示（`ParagraphList`）
- コードブロック: `step.code` を `CodeBlockView` で表示
- コールアウト: `step.callouts` を `CalloutBox` で表示

### 変更するファイル

#### `app/routes/setup/constants.tsx`

- `Step` 型、`SetupSection` 型は維持（データの互換性のため）
- `TOTAL_STEPS` を `TOTAL_ITEMS` にリネーム（best-practices と統一）
- `TAB_DEFS` を動的生成で追加:

```typescript
export const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  ...SECTIONS.map((s, i) => ({
    id: s.id,
    label: `${i + 1}. ${s.name}`,
    color: SECTION_COLORS[s.id]?.color || "#3B82F6",
  })),
];
```

- `ITEM_SECTION_MAP` を追加: step.id → { sectionName, sectionId } のマップ（best-practices と同じパターン）
- `SECTION_INDEX_MAP` を追加: section.id → 元のインデックス番号のマップ（番号バッジ描画用）

#### `app/routes/setup/index.tsx`

best-practices の `index.tsx` と同じ構造に書き換え:

- `usePageState` フック導入。`steps` → `items` の変換はコールサイトで行う:

```typescript
usePageState({
  sections: SECTIONS.map((s) => ({ id: s.id, name: s.name, items: s.steps })),
  searchFields: (item) => [
    item.title,
    item.description,
    item.content,
    ...item.code.map((c) => c.value),
    ...item.callouts.map((c) => c.text),
    ...item.tags,
  ],
});
```

- `TabBar` コンポーネント導入（番号付きタブ）
- `ItemGrid` でカードを描画
- `DetailModal` をモーダル表示
- セクションヘッダーに番号バッジを追加（`SECTION_INDEX_MAP` を使って元の順番を維持）
- `TimelineSidebar`, `MobileTimelineMarker`, `StepCard`, `QuickStartPanel`, `SummaryPanel` のインポートを削除
- フッターは `<Footer />` のみ（カスタムリンクなし、best-practices と統一）

#### `app/routes/setup/section-icons.tsx`

変更なし。既存のアイコンをそのまま使用。

### セクションヘッダーの番号バッジ

`SECTION_INDEX_MAP` で元のセクション順番号を取得し描画:

```tsx
const sectionIndex = SECTION_INDEX_MAP[section.id]; // 0-based
<div style={{
  width: 24, height: 24, borderRadius: '50%',
  background: colors.bg, border: `2px solid ${colors.color}`,
  color: colors.color, fontSize: 11, fontWeight: 'bold',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}}>
  {sectionIndex + 1}
</div>
<h2>{section.name}</h2>
<span>{section.items.length} 件</span>
```

「すべて」タブ選択時は全セクションが番号付きで表示される。個別タブ選択時はそのセクションのみ表示（番号は元の順番を維持）。

### データ互換性

既存の JSON データ（`app/data/setup/*.json`）は変更しない。`Step` 型の `description` フィールドがカードの summary として機能し、`content`, `code`, `callouts` はモーダルで表示する。`usePageState` が期待する `items` プロパティは `index.tsx` のコールサイトで `s.steps` → `items` にマッピングして提供する（型変換やエイリアスは不要）。

### 意図的な削除

- `section.description`（セクションヘッダー横の説明文）: 削除。best-practices パターンでは表示していないため統一。
- フッターのカスタムリンク（公式ドキュメント、GitHub）: 削除。共通 `<Footer />` に統一。

## 使用する共通コンポーネント

- `~/components/base-card` — カードの外枠
- `~/components/detail-modal` — モーダルシェル（`DetailModalShell`）
- `~/components/header-tags` — モーダルヘッダーのタグ表示
- `~/components/paragraph-list` — content のパラグラフ表示
- `~/components/code-block-view` — コードブロック表示
- `~/components/callout-box` — コールアウト表示
- `~/components/item-grid` — カードグリッドレイアウト
- `~/components/tab-bar` — タブバー
- `~/components/search-input` — 検索入力
- `~/components/empty-state` — 検索結果なし
- `~/components/page-header` — ページヘッダー
- `~/components/footer` — フッター
- `~/hooks/usePageState` — タブ・検索・モーダル状態管理
