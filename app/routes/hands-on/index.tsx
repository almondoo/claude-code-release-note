import { useState, useMemo } from "react";
import { useReducedMotion } from "motion/react";

import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";

import { TOPICS, TOPICS_DATA } from "./constants";
import { TopicCard } from "./topic-card";

// ── Meta ──────────────────────────────────────────────────────────────────

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "Claude Code ハンズオン" },
    {
      name: "description",
      content: TOPICS_DATA.meta.description,
    },
  ];
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function HandsOnHub(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const reducedMotion = useReducedMotion();

  const lowerQuery = query.toLowerCase();

  const filteredTopics = useMemo(() => {
    if (!query) return TOPICS;
    return TOPICS.filter(
      (t) =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
    );
  }, [query, lowerQuery]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title={TOPICS_DATA.meta.title}
          description={TOPICS_DATA.meta.description}
          stats={[{ value: TOPICS.length, label: "お題" }]}
          gradient={["rgba(99,102,241,0.08)", "rgba(168,85,247,0.05)"]}
        />

        {/* Search */}
        <div className="mb-6">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="お題を検索..."
            accentColor="#6366F1"
          />
        </div>

        {/* Count */}
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[14px] text-slate-500 font-medium">
            {filteredTopics.length} / {TOPICS.length} お題
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
          <EmptyState message="条件に一致するお題はありません" reducedMotion={reducedMotion} />
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
