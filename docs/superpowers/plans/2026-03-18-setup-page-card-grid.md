# Setup ページ カードグリッド化 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setup ページのレイアウトをタイムライン+アコーディオン形式から、best-practices ページと同じカテゴリ別カードグリッド+モーダル形式に変更する

**Architecture:** best-practices ページと同じ構造（TabBar + ItemGrid + DetailModal）を採用。`usePageState` フックでタブ切替・検索・モーダル状態を管理。セクションヘッダーに番号バッジを追加して順序感を維持。既存の JSON データ構造は変更しない。

**Tech Stack:** React, React Router v7, motion/react, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-18-setup-page-card-grid-design.md`

---

## ファイル構成

| 操作 | ファイル                                      | 責務                                                                                 |
| ---- | --------------------------------------------- | ------------------------------------------------------------------------------------ |
| 変更 | `app/routes/setup/constants.tsx`              | TAB_DEFS, ITEM_SECTION_MAP, SECTION_INDEX_MAP 追加、TOTAL_STEPS→TOTAL_ITEMS リネーム |
| 新規 | `app/routes/setup/item-card.tsx`              | カードグリッドの個別カード                                                           |
| 新規 | `app/routes/setup/detail-modal.tsx`           | モーダル（content + code + callouts 表示）                                           |
| 書換 | `app/routes/setup/index.tsx`                  | メインページ（TabBar + ItemGrid + DetailModal 構造に全面書換）                       |
| 削除 | `app/routes/setup/step-card.tsx`              | アコーディオンカード（不要）                                                         |
| 削除 | `app/routes/setup/quick-start-panel.tsx`      | クイックスタート（不要）                                                             |
| 削除 | `app/routes/setup/summary-panel.tsx`          | サマリー（不要）                                                                     |
| 削除 | `app/routes/setup/timeline-sidebar.tsx`       | タイムラインサイドバー（不要）                                                       |
| 削除 | `app/routes/setup/mobile-timeline-marker.tsx` | モバイルマーカー（不要）                                                             |
| 維持 | `app/routes/setup/section-icons.tsx`          | セクションアイコン（変更なし）                                                       |
| 維持 | `app/data/setup/*.json`                       | JSON データ（変更なし）                                                              |
| 維持 | `app/data/setup/index.ts`                     | データインポート（変更なし）                                                         |

---

### Task 1: constants.tsx を更新

**Files:**

- Modify: `app/routes/setup/constants.tsx`

- [ ] **Step 1: constants.tsx に TAB_DEFS, ITEM_SECTION_MAP, SECTION_INDEX_MAP を追加し、TOTAL_STEPS を TOTAL_ITEMS にリネーム**

現在の `app/routes/setup/constants.tsx` を以下の内容に書き換える。`Step`, `SetupSection` 型、`SECTIONS`, `SECTION_COLORS`, `SECTION_ICONS`, `TAG_COLORS` は既存のまま維持し、以下を追加・変更:

```typescript
import type { Callout } from "~/components/callout-box";
import type { CodeBlock } from "~/components/code-block-view";
import type { TabItem } from "~/components/tab-bar";
import { SECTIONS as RAW_SECTIONS } from "~/data/setup";
import { PALETTE } from "~/theme/colors";

export interface Step {
  id: string;
  title: string;
  description: string;
  content: string;
  code: CodeBlock[];
  callouts: Callout[];
  tags: string[];
}

export interface SetupSection {
  id: string;
  name: string;
  description: string;
  steps: Step[];
}

export const SECTIONS = RAW_SECTIONS as SetupSection[];
export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  installation: PALETTE.green,
  "initial-setup": PALETTE.cyan,
  "claude-md": PALETTE.purple,
  "first-steps": { color: "#86EFAC", bg: "rgba(34, 197, 94, 0.15)" },
  skills: PALETTE.pink,
  hooks: PALETTE.orange,
  mcp: PALETTE.teal,
  ide: PALETTE.blueDark,
  permissions: PALETTE.yellow,
  tips: PALETTE.pinkBright,
  troubleshooting: PALETTE.red,
  "best-practices": PALETTE.indigo,
};

export { SECTION_ICONS } from "./section-icons";

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  必須: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  初心者向け: PALETTE.green,
  中級者向け: { color: "#FCD34D", bg: "rgba(250, 204, 21, 0.15)" },
  上級者向け: PALETTE.purple,
  チーム向け: PALETTE.cyan,
  "CI/CD": PALETTE.orange,
};

export const TAB_DEFS: TabItem[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  ...SECTIONS.map((s, i) => ({
    id: s.id,
    label: `${i + 1}. ${s.name}`,
    color: SECTION_COLORS[s.id]?.color || "#3B82F6",
  })),
];

export const ITEM_SECTION_MAP = new Map<string, { sectionName: string; sectionId: string }>();
for (const section of SECTIONS) {
  for (const step of section.steps) {
    ITEM_SECTION_MAP.set(step.id, { sectionName: section.name, sectionId: section.id });
  }
}

export const SECTION_INDEX_MAP: Record<string, number> = {};
SECTIONS.forEach((s, i) => {
  SECTION_INDEX_MAP[s.id] = i;
});
```

- [ ] **Step 2: typecheck を実行**

Run: `pnpm run typecheck`
Expected: `TOTAL_STEPS` を参照していた `index.tsx` でエラーが出る（想定内、Task 4 で修正）

- [ ] **Step 3: コミット**

```bash
git add app/routes/setup/constants.tsx
git commit -m "setup: constants に TAB_DEFS, ITEM_SECTION_MAP, SECTION_INDEX_MAP を追加"
```

---

### Task 2: item-card.tsx を新規作成

**Files:**

- Create: `app/routes/setup/item-card.tsx`
- Reference: `app/routes/best-practices/item-card.tsx`（パターン参照）

- [ ] **Step 1: item-card.tsx を作成**

`app/routes/best-practices/item-card.tsx` をベースに、`BPItem` → `Step`、`item.summary` → `item.description` に置き換える:

```tsx
import { BaseCard } from "~/components/base-card";
import type { Step } from "./constants";
import { TAG_COLORS } from "./constants";

export function ItemCard({
  item,
  accentColor,
  sectionName,
  onClick,
}: {
  item: Step;
  accentColor: string;
  sectionName: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <BaseCard
      accentColor={accentColor}
      onClick={onClick}
      className="gap-2.5 h-[200px] px-5 py-[18px]"
    >
      <div className="flex items-start gap-2">
        <span className="font-semibold text-sm text-slate-100 leading-snug line-clamp-2">
          {item.title}
        </span>
      </div>
      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 line-clamp-3">
        {item.description}
      </p>
      <div className="flex items-center gap-1.5 mt-auto flex-wrap">
        <span
          className="text-[11px] font-semibold rounded self-start whitespace-nowrap"
          style={{
            padding: "2px 8px",
            background: accentColor + "18",
            color: accentColor,
          }}
        >
          {sectionName}
        </span>
        {item.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-semibold rounded whitespace-nowrap"
            style={{
              padding: "2px 8px",
              background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
              color: TAG_COLORS[tag]?.color ?? "#94A3B8",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </BaseCard>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add app/routes/setup/item-card.tsx
git commit -m "setup: ItemCard コンポーネントを新規作成"
```

---

### Task 3: detail-modal.tsx を新規作成

**Files:**

- Create: `app/routes/setup/detail-modal.tsx`
- Reference: `app/routes/best-practices/detail-modal.tsx`（パターン参照）

- [ ] **Step 1: detail-modal.tsx を作成**

best-practices の DetailModal をベースに、setup 用の `code` (CodeBlockView) と `callouts` (CalloutBox) セクションを追加:

```tsx
import { CalloutBox } from "~/components/callout-box";
import { CodeBlockView } from "~/components/code-block-view";
import { DetailModalShell } from "~/components/detail-modal";
import { HeaderTags } from "~/components/header-tags";
import { ParagraphList } from "~/components/paragraph-list";

import type { Step } from "./constants";
import { SECTIONS, SECTION_ICONS, TAG_COLORS } from "./constants";

export function DetailModal({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: Step;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const sectionIcon = SECTION_ICONS[
    SECTIONS.find((s) => s.steps.some((st) => st.id === item.id))?.id ?? ""
  ]?.() ?? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="700px"
      icon={sectionIcon}
      headerContent={
        <>
          <h2 className="text-base font-bold text-slate-100 m-0 leading-snug">{item.title}</h2>
          <p className="text-[14px] text-slate-400 mt-1.5 font-sans leading-[1.6] m-0">
            {item.description}
          </p>
          <HeaderTags
            sectionName={sectionName}
            accentColor={accentColor}
            tags={item.tags}
            tagColors={TAG_COLORS}
          />
        </>
      }
    >
      {/* Content paragraphs */}
      <ParagraphList content={item.content} />

      {/* Code blocks */}
      {item.code.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            コード
          </h3>
          {item.code.map((block, i) => (
            <CodeBlockView key={i} block={block} />
          ))}
        </div>
      )}

      {/* Callouts */}
      {item.callouts.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {item.callouts.map((callout, i) => (
            <CalloutBox key={i} callout={callout} />
          ))}
        </div>
      )}
    </DetailModalShell>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add app/routes/setup/detail-modal.tsx
