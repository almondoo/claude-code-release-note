# プロンプトベストプラクティス ページ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Claude の最新モデル向けプロンプトエンジニアリング技法を日本語で閲覧できるページ `/prompting` を新規作成する。

**Architecture:** skill-best-practices ページと同一パターン（セクション見出し付きカードグリッド + モーダル詳細）。7セクション29項目を5タブにグループ化して表示。`usePageState` フックに `tabSectionMap` 対応を追加。

**Tech Stack:** React Router v7, TypeScript, Tailwind CSS v4, Framer Motion

**Spec:** `docs/superpowers/specs/2026-03-18-prompting-best-practices-design.md`

**制約:** git 操作（commit, push, branch 作成等）は行わない。コード変更のみ実施。

---

## ファイル構成

| 操作 | ファイル | 役割 |
|------|---------|------|
| Modify | `app/hooks/usePageState.ts` | `tabSectionMap` パラメータ追加 |
| Create | `app/data/prompting/prompting.json` | 7セクション29項目のデータ |
| Create | `app/routes/prompting/constants.tsx` | 型定義・定数・マッピング |
| Create | `app/routes/prompting/item-card.tsx` | カードコンポーネント |
| Create | `app/routes/prompting/detail-modal.tsx` | モーダルコンポーネント |
| Create | `app/routes/prompting/index.tsx` | メインページ |
| Modify | `app/routes.ts` | ルート追加 |
| Modify | `app/components/page-header.tsx` | ナビゲーション追加 |

---

### Task 1: usePageState に tabSectionMap 対応を追加

**Files:**
- Modify: `app/hooks/usePageState.ts`

- [ ] **Step 1: UsePageStateOptions に tabSectionMap を追加**

`app/hooks/usePageState.ts` の `UsePageStateOptions` インターフェースに optional な `tabSectionMap` プロパティを追加し、フィルタリングロジックを更新する。

```typescript
interface UsePageStateOptions<T> {
  sections: Section<T>[];
  searchFields: (item: T) => string[];
  tabSectionMap?: Record<string, string[]>;
}
```

`filteredSections` の `useMemo` 内、44-46行目のフィルタリングを以下に変更:

```typescript
const { sections, searchFields, tabSectionMap } = options;
const isAllTab = activeTab === "all";
const target = isAllTab
  ? sections
  : tabSectionMap && tabSectionMap[activeTab]
    ? sections.filter((s) => tabSectionMap[activeTab].includes(s.id))
    : sections.filter((s) => s.id === activeTab);
```

- [ ] **Step 2: typecheck で既存ページに影響がないことを確認**

Run: `pnpm run typecheck`
Expected: エラーなし（optional パラメータなので既存コード影響なし）

---

### Task 2: JSON データファイルを作成

**Files:**
- Create: `app/data/prompting/prompting.json`

- [ ] **Step 1: prompting.json を作成**

元のコンテンツ（ユーザーが提供したプロンプトベストプラクティス英語ドキュメント）を翻訳・構造化して JSON データファイルを作成する。

**セクション構造:**

```json
{
  "sections": [
    {
      "id": "general-principles",
      "name": "一般原則",
      "description": "効果的なプロンプトの基本テクニック",
      "items": [ /* 7 items */ ]
    },
    {
      "id": "output-formatting",
      "name": "出力とフォーマット",
      "description": "レスポンスの形式と書式を制御する",
      "items": [ /* 5 items */ ]
    },
    {
      "id": "tool-use",
      "name": "ツール使用",
      "description": "ツール呼び出しの指示と最適化",
      "items": [ /* 2 items */ ]
    },
    {
      "id": "thinking",
      "name": "思考と推論",
      "description": "thinking 機能の制御と活用",
      "items": [ /* 2 items */ ]
    },
    {
      "id": "agentic",
      "name": "エージェントシステム",
      "description": "長期推論、安全性、サブエージェントの制御",
      "items": [ /* 9 items */ ]
    },
    {
      "id": "capability-tips",
      "name": "機能別Tips",
      "description": "ビジョンとフロントエンドデザインの活用",
      "items": [ /* 2 items */ ]
    },
    {
      "id": "migration",
      "name": "マイグレーション",
      "description": "Claude 4.6 モデルへの移行ガイド",
      "items": [ /* 2 items */ ]
    }
  ]
}
```

