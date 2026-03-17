# コードベース共通化リファクタリング 実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** プロジェクト全体の重複パターンを共通コンポーネント・フック・ユーティリティに集約し、約950行を削減する

**Architecture:** ボトムアップで5ステップ実施。1. カラーパレット集約 → 2. BaseCard → 3. DetailModal統合 → 4. usePageState + ItemGrid → 5. ユーティリティ。エージェントチームで並列実行し、git 操作は全ステップ完了後にまとめて行う。

**Tech Stack:** React Router v7 (SSR), TypeScript, motion/react (Framer Motion), Tailwind CSS + インラインスタイル

**Spec:** `docs/superpowers/specs/2026-03-17-refactoring-commonization-design.md`

---

## ファイル構成

### 新規作成ファイル
| ファイル | 責務 |
|---------|------|
| `app/theme/colors.ts` | 共通カラーパレット定義 |
| `app/components/base-card.tsx` | カード共通コンテナ |
| `app/components/modal-section.tsx` | モーダル内セクション wrapper |
| `app/components/section-heading.tsx` | アイコン+ラベル見出し |
| `app/components/paragraph-list.tsx` | 段落分割レンダリング |
| `app/components/header-tags.tsx` | タグバッジレンダリング |
| `app/hooks/usePageState.ts` | ページ状態管理フック |
| `app/components/item-grid.tsx` | アニメーション付きカードグリッド |
| `app/utils/search.ts` | 検索ユーティリティ |
| `app/utils/render-inline-links.tsx` | インラインリンクレンダリング |

### 変更ファイル（ステップ順）
- **ステップ1**: 9 constants.tsx + icons.tsx
- **ステップ2**: 10 カードコンポーネント
- **ステップ3**: 8 detail-modal.tsx
- **ステップ4**: 7 index.tsx
- **ステップ5**: 5ファイル（constants.tsx × 2, guided-reader, step-card, detail-card）

---

## Task 1: カラーパレット集約

**Files:**
- Create: `app/theme/colors.ts`
- Modify: `app/routes/best-practices/constants.tsx`
- Modify: `app/routes/commands/constants.tsx`
- Modify: `app/routes/customization/constants.tsx`
- Modify: `app/routes/directory/constants.tsx`
- Modify: `app/routes/env-vars/constants.tsx`
- Modify: `app/routes/hands-on/constants.tsx`
- Modify: `app/routes/plugins/constants.tsx`
- Modify: `app/routes/setup/constants.tsx`
- Modify: `app/routes/token-usage/constants.tsx`

- [ ] **Step 1: `app/theme/colors.ts` を作成**

```ts
export const PALETTE = {
  green: { color: "#6EE7B7", bg: "rgba(16,185,129,0.15)" },
  blue: { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  blueDark: { color: "#3B82F6", bg: "rgba(59,130,246,0.25)" },
  purple: { color: "#C4B5FD", bg: "rgba(139,92,246,0.15)" },
  cyan: { color: "#67E8F9", bg: "rgba(6,182,212,0.15)" },
  orange: { color: "#FDBA74", bg: "rgba(249,115,22,0.15)" },
  red: { color: "#FCA5A5", bg: "rgba(239,68,68,0.15)" },
  teal: { color: "#5EEAD4", bg: "rgba(20,184,166,0.15)" },
  yellow: { color: "#FDE68A", bg: "rgba(234,179,8,0.15)" },
  pink: { color: "#F9A8D4", bg: "rgba(244,114,182,0.15)" },
  pinkBright: { color: "#F472B6", bg: "rgba(244,114,182,0.15)" },
  slate: { color: "#94A3B8", bg: "rgba(100,116,139,0.15)" },
  indigo: { color: "#A5B4FC", bg: "rgba(99,102,241,0.15)" },
} as const;

export type ColorPair = { readonly color: string; readonly bg: string };
export type PaletteKey = keyof typeof PALETTE;
```

- [ ] **Step 2: 各 constants.tsx の SECTION_COLORS / CATEGORY_COLORS / TAG_COLORS で、PALETTE に存在する色を参照に置換**

各ファイルで `import { PALETTE } from "~/theme/colors";` を追加し、一致するカラー値を `PALETTE.xxx` に置き換える。ページ固有の色（`#FCD34D`, `#93C5FD`, `#86EFAC` 等）はそのまま残す。

