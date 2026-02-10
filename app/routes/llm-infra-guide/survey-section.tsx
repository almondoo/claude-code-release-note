import { motion, useReducedMotion } from "motion/react";
import { SECTION_THEMES, SECTION_ICONS } from "./constants";

interface SurveySectionProps {
  id: string;
  title: string;
  description: string;
  index: number;
  sectionRef: (el: HTMLElement | null) => void;
  children: React.ReactNode;
  skipMotion?: boolean;
}

export function SurveySection({ id, title, description, index, sectionRef, children, skipMotion }: SurveySectionProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();
  const theme = SECTION_THEMES[id] || { color: "#3B82F6", bg: "rgba(59,130,246,0.12)" };
  const Icon = SECTION_ICONS[id];

  const motionProps = skipMotion ? {} : {
    initial: reducedMotion ? false : { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.4, delay: reducedMotion ? 0 : Math.min(index * 0.03, 0.2) },
  };

  return (
    <motion.section
      ref={sectionRef}
      data-section-id={id}
      className="scroll-mt-8"
      {...motionProps}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: theme.bg, color: theme.color }}
        >
          {Icon ? Icon() : <span className="text-xs font-bold">{index + 1}</span>}
        </div>
        <div className="flex flex-col min-w-0">
          <h2 className="text-[17px] font-bold m-0" style={{ color: theme.color }}>
            {title}
          </h2>
          <span className="text-[12px] text-slate-500 mt-0.5">{description}</span>
        </div>
      </div>

      {/* Content — generous spacing between blocks */}
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </motion.section>
  );
}
