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
  TAG_COLORS,
} from "./constants";
import { SummaryCard } from "~/components/summary-card";
import { DetailModal } from "./detail-modal";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export const meta = (): Array<{ title?: string; name?: string; content?: string }> => {
  return [
    { title: "Claude Code プロンプト ベストプラクティス" },
    {
      name: "description",
      content: "Claude の最新モデルにおけるプロンプトエンジニアリングの包括的ガイド",
    },
  ];
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const renderTabIcon = (tab: TabItem): React.ReactNode => {
  // タブIDに対応する最初のセクションのアイコンを表示
  const sectionIds = TAB_SECTION_MAP[tab.id];
  if (sectionIds && sectionIds[0] && SECTION_ICONS[sectionIds[0]]) {
    return <span className="flex items-center scale-[0.8]">{SECTION_ICONS[sectionIds[0]]()}</span>;
  }
  return null;
};

const PromptingBestPractices = (): React.JSX.Element => {
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
                    <SummaryCard
                      title={item.title}
                      description={item.summary}
                      tags={item.tags}
                      accentColor={colors.color}
                      sectionName={section.name}
                      onClick={() => openModal(item.id)}
                      tagColors={TAG_COLORS}
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
};

export default PromptingBestPractices;
