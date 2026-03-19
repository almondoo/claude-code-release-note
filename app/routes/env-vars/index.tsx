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
  CATEGORIES,
  SECTIONS,
  TOTAL_ITEMS,
  SECTION_COLORS,
  SECTION_ICONS,
  TAB_DEFS,
  ITEM_SECTION_MAP,
  TAG_COLORS,
} from "./constants";
import { DetailModal } from "./detail-modal";

export const meta = (): Array<{ title?: string; name?: string; content?: string }> => {
  return [
    { title: "Claude Code 環境変数リファレンス" },
    { name: "description", content: "Claude Code の全環境変数の一覧と設定方法" },
  ];
};

const renderTabIcon = (tab: TabItem): React.ReactNode => {
  if (SECTION_ICONS[tab.id]) {
    return <span className="flex items-center scale-[0.8]">{SECTION_ICONS[tab.id]()}</span>;
  }
  return null;
};

const EnvVars = (): React.JSX.Element => {
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
    sections: SECTIONS,
    searchFields: (v) => [v.name, v.description, v.detail],
  });
  const reducedMotion = useReducedMotion();

  const visibleItemCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  const modalEnvVar = modalItemId
    ? (SECTIONS.flatMap((s) => s.items).find((v) => v.name === modalItemId) ?? null)
    : null;
  const modalSection = modalItemId ? ITEM_SECTION_MAP.get(modalItemId) : null;
  const modalCategory = modalSection
    ? (CATEGORIES.find((c) => c.id === modalSection.sectionId) ?? null)
    : null;

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="Claude Code 環境変数リファレンス"
          description="Claude Code の動作を制御する全環境変数の一覧と設定方法"
          stats={[
            { value: CATEGORIES.length, label: "カテゴリ" },
            { value: TOTAL_ITEMS, label: "環境変数" },
          ]}
          gradient={["rgba(139,92,246,0.08)", "rgba(234,179,8,0.05)"]}
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
          <SearchInput value={query} onChange={setQuery} placeholder="変数名やキーワードで検索..." />
        </motion.div>

        {/* Count */}
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[14px] text-slate-500 font-medium">
            {visibleItemCount} / {TOTAL_ITEMS} 環境変数
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
                  keyExtractor={(v) => v.name}
                  renderItem={(v) => (
                    <SummaryCard
                      title={v.name}
                      description={v.description}
                      tags={v.deprecated ? ["非推奨"] : []}
                      accentColor={colors.color}
                      sectionName={section.name}
                      onClick={() => openModal(v.name)}
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
            message="条件に一致する環境変数はありません"
            reducedMotion={reducedMotion}
          />
        )}

        {/* Footer */}
        <Footer />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalEnvVar && modalCategory && (
          <DetailModal
            envVar={modalEnvVar}
            category={modalCategory}
            accentColor={SECTION_COLORS[modalCategory.id]?.color || "#3B82F6"}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnvVars;
