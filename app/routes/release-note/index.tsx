import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { TAG_COLORS } from "~/components/badge";
import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { useL } from "~/i18n/localize";
import { dictFromMatches } from "~/i18n/meta";
import { useT } from "~/i18n/useT";

import { RELEASES, getTabDefs, TAG_ICONS, totalAll } from "./constants";
import { DetailModal } from "./detail-modal";
import { VersionCard } from "./version-card";

export const meta = ({
  matches,
}: {
  matches: readonly ({ data?: unknown } | undefined)[];
}): Array<{ title?: string; name?: string; content?: string }> => {
  const d = dictFromMatches(matches);
  return [
    { title: d.releaseNote.metaTitle },
    { name: "description", content: d.releaseNote.metaDescription },
  ];
};

const ReleaseNote = (): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [modalVersion, setModalVersion] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const tabsRef = useRef<HTMLDivElement>(null);
  const t = useT();
  const L = useL();

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  const closeModal = useCallback(() => setModalVersion(null), []);

  const tabDefs = getTabDefs(t);

  const filtered = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    return RELEASES.map((release) => ({
      ...release,
      items: release.items.filter((item) => {
        const tagMatch = activeTab === "all" || item.tags.includes(activeTab);
        const queryMatch = !query || L(item.t, item.t_en).toLowerCase().includes(lowerQuery);
        return tagMatch && queryMatch;
      }),
    })).filter((release) => release.items.length > 0);
  }, [activeTab, query, L]);

  const totalItems = filtered.reduce((sum, r) => sum + r.items.length, 0);

  const activeTabDef = tabDefs.find((tab) => tab.id === activeTab) ?? tabDefs[0];
  const accentColor = activeTabDef.color;

  const modalRelease = modalVersion ? RELEASES.find((r) => r.v === modalVersion) : null;

  const modalItems = modalRelease
    ? activeTab === "all"
      ? modalRelease.items
      : modalRelease.items.filter((item) => item.tags.includes(activeTab))
    : [];

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto p-8 px-4">
        {/* Header */}
        <PageHeader
          title={t.releaseNote.pageTitle}
          stats={[
            { value: RELEASES.length, label: t.releaseNote.statVersions },
            { value: totalAll, label: t.releaseNote.statChanges },
          ]}
          extraStats={
            <span className="font-mono text-xs">
              v{RELEASES[0]?.v} 〜 v{RELEASES[RELEASES.length - 1]?.v}
            </span>
          }
        />

        {/* Tab navigation */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          ref={tabsRef}
          className="flex gap-1.5 mb-3.5 overflow-x-auto py-1 scrollbar-none"
        >
          {tabDefs.map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.id !== "all" ? TAG_ICONS[tab.id] : null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-semibold cursor-pointer transition-all font-sans whitespace-nowrap shrink-0 ${
                  active ? "" : "hover:bg-surface-hover hover:text-slate-300"
                }`}
                style={{
                  border: `1px solid ${active ? tab.color + "60" : "#334155"}`,
                  background: active
                    ? (TAG_COLORS[tab.id]?.bg ?? "rgba(59, 130, 246, 0.25)")
                    : "#1E293B",
                  color: active ? tab.color : "#64748B",
                }}
              >
                {Icon && (
                  <span className="flex items-center">
                    <Icon />
                  </span>
                )}
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Search + count */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-3 items-center mb-[18px]"
        >
          <div className="flex-1">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={t.releaseNote.searchPlaceholder}
              accentColor={accentColor}
            />
          </div>
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap font-mono">
            {t.releaseNote.countSummary(filtered.length, totalItems)}
          </span>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
          <AnimatePresence mode="popLayout">
            {filtered.map((release, i) => (
              <motion.div
                key={release.v}
                layout={!reducedMotion}
                initial={m ? false : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={m ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                transition={{ duration: 0.25, delay: reducedMotion ? 0 : Math.min(i * 0.03, 0.3) }}
              >
                <VersionCard
                  version={release.v}
                  items={release.items}
                  accentColor={accentColor}
                  onClick={() => setModalVersion(release.v)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state */}
        <AnimatePresence>
          {filtered.length === 0 && (
            <EmptyState message={t.releaseNote.noResults} reducedMotion={reducedMotion} />
          )}
        </AnimatePresence>

        {/* Footer */}
        <Footer />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalVersion && modalRelease && (
          <DetailModal
            version={modalVersion}
            items={modalItems}
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReleaseNote;
