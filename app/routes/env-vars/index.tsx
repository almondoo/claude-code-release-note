import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { TabBar } from "~/components/tab-bar";
import type { TabItem } from "~/components/tab-bar";

import type { EnvCategory, EnvVar } from "./constants";
import { CATEGORIES, CATEGORY_COLORS, TOTAL, getCategoryForVar } from "./constants";
import { DetailModal } from "./detail-modal";
import { EnvCard } from "./env-card";

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code 環境変数リファレンス" },
    {
      name: "description",
      content: "Claude Code の全環境変数の一覧と設定方法",
    },
  ];
}

const tabItems: TabItem[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  ...CATEGORIES.map((c) => ({
    id: c.id,
    label: c.name,
    color: CATEGORY_COLORS[c.id]?.color || "#3B82F6",
  })),
];

export default function EnvVars(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ envVar: EnvVar; category: EnvCategory } | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const lowerQuery = query.toLowerCase();
  const isAllTab = activeTab === "all";
  const activeCategory = CATEGORIES.find((c) => c.id === activeTab);

  const filteredVars = useMemo(() => {
    const vars = isAllTab
      ? CATEGORIES.flatMap((c) => c.vars)
      : activeCategory
        ? activeCategory.vars
        : [];
    return vars.filter(
      (v) =>
        !query ||
        v.name.toLowerCase().includes(lowerQuery) ||
        v.description.toLowerCase().includes(lowerQuery) ||
        v.detail.toLowerCase().includes(lowerQuery),
    );
  }, [isAllTab, activeCategory, query, lowerQuery]);

  const openModal = useCallback((envVar: EnvVar, category: EnvCategory) => {
    setSelected({ envVar, category });
  }, []);

  const closeModal = useCallback(() => {
    setSelected(null);
  }, []);

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
    setQuery("");
  }, []);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto py-8 px-4">
        <PageHeader
          title="Claude Code 環境変数リファレンス"
          description="Claude Code の動作を制御する全環境変数の一覧と設定方法"
          stats={[
            { value: TOTAL, label: "環境変数" },
            { value: CATEGORIES.length, label: "カテゴリ" },
          ]}
          gradient={["rgba(139,92,246,0.08)", "rgba(234,179,8,0.05)"]}
        />

        <TabBar
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          reducedMotion={reducedMotion}
        />

        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-4"
        >
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="変数名やキーワードで検索..."
          />
        </motion.div>

        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeTab}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeCategory && !isAllTab && (
              <div className="flex items-center gap-2.5 mb-4 px-1">
                <span className="text-[14px] text-slate-500 font-medium">
                  {filteredVars.length} / {activeCategory.vars.length} 件
                </span>
                <span className="text-xs text-slate-500 font-sans">
                  — {activeCategory.description}
                </span>
              </div>
            )}

            {isAllTab && (
              <div className="flex items-center gap-2.5 mb-4 px-1">
                <span className="text-[14px] text-slate-500 font-medium">
                  {filteredVars.length} / {TOTAL} 件
                </span>
              </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
              <AnimatePresence mode="popLayout">
                {filteredVars.map((v, i) => {
                  const category = isAllTab ? getCategoryForVar(v) : activeCategory!;
                  const color = CATEGORY_COLORS[category.id]?.color || "#3B82F6";
                  const bg = CATEGORY_COLORS[category.id]?.bg || "rgba(59,130,246,0.15)";
                  return (
                    <motion.div
                      key={v.name}
                      layout={!reducedMotion}
                      initial={reducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={
                        reducedMotion
                          ? undefined
                          : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }
                      }
                      transition={{
                        duration: 0.2,
                        delay: reducedMotion || hasMounted ? 0 : Math.min(i * 0.04, 0.4),
                      }}
                    >
                      <EnvCard
                        envVar={v}
                        categoryName={category.name}
                        accentColor={color}
                        categoryBg={bg}
                        onClick={() => openModal(v, category)}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredVars.length === 0 && (
              <EmptyState
                message="条件に一致する環境変数はありません"
                reducedMotion={reducedMotion}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <Footer />
      </div>

      <AnimatePresence>
        {selected && (
          <DetailModal
            envVar={selected.envVar}
            category={selected.category}
            accentColor={CATEGORY_COLORS[selected.category.id]?.color || "#3B82F6"}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
