import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { SearchInput } from "~/components/search-input";

import { SECTIONS, TOTAL_STEPS, SECTION_COLORS, SECTION_ICONS } from "./constants";
import { StepCard } from "./step-card";
import { QuickStartPanel } from "./quick-start-panel";
import { SummaryPanel } from "./summary-panel";
import { TimelineSidebar } from "./timeline-sidebar";
import { MobileTimelineMarker } from "./mobile-timeline-marker";

export function meta(): Array<{ title?: string; name?: string; content?: string }> {
  return [
    { title: "Claude Code セットアップガイド" },
    { name: "description", content: "Claude Code のインストールから設定、ベストプラクティスまで" },
  ];
}

export default function SetupPage(): React.JSX.Element {
  const [query, setQuery] = useState("");
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);
  const reducedMotion = useReducedMotion();
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isScrollingRef = useRef(false);

  const lowerQuery = query.toLowerCase();

  const filteredSections = useMemo(() => {
    if (!query) return SECTIONS;
    return SECTIONS
      .map((section) => ({
        ...section,
        steps: section.steps.filter(
          (step) =>
            step.title.toLowerCase().includes(lowerQuery) ||
            step.description.toLowerCase().includes(lowerQuery) ||
            step.content.toLowerCase().includes(lowerQuery) ||
            step.code.some((c) => c.value.toLowerCase().includes(lowerQuery)) ||
            step.callouts.some((c) => c.text.toLowerCase().includes(lowerQuery))
        ),
      }))
      .filter((section) => section.steps.length > 0);
  }, [query, lowerQuery]);

  const filteredSectionIds = useMemo(
    () => new Set(filteredSections.map((s) => s.id)),
    [filteredSections]
  );

  const visibleStepCount = filteredSections.reduce((sum, s) => sum + s.steps.length, 0);

  // IntersectionObserver for scroll-based active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section-id");
            if (id) setActiveSectionId(id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    const refs = sectionRefs.current;
    refs.forEach((el) => observer.observe(el));

    return () => {
      refs.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleSectionClick = useCallback((id: string) => {
    const el = sectionRefs.current.get(id);
    if (!el) return;
    isScrollingRef.current = true;
    setActiveSectionId(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  }, []);

  const setSectionRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
    } else {
      sectionRefs.current.delete(id);
    }
  }, []);

  const toggleStep = useCallback((stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  }, []);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Header */}
        <PageHeader
          title="セットアップガイド"
          description="インストールから CLAUDE.md、フック、MCP、IDE 連携、ベストプラクティスまで。Claude Code を最大限に活用するためのステップバイステップガイド。"
          stats={[
            { value: SECTIONS.length, label: "セクション" },
            { value: TOTAL_STEPS, label: "ステップ" },
          ]}
          gradient={["rgba(139,92,246,0.08)", "rgba(16,185,129,0.05)"]}
        />

        {/* Hero cards: QuickStart + Summary */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col gap-4 mb-6"
        >
          <QuickStartPanel />
          <SummaryPanel />
        </motion.div>

        {/* Search */}
        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="mb-4"
        >
          <SearchInput value={query} onChange={setQuery} placeholder="ステップを検索..." />
        </motion.div>

        {/* Step count */}
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <span className="text-[14px] text-slate-500 font-medium">
            {visibleStepCount} / {TOTAL_STEPS} ステップ
          </span>
        </div>

        {/* Two-column layout: Timeline sidebar + Content */}
        <div className="flex gap-8">
          <TimelineSidebar
            sections={SECTIONS}
            activeSectionId={activeSectionId}
            onSectionClick={handleSectionClick}
            filteredSectionIds={filteredSectionIds}
            hasQuery={query.length > 0}
          />

          {/* Content area */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-8">
              {filteredSections.map((section, sectionIdx) => {
                const colors = SECTION_COLORS[section.id] || { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" };
                const globalIdx = SECTIONS.findIndex((s) => s.id === section.id);

                return (
                  <motion.section
                    key={section.id}
                    ref={(el) => setSectionRef(section.id, el)}
                    data-section-id={section.id}
                    className="scroll-mt-8"
                    initial={reducedMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: reducedMotion ? 0 : Math.min(sectionIdx * 0.05, 0.3) }}
                  >
                    {/* Mobile timeline marker */}
                    <MobileTimelineMarker index={globalIdx} section={section} />

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
                      <span className="text-xs text-slate-500">{section.description}</span>
                    </div>

                    {/* Step cards */}
                    <div className="flex flex-col gap-2.5">
                      <AnimatePresence mode="popLayout">
                        {section.steps.map((step, i) => (
                          <motion.div
                            key={step.id}
                            layout={!reducedMotion}
                            initial={reducedMotion ? false : { opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                            transition={{ duration: 0.2, delay: reducedMotion ? 0 : Math.min(i * 0.04, 0.4) }}
                          >
                            <StepCard
                              step={step}
                              accentColor={colors.color}
                              expanded={expandedSteps.has(step.id)}
                              onToggle={() => toggleStep(step.id)}
                              reducedMotion={reducedMotion}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.section>
                );
              })}
            </div>

            {/* Empty state */}
            {visibleStepCount === 0 && (
              <EmptyState message="条件に一致するステップはありません" reducedMotion={reducedMotion} />
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer>
          <p className="m-0 mb-1">
            <a
              href="https://docs.anthropic.com/en/docs/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 no-underline"
            >
              公式ドキュメント
            </a>
            {" | "}
            <a
              href="https://github.com/anthropics/claude-code"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 no-underline"
            >
              GitHub
            </a>
          </p>
          <p className="m-0 text-slate-500/50">
            Claude Code セットアップガイド
          </p>
        </Footer>
      </div>
    </div>
  );
}
