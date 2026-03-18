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
          <EmptyState
            message="条件に一致するステップはありません"
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