**例: `app/routes/plugins/constants.tsx`**
```ts
// Before
export const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  "code-intelligence": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "dev-tools": { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  // ...
};

// After
import { PALETTE } from "~/theme/colors";
export const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  "code-intelligence": PALETTE.cyan,
  "dev-tools": PALETTE.purple,
  "code-review-git": PALETTE.green,
  "external-integrations": PALETTE.teal,
  "output-styles": PALETTE.orange,
  "community": PALETTE.pinkBright,
};
```

同様のパターンで残り8ファイルも変換する。

- [ ] **Step 3: 重複 SVG アイコンを `app/components/icons.tsx` に移動**

constants.tsx の `SECTION_ICONS` / `CATEGORY_ICONS` / `TOPIC_ICONS` 等のオブジェクト内にインラインで定義されている SVG が、複数ファイルでコピペされている。これらを `icons.tsx` に名前付きエクスポート関数として抽出し、元のインライン定義をインポートに置き換える。

抽出対象（SVGの内容で同一性を確認すること）:
- **チーム/人物アイコン**（`M17 21v-2a4 4 0 0 0-4-4H5...` のパス）: hands-on/constants.tsx, plugins/constants.tsx, token-usage/constants.tsx の `TOPIC_ICONS`/`CATEGORY_ICONS`/`SECTION_ICONS` 内に存在 → `TeamIcon` として抽出
- **チェック+ドキュメントアイコン**（`M9 11l3 3L22 4` のパス）: hands-on/constants.tsx, plugins/constants.tsx 内に存在 → `CheckDocIcon` として抽出
- **リンクアイコン**: `LinkIcon` は既に `app/components/icons.tsx` に存在するため、customization/constants.tsx と plugins/constants.tsx のインライン SVG を既存の `LinkIcon` のインポートに置き換える
- **設定/歯車アイコン**（`circle cx="12" cy="12" r="3"` のパス）: best-practices/constants.tsx, directory/constants.tsx 内に存在 → `SettingsGearIcon` として抽出

- [ ] **Step 4: 型チェック**

Run: `pnpm run typecheck`
Expected: 成功（エラーなし）

---

## Task 2: BaseCard コンポーネント

**Files:**
- Create: `app/components/base-card.tsx`
- Modify: `app/routes/best-practices/item-card.tsx`
- Modify: `app/routes/commands/command-card.tsx`
- Modify: `app/routes/commands/cli-card.tsx`
- Modify: `app/routes/commands/shortcut-card.tsx`
- Modify: `app/routes/customization/customization-card.tsx`
- Modify: `app/routes/directory/entry-card.tsx`
- Modify: `app/routes/env-vars/env-card.tsx`
- Modify: `app/routes/plugins/plugin-card.tsx`
- Modify: `app/routes/release-note/version-card.tsx`
- Modify: `app/routes/token-usage/item-card.tsx`

- [ ] **Step 1: `app/components/base-card.tsx` を作成**

```tsx
interface BaseCardProps {
  accentColor: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  gradientOpacity?: string;
  children: React.ReactNode;
}

export function BaseCard({
  accentColor,
  onClick,
  className,
  style,
  gradientOpacity = "40",
  children,
}: BaseCardProps): React.JSX.Element {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`hover-card bg-surface rounded-xl border border-slate-700 flex flex-col cursor-pointer relative overflow-hidden ${className ?? ""}`}
      style={{ "--accent": accentColor, ...style } as React.CSSProperties}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
        style={{
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}${gradientOpacity})`,
        }}
      />
      {children}
    </div>
  );
}
```

- [ ] **Step 2: 各カードコンポーネントを BaseCard に置き換え**

各カードのコンテナ div + onKeyDown + アクセントボーダーを `<BaseCard>` に置換。カード固有の `className`（高さ、パディング、gap）と `style`（inline padding）は props で渡す。

**例: `app/routes/best-practices/item-card.tsx`**
```tsx
// Before
<div
  role="button"
  tabIndex={0}
  onClick={onClick}
  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
  className="hover-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden h-[200px] px-5 py-[18px]"
  style={{ "--accent": accentColor } as React.CSSProperties}
