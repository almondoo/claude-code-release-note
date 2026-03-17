# リファクタリング: コードベース共通化設計

## 概要

プロジェクト全体で重複しているパターンを共通コンポーネント・フック・ユーティリティに集約し、保守性と一貫性を向上させる。

**アプローチ**: ボトムアップ（依存関係の下流から段階的に共通化）

## スコープ外

以下は各ページ固有のため共通化しない:
- **llm-infra-guide**: 独自のカラー・レイアウト・データ構造を持つガイドページ。他ページとパターンが共通しない
- **hands-on-topic**: ステップベースのレンダラーで他ページのカード/モーダルパターンと異なる
- **setup**: タイムラインベースの独自 UI。ただしカラー定義は PALETTE を参照可能
- **version-detail**: アコーディオン型カード（detail-card.tsx）は BaseCard の対象外

## ステップ 1: カラー/テーマ集約

### 課題

複数の constants.tsx ファイルに同一のカラー値（`#3B82F6`, `#6EE7B7`, `#C4B5FD` 等）と `{ color: string; bg: string }` 形式の定義が散在。同じ SVG アイコンも複数ファイルにコピペされている。

### 解決策

**新規ファイル**: `app/theme/colors.ts`

PALETTE には **3ファイル以上で実際に使われている色のみ** を収録する。ページ固有の色（llm-infra-guide の数十色、commands の `#FCD34D` 等）はそのまま各 constants.tsx に残す。

```ts
// 3ファイル以上で共通して使われるカラー値のみ
export const PALETTE = {
  green:  { color: "#6EE7B7", bg: "rgba(16,185,129,0.15)" },
  blue:   { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  purple: { color: "#C4B5FD", bg: "rgba(139,92,246,0.15)" },
  cyan:   { color: "#67E8F9", bg: "rgba(34,211,238,0.15)" },
  orange: { color: "#FDBA74", bg: "rgba(251,146,60,0.15)" },
  red:    { color: "#FCA5A5", bg: "rgba(239,68,68,0.15)" },
  teal:   { color: "#5EEAD4", bg: "rgba(20,184,166,0.15)" },
  yellow: { color: "#FDE68A", bg: "rgba(234,179,8,0.15)" },
  pink:   { color: "#F9A8D4", bg: "rgba(244,114,182,0.15)" },
  slate:  { color: "#94A3B8", bg: "rgba(100,116,139,0.15)" },
} as const;

export type PaletteKey = keyof typeof PALETTE;
export type ColorPair = { color: string; bg: string };
```

**変更対象**: 共通カラーを使っている constants.tsx のみ `PALETTE` 参照に置換。ページ固有の色はそのまま。

**アイコン統合**: constants.tsx にコピペされている SVG アイコン（歯車、リンク、チェックマーク等）を `app/components/icons.tsx` に移動。

### 影響ファイル

- best-practices/constants.tsx
- commands/constants.tsx
- customization/constants.tsx
- directory/constants.tsx
- env-vars/constants.tsx
- hands-on/constants.tsx
- plugins/constants.tsx
- setup/constants.tsx
- token-usage/constants.tsx

### スコープ外

- llm-infra-guide/constants.tsx（独自カラーが多く PALETTE 化のメリットが薄い）
- release-note/constants.tsx（badge.tsx から TAG_COLORS をインポート済み）

## ステップ 2: BaseCard コンポーネント

### 課題

10個のカードコンポーネントで以下が完全コピペ:
- コンテナ div（`role="button"`, `tabIndex={0}`, hover-card クラス）
- アクセントトップボーダー（グラデーション 3px 線）
- キーボードイベントハンドラ（Enter/Space）

ただし height, padding, gap, gradient opacity にバリエーションがある。

### 解決策

**新規ファイル**: `app/components/base-card.tsx`

`className` と `style` の両方を受け取り、各カードの差異を吸収する:

```tsx
interface BaseCardProps {
  accentColor: string;
  onClick: () => void;
  className?: string;       // h-[200px], px-5 py-[18px] 等の差異を吸収
  style?: React.CSSProperties;  // padding 等インラインスタイルの差異を吸収
  gradientOpacity?: string; // デフォルト "40"、version-card は "60"
  children: React.ReactNode;
}

export function BaseCard({
  accentColor, onClick, className, style, gradientOpacity = "40", children,
}: BaseCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); }
      }}
      className={`hover-card bg-surface rounded-xl border border-slate-700 flex flex-col cursor-pointer relative overflow-hidden ${className ?? ""}`}
      style={{ "--accent": accentColor, ...style } as React.CSSProperties}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}${gradientOpacity})` }}
      />
      {children}
    </div>
  );
}
```

**注意**: `gap` は className（`gap-2.5` 等）で各カードが指定。BaseCard は gap を含めない。

### 影響ファイル

- best-practices/item-card.tsx
- commands/command-card.tsx, cli-card.tsx, shortcut-card.tsx
- customization/customization-card.tsx
- directory/entry-card.tsx
- env-vars/env-card.tsx
- plugins/plugin-card.tsx
- release-note/version-card.tsx
- token-usage/item-card.tsx

### スコープ外

- hands-on/topic-card.tsx（`<Link>` ベースで role="button" パターンと異なる）
- version-detail/detail-card.tsx（アコーディオン型で click-to-modal ではない）

## ステップ 3: DetailModal 統合

### 課題

- `release-note/detail-modal.tsx` が `DetailModalShell` を使わず完全自前実装（~110行の重複）
- ヘッダー構造（タイトル+説明+タグ）が 7 ファイルで ~85% 同一
- `content.split("\n\n").map()` が 4 ファイルのモーダルで完全一致（best-practices, directory, env-vars, token-usage）
- `ModalSection` が directory と env-vars でコピペ
- 「アイコン+ラベル」ヘッダーが 3+ ファイルでコピペ

### 解決策

#### 3a. release-note/detail-modal.tsx を DetailModalShell ベースにリファクタ

自前の overlay + motion.div + 閉じボタンを削除し、`DetailModalShell` を使用。~50行削減。ステップ 3b/3c とは独立して実施可能。

#### 3b. 共通サブコンポーネント抽出

**`app/components/modal-section.tsx`**:

```tsx
export function ModalSection({ label, accentColor, children }: {
  label: string; accentColor: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-[12px] font-bold tracking-wide uppercase font-mono"
           style={{ color: accentColor }}>
        {label}
      </div>
      {children}
    </div>
  );
}
```

**`app/components/section-heading.tsx`**:

```tsx
export function SectionHeading({ icon, label, color }: {
  icon: React.ReactNode; label: string; color: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] font-bold tracking-wide uppercase font-mono"
         style={{ color }}>
      {icon}{label}
    </div>
  );
}
```

**`app/components/paragraph-list.tsx`**:

`renderText` prop で `renderInlineLinks` 等のカスタムレンダリングに対応:

```tsx
export function ParagraphList({ content, className, renderText }: {
  content: string;
  className?: string;
  renderText?: (paragraph: string) => React.ReactNode;
}) {
  return (
    <>
      {content.split("\n\n").map((p, i) => (
        <p key={i} className={className ?? "m-0 text-[14px] leading-[1.8] text-slate-300 font-sans"}>
          {renderText ? renderText(p) : p}
        </p>
      ))}
    </>
  );
}
```

#### 3c. ヘッダータグレンダリング共通化

**`app/components/header-tags.tsx`**:

```tsx
interface HeaderTagsProps {
  sectionName?: string;
  accentColor?: string;
  tags?: string[];
  tagColors: Record<string, { color: string; bg: string }>;
}

export function HeaderTags({ sectionName, accentColor, tags, tagColors }: HeaderTagsProps) {
  return (
    <div className="flex gap-1.5 mt-2 flex-wrap">
      {sectionName && accentColor && (
        <span className="text-[11px] font-semibold rounded"
              style={{ padding: "2px 8px", background: accentColor + "18", color: accentColor }}>
          {sectionName}
        </span>
      )}
      {tags?.map(tag => (
        <span key={tag} className="text-[11px] font-semibold rounded"
              style={{
                padding: "2px 8px",
                background: tagColors[tag]?.bg ?? "rgba(100,116,139,0.15)",
                color: tagColors[tag]?.color ?? "#94A3B8",
              }}>
          {tag}
        </span>
      ))}
    </div>
  );
}
```

### 影響ファイル

- release-note/detail-modal.tsx（自前実装 → DetailModalShell 化）
- best-practices/detail-modal.tsx
- commands/detail-modal.tsx
- customization/detail-modal.tsx
- directory/detail-modal.tsx
- env-vars/detail-modal.tsx
- plugins/detail-modal.tsx
- token-usage/detail-modal.tsx

## ステップ 4: usePageState フック + ItemGrid コンポーネント

### 課題

複数の index.tsx で以下が重複:
- useState のセット（query, activeTab, modalItem）
- useMemo のフィルタ/検索ロジック
- useCallback の handleTabChange, openModal, closeModal
- AnimatePresence + motion.div のカードグリッドアニメーション

### スコープ

`usePageState` が適用可能なのは「セクション → アイテム」の単純構造を持つページのみ:

| ページ | 適用可否 | 理由 |
|--------|---------|------|
| best-practices | 可 | セクション→アイテム構造 |
| token-usage | 可 | best-practices と同一構造 |
| plugins | 可 | カテゴリ→プラグイン構造 |
| directory | 可 | セクション→エントリ構造 |
| env-vars | 可 | カテゴリ→変数構造（vars を items に正規化） |
| commands | **不可** | 3種のデータ構造（スラッシュ/CLI/ショートカット）が混在 |
| customization | **一部** | タブ + ガイドモードの独自 UI あり |
| release-note | **不可** | バージョン構造が異なる |

**ItemGrid** は構造に依存しないため、全ページで使用可能。

### 解決策

#### 4a. `app/hooks/usePageState.ts`

```tsx
interface UsePageStateOptions<T> {
  sections: { id: string; items: T[] }[];
  searchFields: (item: T) => string[];
}