**各アイテムのフォーマット:**

```json
{
  "id": "clear-direct",
  "title": "明確で直接的な指示",
  "summary": "具体的な出力形式を指定し、順序が重要な場合は番号付きリストを使う。曖昧なプロンプトに頼らず明示的に要求する。",
  "content": "Claude は明確で具体的な指示に最もよく応答します。...\n\n黄金律：...",
  "tags": ["基礎"],
  "examples": [
    {
      "strategy": "アナリティクスダッシュボード作成",
      "before": "Create an analytics dashboard",
      "after": "Create an analytics dashboard. Include as many relevant features and interactions as possible. Go beyond the basics to create a fully-featured implementation."
    }
  ],
  "tips": [
    "具体的な出力形式と制約を指定する",
    "順序や完全性が重要な場合は番号付きリストやブレットポイントで手順を指示する"
  ]
}
```

**翻訳ルール:**
- `summary` と `content` は日本語で記述
- `examples` 内の `before` / `after` のプロンプトテキストは英語のまま（実際に使うプロンプトのため）
- `code` 内の `value` は英語のまま（コード/プロンプト）
- `code` 内の `label` は日本語で記述
- API パラメータ名（`thinking`, `effort`, `budget_tokens` 等）は英語のまま
- 公式用語（adaptive thinking, few-shot 等）は原語のまま使用

**各セクションの全項目リスト:**

セクション1: `general-principles` (7 items)
- `clear-direct`: 明確で直接的な指示
- `add-context`: コンテキストで性能を向上
- `use-examples`: 効果的な例示（few-shot）
- `xml-tags`: XMLタグで構造化
- `give-role`: ロール設定
- `long-context`: 長文コンテキスト
- `model-identity`: モデルの自己認識

セクション2: `output-formatting` (5 items)
- `communication-style`: コミュニケーションスタイル
- `format-control`: レスポンス形式制御
- `latex-output`: LaTeX出力
- `document-creation`: ドキュメント作成
- `prefill-migration`: prefill からの移行

セクション3: `tool-use` (2 items)
- `tool-usage`: ツール使用の指示
- `parallel-tools`: 並列ツール呼び出し

セクション4: `thinking` (2 items)
- `overthinking`: 過剰思考の制御
- `thinking-capabilities`: thinking 機能の活用

セクション5: `agentic` (9 items)
- `long-horizon`: 長期推論と状態追跡
- `autonomy-safety`: 自律性と安全性のバランス
- `research`: リサーチと情報収集
- `subagent`: サブエージェント制御
- `prompt-chaining`: プロンプトチェーン
- `reduce-files`: ファイル作成の抑制
- `overeagerness`: 過剰対応の抑制
- `test-focus`: テスト偏重の防止
- `hallucination`: ハルシネーション削減

セクション6: `capability-tips` (2 items)
- `vision`: ビジョン機能
- `frontend-design`: フロントエンドデザイン

セクション7: `migration` (2 items)
- `migration-4-6`: Claude 4.6 への移行
- `sonnet-migration`: Sonnet 4.5→4.6 移行

**コンテンツのソース:** ユーザーが提供した英語ドキュメント「Prompting best practices」の各セクションを翻訳して対応するアイテムに変換する。

