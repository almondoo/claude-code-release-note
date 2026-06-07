import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";
import { TabBar } from "~/components/tab-bar";
import { dictFromMatches } from "~/i18n/meta";
import { useL } from "~/i18n/localize";
import { useT } from "~/i18n/useT";

import { ACCENT, META, SECTIONS, getTabDefs } from "./constants";
import { RenderBlock } from "./section-renderer";

// ── Meta ───────────────────────────────────────────────────────────────────

export const meta = ({
  matches,
}: {
  matches: readonly ({ data?: unknown } | undefined)[];
}): Array<{ title?: string; name?: string; content?: string }> => {
  const d = dictFromMatches(matches);
  return [
    { title: d.workflows.metaTitle },
    {
      name: "description",
      content: d.workflows.metaDescription,
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
}): React.JSX.Element => {
  const L = useL();
  return (
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
          {L(section.title, section.title_en)}
        </h2>
        {section.description && (
          <p className="text-[14px] text-slate-400 m-0">
            {L(section.description, section.description_en)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {section.blocks.map((block, i) => (
          <RenderBlock key={i} block={block} />
        ))}
      </div>
    </section>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────

const WorkflowsPage = (): React.JSX.Element => {
  const t = useT();
  const L = useL();
  const tabDefs = getTabDefs(t);
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
          title={L(META.title, META.title_en)}
          description={L(META.premise, META.premise_en)}
          stats={META.keyStats.map((s) => ({ value: s.value, label: L(s.label, s.label_en) }))}
          gradient={["rgba(224,115,77,0.10)", "rgba(224,115,77,0.05)"]}
        />

        {/* Body constrained for comfortable vertical reading */}
        <div className="max-w-[860px] mx-auto">
          {/* Anchor-jump TabBar */}
          <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm py-2 -mx-4 px-4 mb-6">
            <TabBar
              tabs={tabDefs}
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
            <p className="m-0 mb-1 text-[12px] text-slate-500">{t.workflows.footerDate}</p>
            <p className="m-0 text-slate-500/50">{t.workflows.footerCredit}</p>
          </Footer>
        </div>
      </div>
    </div>
  );
};

export default WorkflowsPage;
