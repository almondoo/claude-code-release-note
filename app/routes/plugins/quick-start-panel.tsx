import { BoltIcon } from "~/components/icons.js";
import { QUICKSTART_STEPS } from "./constants";

export function QuickStartPanel(): React.JSX.Element {
  return (
    <div className="bg-surface rounded-xl border border-slate-700 p-6">
      <div className="text-[13px] font-bold tracking-wide uppercase font-mono mb-5 flex items-center gap-2 text-teal-300">
        <BoltIcon />
        クイックスタート
      </div>
      <div className="flex flex-col gap-4">
        {QUICKSTART_STEPS.map((step, i) => (
          <div key={i} className="flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-mono shrink-0 bg-teal-500/15 text-teal-300">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-semibold text-slate-100">{step.title}</span>
                <code className="font-mono text-[11px] rounded-sm px-1.5 py-px bg-teal-500/15 text-teal-300">
                  {step.cmd}
                </code>
              </div>
              <span className="text-[13px] text-slate-400 font-sans leading-relaxed">
                {step.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
