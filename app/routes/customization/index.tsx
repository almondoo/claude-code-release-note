import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { TabBar } from "~/components/tab-bar";
import type { TabItem } from "~/components/tab-bar";

import type { CustomizationItem } from "./constants";
import { matchesQuery, TAB_COLORS, TAB_ICONS, TABS, TOTAL_ITEMS } from "./constants";
import { CustomizationCard } from "./customization-card";
import { DetailModal } from "./detail-modal";

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code カスタマイズガイド" },
    {
      name: "description",
      content: "スキル・MCP・フックで Claude Code を自分好みにカスタマイズする完全ガイド",
    },
  ];
}

const TAB_DEFS: TabItem[] = TABS.map((tab) => ({
  id: tab.id,
  label: tab.name,
  color: TAB_COLORS[tab.id] ?? "#94A3B8",
}));

function renderTabIcon(tab: TabItem): React.ReactNode {
  const Icon = TAB_ICONS[tab.id];
  if (!Icon) return null;
  return (
    <span className="flex items-center">
      <Icon />
    </span>
  );
}

export default function CustomizationPage(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>(TABS[0].id);
  const [modalItem, setModalItem] = useState<CustomizationItem | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const lowerQuery = query.toLowerCase();

  const activeTabDef = TABS.find((t) => t.id === activeTab) ?? TABS[0];
  const accentColor = TAB_COLORS[activeTab] ?? "#94A3B8";

  const filteredItems = useMemo(() => {
    return activeTabDef.items.filter((item) =>
      matchesQuery([item.title, item.description, item.content, ...item.tags], lowerQuery),
    );
  }, [activeTabDef, lowerQuery]);

  const openModal = useCallback((item: CustomizationItem) => {
    setModalItem(item);
  }, []);

  const closeModal = useCallback(() => {
    setModalItem(null);
  }, []);

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
    setQuery("");
  }, []);

  function cardMotionProps(index: number): Record<string, unknown> {
    return {
      layout: !reducedMotion,
      initial: reducedMotion ? false : hasMounted ? { opacity: 0 } : { opacity: 0, y: 15 },
      animate: { opacity: 1, y: 0 },
      exit: reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } },
      transition: {
        duration: 0.2,
        delay: reducedMotion || hasMounted ? 0 : Math.min(index * 0.04, 0.4),
      },
    };
  }

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        <PageHeader
          title="カスタマイズガイド"
          description="スキル・MCP・フックで Claude Code を自分好みにカスタマイズする。高度な機能を使いこなして開発ワークフローを自動化しましょう。"
          stats={[
            { value: TABS[0].items.length, label: "スキル" },
            { value: TABS[1].items.length, label: "MCP" },
            { value: TABS[2].items.length, label: "フック" },
            { value: TOTAL_ITEMS, label: "合計項目" },
          ]}
          gradient={["rgba(244,114,182,0.08)", "rgba(20,184,166,0.05)"]}
        />

        <TabBar
          tabs={TAB_DEFS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          renderIcon={renderTabIcon}
          reducedMotion={reducedMotion}
        />

        <motion.div
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-4"
        >
          <SearchInput value={query} onChange={setQuery} placeholder="検索..." />
        </motion.div>

        {activeTabDef.description && (
          <p className="text-[13px] text-slate-500 mb-3 px-1">{activeTabDef.description}</p>
        )}

        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[14px] text-slate-500 font-medium">{filteredItems.length} 件表示中</span>
        </div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((item, i) => (
                  <motion.div key={item.id} {...cardMotionProps(i)}>
                    <CustomizationCard
                      item={item}
                      accentColor={accentColor}
                      onClick={() => openModal(item)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredItems.length === 0 && (
              <EmptyState
                message="条件に一致する項目はありません"
                reducedMotion={reducedMotion}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <Footer />
      </div>

      <AnimatePresence>
        {modalItem && (
          <DetailModal
            item={modalItem}
            tabId={activeTab}
            accentColor={accentColor}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
