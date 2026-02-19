import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { redirect } from "react-router";

export function loader() {
  return redirect("/");
}

import { Footer } from "~/components/footer";
import { PageHeader } from "~/components/page-header";

import { DiagramBlock } from "./architecture-diagram";
import { ChapterDivider, ChapterWrapper } from "./chapter-wrapper";
import { CodeBlock } from "./code-block";
import {
  CHAPTERS,
  SECTION_THEMES,
  SURVEY,
  type ContentBlock,
  type GlossaryData,
  type SurveySection,
} from "./constants";
import { DataTable } from "./data-table";
import { DecisionFlow } from "./decision-flow";
import { GlossaryPanel, GlossaryTrigger } from "./glossary-panel";
import { parseGlossaryLinks } from "./glossary-utils";
import { HighlightBox } from "./highlight-box";
import { InfraDiagram } from "./infra-diagram";
import { ProgressIndicator } from "./progress-indicator";
import { ClientOnly, ReactFlowDiagram } from "./rf-client";
import { RF_DIAGRAMS } from "./rf-diagrams";
import { RoadmapTimeline } from "./roadmap-timeline";
import { ScoreMatrix, SecurityCombos } from "./score-matrix";
import { MobileSectionMarker, SectionNav } from "./section-nav";
import { Checklist, SourceList } from "./source-list";
import { StatCard } from "./stat-card";
import { StepGuide } from "./step-guide";
import { SurveySection as SurveySectionWrapper } from "./survey-section";

import glossaryRaw from "~/data/llm-infra-guide/llm-glossary.json";

const GLOSSARY: GlossaryData = glossaryRaw as unknown as GlossaryData;

// ── Meta ──────────────────────────────────────────────────────────────────

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "エンタープライズLLM基盤の構築ガイド" },
    {
      name: "description",
      content: "アーキテクチャ設計から運用まで — エンタープライズLLM基盤の実践的構築ガイド",
    },
  ];
}

// ── Block Renderer ────────────────────────────────────────────────────────

function renderBlock(
  block: ContentBlock,
  key: number,
  accentColor?: string,
  glossaryTerms?: GlossaryData["terms"],
  onTermClick?: (termId: string) => void,
): React.ReactNode {
  const gl = (text: string) =>
    glossaryTerms && onTermClick ? parseGlossaryLinks(text, glossaryTerms, onTermClick) : text;

  switch (block.type) {
    case "text":
      return (
        <p key={key} className="text-[14px] text-slate-400 leading-[1.8] m-0">
          {gl(block.content)}
        </p>
      );

    case "table":
      return (
        <DataTable
          key={key}
          caption={block.caption}
          headers={block.headers}
          rows={block.rows}
          footnote={block.footnote}
          accentColor={accentColor}
        />
      );

    case "list": {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          key={key}
          className="text-[14px] text-slate-400 leading-[1.8] m-0 pl-5 flex flex-col gap-2.5"
        >
          {block.items.map((item, i) => (
            <li key={i}>{gl(item)}</li>
          ))}
        </ListTag>
      );
    }

    case "stats":
      return (
        <div key={key} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {block.items.map((item, i) => (
            <StatCard
              key={i}
              label={item.label}
              value={item.value}
              trend={item.trend}
              accentColor={accentColor}
            />
          ))}
        </div>
      );

    case "highlight":
      return (
        <HighlightBox
          key={key}
          variant={block.variant}
          title={block.title}
          content={gl(block.content)}
        />
      );

    case "subsection":
      return (
        <div key={key} className="flex flex-col gap-4 pt-2">
          <h3
            className="text-[14px] font-semibold text-slate-300 m-0 px-1 border-l-2 pl-3"
            style={{ borderColor: accentColor || "#475569" }}
          >
            {block.title}
          </h3>
          {block.blocks.map((b, i) => renderBlock(b, i, accentColor, glossaryTerms, onTermClick))}
        </div>
      );

    case "diagram":
      return <DiagramBlock key={key} data={block.data} />;

    case "scoreMatrix":
      return <ScoreMatrix key={key} axes={block.axes} products={block.products} />;

    case "securityCombos":
      return <SecurityCombos key={key} combos={block.combos} />;

    case "flowchart":
      return <DecisionFlow key={key} nodes={block.nodes} />;

    case "timeline":
      return <RoadmapTimeline key={key} phases={block.phases} staffing={block.staffing} />;

    case "sources":
      return <SourceList key={key} categories={block.categories} />;

    case "checklist":
      return <Checklist key={key} categories={block.categories} />;

    case "codeBlock":
      return (
        <CodeBlock
          key={key}
          language={block.language}
          title={block.title}
          code={block.code}
          filename={block.filename}
          caption={block.caption}
        />
      );

    case "stepGuide":
      return (
        <StepGuide
          key={key}
          title={block.title}
          steps={block.steps}
          accentColor={accentColor}
          renderBlock={(b, i, c) => renderBlock(b, i, c, glossaryTerms, onTermClick)}
        />
      );

    case "infraDiagram":
      return (
        <InfraDiagram
          key={key}
          variant={block.variant}
          title={block.title}
          caption={block.caption}
          zones={block.zones}
          connections={block.connections}
          stages={block.stages}
          provider={block.provider}
          layers={block.layers}
        />
      );

    case "reactFlowDiagram": {
      const diagram = RF_DIAGRAMS[block.diagramId];
      if (!diagram) return null;
      return (
        <ClientOnly
          key={key}
          fallback={
            <div
              className="rounded-xl border border-slate-700 flex items-center justify-center text-slate-600 text-[13px]"
              style={{
                background: "rgba(15,23,42,0.6)",
                height: diagram.height || 500,
              }}
            >
              構成図を読み込み中...
            </div>
          }
        >
          <ReactFlowDiagram
            nodes={diagram.nodes}
            edges={diagram.edges}
            title={diagram.title}
            caption={diagram.caption}
            height={diagram.height}
          />
        </ClientOnly>
      );
    }

    default:
      return null;
  }
}

