import { useState } from "react";
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

import type { AnyItem } from "./constants";
import { CATEGORIES, CATEGORY_CONFIGS, ITEM_SECTION_MAP } from "./constants";
import { DetailModal } from "./detail-modal";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export const meta = (): Array<{ title?: string; name?: string; content?: string }> => {
  return [
    { title: "Claude Code クイックリファレンス" },
    {
      name: "description",
      content: "よく使われる・推奨されるコマンド、プラグイン、環境変数の厳選ガイド",
    },
  ];
};

// ---------------------------------------------------------------------------
// CategoryTabBar – upper tier tab bar for the 3 categories
// ---------------------------------------------------------------------------

const CategoryTabBar = ({
  categories,
  activeCategory,
  onCategoryChange,
}: {
  categories: typeof CATEGORIES;
  activeCategory: string;
  onCategoryChange: (id: string) => void;
}) => {
  return (
    <div className="flex gap-0 border-b border-slate-700 mb-5 overflow-x-auto">
      {categories.map((cat) => {
        const isActive = cat.id === activeCategory;
        return (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`
              relative px-5 py-3 text-sm font-medium transition-colors whitespace-nowrap
              ${isActive ? "text-slate-100 font-bold" : "text-slate-400 hover:text-slate-300"}
            `}
            style={
              isActive
                ? { borderBottom: `3px solid ${cat.color}`, marginBottom: "-1px" }
                : { borderBottom: "3px solid transparent", marginBottom: "-1px" }
            }
          >
            {cat.label}
            {isActive && (
              <span
                className="absolute inset-0 rounded-t-lg"
                style={{ background: `${cat.color}08` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// CategoryContent – renders section tabs + content for the active category
// ---------------------------------------------------------------------------

const CategoryContent = ({ categoryId }: { categoryId: string }) => {
  const config = CATEGORY_CONFIGS[categoryId];

  const renderTabIcon = (tab: TabItem): React.ReactNode => {
    if (config.sectionIcons[tab.id]) {
      return <span className="flex items-center scale-[0.8]">{config.sectionIcons[tab.id]()}</span>;
    }
    return null;
  };

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
    sections: config.sections.map((s) => ({ id: s.id, name: s.name, items: s.items })),
    searchFields: (item: AnyItem) => [item.title, item.summary, item.content, ...(item.tags || [])],
  });

  const reducedMotion = useReducedMotion();
  const visibleItemCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  const modalItemData = modalItemId
    ? (config.sections.flatMap((s) => s.items).find((i) => i.id === modalItemId) ?? null)
    : null;
  const modalSection = modalItemId ? ITEM_SECTION_MAP.get(modalItemId) : null;

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <>
      {/* Section Tabs */}
      <TabBar
        tabs={config.tabDefs}
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
        <SearchInput value={query} onChange={setQuery} placeholder={config.searchPlaceholder} />
      </motion.div>

      {/* Count */}
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <span className="text-[14px] text-slate-500 font-medium">
          {visibleItemCount} / {config.totalItems} {config.itemLabel}
        </span>
      </div>

      {/* Section cards */}
      <div className="flex flex-col gap-8">
        {filteredSections.map((section) => {
          const colors = config.sectionColors[section.id] || {
            color: "#3B82F6",
            bg: "rgba(59,130,246,0.15)",
          };
          return (
            <div key={section.id}>
              <div className="flex items-center gap-2.5 mb-3 px-1">
                {config.sectionIcons[section.id] && (
                  <span className="flex items-center" style={{ color: colors.color }}>
                    {config.sectionIcons[section.id]()}
                  </span>
                )}
                <h2 className="text-base font-bold m-0" style={{ color: colors.color }}>
                  {section.name}
                </h2>
                <span className="text-xs text-slate-500">{section.items.length} 件</span>
              </div>
              <ItemGrid
                items={section.items}
                keyExtractor={(item: AnyItem) => item.id}
                renderItem={(item: AnyItem) => (
                  <SummaryCard
                    title={item.title}
                    description={item.summary}
                    tags={item.tags}
                    accentColor={colors.color}
                    sectionName={section.name}
                    onClick={() => openModal(item.id)}
                    tagColors={config.tagColors}
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
          message={`条件に一致する${config.itemLabel}はありません`}
          reducedMotion={reducedMotion}
        />
      )}

      {/* Footer */}
      <Footer />

      {/* Modal */}
      <AnimatePresence>
        {modalItemData && modalSection && (
          <DetailModal
            categoryId={categoryId}
            item={modalItemData}
            sectionName={modalSection.sectionName}
            accentColor={config.sectionColors[modalSection.sectionId]?.color || "#3B82F6"}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const QuickReference = (): React.JSX.Element => {
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const config = CATEGORY_CONFIGS[activeCategory];

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="クイックリファレンス"
          description={config.description}
          stats={[
            { value: config.sections.length, label: "カテゴリ" },
            { value: config.totalItems, label: config.itemLabel },
          ]}
          gradient={config.gradient}
        />

        {/* Category tabs (upper tier) */}
        <CategoryTabBar
          categories={CATEGORIES}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />

        {/* Category content (lower tier) - key forces remount */}
        <CategoryContent key={activeCategory} categoryId={activeCategory} />
      </div>
    </div>
  );
};

export default QuickReference;