**各フィールドの使い分け:**
- `content`: メインの説明テキスト（`\n\n` で段落区切り）
- `examples`: 「Less effective / More effective」の比較 → `before` / `after`
- `tips`: ブレットポイントのリスト
- `code`: `{ lang, label, value }[]` 形式のサンプルプロンプト/コード。元ドキュメントの「Sample prompt」や Python コードスニペットをそのまま格納。`lang` は `"text"`, `"python"`, `"xml"`, `"json"` のいずれか

---

### Task 3: constants.tsx を作成

**Files:**
- Create: `app/routes/prompting/constants.tsx`

- [ ] **Step 1: constants.tsx を作成**

`app/routes/skill-best-practices/constants.tsx` をベースに作成する。

```typescript
import promptData from "~/data/prompting/prompting.json";
import { PALETTE } from "~/theme/colors";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PromptExample {
  strategy: string;
  detail?: string;
  before: string;
  after: string;
}

export interface PromptCode {
  lang: string;
  label: string;
  value: string;
}

export interface PromptItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  examples?: PromptExample[];
  tips?: string[];
  code?: PromptCode[];
}

export interface PromptSection {
  id: string;
  name: string;
  description: string;
  items: PromptItem[];
}

export interface TabDef {
  id: string;
  label: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SECTIONS = promptData.sections as PromptSection[];
export const TOTAL_ITEMS = SECTIONS.reduce((sum, s) => sum + s.items.length, 0);

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  "general-principles": { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  "output-formatting": PALETTE.blue,
  "tool-use": PALETTE.cyan,
  thinking: PALETTE.purple,
  agentic: PALETTE.orange,
  "capability-tips": PALETTE.green,
  migration: PALETTE.teal,
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  "general-principles": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  "output-formatting": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  "tool-use": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  thinking: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  agentic: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  "capability-tips": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  migration: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
};

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  基礎: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  出力: PALETTE.blue,
  ツール: PALETTE.cyan,
  思考: PALETTE.purple,
  エージェント: PALETTE.orange,
  移行: PALETTE.teal,
  ビジョン: PALETTE.green,
  デザイン: PALETTE.indigo,
};

// ---------------------------------------------------------------------------
// Tab definitions (5 grouped tabs + "all")
// ---------------------------------------------------------------------------

export const TAB_SECTION_MAP: Record<string, string[]> = {
  foundations: ["general-principles"],
  output: ["output-formatting"],
  "tools-thinking": ["tool-use", "thinking"],
  agentic: ["agentic"],
  "tips-migration": ["capability-tips", "migration"],
};

export const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  { id: "foundations", label: "基礎", color: SECTION_COLORS["general-principles"]?.color || "#3B82F6" },
  { id: "output", label: "出力", color: SECTION_COLORS["output-formatting"]?.color || "#3B82F6" },
  { id: "tools-thinking", label: "ツール・思考", color: SECTION_COLORS["tool-use"]?.color || "#3B82F6" },
  { id: "agentic", label: "エージェント", color: SECTION_COLORS.agentic?.color || "#3B82F6" },
  { id: "tips-migration", label: "Tips・移行", color: SECTION_COLORS["capability-tips"]?.color || "#3B82F6" },
];

// ---------------------------------------------------------------------------
// Lookup maps
// ---------------------------------------------------------------------------

export const ITEM_SECTION_MAP = new Map<string, { sectionName: string; sectionId: string }>();
for (const section of SECTIONS) {
  for (const item of section.items) {
    ITEM_SECTION_MAP.set(item.id, { sectionName: section.name, sectionId: section.id });
  }
}
```

---

### Task 4: item-card.tsx を作成

**Files:**
- Create: `app/routes/prompting/item-card.tsx`

- [ ] **Step 1: item-card.tsx を作成**

`app/routes/skill-best-practices/item-card.tsx` と同一構造で作成。型名のみ変更。

