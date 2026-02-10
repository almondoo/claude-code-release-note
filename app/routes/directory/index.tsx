import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { InfoIcon, LightbulbIcon } from "~/components/icons";
import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { TabBar } from "~/components/tab-bar";
import type { TabItem } from "~/components/tab-bar";

import type { Entry, Section } from "./constants";
import {
  SECTION_COLORS,
  SECTION_ICONS,
  SECTIONS,
  SPECIAL_TABS,
  TAB_DEFS,
  TOTAL,
  getSectionForEntry,
} from "./constants";
import { CommitGuidePanel } from "./commit-guide-panel";
import { DetailModal } from "./detail-modal";
import { EntryCard } from "./entry-card";
import { PrecedencePanel } from "./precedence-panel";
import { SkillsVsAgentsPanel } from "./skills-vs-agents-panel";

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "Claude Code ディレクトリ構成ガイド" },
    {
      name: "description",
      content:
        "Claude Code の設定ファイル・ディレクトリ構成のベストプラクティスガイド",
    },
  ];
}

const tabItems: TabItem[] = TAB_DEFS.map((t) => ({
  id: t.id,
  label: t.shortLabel,
  color: t.color,
}));

function renderTabIcon(tab: TabItem): React.ReactNode {
  const def = TAB_DEFS.find((t) => t.id === tab.id);
  if (!def) return null;
  if (def.type === "section" && SECTION_ICONS[tab.id]) {
    return <span className="flex items-center scale-[0.8]">{SECTION_ICONS[tab.id]()}</span>;
  }
  if (def.type === "info") {
    return <span className="flex items-center"><InfoIcon /></span>;
  }
  return null;
}

export default function Directory(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: Entry;
    section: Section;
  } | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const lowerQuery = query.toLowerCase();

  const isAllTab = activeTab === "all";
  const activeSection = SECTIONS.find((s) => s.id === activeTab);

  const filteredEntries = useMemo(() => {
    const entries = isAllTab
      ? SECTIONS.flatMap((s) => s.entries)
      : activeSection
        ? activeSection.entries
        : [];
    return entries.filter(
      (e) =>
        !query ||
        e.path.toLowerCase().includes(lowerQuery) ||
        e.name.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery) ||
        e.detail.toLowerCase().includes(lowerQuery) ||
        e.usage.toLowerCase().includes(lowerQuery),
    );
  }, [isAllTab, activeSection, query, lowerQuery]);

  const isInfoTab = SPECIAL_TABS.includes(
    activeTab as (typeof SPECIAL_TABS)[number],
  );

  const openModal = useCallback((entry: Entry, section: Section) => {
    setSelectedEntry({ entry, section });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedEntry(null);
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
        {/* Header */}
        <PageHeader
          title="ディレクトリ構成ガイド"
          description="設定ファイルの配置場所・使い方・ベストプラクティスを網羅したガイド"
          stats={[
            { value: TOTAL, label: "エントリ" },
            { value: SECTIONS.length, label: "セクション" },
          ]}
          gradient={["rgba(139,92,246,0.08)", "rgba(6,182,212,0.05)"]}
        />

        {/* Tabs */}
        <TabBar
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          renderIcon={renderTabIcon}
          reducedMotion={reducedMotion}
        />

        {/* Best practices -- only for section tabs */}
        {!isInfoTab && activeSection && activeSection.bestPractices.length > 0 && (
          <motion.div
            initial={m ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            className="mb-4"
          >
            <div
              className="rounded-xl border flex gap-3"
              style={{
                padding: "14px 18px",
                background: `${SECTION_COLORS[activeSection.id]?.bg || "rgba(59, 130, 246, 0.08)"}`,
                borderColor: `${SECTION_COLORS[activeSection.id]?.color || "#3B82F6"}25`,
              }}
            >
              <div
                className="shrink-0 mt-0.5"
                style={{ color: SECTION_COLORS[activeSection.id]?.color || "#3B82F6" }}
              >
                <LightbulbIcon width={16} height={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[12px] font-bold tracking-wide uppercase font-mono mb-2"
                  style={{ color: SECTION_COLORS[activeSection.id]?.color || "#3B82F6" }}
                >
                  ベストプラクティス
                </div>
                <ul className="m-0 pl-4 flex flex-col gap-1">
                  {activeSection.bestPractices.map((tip, i) => (
                    <li
                      key={i}
                      className="text-xs leading-[1.7] text-slate-400 font-sans"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search -- only for section tabs */}
        {!isInfoTab && (
          <motion.div
            initial={m ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mb-4"
          >
            <SearchInput value={query} onChange={setQuery} placeholder="ファイル名やキーワードで検索..." />
          </motion.div>
        )}

        {/* Tab content */}
        <AnimatePresence mode="popLayout">
          {isInfoTab ? (
            <motion.div
              key={activeTab}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "precedence" && <PrecedencePanel />}
              {activeTab === "commit-guide" && <CommitGuidePanel />}
              {activeTab === "skills-agents" && <SkillsVsAgentsPanel />}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Section description */}
              {activeSection && !isAllTab && (
                <div className="flex items-center gap-2.5 mb-4 px-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background:
                        SECTION_COLORS[activeSection.id]?.bg ||
                        "rgba(59, 130, 246, 0.25)",
                      color:
                        SECTION_COLORS[activeSection.id]?.color || "#3B82F6",
                    }}
                  >
                    {SECTION_ICONS[activeSection.id]?.()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <code
                        className="text-xs text-slate-500 font-mono bg-surface rounded"
                        style={{ padding: "2px 8px" }}
                      >
                        {activeSection.basePath}
                      </code>
                      <span className="text-xs text-slate-500">
                        {filteredEntries.length} /{" "}
                        {activeSection.entries.length} エントリ
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-sans">
                      {activeSection.description}
                    </span>
                  </div>
                </div>
              )}

              {isAllTab && (
                <div className="flex items-center gap-2.5 mb-4 px-1">
                  <span className="text-[14px] text-slate-500 font-medium">
                    {filteredEntries.length} / {TOTAL} エントリ
                  </span>
                </div>
              )}

              {/* Card grid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry, i) => {
                    const section = isAllTab ? getSectionForEntry(entry) : activeSection!;
                    const color = SECTION_COLORS[section.id]?.color || "#3B82F6";
                    return (
                      <motion.div
                        key={`${section.id}-${entry.path}`}
                        layout={!reducedMotion}
                        initial={reducedMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={
                          reducedMotion
                            ? undefined
                            : {
                                opacity: 0,
                                scale: 0.96,
                                transition: { duration: 0.15 },
                              }
                        }
                        transition={{
                          duration: 0.2,
                          delay:
                            reducedMotion || hasMounted.current
                              ? 0
                              : Math.min(i * 0.04, 0.4),
                        }}
                      >
                        <EntryCard
                          entry={entry}
                          accentColor={color}
                          onClick={() => openModal(entry, section)}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Empty state */}
              {filteredEntries.length === 0 && (
                <EmptyState message="条件に一致するエントリはありません" reducedMotion={reducedMotion} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <DetailModal
            entry={selectedEntry.entry}
            section={selectedEntry.section}
            accentColor={
              SECTION_COLORS[selectedEntry.section.id]?.color || "#3B82F6"
            }
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
