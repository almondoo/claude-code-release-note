import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { BoltIcon } from "~/components/icons.js";
import { EmptyState } from "~/components/empty-state.js";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input.js";
import { TabBar } from "~/components/tab-bar";
import type { TabItem } from "~/components/tab-bar";

import {
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  PLUGIN_CATEGORY_MAP,
  TAB_DEFS,
  TOTAL,
} from "./constants";
import type { Plugin } from "./constants";
import { PluginCard } from "./plugin-card";
import { DetailModal } from "./detail-modal";
import { QuickStartPanel } from "./quick-start-panel";

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code 公式プラグイン一覧" },
    { name: "description", content: "Claude Code の公式プラグインの詳細と使い方" },
  ];
}

function renderTabIcon(tab: TabItem): React.ReactNode {
  const def = TAB_DEFS.find((t) => t.id === tab.id);
  if (!def) return null;
  if (def.type === "category" && CATEGORY_ICONS[tab.id]) {
    return <span className="flex items-center scale-[0.8]">{CATEGORY_ICONS[tab.id]()}</span>;
  }
  if (def.type === "quickstart") {
    return <span className="flex items-center"><BoltIcon width={14} height={14} /></span>;
  }
  return null;
}

export default function Plugins(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedPlugin, setSelectedPlugin] = useState<{ plugin: Plugin; accentColor: string } | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);

  // Track initial mount for stagger animations
  if (!hasMounted.current) {
    hasMounted.current = true;
  }

  const lowerQuery = query.toLowerCase();
  const isAllTab = activeTab === "all";
  const activeCategory = CATEGORIES.find((c) => c.id === activeTab);
  const isQuickStart = activeTab === "quickstart";

  const filteredPlugins = useMemo(() => {
    const plugins = isAllTab
      ? CATEGORIES.flatMap((c) => c.plugins)
      : activeCategory
        ? activeCategory.plugins
        : [];
    if (!query) return plugins;
    return plugins.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.displayName.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.detail.toLowerCase().includes(lowerQuery) ||
        p.whenToUse.toLowerCase().includes(lowerQuery) ||
        (p.binary && p.binary.toLowerCase().includes(lowerQuery))
    );
  }, [isAllTab, activeCategory, query, lowerQuery]);

  const openModal = useCallback((plugin: Plugin, accentColor: string) => {
    setSelectedPlugin({ plugin, accentColor });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPlugin(null);
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
      <div className="max-w-[1100px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="公式プラグイン"
          description="Anthropic が公式マーケットプレイスで提供するプラグイン。コードインテリジェンス、外部サービス連携、開発ワークフローを拡張します。"
          stats={[
            { value: TOTAL, label: "プラグイン" },
            { value: CATEGORIES.length, label: "カテゴリ" },
          ]}
          gradient={["rgba(6,182,212,0.08)", "rgba(16,185,129,0.05)"]}
        />

        {/* Tabs */}
        <TabBar
          tabs={TAB_DEFS}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          renderIcon={renderTabIcon}
          reducedMotion={reducedMotion}
        />

        {/* Search -- only for category tabs */}
        {!isQuickStart && (
          <motion.div
            initial={m ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mb-4"
          >
            <SearchInput value={query} onChange={setQuery} placeholder="プラグインを検索..." />
          </motion.div>
        )}

        {/* Tab content */}
        <AnimatePresence mode="popLayout">
          {isQuickStart ? (
            <motion.div
              key="quickstart"
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <QuickStartPanel />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Count */}
              <div className="flex items-center gap-2.5 mb-4 px-1">
                <span className="text-[13px] text-slate-500 font-medium">
                  {filteredPlugins.length} 件表示中
                </span>
              </div>

              {/* Card grid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
                <AnimatePresence mode="popLayout">
                  {filteredPlugins.map((plugin, i) => {
                    const color = isAllTab
                      ? (PLUGIN_CATEGORY_MAP.get(plugin.name)?.color || "#3B82F6")
                      : (CATEGORY_COLORS[activeTab]?.color || "#3B82F6");
                    return (
                      <motion.div
                        key={plugin.name}
                        layout={!reducedMotion}
                        initial={reducedMotion ? false : { opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.2, delay: reducedMotion ? 0 : Math.min(i * 0.04, 0.4) }}
                      >
                        <PluginCard
                          plugin={plugin}
                          accentColor={color}
                          onClick={() => openModal(plugin, color)}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Empty state */}
              {filteredPlugins.length === 0 && (
                <EmptyState message="条件に一致するプラグインはありません" reducedMotion={reducedMotion} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="text-center p-6 mt-6 text-slate-500 text-xs font-sans">
          <p className="m-0 mb-1">
            <a
              href="https://github.com/anthropics/claude-plugins-official"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 no-underline"
            >
              公式プラグインリポジトリ
            </a>
            {" | "}
            <a
              href="https://code.claude.com/docs/en/discover-plugins"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 no-underline"
            >
              プラグインドキュメント
            </a>
          </p>
          <p className="m-0 text-slate-500/50">
            /plugin コマンドから最新のプラグイン一覧を確認できます
          </p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedPlugin && (
          <DetailModal
            plugin={selectedPlugin.plugin}
            accentColor={selectedPlugin.accentColor}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
