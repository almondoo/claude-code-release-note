import { useState, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { BoltIcon } from "~/components/icons.js";
import { EmptyState } from "~/components/empty-state.js";
import { ItemGrid } from "~/components/item-grid";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input.js";
import { TabBar } from "~/components/tab-bar";
import type { TabItem } from "~/components/tab-bar";
import { usePageState } from "~/hooks/usePageState";

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
    return (
      <span className="flex items-center">
        <BoltIcon width={14} height={14} />
      </span>
    );
  }
  return null;
}

export default function Plugins(): React.JSX.Element {
  const {
    query,
    setQuery,
    activeTab,
    handleTabChange,
    filteredItems: filteredPlugins,
  } = usePageState<Plugin>({
    sections: CATEGORIES.map((c) => ({ id: c.id, name: c.name, items: c.plugins })),
    searchFields: (p) => [
      p.name,
      p.displayName,
      p.description,
      p.detail,
      p.whenToUse,
      ...(p.binary ? [p.binary] : []),
    ],
  });

  // Custom modal state (plugin + color pair)
  const [selectedPlugin, setSelectedPlugin] = useState<{
    plugin: Plugin;
    accentColor: string;
  } | null>(null);
  const reducedMotion = useReducedMotion();

  const isQuickStart = activeTab === "quickstart";
  const isAllTab = activeTab === "all";

  const openModal = useCallback((plugin: Plugin, accentColor: string) => {
    setSelectedPlugin({ plugin, accentColor });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPlugin(null);
  }, []);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
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
                <span className="text-[14px] text-slate-500 font-medium">
                  {filteredPlugins.length} 件表示中
                </span>
              </div>

              {/* Card grid */}
              <ItemGrid
                items={filteredPlugins}
                keyExtractor={(plugin) => plugin.name}
                renderItem={(plugin) => {
                  const color = isAllTab
                    ? PLUGIN_CATEGORY_MAP.get(plugin.name)?.color || "#3B82F6"
                    : CATEGORY_COLORS[activeTab]?.color || "#3B82F6";
                  return (
                    <PluginCard
                      plugin={plugin}
                      accentColor={color}
                      onClick={() => openModal(plugin, color)}
                    />
                  );
                }}
                reducedMotion={reducedMotion}
              />

              {/* Empty state */}
              {filteredPlugins.length === 0 && (
                <EmptyState
                  message="条件に一致するプラグインはありません"
                  reducedMotion={reducedMotion}
                />
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
