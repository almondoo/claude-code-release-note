import { useState, useMemo, useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { InfoIcon, TerminalIcon } from "~/components/icons";
import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { TabBar } from "~/components/tab-bar";
import type { TabItem } from "~/components/tab-bar";

import type { Command, ModalData } from "./constants";
import {
  CATEGORIES,
  CATEGORY_ICONS,
  CLI_COMMANDS,
  CLI_FLAGS,
  CMD_CATEGORY_MAP,
  getCategoryColor,
  matchesQuery,
  POPULAR_COMMANDS,
  SHORTCUTS,
  TAB_DEFS,
  TOTAL_CLI,
  TOTAL_SLASH,
} from "./constants";
import { CommandCard } from "./command-card";
import { CLICard } from "./cli-card";
import { ShortcutCard } from "./shortcut-card";
import { DetailModal } from "./detail-modal";

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code コマンド一覧" },
    {
      name: "description",
      content: "Claude Code の全スラッシュコマンドと CLI オプションのリファレンス",
    },
  ];
}

function renderTabIcon(tab: TabItem): React.ReactNode {
  const def = TAB_DEFS.find((t) => t.id === tab.id);
  if (!def) return null;

  if (def.type === "slash-category" && CATEGORY_ICONS[tab.id]) {
    return <span className="flex items-center scale-[0.8]">{CATEGORY_ICONS[tab.id]()}</span>;
  }
  if (def.type === "cli") {
    return (
      <span className="flex items-center">
        <TerminalIcon />
      </span>
    );
  }
  if (def.type === "shortcuts") {
    return (
      <span className="flex items-center">
        <InfoIcon />
      </span>
    );
  }
  return null;
}

function getSlashCommands(activeTab: string): Command[] {
  if (activeTab === "popular") return POPULAR_COMMANDS;
  if (activeTab === "all") return CATEGORIES.flatMap((c) => c.commands);

  const category = CATEGORIES.find((c) => c.id === activeTab);
  return category ? category.commands : [];
}

function getCatInfo(activeTab: string, cmdName: string): { name: string; color: string } {
  if (activeTab === "all" || activeTab === "popular") {
    return CMD_CATEGORY_MAP.get(cmdName) ?? { name: "", color: getCategoryColor(activeTab) };
  }

  const category = CATEGORIES.find((c) => c.id === activeTab);
  return {
    name: category?.name ?? "",
    color: getCategoryColor(activeTab),
  };
}

export default function Commands(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("popular");
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const lowerQuery = query.toLowerCase();

  const isCLITab = activeTab === "cli";
  const isShortcutsTab = activeTab === "shortcuts";
  const isSlashTab = !isCLITab && !isShortcutsTab;

  const filteredSlashCommands = useMemo(() => {
    return getSlashCommands(activeTab).filter((cmd) =>
      matchesQuery([cmd.name, cmd.description, cmd.args, cmd.detail, cmd.whenToUse], lowerQuery),
    );
  }, [activeTab, lowerQuery]);

  const filteredCLICommands = useMemo(() => {
    return CLI_COMMANDS.filter((cmd) =>
      matchesQuery([cmd.name, cmd.description, cmd.detail, cmd.whenToUse], lowerQuery),
    );
  }, [lowerQuery]);

  const filteredCLIFlags = useMemo(() => {
    return CLI_FLAGS.filter((cmd) =>
      matchesQuery([cmd.name, cmd.description, cmd.detail, cmd.whenToUse], lowerQuery),
    );
  }, [lowerQuery]);

  const filteredShortcuts = useMemo(() => {
    return SHORTCUTS.filter((s) =>
      matchesQuery([s.key, s.description, s.detail, s.whenToUse], lowerQuery),
    );
  }, [lowerQuery]);

  let currentCount: number;
  if (isSlashTab) {
    currentCount = filteredSlashCommands.length;
  } else if (isCLITab) {
    currentCount = filteredCLICommands.length + filteredCLIFlags.length;
  } else {
    currentCount = filteredShortcuts.length;
  }

  const openModal = useCallback((data: ModalData) => {
    setModalData(data);
  }, []);

  const closeModal = useCallback(() => {
    setModalData(null);
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
          title="コマンド一覧"
          stats={[
            { value: TOTAL_SLASH, label: "スラッシュコマンド" },
            { value: TOTAL_CLI, label: "CLI オプション" },
            { value: SHORTCUTS.length, label: "ショートカット" },
          ]}
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
          <SearchInput value={query} onChange={setQuery} placeholder="コマンドを検索..." />
        </motion.div>

        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[14px] text-slate-500 font-medium">{currentCount} 件表示中</span>
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
                {isSlashTab &&
                  filteredSlashCommands.map((cmd, i) => {
                    const catInfo = getCatInfo(activeTab, cmd.name);
                    return (
                      <motion.div key={cmd.name} {...cardMotionProps(i)}>
                        <CommandCard
                          cmd={cmd}
                          accentColor={catInfo.color}
                          categoryName={catInfo.name}
                          onClick={() =>
                            openModal({
                              type: "command",
                              cmd,
                              categoryName: catInfo.name,
                              accentColor: catInfo.color,
                            })
                          }
                        />
                      </motion.div>
                    );
                  })}

                {isCLITab && (
                  <>
                    {filteredCLICommands.map((cmd, i) => (
                      <motion.div key={`cli-cmd-${cmd.name}`} {...cardMotionProps(i)}>
                        <CLICard
                          cmd={cmd}
                          kind="command"
                          onClick={() => openModal({ type: "cli", cmd, kind: "command" })}
                        />
                      </motion.div>
                    ))}
                    {filteredCLIFlags.map((cmd, i) => (
                      <motion.div
                        key={`cli-flag-${cmd.name}`}
                        {...cardMotionProps(filteredCLICommands.length + i)}
                      >
                        <CLICard
                          cmd={cmd}
                          kind="flag"
                          onClick={() => openModal({ type: "cli", cmd, kind: "flag" })}
                        />
                      </motion.div>
                    ))}
                  </>
                )}

                {isShortcutsTab &&
                  filteredShortcuts.map((s, i) => (
                    <motion.div key={s.key} {...cardMotionProps(i)}>
                      <ShortcutCard
                        shortcut={s}
                        onClick={() => openModal({ type: "shortcut", shortcut: s })}
                      />
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>

            {currentCount === 0 && (
              <EmptyState
                message="条件に一致するコマンドはありません"
                reducedMotion={reducedMotion}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <Footer />
      </div>

      <AnimatePresence>
        {modalData && (
          <DetailModal data={modalData} onClose={closeModal} reducedMotion={reducedMotion} />
        )}
      </AnimatePresence>
    </div>
  );
}
