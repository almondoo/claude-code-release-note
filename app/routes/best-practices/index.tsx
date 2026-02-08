import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { TabBar } from "~/components/tab-bar";
import type { TabItem } from "~/components/tab-bar";

import {
  SECTIONS,
  TOTAL_ITEMS,
  SECTION_COLORS,
  SECTION_ICONS,
  TAB_DEFS,
  ITEM_SECTION_MAP,
} from "./constants";
import { ItemCard } from "./item-card";
import { DetailModal } from "./detail-modal";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code ベストプラクティス" },
    { name: "description", content: "Claude Code を最大限に活用するためのヒントとパターン" },
  ];
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

function renderTabIcon(tab: TabItem): React.ReactNode {
  if (SECTION_ICONS[tab.id]) {
    return <span className="flex items-center scale-[0.8]">{SECTION_ICONS[tab.id]()}</span>;
  }
  return null;
}

export default function BestPractices(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [modalItemId, setModalItemId] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);

  if (!hasMounted.current) {
    hasMounted.current = true;
  }

  const lowerQuery = query.toLowerCase();
  const isAllTab = activeTab === "all";
  const activeSection = SECTIONS.find((s) => s.id === activeTab);

  const filteredSections = useMemo(() => {
    const sections = isAllTab ? SECTIONS : activeSection ? [activeSection] : [];
    if (!query) return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.title.toLowerCase().includes(lowerQuery) ||
            item.summary.toLowerCase().includes(lowerQuery) ||
            item.content.toLowerCase().includes(lowerQuery) ||
            item.tags.some((t) => t.toLowerCase().includes(lowerQuery))
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [isAllTab, activeSection, query, lowerQuery]);

  const visibleItemCount = filteredSections.reduce((sum, s) => sum + s.items.length, 0);

  const openModal = useCallback((itemId: string) => setModalItemId(itemId), []);
  const closeModal = useCallback(() => setModalItemId(null), []);

  const modalItem = modalItemId
    ? SECTIONS.flatMap((s) => s.items).find((i) => i.id === modalItemId) ?? null
    : null;
  const modalSection = modalItemId ? ITEM_SECTION_MAP.get(modalItemId) : null;

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
    setQuery("");
  }, []);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="ベストプラクティス"
          description="環境設定から並列セッションでのスケーリングまで、Claude Code を最大限に活用するためのヒントとパターン。"
          stats={[
            { value: SECTIONS.length, label: "カテゴリ" },
            { value: TOTAL_ITEMS, label: "プラクティス" },
          ]}
          gradient={["rgba(99,102,241,0.08)", "rgba(16,185,129,0.05)"]}
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
          <span className="text-[13px] text-slate-500 font-medium">
            {visibleItemCount} / {TOTAL_ITEMS} プラクティス
          </span>
        </div>

        {/* Section cards */}
        <div className="flex flex-col gap-8">
          {filteredSections.map((section) => {
            const colors = SECTION_COLORS[section.id] || { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" };
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
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
                  <AnimatePresence mode="popLayout">
                    {section.items.map((item, i) => (
                      <motion.div
                        key={item.id}
                        layout={!reducedMotion}
                        initial={reducedMotion ? false : { opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.2, delay: reducedMotion ? 0 : Math.min(i * 0.04, 0.4) }}
                      >
                        <ItemCard
                          item={item}
                          accentColor={colors.color}
                          sectionName={section.name}
                          onClick={() => openModal(item.id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {visibleItemCount === 0 && (
          <EmptyState message="条件に一致するプラクティスはありません" reducedMotion={reducedMotion} />
        )}

        {/* Footer */}
        <Footer />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalItem && modalSection && (
          <DetailModal
            item={modalItem}
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
