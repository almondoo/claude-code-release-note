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

import type { Entry } from "./constants";
import {
  SECTIONS,
  TOTAL_ITEMS,
  SECTION_COLORS,
  SECTION_ICONS,
  TAB_DEFS,
  ITEM_SECTION_MAP,
  TAG_COLORS,
  RECOMMEND_CONFIG,
  VCS_CONFIG,
  getItemId,
  getVcsKey,
} from "./constants";
import { DetailModal } from "./detail-modal";

export const meta = (): Array<{
  title?: string;
  name?: string;
  content?: string;
}> => {
  return [
    { title: "Claude Code 設定ガイド" },
    {
      name: "description",
      content: "Claude Code の設定ファイル・ディレクトリ構成のベストプラクティスガイド",
    },
  ];
};

const renderTabIcon = (tab: TabItem): React.ReactNode => {
  if (SECTION_ICONS[tab.id]) {
    return <span className="flex items-center scale-[0.8]">{SECTION_ICONS[tab.id]()}</span>;
  }
  return null;
};

const getEntryTags = (entry: Entry): string[] => {
  const tags: string[] = [];
  tags.push(RECOMMEND_CONFIG[entry.recommended].label);
  tags.push(VCS_CONFIG[getVcsKey(entry.vcs)].label);
  return tags;
};

const Directory = (): React.JSX.Element => {
  const {
    query,
    setQuery,
    activeTab,
    handleTabChange,
    filteredSections,
    modalItem: modalItemId,
    openModal,
    closeModal,
  } = usePageState<Entry>({
    sections: SECTIONS.map((s) => ({ id: s.id, name: s.name, items: s.entries })),
    searchFields: (e) => [e.path, e.name, e.description, e.detail, e.usage],
  });
  const reducedMotion = useReducedMotion();

  const visibleItemCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  // Modal resolution
  const modalEntry = modalItemId
    ? (() => {
        for (const s of SECTIONS) {
          for (const e of s.entries) {
            if (getItemId(s.id, e.path) === modalItemId) return e;
          }
        }
        return null;
      })()
    : null;
  const modalSectionInfo = modalItemId ? ITEM_SECTION_MAP.get(modalItemId) : null;
  const modalSection = modalSectionInfo
    ? (SECTIONS.find((s) => s.id === modalSectionInfo.sectionId) ?? null)
    : null;

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto py-8 px-4">
        {/* Header */}
        <PageHeader
          title="Claude Code 設定ガイド"
          description="設定ファイルの配置場所・使い方・ベストプラクティスを網羅したガイド"
          stats={[
            { value: SECTIONS.length, label: "セクション" },
            { value: TOTAL_ITEMS, label: "エントリ" },
          ]}
          gradient={["rgba(139,92,246,0.08)", "rgba(6,182,212,0.05)"]}
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
            placeholder="ファイル名やキーワードで検索..."
          />
        </motion.div>

        {/* Count */}
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[14px] text-slate-500 font-medium">
            {visibleItemCount} / {TOTAL_ITEMS} エントリ
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
                  keyExtractor={(entry) => getItemId(section.id, entry.path)}
                  renderItem={(entry) => (
                    <SummaryCard
                      title={entry.name}
                      description={entry.description}
                      tags={getEntryTags(entry)}
                      accentColor={colors.color}
                      sectionName={section.name}
                      onClick={() => openModal(getItemId(section.id, entry.path))}
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
            message="条件に一致するエントリはありません"
            reducedMotion={reducedMotion}
          />
        )}

        <Footer />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalEntry && modalSection && (
          <DetailModal
            entry={modalEntry}
            section={modalSection}
            accentColor={SECTION_COLORS[modalSection.id]?.color || "#3B82F6"}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Directory;