>
  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl"
       style={{ background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)` }} />
  {/* children */}
</div>

// After
<BaseCard accentColor={accentColor} onClick={onClick} className="gap-2.5 h-[200px] px-5 py-[18px]">
  {/* children */}
</BaseCard>
```

**カード別の差異マッピング:**

| カード | className | style | gradientOpacity |
|--------|-----------|-------|-----------------|
| best-practices/item-card | `gap-2.5 h-[200px] px-5 py-[18px]` | — | (default) |
| commands/command-card | `gap-2.5 h-[200px] px-5 py-[18px]` | — | (default) |
| commands/cli-card | `gap-2.5 h-[200px] px-5 py-[18px]` | — | (default) |
| commands/shortcut-card | `gap-2.5 h-[200px] px-5 py-[18px]` | — | (default) |
| customization/customization-card | `gap-2.5 px-5 py-[18px]` | — | (default) |
| directory/entry-card | `gap-2.5 h-[200px]` | `{ padding: "18px 20px" }` | (default) |
| env-vars/env-card | `gap-2.5 h-[160px]` | `{ padding: "18px 20px" }` | (default) |
| plugins/plugin-card | `gap-2.5 h-[200px] px-5 py-[18px]` | — | (default) |
| release-note/version-card | `gap-[10px] min-h-[200px]` | `{ padding: "18px 20px" }` | `"60"` |
| token-usage/item-card | `gap-2.5 h-[200px] px-5 py-[18px]` | — | (default) |

- [ ] **Step 3: 型チェック**

Run: `pnpm run typecheck`
Expected: 成功

---

## Task 3a: release-note DetailModal を DetailModalShell ベースにリファクタ

**Files:**
- Modify: `app/routes/release-note/detail-modal.tsx`

- [ ] **Step 1: release-note/detail-modal.tsx を DetailModalShell を使用するよう書き換え**

自前の overlay `<motion.div>` + 内部コンテナ `<motion.div>` + 閉じボタンを削除し、`DetailModalShell` で置き換える。ヘッダー部分（バージョン番号、タグカウント）を `headerContent` prop に、アイテムリスト+リンクを `children` に渡す。

```tsx
import { DetailModalShell } from "~/components/detail-modal";
// ... 既存の import

export function DetailModal({ version, items, onClose, reducedMotion }: Props) {
  const hasDetails = VERSION_DETAILS_AVAILABLE.has(version);
  const sortedTags = computeSortedTagCounts(items);
  const accentColor = "#3B82F6";

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="680px"
      icon={<span className="text-[18px]">📋</span>}
      headerContent={
        <>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[23px] font-bold text-slate-100 tracking-tight">
              v{version}
            </span>
            <span className="font-mono text-xs text-slate-500 bg-slate-900 px-2 py-[2px] rounded">
              {items.length}件の変更
            </span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {sortedTags.map(([tag, count]) => (
              <TagCountBadge key={tag} tag={tag} count={count} />
            ))}
          </div>
        </>
      }
      bodyClassName="overflow-y-auto flex-1 px-6 pt-4 pb-6"
    >
      {/* Items list - 既存のまま */}
      <div className="flex flex-col gap-[2px]">
        {items.map((item, i) => (
          <div key={i} className="modal-item rounded-lg transition-colors" style={{ padding: "10px 12px" }}>
            {/* ... 既存の item レンダリング ... */}
          </div>
        ))}
      </div>
      {/* Version page link - 既存のまま */}
      <Link to={`/version/${version}`} className={/* 既存 */}>
        {hasDetails ? "バージョン詳細ページへ →" : "バージョンページへ →"}
      </Link>
    </DetailModalShell>
  );
}
```

`useModalLock` の呼び出しは `DetailModalShell` 内で行われるため削除。`motion/react` の import も不要になれば削除。

- [ ] **Step 2: 型チェック**

Run: `pnpm run typecheck`
Expected: 成功

---

## Task 3b: モーダル共通サブコンポーネント抽出

**Files:**
- Create: `app/components/modal-section.tsx`
- Create: `app/components/section-heading.tsx`
- Create: `app/components/paragraph-list.tsx`
- Create: `app/components/header-tags.tsx`
- Modify: `app/routes/best-practices/detail-modal.tsx`
- Modify: `app/routes/commands/detail-modal.tsx`
- Modify: `app/routes/customization/detail-modal.tsx`
- Modify: `app/routes/directory/detail-modal.tsx`
- Modify: `app/routes/env-vars/detail-modal.tsx`
- Modify: `app/routes/plugins/detail-modal.tsx`
- Modify: `app/routes/token-usage/detail-modal.tsx`

- [ ] **Step 1: 4つの共通コンポーネントを作成**

**`app/components/modal-section.tsx`:**
```tsx
export function ModalSection({
  label,
  accentColor,
  children,
}: {
  label: string;
  accentColor: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2.5">
      <div
        className="text-[12px] font-bold tracking-wide uppercase font-mono"
        style={{ color: accentColor }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
```

**`app/components/section-heading.tsx`:**
```tsx
export function SectionHeading({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
}): React.JSX.Element {
  return (
    <div
      className="flex items-center gap-1.5 text-[12px] font-bold tracking-wide uppercase font-mono"
      style={{ color }}
    >
      {icon}
      {label}
    </div>
  );
}
```

**`app/components/paragraph-list.tsx`:**
```tsx
export function ParagraphList({
  content,
  className,
  renderText,
}: {
  content: string;
  className?: string;
  renderText?: (paragraph: string) => React.ReactNode;
}): React.JSX.Element {
  return (
    <>
      {content.split("\n\n").map((p, i) => (
        <p
          key={i}
          className={
            className ??
            "m-0 text-[14px] leading-[1.8] text-slate-300 font-sans"
          }
        >
          {renderText ? renderText(p) : p}
        </p>
      ))}
    </>
  );
}
```

**`app/components/header-tags.tsx`:**
```tsx
import type { ColorPair } from "~/theme/colors";

export function HeaderTags({
  sectionName,
  accentColor,
  tags,
  tagColors,
}: {
  sectionName?: string;
  accentColor?: string;
  tags?: string[];
  tagColors: Record<string, ColorPair | { color: string; bg: string }>;
}): React.JSX.Element {
  return (
    <div className="flex gap-1.5 mt-2 flex-wrap">
      {sectionName && accentColor && (
        <span
          className="text-[11px] font-semibold rounded"
          style={{
            padding: "2px 8px",
            background: accentColor + "18",
            color: accentColor,
          }}
        >
          {sectionName}
        </span>
      )}
      {tags?.map((tag) => (
        <span
          key={tag}
          className="text-[11px] font-semibold rounded"
          style={{
            padding: "2px 8px",
            background: tagColors[tag]?.bg ?? "rgba(100,116,139,0.15)",
            color: tagColors[tag]?.color ?? "#94A3B8",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: directory/detail-modal.tsx と env-vars/detail-modal.tsx のローカル ModalSection を共通版に置換**

各ファイルのローカル `ModalSection` 関数定義を削除し、`import { ModalSection } from "~/components/modal-section"` に置換。

- [ ] **Step 3: commands/detail-modal.tsx、plugins/detail-modal.tsx、token-usage/detail-modal.tsx のアイコン+ラベルヘッダーを SectionHeading に置換**

```tsx
// Before
<div className="flex items-center gap-1.5 text-cyan-300 text-[12px] font-bold tracking-wide uppercase font-mono">
  <InfoIcon />
  詳細説明
</div>

// After
<SectionHeading icon={<InfoIcon />} label="詳細説明" color="#67E8F9" />
```

- [ ] **Step 4: best-practices, directory, env-vars, token-usage の detail-modal.tsx で content.split("\n\n") を ParagraphList に置換**

```tsx
// Before
{item.content.split("\n\n").map((paragraph, i) => (
  <p key={i} className="m-0 text-[14px] leading-[1.8] text-slate-300 font-sans">
    {paragraph}
  </p>
))}

// After
<ParagraphList content={item.content} />
```

- [ ] **Step 5: 7つの detail-modal.tsx のタグレンダリングを HeaderTags に置換**

```tsx
// Before
<div className="flex gap-1.5 mt-2 flex-wrap">
  <span className="text-[11px] font-semibold rounded"
        style={{ padding: "2px 8px", background: accentColor + "18", color: accentColor }}>
    {sectionName}
  </span>
  {item.tags.map((tag) => (
    <span key={tag} className="text-[11px] font-semibold rounded"
          style={{ padding: "2px 8px", background: TAG_COLORS[tag]?.bg ?? "...", color: TAG_COLORS[tag]?.color ?? "..." }}>
      {tag}
    </span>
  ))}
</div>

// After
<HeaderTags sectionName={sectionName} accentColor={accentColor} tags={item.tags} tagColors={TAG_COLORS} />
```

- [ ] **Step 6: 型チェック**

Run: `pnpm run typecheck`
Expected: 成功

---

## Task 4: usePageState フック + ItemGrid コンポーネント

**Files:**
- Create: `app/hooks/usePageState.ts`
- Create: `app/components/item-grid.tsx`
- Modify: `app/routes/best-practices/index.tsx`
- Modify: `app/routes/token-usage/index.tsx`
- Modify: `app/routes/plugins/index.tsx`
- Modify: `app/routes/directory/index.tsx`
- Modify: `app/routes/env-vars/index.tsx`
- Modify: `app/routes/commands/index.tsx`（ItemGrid のみ）
- Modify: `app/routes/customization/index.tsx`（ItemGrid のみ）

- [ ] **Step 1: `app/hooks/usePageState.ts` を作成**

`filteredSections`（セクション単位の結果）と `filteredItems`（フラット化した結果）の両方を返す。best-practices や directory のようにセクションヘッダー付きで表示するページは `filteredSections` を使い、plugins のようにフラット表示するページは `filteredItems` を使う。

```ts
import { useCallback, useMemo, useState } from "react";

interface Section<T> {
  id: string;
  name: string;
  items: T[];
}

interface UsePageStateOptions<T> {
  sections: Section<T>[];
  searchFields: (item: T) => string[];
}

interface UsePageStateReturn<T> {
  query: string;
  setQuery: (q: string) => void;
  activeTab: string;
  handleTabChange: (id: string) => void;
  filteredSections: Section<T>[];
  filteredItems: T[];
  modalItem: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export function usePageState<T>(
  options: UsePageStateOptions<T>,
): UsePageStateReturn<T> {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [modalItem, setModalItem] = useState<string | null>(null);

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
    setQuery("");
  }, []);

  const openModal = useCallback((id: string) => setModalItem(id), []);
  const closeModal = useCallback(() => setModalItem(null), []);

  const filteredSections = useMemo(() => {
    const { sections, searchFields } = options;
    const isAllTab = activeTab === "all";
    const target = isAllTab
      ? sections
      : sections.filter((s) => s.id === activeTab);
    if (!query) return target;
    const lq = query.toLowerCase();
    return target
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          searchFields(item).some((f) => f.toLowerCase().includes(lq)),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [activeTab, query, options]);

  const filteredItems = useMemo(
    () => filteredSections.flatMap((s) => s.items),
    [filteredSections],
  );

  return {
    query,
    setQuery,
    activeTab,
    handleTabChange,
    filteredSections,
    filteredItems,
    modalItem,
    openModal,
    closeModal,
  };
}
```

- [ ] **Step 2: `app/components/item-grid.tsx` を作成**

```tsx
import { AnimatePresence, motion } from "motion/react";

interface ItemGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  reducedMotion: boolean | null;
  hasMounted?: boolean;
}

