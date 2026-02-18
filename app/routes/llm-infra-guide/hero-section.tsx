import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import type { KeyStat } from "./constants";

interface HeroSectionProps {
  title: string;
  date: string;
  audience: string;
  premise: string;
  keyStats: KeyStat[];
}

function AnimatedCounter({
  value,
  prefix,
  unit,
  duration = 1500,
}: {
  value: number;
  prefix?: string;
  unit: string;
  duration?: number;
}) {
  const [current, setCurrent] = useState(0);
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (reducedMotion || hasAnimated.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrent(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [value, duration, reducedMotion]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-0.5">
      <span className="text-2xl md:text-3xl font-bold text-slate-100 font-mono tabular-nums">
        {prefix}
        {current.toLocaleString()}
        {unit === "%" ? "%" : ""}
      </span>
    </div>
  );
}

export function HeroSection({
  title,
  date,
  audience,
  premise,
  keyStats,
}: HeroSectionProps): React.JSX.Element {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-slate-700 px-6 py-10 bg-gradient-to-br from-slate-800 to-slate-900"
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(245,158,11,0.08), transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(99,102,241,0.06), transparent 60%)",
        }}
      />

      <div className="relative text-center">
        <div className="text-xs font-semibold text-slate-500 tracking-[3px] uppercase mb-3 font-mono">
          ENTERPRISE LLM INFRASTRUCTURE GUIDE
        </div>
        <h1 className="text-[25px] md:text-[29px] font-bold m-0 mb-2.5 text-slate-100 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-sm text-slate-400 m-0 mb-5 max-w-[600px] mx-auto leading-relaxed">
          {date} | {audience} | {premise}
        </p>

        {/* Animated stat counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-[700px] mx-auto mb-4">
          {keyStats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg"
              style={{ background: "rgba(30,41,59,0.5)" }}
            >
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix}
                unit={stat.unit}
                duration={1200 + i * 200}
              />
              <span className="text-[12px] text-slate-500 font-medium">
                {stat.unit !== "%" ? stat.unit : ""} {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
