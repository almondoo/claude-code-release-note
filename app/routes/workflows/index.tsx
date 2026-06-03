import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { TabBar } from "~/components/tab-bar";

import { ACCENT, META, SECTIONS, TAB_DEFS } from "./constants";
import { RenderBlock } from "./section-renderer";

// ── Meta ───────────────────────────────────────────────────────────────────

export const meta = (): Array<{ title?: string; name?: string; content?: string }> => {
  return [
    { title: "動的ワークフロー（Dynamic Workflows）— Claude Code" },
    {
      name: "description",
      content:
        "Claude Code がタスク専用のハーネスをその場で書き、複数のサブエージェントを協調させる動的ワークフローの解説。",
    },
  ];
};

// ── Section component ──────────────────────────────────────────────────────

const WorkflowSection = ({
  section,
  sectionRef,
}: {
  section: (typeof SECTIONS)[number];
  sectionRef: (el: HTMLElement | null) => void;
}): React.JSX.Element => (
  <section
    ref={sectionRef}
    data-section-id={section.id}
    id={section.id}
    className="scroll-mt-24"
    aria-labelledby={`section-title-${section.id}`}
  >
    <div className="mb-6">
      <h2
        id={`section-title-${section.id}`}
        className="text-base font-bold text-slate-100 m-0 mb-2"
        style={{ color: ACCENT }}
      >
        {section.title}
      </h2>
      {section.description && (
        <p className="text-[14px] text-slate-400 m-0">{section.description}</p>
      )}
    </div>

    <div className="flex flex-col gap-5">
      {section.blocks.map((block, i) => (
        <RenderBlock key={i} block={block} />
      ))}
    </div>
  </section>
);

// ── Main page ──────────────────────────────────────────────────────────────

const WorkflowsPage = (): React.JSX.Element => {
  const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0]?.id ?? "overview");
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isScrollingRef = useRef(false);
  const reducedMotion = useReducedMotion();

  // IntersectionObserver: track active section on scroll
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
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );

    const refs = sectionRefs.current;
    refs.forEach((el) => observer.observe(el));
    return () => {
      refs.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleSectionClick = useCallback(
    (id: string) => {
      const el = sectionRefs.current.get(id);
      if (!el) return;
      isScrollingRef.current = true;
      setActiveSectionId(id);
      el.scrollIntoView({
        behavior: reducedMotion ? "instant" : "smooth",
        block: "start",
      });
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
    },
    [reducedMotion],
  );

  const setSectionRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) sectionRefs.current.set(id, el);
      else sectionRefs.current.delete(id);
    },
    [],
  );

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Page header */}
        <PageHeader
          title={META.title}
          description={META.premise}
          stats={META.keyStats.map((s) => ({ value: s.value, label: s.label }))}
          gradient={["rgba(224,115,77,0.10)", "rgba(224,115,77,0.05)"]}
        />

        {/* Body constrained for comfortable vertical reading */}
        <div className="max-w-[860px] mx-auto">
          {/* Anchor-jump TabBar */}
          <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm py-2 -mx-4 px-4 mb-6">
            <TabBar
              tabs={TAB_DEFS}
              activeTab={activeSectionId}
              onTabChange={handleSectionClick}
              reducedMotion={reducedMotion}
            />
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-16">
            {SECTIONS.map((section) => (
              <WorkflowSection
                key={section.id}
                section={section}
                sectionRef={setSectionRef(section.id)}
              />
            ))}
          </div>

          {/* Footer */}
          <Footer>
            <p className="m-0 mb-1 text-[12px] text-slate-500">
              本ページの情報は2026年6月時点のもの（リサーチプレビュー段階）です。仕様は変更される可能性があります。
            </p>
            <p className="m-0 text-slate-500/50">
              動的ワークフロー（Dynamic Workflows）— Claude Code
            </p>
          </Footer>
        </div>
      </div>
    </div>
  );
};

export default WorkflowsPage;