git commit -m "setup: DetailModal コンポーネントを新規作成（code + callouts 対応）"
```

---

### Task 4: index.tsx を全面書き換え

**Files:**

- Rewrite: `app/routes/setup/index.tsx`
- Reference: `app/routes/best-practices/index.tsx`（パターン参照）

- [ ] **Step 1: index.tsx を書き換え**

best-practices の index.tsx をベースに、setup 用にカスタマイズ。主な違い:

- `usePageState` の `sections` で `s.steps` → `items` にマッピング
- `searchFields` で `code`, `callouts` も検索対象に含める
- セクションヘッダーに番号バッジを追加（`SECTION_INDEX_MAP` 使用）

```tsx
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { ItemGrid } from "~/components/item-grid";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { TabBar } from "~/components/tab-bar";
import type { TabItem } from "~/components/tab-bar";
import { usePageState } from "~/hooks/usePageState";

import {
  SECTIONS,
  TOTAL_ITEMS,
  SECTION_COLORS,
  SECTION_ICONS,
  SECTION_INDEX_MAP,
  TAB_DEFS,
  ITEM_SECTION_MAP,
} from "./constants";
import { ItemCard } from "./item-card";
import { DetailModal } from "./detail-modal";

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code セットアップガイド" },
    { name: "description", content: "Claude Code のインストールから設定、ベストプラクティスまで" },
  ];
}

