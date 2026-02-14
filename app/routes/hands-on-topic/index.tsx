import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Link, useParams, Navigate } from "react-router";

import { Footer } from "~/components/footer";
import { ArrowLeftIcon } from "~/components/icons";

import { TOPIC_MAP, DIFFICULTY_COLORS, type Approach } from "./constants";
import { StepRenderer, IntroBlockRenderer } from "./step-renderer";

// ── Meta ──────────────────────────────────────────────────────────────────

export function meta({
  params,
}: {
  params: { topic: string };
}): Array<{ title?: string; name?: string; content?: string }> {
  const topic = TOPIC_MAP[params.topic];
  return [
    {
      title: `${topic?.title ?? "ハンズオン"} - Claude Code ハンズオン`,
    },
  ];
}

// ── Approach Tab Bar ──────────────────────────────────────────────────────

function ApproachTabs({
  approaches,
  activeId,
  onSelect,
}: {
  approaches: Approach[];
  activeId: string;
  onSelect: (id: string) => void;
}): React.JSX.Element {
  return (
    <div className="mb-8">
      <div
        className="flex rounded-xl overflow-hidden border border-slate-700"
        style={{ background: "rgba(15,23,42,0.6)" }}
      >
        {approaches.map((a) => {
          const isActive = a.id === activeId;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onSelect(a.id)}
              className="flex-1 py-4 px-5 text-left transition-all border-none cursor-pointer"
              style={{
                background: isActive
                  ? "rgba(99,102,241,0.12)"
                  : "transparent",
                borderRight:
                  a !== approaches[approaches.length - 1]
                    ? "1px solid rgba(51,65,85,0.5)"
                    : "none",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: isActive ? "#6366F1" : "#475569",
                  }}
                />
                <span
                  className="text-[14px] font-bold"
                  style={{
                    color: isActive ? "#E2E8F0" : "#94A3B8",
                  }}
                >
                  {a.label}
                </span>
              </div>
              <p
                className="text-[12px] m-0 ml-4"
                style={{ color: isActive ? "#94A3B8" : "#64748B" }}
              >
                {a.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function HandsOnTopic(): React.JSX.Element {
  const { topic: topicId } = useParams();
  const reducedMotion = useReducedMotion();

  const topic = topicId ? TOPIC_MAP[topicId] : undefined;

  const [activeApproachId, setActiveApproachId] = useState(
    () => topic?.approaches?.[0]?.id ?? "",
  );

  if (!topic) {
    return <Navigate to="/hands-on" replace />;
  }

  const diff = DIFFICULTY_COLORS[topic.difficulty];
  const accentColor = diff?.color ?? "#6366F1";

  const hasApproaches = topic.approaches && topic.approaches.length > 0;
  const activeApproach = hasApproaches
    ? topic.approaches!.find((a) => a.id === activeApproachId) ??
      topic.approaches![0]
    : null;

  const steps = activeApproach ? activeApproach.steps : (topic.steps ?? []);
  const stepCount = hasApproaches
    ? topic.approaches!.reduce((sum, a) => Math.max(sum, a.steps.length), 0)
    : steps.length;

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[900px] mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <motion.div
          initial={m ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <Link
            to="/hands-on"
            className="back-link inline-flex items-center gap-1.5 text-slate-500 no-underline text-[14px] font-sans py-1.5 px-3 rounded-md transition-all"
          >
            <ArrowLeftIcon />
            ハンズオン一覧
          </Link>
        </motion.div>

        {/* Topic Header */}
        <motion.div
          initial={m ? false : { opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-10 rounded-xl border border-slate-700 p-6 relative overflow-hidden"
          style={{ background: "rgba(15,23,42,0.6)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, ${diff?.bg ?? "rgba(99,102,241,0.08)"}, transparent 60%)`,
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span
                className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ color: diff?.color, background: diff?.bg }}
              >
                {diff?.label}
              </span>
              <span
                className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                style={{
                  color: "#94A3B8",
                  background: "rgba(100,116,139,0.12)",
                }}
              >
                {topic.estimatedTime}
              </span>
              <span className="text-[11px] text-slate-500">
                {stepCount} ステップ
                {hasApproaches &&
                  ` × ${topic.approaches!.length} アプローチ`}
              </span>
            </div>
            <h1 className="text-[24px] font-bold text-slate-100 m-0 mb-2 leading-snug">
              {topic.title}
            </h1>
          </div>
        </motion.div>

        {/* Intro (shared content before tabs) */}
        {topic.intro && topic.intro.length > 0 && (
          <motion.div
            initial={m ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 flex flex-col gap-4"
          >
            {topic.intro.map((block, i) => (
              <IntroBlockRenderer key={i} block={block} />
            ))}
          </motion.div>
        )}

        {/* Approach Tabs */}
        {hasApproaches && (
          <ApproachTabs
            approaches={topic.approaches!}
            activeId={activeApproach!.id}
            onSelect={setActiveApproachId}
          />
        )}

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeApproach?.id ?? "default"}
            initial={reducedMotion ? false : { opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-10"
          >
            {steps.map((step, i) => (
              <StepRenderer
                key={step.id}
                step={step}
                index={i}
                accentColor={accentColor}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Common Tips */}
        {topic.commonTips && topic.commonTips.length > 0 && (
          <motion.div
            initial={m ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: reducedMotion ? 0 : 0.1 }}
            className="rounded-xl border border-slate-700 p-6 mb-8"
            style={{ background: "rgba(249,115,22,0.04)" }}
          >
            {topic.commonTips.map((tip, ti) => (
              <div key={ti}>
                <h2 className="text-[16px] font-bold text-slate-100 m-0 mb-4 flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="9" y1="18" x2="15" y2="18" />
                    <line x1="10" y1="22" x2="14" y2="22" />
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                  </svg>
                  {tip.title}
                </h2>
                <div className="flex flex-col gap-3">
                  {tip.blocks.map((block, bi) => (
                    <IntroBlockRenderer key={bi} block={block} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Summary */}
        <motion.div
          initial={m ? false : { opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: reducedMotion ? 0 : 0.2 }}
          className="rounded-xl border border-slate-700 p-6 mb-8"
          style={{ background: "rgba(16,185,129,0.04)" }}
        >
          <h2 className="text-[16px] font-bold text-slate-100 m-0 mb-4 flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            このハンズオンで学んだこと
          </h2>
          <ul className="text-[14px] text-slate-400 leading-[1.8] m-0 pl-5 flex flex-col gap-2">
            {topic.summary.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </motion.div>

        {/* Back to hub */}
        <div className="text-center mb-6">
          <Link
            to="/hands-on"
            className="back-link inline-flex items-center gap-1.5 text-slate-500 no-underline text-[14px] font-sans py-2 px-4 rounded-md transition-all border border-slate-700"
          >
            <ArrowLeftIcon />
            ハンズオン一覧へ戻る
          </Link>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
