import { BeforeAfterExamples } from "~/components/before-after-examples";
import type { BeforeAfterExample } from "~/components/before-after-examples";
import { CodeBlockView } from "~/components/code-block-view";
import { DetailModalShell } from "~/components/detail-modal";
import { HeaderTags } from "~/components/header-tags";
import { ParagraphList, renderInlineMarkdown } from "~/components/paragraph-list";
import { TipsList } from "~/components/tips-list";
import { useL } from "~/i18n/localize";
import { useT } from "~/i18n/useT";

import type { AnyItem, BPItem, PromptItem, HooksItem } from "./constants";
import { CATEGORY_CONFIGS } from "./constants";

// ---------------------------------------------------------------------------
// Helper: resolve section icon for a given category + item
// ---------------------------------------------------------------------------

const STAR_FALLBACK = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const BOLT_FALLBACK = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const resolveSectionIcon = (categoryId: string, itemId: string): React.JSX.Element => {
  const config = CATEGORY_CONFIGS[categoryId];
  const fallback = categoryId === "hooks" ? BOLT_FALLBACK : STAR_FALLBACK;
  return (
    config.sectionIcons[
      config.sections.find((s) => s.items.some((i) => i.id === itemId))?.id ?? ""
    ]?.() ?? fallback()
  );
};

// ---------------------------------------------------------------------------
// BPDetailContent (best-practices)
// ---------------------------------------------------------------------------