```tsx
import { BaseCard } from "~/components/base-card";
import type { PromptItem } from "./constants";
import { TAG_COLORS } from "./constants";

export function ItemCard({
  item,
  accentColor,
  sectionName,
  onClick,
}: {
  item: PromptItem;
  accentColor: string;
  sectionName: string;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <BaseCard accentColor={accentColor} onClick={onClick} className="gap-2.5 h-[200px] px-5 py-[18px]">
      <div className="flex items-start gap-2">
        <span className="font-semibold text-sm text-slate-100 leading-snug line-clamp-2">
          {item.title}
        </span>
      </div>
      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 line-clamp-3">
        {item.summary}
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

---

### Task 5: detail-modal.tsx を作成

**Files:**
- Create: `app/routes/prompting/detail-modal.tsx`

- [ ] **Step 1: detail-modal.tsx を作成**

`app/routes/skill-best-practices/detail-modal.tsx` をベースに、`code` フィールドを `CodeBlockView` 配列対応に変更する。`steps` は除外。

```tsx
import { DetailModalShell } from "~/components/detail-modal";
import { HeaderTags } from "~/components/header-tags";
import { ParagraphList } from "~/components/paragraph-list";
import { CodeBlockView } from "~/components/code-block-view";

import type { PromptItem } from "./constants";
import { SECTIONS, SECTION_ICONS, TAG_COLORS } from "./constants";

