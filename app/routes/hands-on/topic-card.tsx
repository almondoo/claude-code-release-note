import { Link } from "react-router";
import { motion, useReducedMotion } from "motion/react";

import {
  type TopicMeta,
  DIFFICULTY_COLORS,
  TAG_COLORS,
  TOPIC_ICONS,
} from "./constants";

interface TopicCardProps {
  topic: TopicMeta;
  index: number;
}

export function TopicCard({ topic, index }: TopicCardProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const diff = DIFFICULTY_COLORS[topic.difficulty];
  const IconRenderer = TOPIC_ICONS[topic.icon];

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: reducedMotion ? 0 : index * 0.1,
      }}
      className="h-full"
    >
      <Link
        to={`/hands-on/${topic.id}`}
        className="topic-card flex flex-col no-underline rounded-xl border border-slate-700 p-6 transition-all h-full"
        style={{ background: "rgba(15,23,42,0.6)" }}
      >
        {/* Icon + Difficulty */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg"
            style={{ background: diff.bg, color: diff.color }}
          >
            {IconRenderer ? <IconRenderer /> : null}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ color: diff.color, background: diff.bg }}
            >
              {diff.label}
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
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[16px] font-bold text-slate-100 m-0 mb-2 leading-snug">
          {topic.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-slate-400 m-0 mb-4 leading-relaxed flex-1">
          {topic.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {topic.tags.map((tag) => {
            const tc = TAG_COLORS[tag] || {
              color: "#94A3B8",
              bg: "rgba(100,116,139,0.15)",
            };
            return (
              <span
                key={tag}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                style={{ color: tc.color, background: tc.bg }}
              >
                {tag}
              </span>
            );
          })}
        </div>

        {/* Prerequisites */}
        {topic.prerequisites.length > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>前提: {topic.prerequisites.join(", ")}</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
