import { useState, useMemo } from "react";
import { useReducedMotion } from "motion/react";

import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";
import { dictFromMatches } from "~/i18n/meta";
import { useT } from "~/i18n/useT";

import { TOPICS, TOPICS_DATA } from "./constants";
import { TopicCard } from "./topic-card";

// ── Meta ──────────────────────────────────────────────────────────────────

export const meta = ({
  matches,
}: {
  matches: readonly ({ data?: unknown } | undefined)[];
}): Array<{
  title?: string;
  name?: string;
  content?: string;
}> => {
  const d = dictFromMatches(matches);
  return [
    { title: d.handsOn.metaTitle },
    {
      name: "description",
      content: TOPICS_DATA.meta.description,
    },
  ];
};

// ── Main Page ─────────────────────────────────────────────────────────────

const HandsOnHub = (): React.JSX.Element => {
  const t = useT();
  const [query, setQuery] = useState("");
  const reducedMotion = useReducedMotion();

  const lowerQuery = query.toLowerCase();

  const filteredTopics = useMemo(() => {
    if (!query) return TOPICS;
    return TOPICS.filter(
      (topic) =>
        topic.title.toLowerCase().includes(lowerQuery) ||
        topic.description.toLowerCase().includes(lowerQuery) ||
        topic.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
  }, [query, lowerQuery]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title={TOPICS_DATA.meta.title}
          description={TOPICS_DATA.meta.description}
          stats={[{ value: TOPICS.length, label: t.handsOn.statLabel }]}
          gradient={["rgba(99,102,241,0.08)", "rgba(168,85,247,0.05)"]}
        />

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={t.handsOn.searchPlaceholder}
            accentColor="#6366F1"
          />
        </div>

        {/* Count */}
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[14px] text-slate-500 font-medium">
            {t.handsOn.countSummary(filteredTopics.length, TOPICS.length)}
          </span>
        </div>

        {/* Topic Cards */}
        {filteredTopics.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5">
            {filteredTopics.map((topic, i) => (
              <TopicCard key={topic.id} topic={topic} index={i} />
            ))}
          </div>
        ) : (
          <EmptyState message={t.handsOn.noResults} reducedMotion={reducedMotion} />
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default HandsOnHub;
