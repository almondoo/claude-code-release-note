import { useMemo } from "react";
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
  PHASES,
  PHASE_COLORS,
  TAB_DEFS,
  TAB_SECTION_MAP,
  ITEM_SECTION_MAP,
  TAG_COLORS,
} from "./constants";
import { SummaryCard } from "~/components/summary-card";
import { DetailModal } from "./detail-modal";

export const meta = (): Array<{ title?: string; name?: string; content?: string }> => {
  return [
    { title: "Claude Code セットアップガイド" },
    {
      name: "description",
      content:
        "導入から活用、カスタマイズまで。Claude Code を始めるためのステップバイステップガイド。",
    },
  ];
};

const renderTabIcon = (tab: TabItem): React.ReactNode => {
  if (SECTION_ICONS[tab.id]) {
    return <span className="flex items-center scale-[0.8]">{SECTION_ICONS[tab.id]()}</span>;
  }
  return null;
};

const SetupPage = (): React.JSX.Element => {
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
    tabSectionMap: TAB_SECTION_MAP,
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

  const groupedByPhase = useMemo(() => {
    const groups = new Map<number, typeof filteredSections>();
    for (const section of filteredSections) {
      const sectionData = SECTIONS.find((s) => s.id === section.id);
      const phase = sectionData?.phase ?? 1;
      if (!groups.has(phase)) groups.set(phase, []);
      groups.get(phase)!.push(section);
    }
    return groups;
  }, [filteredSections]);

  const showPhaseHeaders = activeTab === "all" || activeTab.startsWith("phase-");

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="セットアップガイド"
          description="導入から活用、カスタマイズまで。3つのフェーズで Claude Code を使いこなそう。"
          stats={[
            { value: PHASES.length, label: "フェーズ" },
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

        {/* Section cards grouped by phase */}
        <div className="flex flex-col gap-8">
          {Array.from(groupedByPhase.entries()).map(([phaseId, sections]) => {
            const phaseInfo = PHASES.find((p) => p.id === phaseId);
            const phaseColor = PHASE_COLORS[phaseId];
            return (
              <div key={phaseId}>
                {/* Phase heading */}
                {showPhaseHeaders && phaseInfo && (
                  <div
                    className="mb-4 px-4 py-3 rounded-lg border"
                    style={{
                      borderColor: phaseColor?.color + "30",
                      background: phaseColor?.bg,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: phaseColor?.color }}>
                        Phase {phaseId}: {phaseInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 m-0">{phaseInfo.description}</p>
                  </div>
                )}

                {/* Sections and cards */}
                {sections.map((section) => {
                  const colors = SECTION_COLORS[section.id] || {
                    color: "#3B82F6",
                    bg: "rgba(59,130,246,0.15)",
                  };
                  const sectionData = SECTIONS.find((s) => s.id === section.id);
                  const badge = sectionData ? `${sectionData.phase}-${sectionData.order}` : "";
                  return (
                    <div key={section.id} className="mb-6">
                      <div className="flex items-center gap-2.5 mb-3 px-1">
                        <div
                          className="w-7 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                          style={{
                            background: colors.bg,
                            border: `2px solid ${colors.color}`,
                            color: colors.color,
                          }}
                        >
                          {badge}
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
                      <ItemGrid
                        items={section.items}
                        keyExtractor={(item) => item.id}
                        renderItem={(item) => (
                          <SummaryCard
                            title={item.title}
                            description={item.description}
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
};

export default SetupPage;