// ── Lazy Section ──────────────────────────────────────────────────────────

function LazySection({
  section,
  index,
  sectionRef,
  glossaryTerms,
  onTermClick,
  chapterTitle,
  skipMotion,
}: {
  section: SurveySection;
  index: number;
  sectionRef: (el: HTMLElement | null) => void;
  glossaryTerms: GlossaryData["terms"];
  onTermClick: (termId: string) => void;
  chapterTitle?: string;
  skipMotion?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => {
      observer.unobserve(el);
    };
  }, []);

  const theme = SECTION_THEMES[section.id];
  const accentColor = theme?.color || "#3B82F6";

  return (
    <div ref={sentinelRef}>
      <MobileSectionMarker index={index} sectionId={section.id} chapterTitle={chapterTitle} />
      <SurveySectionWrapper
        id={section.id}
        title={section.title}
        description={section.description}
        index={index}
        sectionRef={sectionRef}
        skipMotion={skipMotion}
      >
        {visible ? (
          section.blocks.map((block, i) =>
            renderBlock(block, i, accentColor, glossaryTerms, onTermClick),
          )
        ) : (
          <div
            className="h-[100px] rounded-lg animate-pulse"
            style={{ background: "rgba(30,41,59,0.3)" }}
          />
        )}
      </SurveySectionWrapper>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function LlmSurveyPage(): React.JSX.Element {
  const [activeSectionId, setActiveSectionId] = useState(SURVEY.sections[0]?.id || "");
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const isScrollingRef = useRef(false);
  const reducedMotion = useReducedMotion();

  const glossaryTerms = GLOSSARY.terms;
  const glossaryCategories = GLOSSARY.categories;

  // Section title lookup for chapter wrapper tabs
  const sectionTitles = useMemo(() => {
    const map: Record<string, string> = {};
    SURVEY.sections.forEach((s) => {
      map[s.id] = s.title;
    });
    return map;
  }, []);

  // Section lookup by ID
  const sectionMap = useMemo(() => {
    const map = new Map<string, { section: SurveySection; index: number }>();
    SURVEY.sections.forEach((s, i) => map.set(s.id, { section: s, index: i }));
    return map;
  }, []);

  const handleTermClick = useCallback((termId: string) => {
    setActiveTermId(termId);
    setGlossaryOpen(true);
  }, []);

  const handleGlossaryClose = useCallback(() => {
    setGlossaryOpen(false);
  }, []);

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
      <ProgressIndicator />

      <div className="max-w-[1400px] mx-auto px-4 py-8">
        {/* Page Header with nav links */}
        <PageHeader
          title="エンタープライズLLM基盤の構築ガイド"
          description="アーキテクチャ設計から運用まで — 5チャプター、18セクション、インフラ構成図、ステップバイステップ手順、用語集を網羅した実践ガイド。"
          stats={[
            { value: CHAPTERS.length, label: "チャプター" },
            { value: SURVEY.sections.length, label: "セクション" },
            { value: "2026.2", label: "更新時点" },
            { value: GLOSSARY.terms.length, label: "用語解説" },
          ]}
          gradient={["rgba(245,158,11,0.08)", "rgba(99,102,241,0.06)"]}
        />

        {/* Three-column layout: Nav + Content + Glossary */}
        <div className="flex gap-8">
          <SectionNav
            sections={SURVEY.sections}
            activeSectionId={activeSectionId}
            onSectionClick={handleSectionClick}
          />

          {/* Content area — chapter-based rendering */}
          <div className="flex-1 min-w-0">
            {CHAPTERS.map((chapter, chIdx) => (
              <div key={chapter.id}>
                {chIdx > 0 && <ChapterDivider color={chapter.color} />}

                <ChapterWrapper chapter={chapter} sectionTitles={sectionTitles}>
                  {chapter.sectionIds.map((sid) => {
                    const entry = sectionMap.get(sid);
                    if (!entry) return <div key={sid} />;
                    return (
                      <LazySection
                        key={sid}
                        section={entry.section}
                        index={entry.index}
                        sectionRef={setSectionRef(sid)}
                        glossaryTerms={glossaryTerms}
                        onTermClick={handleTermClick}
                        chapterTitle={chapter.title}
                        skipMotion={chapter.id === "ch-overview"}
                      />
                    );
                  })}
                </ChapterWrapper>
              </div>
            ))}
          </div>

          {/* Glossary panel (right column on xl, overlay/bottomsheet on smaller) */}
          <GlossaryPanel
            terms={glossaryTerms}
            categories={glossaryCategories}
            isOpen={glossaryOpen}
            onClose={handleGlossaryClose}
            activeTermId={activeTermId}
            onTermClick={handleTermClick}
          />
        </div>

        {/* Glossary floating trigger (hidden on xl) */}
        <GlossaryTrigger onClick={() => setGlossaryOpen(true)} termCount={glossaryTerms.length} />

        {/* Footer */}
        <Footer>
          <p className="m-0 mb-1 text-[12px] text-slate-500">
            本ガイドの情報は2026年2月時点の調査に基づいています。最終的な意思決定の前に各ベンダーの最新情報を直接確認してください。
          </p>
          <p className="m-0 text-slate-500/50">エンタープライズLLM基盤の構築ガイド</p>
        </Footer>
      </div>
    </div>
  );
}
