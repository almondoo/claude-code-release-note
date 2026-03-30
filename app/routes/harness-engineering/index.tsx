import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { ItemGrid } from "~/components/item-grid";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { SummaryCard } from "~/components/summary-card";
import { TabBar } from "~/components/tab-bar";
import type { TabItem } from "~/components/tab-bar";
import { usePageState } from "~/hooks/usePageState";

import {
  ACCENT,
  SECTIONS,
  TOTAL_ITEMS,
  SECTION_COLORS,
  SECTION_ICONS,
  TAB_DEFS,
  TAB_SECTION_MAP,
  ITEM_SECTION_MAP,
  TAG_COLORS,
} from "./constants";
import { DetailModal } from "./detail-modal";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export const meta = (): Array<{ title?: string; name?: string; content?: string }> => {
  return [
    { title: "ハーネス＆コンテキストエンジニアリング — Claude Code" },
    {
      name: "description",
      content: "Claude Code のハーネス設計（コンテキスト管理含む）を最適化するための包括的リファレンス",
    },
  ];
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const renderTabIcon = (tab: TabItem): React.ReactNode => {
  // Tab icons map to section icons — show first matching section's icon
  const sectionIds = TAB_SECTION_MAP[tab.id];
  if (sectionIds) {
    const icon = SECTION_ICONS[sectionIds[0]];
    if (icon) {
      return <span className="flex items-center scale-[0.8]">{icon()}</span>;
    }
  }
  return null;
};

const HarnessEngineering = (): React.JSX.Element => {
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
          title="ハーネス＆コンテキストエンジニアリング"
          description="CLAUDE.md・Hooks・サブエージェント・Skills・コンテキストウィンドウ管理 — Claude Code のハーネスエンジニアリング（コンテキストエンジニアリング含む）の包括的リファレンス。"
          stats={[
            { value: SECTIONS.length, label: "セクション" },
            { value: TOTAL_ITEMS, label: "トピック" },
          ]}
          gradient={["rgba(6,182,212,0.08)", "rgba(6,182,212,0.03)"]}
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
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="トピックを検索..."
            accentColor={ACCENT}
          />
        </motion.div>

        {/* Count */}
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[14px] text-slate-500 font-medium">
            {visibleItemCount} / {TOTAL_ITEMS} トピック
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
            message="条件に一致するトピックはありません"
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
            accentColor={SECTION_COLORS[modalSection.sectionId]?.color || ACCENT}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HarnessEngineering;