interface UsePageStateReturn<T> {
  query: string;
  setQuery: (q: string) => void;
  activeTab: string;
  handleTabChange: (id: string) => void;
  filteredItems: T[];
  modalItem: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export function usePageState<T>(options: UsePageStateOptions<T>): UsePageStateReturn<T> {
  // query, activeTab, modalItem の useState
  // handleTabChange, openModal, closeModal の useCallback
  // filteredItems の useMemo（searchFields ベースの検索）
}
```

**適用対象**: best-practices, token-usage, plugins, directory, env-vars（5ページ）

#### 4b. `app/components/item-grid.tsx`

```tsx
interface ItemGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  reducedMotion: boolean;
  hasMounted: boolean;
}

export function ItemGrid<T>(props: ItemGridProps<T>) {
  // grid + AnimatePresence + motion.div のレンダリング
  // reducedMotion/hasMounted に基づくアニメーション制御
}
```

**適用対象**: usePageState の5ページ + commands, customization（7ページ）

### 影響ファイル

- best-practices/index.tsx
- token-usage/index.tsx
- plugins/index.tsx
- directory/index.tsx
- env-vars/index.tsx
- commands/index.tsx（ItemGrid のみ）
- customization/index.tsx（ItemGrid のみ）

## ステップ 5: ユーティリティ共通化

### 5a. matchesQuery

**`app/utils/search.ts`**:

```ts
export function matchesQuery(fields: (string | undefined)[], lowerQuery: string): boolean {
  return fields.some(f => f?.toLowerCase().includes(lowerQuery));
}
```

commands/constants.tsx と customization/constants.tsx のコピペ定義を置換。

### 5b. renderInlineLinks

**`app/utils/render-inline-links.tsx`**:

version-detail/detail-card.tsx, setup/step-card.tsx, customization/guided-reader.tsx で同一実装の `renderInlineLinks` を共通ユーティリティとして抽出。

## 新規ファイル一覧

| ファイル | 目的 |
|---------|------|
| `app/theme/colors.ts` | 共通カラーパレット（3ファイル以上で使われる色のみ） |
| `app/components/base-card.tsx` | カード共通コンテナ（style/className/gradientOpacity 対応） |
| `app/components/modal-section.tsx` | モーダルセクション wrapper |
| `app/components/section-heading.tsx` | アイコン+ラベルヘッダー |
| `app/components/paragraph-list.tsx` | 段落分割レンダリング（renderText 対応） |
| `app/components/header-tags.tsx` | タグバッジレンダリング |
| `app/hooks/usePageState.ts` | ページ状態管理フック（5ページ適用） |
| `app/components/item-grid.tsx` | アニメーション付きカードグリッド（7ページ適用） |
| `app/utils/search.ts` | 検索ユーティリティ |
| `app/utils/render-inline-links.tsx` | インラインリンクレンダリング |

## 見積もり

| ステップ | 変更ファイル数 | 削減行数目安 |
|---------|-------------|-----------|
| 1. カラー/テーマ集約 | ~10 | ~100行 |
| 2. BaseCard | ~10 | ~200行 |
| 3. DetailModal統合 | ~8 | ~250行 |
| 4. usePageState + ItemGrid | ~7 | ~350行 |
| 5. ユーティリティ | ~5 | ~50行 |
| **合計** | **~30ファイル** | **~950行削減** |

## 実行方法

- **エージェントチーム（`/agent-teams`）で並列実行する**。独立性の高いステップを複数エージェントで同時に進める
- **git 操作（コミット・ブランチ作成等）はすべてのステップ完了後にまとめて行う**。各ステップ完了時点ではコミットせず、最後に一括でコミットする

## 制約

- テストフレームワークは未導入のため、各ステップ後に `pnpm run typecheck` で型チェックし、ブラウザで動作確認する
- 各ページ固有のロジック（commands の3タブ、release-note のバージョン構造等）は共通化せず残す
- ステップ 3a（release-note DetailModal）はステップ 3b/3c と独立して実施可能