const BPDetailContent = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
  categoryId = "best-practices",
}: {
  item: BPItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
  categoryId?: string;
}) => {
  const t = useT();
  const L = useL();
  const bp = t.bestPractices;
  const sectionIcon = resolveSectionIcon(categoryId, item.id);
  const tagColors = CATEGORY_CONFIGS[categoryId].tagColors;

  const translatedExamples: BeforeAfterExample[] | undefined = item.examples?.map((ex) => ({
    strategy: L(ex.strategy, ex.strategy_en),
    detail: ex.detail !== undefined ? L(ex.detail, ex.detail_en) : undefined,
    before: L(ex.before, ex.before_en),
    after: L(ex.after, ex.after_en),
  }));

  const translatedTips = item.tips ? L(item.tips, item.tips_en) : undefined;
  const translatedInclude = item.include ? L(item.include, item.include_en) : undefined;
  const translatedExclude = item.exclude ? L(item.exclude, item.exclude_en) : undefined;

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="700px"
      icon={sectionIcon}
      headerContent={
        <>
          <h2 className="text-base font-bold text-slate-100 m-0 leading-snug">
            {L(item.title, item.title_en)}
          </h2>
          <p className="text-[14px] text-slate-300 mt-1.5 font-sans leading-[1.6] m-0">
            {L(item.summary, item.summary_en)}
          </p>
          <HeaderTags
            sectionName={sectionName}
            accentColor={accentColor}
            tags={item.tags}
            tagColors={tagColors}
          />
        </>
      }
    >
      {/* Content paragraphs */}
      <ParagraphList content={L(item.content, item.content_en)} />

      {/* Before/After examples table */}
      {translatedExamples && translatedExamples.length > 0 && (
        <BeforeAfterExamples examples={translatedExamples} />
      )}

      {/* Steps (workflow phases) */}
      {item.steps && item.steps.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            {bp.sectionPhase}
          </h3>
          <div className="flex flex-col gap-2.5">
            {item.steps.map((step, i) => {
              const phaseLabel = L(step.phase, step.phase_en);
              return (
                <div
                  key={i}
                  className="rounded-lg border border-slate-700 p-4 flex gap-3 items-start"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: accentColor + "18", color: accentColor }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-100 mb-1">{phaseLabel}</div>
                    <div className="text-[13px] text-slate-300 leading-relaxed mb-2">
                      {renderInlineMarkdown(L(step.description, step.description_en))}
                    </div>
                    <CodeBlockView
                      block={{ lang: "text", label: phaseLabel, value: step.example }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips list */}
      {translatedTips && translatedTips.length > 0 && <TipsList tips={translatedTips} />}

      {/* Code block */}
      {item.code && (
        <CodeBlockView block={{ lang: "text", label: bp.sectionCode, value: item.code }} />
      )}

      {/* Include/Exclude tables (for CLAUDE.md item) */}
      {translatedInclude && translatedExclude && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-green-500/20 p-4">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-green-400 font-mono m-0 mb-2.5">
              {bp.sectionInclude}
            </h4>
            <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
              {translatedInclude.map((inc, i) => (
                <li
                  key={i}
                  className="flex gap-1.5 items-start text-[13px] text-slate-300 leading-relaxed"
                >
                  <span className="text-green-400 shrink-0">+</span>
                  <span>{renderInlineMarkdown(inc)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-red-500/20 p-4">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-red-400 font-mono m-0 mb-2.5">
              {bp.sectionExclude}
            </h4>
            <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
              {translatedExclude.map((exc, i) => (
                <li
                  key={i}
                  className="flex gap-1.5 items-start text-[13px] text-slate-300 leading-relaxed"
                >
                  <span className="text-red-400 shrink-0">-</span>
                  <span>{renderInlineMarkdown(exc)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* CLAUDE.md locations */}
      {item.locations && item.locations.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-purple-300 font-mono m-0">
            {bp.sectionLocations}
          </h3>
          <div className="flex flex-col gap-1.5">
            {item.locations.map((loc, i) => (
              <div
                key={i}
                className="flex gap-3 items-start rounded-lg border border-slate-700 p-3"
              >
                <code className="font-mono text-[13px] text-purple-300 shrink-0 bg-purple-500/10 px-2 py-0.5 rounded">
                  {loc.path}
                </code>
                <span className="text-[13px] text-slate-300 leading-relaxed">
                  {renderInlineMarkdown(L(loc.description, loc.description_en))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Writer/Reviewer pattern */}
      {item.writerReviewer && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            {bp.sectionWriterReviewer}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-cyan-500/20 p-4">
              <h4 className="text-[12px] font-bold text-cyan-300 font-mono m-0 mb-2">
                {bp.sessionWriter}
              </h4>
              {L(item.writerReviewer.writer, item.writerReviewer.writer_en).map((w, i) => (
                <p key={i} className="m-0 mt-1.5 text-[13px] text-slate-300 leading-relaxed italic">
                  {renderInlineMarkdown(w)}
                </p>
              ))}
            </div>
            <div className="rounded-lg border border-orange-500/20 p-4">
              <h4 className="text-[12px] font-bold text-orange-300 font-mono m-0 mb-2">
                {bp.sessionReviewer}
              </h4>
              {L(item.writerReviewer.reviewer, item.writerReviewer.reviewer_en).map((r, i) => (
                <p key={i} className="m-0 mt-1.5 text-[13px] text-slate-300 leading-relaxed italic">
                  {renderInlineMarkdown(r)}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Anti-pattern fix */}
      {item.fix && (
        <div
          className="rounded-lg px-4 py-3 flex gap-3 items-start"
          style={{ background: "rgba(16, 185, 129, 0.08)", borderLeft: "3px solid #10B981" }}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider shrink-0 mt-0.5 font-mono text-green-400">
            Fix
          </span>
          <span className="text-[14px] text-slate-300 leading-relaxed font-sans">
            {renderInlineMarkdown(L(item.fix, item.fix_en))}
          </span>
        </div>
      )}
    </DetailModalShell>
  );
};

// ---------------------------------------------------------------------------
// PromptDetailContent (prompting)
// ---------------------------------------------------------------------------

const PromptDetailContent = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: PromptItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}) => {
  const t = useT();
  const L = useL();
  const bp = t.bestPractices;
  const sectionIcon = resolveSectionIcon("prompting", item.id);
  const tagColors = CATEGORY_CONFIGS["prompting"].tagColors;

  const translatedExamples: BeforeAfterExample[] | undefined = item.examples?.map((ex) => ({
    strategy: L(ex.strategy, ex.strategy_en),
    detail: ex.detail !== undefined ? L(ex.detail, ex.detail_en) : undefined,
    before: L(ex.before, ex.before_en),
    after: L(ex.after, ex.after_en),
  }));

  const translatedTips = item.tips ? L(item.tips, item.tips_en) : undefined;

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="700px"
      icon={sectionIcon}
      headerContent={
        <>
          <h2 className="text-base font-bold text-slate-100 m-0 leading-snug">
            {L(item.title, item.title_en)}
          </h2>
          <p className="text-[14px] text-slate-300 mt-1.5 font-sans leading-[1.6] m-0">
            {L(item.summary, item.summary_en)}
          </p>
          <HeaderTags
            sectionName={sectionName}
            accentColor={accentColor}
            tags={item.tags}
            tagColors={tagColors}
          />
        </>
      }
    >
      {/* Content paragraphs */}
      <ParagraphList content={L(item.content, item.content_en)} />

      {/* Before/After examples table */}
      {translatedExamples && translatedExamples.length > 0 && (
        <BeforeAfterExamples examples={translatedExamples} />
      )}

      {/* Tips list */}
      {translatedTips && translatedTips.length > 0 && <TipsList tips={translatedTips} />}

      {/* Code blocks (array of CodeBlock) */}
      {item.code && item.code.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-emerald-300 font-mono m-0">
            {bp.sectionSamplePrompt}
          </h3>
          <div className="flex flex-col gap-2.5">
            {item.code.map((block, i) => (
              <CodeBlockView
                key={i}
                block={{
                  lang: block.lang,
                  label: L(block.label, block.label_en),
                  value: block.value,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </DetailModalShell>
  );
};

// ---------------------------------------------------------------------------
// SkillDetailContent (skills)
// ---------------------------------------------------------------------------

const SkillDetailContent = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: BPItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}) => {
  const t = useT();
  const L = useL();
  const bp = t.bestPractices;
  const sectionIcon = resolveSectionIcon("skills", item.id);
  const tagColors = CATEGORY_CONFIGS["skills"].tagColors;

  const translatedExamples: BeforeAfterExample[] | undefined = item.examples?.map((ex) => ({
    strategy: L(ex.strategy, ex.strategy_en),
    detail: ex.detail !== undefined ? L(ex.detail, ex.detail_en) : undefined,
    before: L(ex.before, ex.before_en),
    after: L(ex.after, ex.after_en),
  }));

  const translatedTips = item.tips ? L(item.tips, item.tips_en) : undefined;

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="700px"
      icon={sectionIcon}
      headerContent={
        <>
          <h2 className="text-base font-bold text-slate-100 m-0 leading-snug">
            {L(item.title, item.title_en)}
          </h2>
          <p className="text-[14px] text-slate-300 mt-1.5 font-sans leading-[1.6] m-0">
            {L(item.summary, item.summary_en)}
          </p>
          <HeaderTags
            sectionName={sectionName}
            accentColor={accentColor}
            tags={item.tags}
            tagColors={tagColors}
          />
        </>
      }
    >
      {/* Content paragraphs */}
      <ParagraphList content={L(item.content, item.content_en)} />

      {/* Before/After examples table */}
      {translatedExamples && translatedExamples.length > 0 && (
        <BeforeAfterExamples examples={translatedExamples} />
      )}

      {/* Steps (workflow phases) */}
      {item.steps && item.steps.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            {bp.sectionPhase}
          </h3>
          <div className="flex flex-col gap-2.5">
            {item.steps.map((step, i) => {
              const phaseLabel = L(step.phase, step.phase_en);
              return (
                <div
                  key={i}
                  className="rounded-lg border border-slate-700 p-4 flex gap-3 items-start"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: accentColor + "18", color: accentColor }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-100 mb-1">{phaseLabel}</div>
                    <div className="text-[13px] text-slate-300 leading-relaxed mb-2">
                      {renderInlineMarkdown(L(step.description, step.description_en))}
                    </div>
                    <CodeBlockView
                      block={{ lang: "text", label: phaseLabel, value: step.example }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips list */}
      {translatedTips && translatedTips.length > 0 && <TipsList tips={translatedTips} />}

      {/* Code block */}
      {item.code && (
        <CodeBlockView block={{ lang: "text", label: bp.sectionCode, value: item.code }} />
      )}
    </DetailModalShell>
  );
};

// ---------------------------------------------------------------------------
// HooksDetailContent (hooks)
// ---------------------------------------------------------------------------

const HooksDetailContent = ({
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  item: HooksItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}) => {
  const t = useT();
  const L = useL();
  const bp = t.bestPractices;
  const sectionIcon = resolveSectionIcon("hooks", item.id);
  const tagColors = CATEGORY_CONFIGS["hooks"].tagColors;

  const translatedExamples: BeforeAfterExample[] | undefined = item.examples?.map((ex) => ({
    strategy: L(ex.strategy, ex.strategy_en),
    detail: ex.detail !== undefined ? L(ex.detail, ex.detail_en) : undefined,
    before: L(ex.before, ex.before_en),
    after: L(ex.after, ex.after_en),
  }));

  const translatedTips = item.tips ? L(item.tips, item.tips_en) : undefined;

  return (
    <DetailModalShell
      accentColor={accentColor}
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="700px"
      icon={sectionIcon}
      bodyClassName="p-6 overflow-y-auto flex-1 min-h-0 flex flex-col gap-5"
      headerContent={
        <>
          <h2 className="text-base font-bold text-slate-100 m-0 leading-snug">
            {L(item.title, item.title_en)}
          </h2>
          <p className="text-[14px] text-slate-300 mt-1.5 font-sans leading-[1.6] m-0">
            {L(item.summary, item.summary_en)}
          </p>
          <HeaderTags
            sectionName={sectionName}
            accentColor={accentColor}
            tags={item.tags}
            tagColors={tagColors}
          />
        </>
      }
    >
      {/* Content paragraphs */}
      <ParagraphList content={L(item.content, item.content_en)} />

      {/* Before/After examples */}
      {translatedExamples && translatedExamples.length > 0 && (
        <BeforeAfterExamples examples={translatedExamples} />
      )}

      {/* Steps (handler types / phases) */}
      {item.steps && item.steps.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-cyan-300 font-mono m-0">
            {bp.sectionDetail}
          </h3>
          <div className="flex flex-col gap-2.5">
            {item.steps.map((step, i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-700 p-4 flex gap-3 items-start"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: accentColor + "18", color: accentColor }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-100 mb-1">
                    <code className="font-mono text-[13px] bg-slate-700/50 px-1.5 py-0.5 rounded">
                      {L(step.phase, step.phase_en)}
                    </code>
                  </div>
                  <div className="text-[13px] text-slate-300 leading-relaxed mb-2">
                    {renderInlineMarkdown(L(step.description, step.description_en))}
                  </div>
                  <div className="text-[12px] text-slate-400 italic">
                    {L(step.example, step.example_en)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips list */}
      {translatedTips && translatedTips.length > 0 && <TipsList tips={translatedTips} />}

      {/* Single code block */}
      {item.code && (
        <div className="shrink-0">
          <CodeBlockView
            block={{
              lang: item.code.trimStart().startsWith("{") ? "json" : "bash",
              label: item.code.trimStart().startsWith("{") ? "settings.json" : bp.sectionScript,
              value: item.code,
            }}
          />
        </div>
      )}

      {/* Multiple code blocks */}
      {item.codeBlocks && item.codeBlocks.length > 0 && (
        <div className="flex flex-col gap-3">
          {item.codeBlocks.map((block, i) => (
            <CodeBlockView
              key={i}
              block={{
                lang: block.lang,
                label: L(block.label, block.label_en),
                value: block.value,
                recommended: block.recommended,
              }}
            />
          ))}
        </div>
      )}

      {/* Config locations */}
      {item.locations && item.locations.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <h3 className="text-[12px] font-bold uppercase tracking-wider text-purple-300 font-mono m-0">
            {bp.sectionLocations}
          </h3>
          <div className="flex flex-col gap-1.5">
            {item.locations.map((loc, i) => (
              <div
                key={i}
                className="flex gap-3 items-start rounded-lg border border-slate-700 p-3"
              >
                <code className="font-mono text-[13px] text-purple-300 shrink-0 bg-purple-500/10 px-2 py-0.5 rounded">
                  {loc.path}
                </code>
                <span className="text-[13px] text-slate-300 leading-relaxed">
                  {renderInlineMarkdown(L(loc.description, loc.description_en))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DetailModalShell>
  );
};

// ---------------------------------------------------------------------------
// Unified dispatcher
// ---------------------------------------------------------------------------

export const DetailModal = ({
  categoryId,
  item,
  sectionName,
  accentColor,
  onClose,
  reducedMotion,
}: {
  categoryId: string;
  item: AnyItem;
  sectionName: string;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}) => {
  switch (categoryId) {
    case "best-practices":
      return (
        <BPDetailContent
          item={item as BPItem}
          sectionName={sectionName}
          accentColor={accentColor}
          onClose={onClose}
          reducedMotion={reducedMotion}
        />
      );
    case "prompting":
      return (
        <PromptDetailContent
          item={item as PromptItem}
          sectionName={sectionName}
          accentColor={accentColor}
          onClose={onClose}
          reducedMotion={reducedMotion}
        />
      );
    case "skills":
      return (
        <SkillDetailContent
          item={item as BPItem}
          sectionName={sectionName}
          accentColor={accentColor}
          onClose={onClose}
          reducedMotion={reducedMotion}
        />
      );
    case "hooks":
      return (
        <HooksDetailContent
          item={item as HooksItem}
          sectionName={sectionName}
          accentColor={accentColor}
          onClose={onClose}
          reducedMotion={reducedMotion}
        />
      );
    case "dynamic-workflows":
      return (
        <BPDetailContent
          item={item as BPItem}
          sectionName={sectionName}
          accentColor={accentColor}
          onClose={onClose}
          reducedMotion={reducedMotion}
          categoryId="dynamic-workflows"
        />
      );
    default:
      return null;
  }
};