export function ItemGrid<T>({
  items,
  renderItem,
  keyExtractor,
  reducedMotion,
  hasMounted = false,
}: ItemGridProps<T>): React.JSX.Element {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.div
            key={keyExtractor(item)}
            layout={!reducedMotion}
            initial={
              reducedMotion
                ? false
                : hasMounted
                  ? { opacity: 0 }
                  : { opacity: 0, y: 15 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={
              reducedMotion
                ? undefined
                : {
                    opacity: 0,
                    scale: 0.96,
                    transition: { duration: 0.15 },
                  }
            }
            transition={{
              duration: 0.2,
              delay:
                reducedMotion || hasMounted
                  ? 0
                  : Math.min(i * 0.04, 0.4),
            }}
          >
            {renderItem(item, i)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 3: best-practices/index.tsx を usePageState + ItemGrid に置き換え**

useState × 3、useCallback × 3、useMemo のフィルタロジック、grid の AnimatePresence をすべて削除し、`usePageState` と `<ItemGrid>` に置き換える。

**重要**: best-practices はセクションヘッダー（アイコン + セクション名 + 件数）付きのセクショングループ表示を使っている。`usePageState` の `filteredSections` を使って、セクションごとに `<ItemGrid>` をレンダリングする形を維持すること:

```tsx
const { filteredSections, query, setQuery, activeTab, handleTabChange, modalItem, openModal, closeModal } = usePageState({ sections: SECTIONS, searchFields: (item) => [item.title, item.summary, item.content, ...item.tags] });

// セクションごとにヘッダー + ItemGrid をレンダリング
{filteredSections.map((section) => (
  <div key={section.id}>
    {/* セクションヘッダー（既存のまま維持） */}
    <ItemGrid items={section.items} renderItem={(item, i) => <ItemCard ... />} keyExtractor={(item) => item.id} reducedMotion={reducedMotion} />
  </div>
))}
```

- [ ] **Step 4: token-usage/index.tsx を同様に置き換え**

token-usage も best-practices と同じセクショングループ表示のため、`filteredSections` を使用。

- [ ] **Step 5: plugins/index.tsx を usePageState + ItemGrid に置き換え**

plugins はフラット表示のため `filteredItems` を使用。`categories` を `sections` インターフェースに適合させる（`plugins` → `items`）。`openModal` のシグネチャが `(plugin, color)` と異なるため、`usePageState` の `openModal` は使わず、独自の `openPluginModal` を定義する。

- [ ] **Step 6: directory/index.tsx を usePageState + ItemGrid に置き換え**

directory の実際のレンダリングパターンを確認し、セクショングループ表示なら `filteredSections`、フラット表示なら `filteredItems` を使用。

- [ ] **Step 7: env-vars/index.tsx を usePageState + ItemGrid に置き換え**

env-vars は `categories` を `sections` に、`vars` を `items` にマッピング。レンダリングパターンに応じて `filteredSections` または `filteredItems` を使用。

- [ ] **Step 8: commands/index.tsx に ItemGrid のみ適用**

commands は3種のデータ構造が混在するため `usePageState` は適用しない。grid 部分の `<AnimatePresence>` + `<motion.div>` ループを `<ItemGrid>` に置き換える。ただし commands は `hasMounted` + `cardMotionProps` パターンを使用しており、`ItemGrid` のアニメーション設定と微妙に異なる（hasMounted ゲートあり）。この差異が許容できない場合は commands への ItemGrid 適用をスキップする。

- [ ] **Step 9: customization/index.tsx に ItemGrid のみ適用**

customization もガイドモードの独自 UI があるため `usePageState` は適用せず、grid 部分のみ `<ItemGrid>` に置き換え。

- [ ] **Step 10: 型チェック**

Run: `pnpm run typecheck`
Expected: 成功

---

## Task 5: ユーティリティ共通化

**Files:**
- Create: `app/utils/search.ts`
- Create: `app/utils/render-inline-links.tsx`
- Modify: `app/routes/commands/constants.tsx`
- Modify: `app/routes/customization/constants.tsx`
- Modify: `app/routes/version-detail/detail-card.tsx`
- Modify: `app/routes/setup/step-card.tsx`
- Modify: `app/routes/customization/guided-reader.tsx`

- [ ] **Step 1: `app/utils/search.ts` を作成**

```ts
export function matchesQuery(
  fields: (string | undefined)[],
  lowerQuery: string,
): boolean {
  return fields.some((f) => f?.toLowerCase().includes(lowerQuery));
}
```

- [ ] **Step 2: commands/constants.tsx と customization/constants.tsx のローカル matchesQuery を共通版に置換**

各ファイルのローカル関数定義を削除し、`import { matchesQuery } from "~/utils/search"` に置換。

- [ ] **Step 3: `app/utils/render-inline-links.tsx` を作成**

```tsx
export function renderInlineLinks(text: string): React.ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      return (
        <a
          key={i}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#67E8F9",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          {match[1]}
        </a>
      );
    }
    return part;
  });
}
```

- [ ] **Step 4: version-detail/detail-card.tsx、setup/step-card.tsx、customization/guided-reader.tsx のローカル renderInlineLinks を共通版に置換**

各ファイルのローカル関数定義を削除し、`import { renderInlineLinks } from "~/utils/render-inline-links"` に置換。

- [ ] **Step 5: 型チェック**

Run: `pnpm run typecheck`
Expected: 成功

---

## Task 6: 最終検証とコミット

- [ ] **Step 1: 全体の型チェック**

Run: `pnpm run typecheck`
Expected: 成功

- [ ] **Step 2: 変更内容を確認**

Run: `git diff --stat`

- [ ] **Step 3: コミット**

変更をステージングしてコミット。新規ファイル（theme/colors.ts, components/*, hooks/*, utils/*）と変更ファイルをすべて含める。

---

## 並列実行ガイド（エージェントチーム用）

### 依存関係グラフ

```
Task 1 (カラー) ──→ Task 2 (BaseCard) は独立
Task 1 (カラー) ──→ Task 3b (HeaderTags は ColorPair 型を使用)
Task 3a (release-note modal) は完全独立
Task 5 (ユーティリティ) は完全独立
Task 4 (usePageState) は Task 2 完了後が望ましい（カード変更と同じファイル）
Task 6 は全タスク完了後
```

### 推奨並列グループ

| フェーズ | 並列実行可能なタスク |
|---------|-------------------|
| フェーズ 1 | Task 1, Task 3a, Task 5 |
| フェーズ 2 | Task 2, Task 3b |
| フェーズ 3 | Task 4 |
| フェーズ 4 | Task 6（最終検証・コミット） |