export function DetailModal({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: PromptItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const sectionIcon = SECTION_ICONS[
    SECTIONS.find((s) => s.items.some((i) => i.id === item.id))?.id ?? ""
  ]?.() ?? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            {item.summary}
          </p>
          <HeaderTags sectionName={sectionName} accentColor={accentColor} tags={item.tags} tagColors={TAG_COLORS} />
        </>
      }
    >
      {/* Content paragraphs */}
      <ParagraphList content={item.content} />

      {/* Before/After examples table */}
      {item.examples && item.examples.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            具体例（Before → After）
          </h3>
          <div className="flex flex-col gap-2.5">
            {item.examples.map((ex, i) => (
              <div key={i} className="rounded-lg border border-slate-700 overflow-hidden">
                <div className="px-4 py-2 bg-slate-800 text-[12px] font-semibold text-slate-300">
                  {ex.strategy}
                  {ex.detail ? ` — ${ex.detail}` : ""}
                </div>
                <div className="grid grid-cols-2 divide-x divide-slate-700">
                  <div className="p-3">
                    <span className="block text-[11px] font-bold text-red-400 mb-1 uppercase tracking-wider">
                      Before
                    </span>
                    <span className="text-[13px] text-slate-400 leading-relaxed italic whitespace-pre-wrap">
                      {ex.before}
                    </span>
                  </div>
                  <div className="p-3">
                    <span className="block text-[11px] font-bold text-green-400 mb-1 uppercase tracking-wider">
                      After
                    </span>
                    <span className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {ex.after}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips list */}
      {item.tips && item.tips.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-orange-300 font-mono m-0">
            ポイント
          </h3>
          <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
            {item.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 items-start text-[14px] text-slate-300 leading-relaxed">
                <span className="text-slate-500 shrink-0 mt-[2px]">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Code blocks (array of CodeBlock) */}
      {item.code && item.code.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-emerald-300 font-mono m-0">
            サンプルプロンプト
          </h3>
          <div className="flex flex-col gap-2.5">
            {item.code.map((block, i) => (
              <CodeBlockView key={i} block={block} />
            ))}
          </div>
        </div>
      )}
    </DetailModalShell>
  );
}
```

---

### Task 6: index.tsx（メインページ）を作成

**Files:**
- Create: `app/routes/prompting/index.tsx`

- [ ] **Step 1: index.tsx を作成**

`app/routes/skill-best-practices/index.tsx` と同一構造で作成。`usePageState` に `tabSectionMap` を渡す。

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
  TAB_DEFS,
  TAB_SECTION_MAP,
  ITEM_SECTION_MAP,
} from "./constants";
import { ItemCard } from "./item-card";
import { DetailModal } from "./detail-modal";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code プロンプト ベストプラクティス" },
    { name: "description", content: "Claude の最新モデルにおけるプロンプトエンジニアリングの包括的ガイド" },
  ];
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function renderTabIcon(tab: TabItem): React.ReactNode {
  // タブIDに対応する最初のセクションのアイコンを表示
  const sectionIds = TAB_SECTION_MAP[tab.id];
  if (sectionIds && sectionIds[0] && SECTION_ICONS[sectionIds[0]]) {
    return <span className="flex items-center scale-[0.8]">{SECTION_ICONS[sectionIds[0]]()}</span>;
  }
  return null;
}

export default function PromptingBestPractices(): React.JSX.Element {
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
    sections: SECTIONS.map((s) => ({ id: s.id, name: s.name, items: s.items })),
    searchFields: (item) => [item.title, item.summary, item.content, ...item.tags],
    tabSectionMap: TAB_SECTION_MAP,
  });
  const reducedMotion = useReducedMotion();

  const visibleItemCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  const modalItemData = modalItemId
    ? (SECTIONS.flatMap((s) => s.items).find((i) => i.id === modalItemId) ?? null)
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
          title="プロンプト ベストプラクティス"
          description="Claude の最新モデルにおけるプロンプトエンジニアリングの包括的ガイド。明確さ、例示、XMLタグ、thinking、エージェントシステムなどを網羅。"
          stats={[
            { value: SECTIONS.length, label: "カテゴリ" },
            { value: TOTAL_ITEMS, label: "プラクティス" },
          ]}
          gradient={["rgba(59,130,246,0.08)", "rgba(6,182,212,0.05)"]}
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
          <SearchInput value={query} onChange={setQuery} placeholder="プラクティスを検索..." />
        </motion.div>

        {/* Count */}
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[14px] text-slate-500 font-medium">
            {visibleItemCount} / {TOTAL_ITEMS} プラクティス
          </span>
        </div>

        {/* Section cards */}
        <div className="flex flex-col gap-8">
          {filteredSections.map((section) => {
            const colors = SECTION_COLORS[section.id] || {
              color: "#3B82F6",
              bg: "rgba(59,130,246,0.15)",
            };
            return (
              <div key={section.id}>
                {/* Section header */}
                <div className="flex items-center gap-2.5 mb-3 px-1">
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
          <EmptyState
            message="条件に一致するプラクティスはありません"
            reducedMotion={reducedMotion}
          />
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

---

### Task 7: ルート定義とナビゲーション追加

**Files:**
- Modify: `app/routes.ts`
- Modify: `app/components/page-header.tsx`

- [ ] **Step 1: app/routes.ts にルート追加**

`app/routes.ts` の配列に以下を追加（`skill-best-practices` の行の前あたり）:

```typescript
route("prompting", "routes/prompting/index.tsx"),
```

- [ ] **Step 2: app/components/page-header.tsx の ALL_PAGES にナビゲーション追加**

`ALL_PAGES` 配列のインデックス7（`{ to: "/best-practices", label: "ベストプラクティス" }` の直後）に追加:

```typescript
{ to: "/prompting", label: "プロンプト" },
```

---

### Task 8: typecheck と動作確認

- [ ] **Step 1: typecheck 実行**

Run: `pnpm run typecheck`
Expected: エラーなし

- [ ] **Step 2: 開発サーバーで動作確認**

Run: `pnpm run dev`

以下を確認:
1. `http://localhost:5173/prompting` にアクセスできる
2. ヘッダー、タブ、検索、カードグリッドが表示される
3. タブ切り替え（特に「ツール・思考」「Tips・移行」など複数セクションタブ）が正しく動作する
4. カードクリックでモーダルが開き、content / examples / tips / code が正しく表示される
5. 検索でフィルタリングが機能する
6. ナビゲーションバーに「プロンプト」リンクが表示される

確認後、必ずサーバーを停止する。