function renderTabIcon(tab: TabItem): React.ReactNode {
  if (SECTION_ICONS[tab.id]) {
    return <span className="flex items-center scale-[0.8]">{SECTION_ICONS[tab.id]()}</span>;
  }
  return null;
}

export default function SetupPage(): React.JSX.Element {
  const {
    query,
    setQuery,
    activeTab,
    handleTabChange,
    filteredSections,
    modalItem: modalItemId,
    openModal,
    closeModal,
  } = usePageState({
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
  const reducedMotion = useReducedMotion();

  const visibleItemCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  const modalItemData = modalItemId
    ? (SECTIONS.flatMap((s) => s.steps).find((i) => i.id === modalItemId) ?? null)
    : null;
  const modalSection = modalItemId ? ITEM_SECTION_MAP.get(modalItemId) : null;

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="セットアップガイド"
          description="インストールから CLAUDE.md、フック、MCP、IDE 連携、ベストプラクティスまで。Claude Code を最大限に活用するためのステップバイステップガイド。"
          stats={[
            { value: SECTIONS.length, label: "セクション" },
            { value: TOTAL_ITEMS, label: "ステップ" },
          ]}
          gradient={["rgba(139,92,246,0.08)", "rgba(16,185,129,0.05)"]}
        />

        {/* Tabs */}
        <TabBar
          tabs={TAB_DEFS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          renderIcon={renderTabIcon}
          reducedMotion={reducedMotion}
        />

        {/* Search */}
        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-4"
        >
          <SearchInput value={query} onChange={setQuery} placeholder="ステップを検索..." />
        </motion.div>

        {/* Count */}
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[14px] text-slate-500 font-medium">
            {visibleItemCount} / {TOTAL_ITEMS} ステップ
          </span>
        </div>

        {/* Section cards */}
        <div className="flex flex-col gap-8">
          {filteredSections.map((section) => {
            const colors = SECTION_COLORS[section.id] || {
              color: "#3B82F6",
              bg: "rgba(59,130,246,0.15)",
            };
            const sectionIndex = SECTION_INDEX_MAP[section.id] ?? 0;
            return (
              <div key={section.id}>
                {/* Section header with number badge */}
                <div className="flex items-center gap-2.5 mb-3 px-1">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                    style={{
                      background: colors.bg,
                      border: `2px solid ${colors.color}`,
                      color: colors.color,
                    }}
                  >
                    {sectionIndex + 1}
                  </div>
                  {SECTION_ICONS[section.id] && (
                    <span className="flex items-center" style={{ color: colors.color }}>
                      {SECTION_ICONS[section.id]()}
                    </span>
                  )}
                  <h2 className="text-base font-bold m-0" style={{ color: colors.color }}>
                    {section.name}
                  </h2>
                  <span className="text-xs text-slate-500">{section.items.length} 件</span>
                </div>

                {/* Cards */}
                <ItemGrid
                  items={section.items}
                  keyExtractor={(item) => item.id}
                  renderItem={(item) => (
                    <ItemCard
                      item={item}
                      accentColor={colors.color}
                      sectionName={section.name}
                      onClick={() => openModal(item.id)}
                    />
                  )}
                  reducedMotion={reducedMotion}
                />
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {visibleItemCount === 0 && (
          <EmptyState message="条件に一致するステップはありません" reducedMotion={reducedMotion} />
        )}

        {/* Footer */}
        <Footer />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalItemData && modalSection && (
          <DetailModal
            item={modalItemData}
            sectionName={modalSection.sectionName}
            accentColor={SECTION_COLORS[modalSection.sectionId]?.color || "#3B82F6"}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: typecheck を実行**

Run: `pnpm run typecheck`
Expected: PASS（エラーなし）

- [ ] **Step 3: コミット**

```bash
git add app/routes/setup/index.tsx
git commit -m "setup: カードグリッド+番号バッジ形式に全面書き換え"
```

---

### Task 5: 不要ファイルの削除

**Files:**

- Delete: `app/routes/setup/step-card.tsx`
- Delete: `app/routes/setup/quick-start-panel.tsx`
- Delete: `app/routes/setup/summary-panel.tsx`
- Delete: `app/routes/setup/timeline-sidebar.tsx`
- Delete: `app/routes/setup/mobile-timeline-marker.tsx`

- [ ] **Step 1: 不要ファイルを削除**

```bash
rm app/routes/setup/step-card.tsx
rm app/routes/setup/quick-start-panel.tsx
rm app/routes/setup/summary-panel.tsx
rm app/routes/setup/timeline-sidebar.tsx
rm app/routes/setup/mobile-timeline-marker.tsx
```

- [ ] **Step 2: typecheck を実行**

Run: `pnpm run typecheck`
Expected: PASS（削除したファイルはもう import されていないため）

- [ ] **Step 3: コミット**

```bash
git add -u app/routes/setup/
git commit -m "setup: 不要になったタイムライン・アコーディオン関連コンポーネントを削除"
```

---

### Task 6: ビルド確認と動作確認

**Files:** なし（確認のみ）

- [ ] **Step 1: プロダクションビルドを実行**

Run: `pnpm run build`
Expected: PASS（ビルド成功）

- [ ] **Step 2: 開発サーバーで目視確認**

Run: `pnpm run dev`

確認項目:

- http://localhost:5173/setup にアクセス
- 番号付きタブバーが表示される（「すべて」「1. インストール」「2. 初期設定」...）
- カードグリッドが表示される
- セクションヘッダーに番号バッジがある
- タブ切替でフィルタリングされる
- 検索が動作する
- カードクリックでモーダルが開く
- モーダルに content, code blocks, callouts が表示される
- モーダルを閉じられる

確認後、必ずサーバーを停止すること。

- [ ] **Step 3: 最終コミット（必要な場合）**

動作確認で問題が見つかった場合のみ修正してコミット。
