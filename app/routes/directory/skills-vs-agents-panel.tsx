import { SKILLS_VS_AGENTS } from "./constants";

export function SkillsVsAgentsPanel(): React.JSX.Element {
  return (
    <div className="bg-surface rounded-xl border border-slate-700 p-6">
      <div
        className="text-[13px] font-bold tracking-wide uppercase font-mono mb-5 flex items-center gap-2"
        style={{ color: "#C4B5FD" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <polyline points="17 11 19 13 23 9" />
        </svg>
        skills/ と agents/ の使い分け
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
        <div
          className="rounded-[10px]"
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            padding: "16px 18px",
            border: "1px solid rgba(103, 232, 249, 0.125)",
          }}
        >
          <div
            className="text-[13px] font-bold mb-2 font-mono"
            style={{ color: "#67E8F9" }}
          >
            skills/
          </div>
          <p
            className="text-xs text-slate-400 leading-[1.6] font-sans"
            style={{ margin: "0 0 10px" }}
          >
            {SKILLS_VS_AGENTS.skills.description}
          </p>
          <ul className="m-0 pl-4 flex flex-col gap-1">
            {SKILLS_VS_AGENTS.skills.characteristics.map(
              (c: string, i: number) => (
                <li
                  key={i}
                  className="text-[11px] leading-[1.6] text-slate-500 font-sans"
                >
                  {c}
                </li>
              ),
            )}
          </ul>
        </div>
        <div
          className="rounded-[10px]"
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            padding: "16px 18px",
            border: "1px solid rgba(196, 181, 253, 0.125)",
          }}
        >
          <div
            className="text-[13px] font-bold mb-2 font-mono"
            style={{ color: "#C4B5FD" }}
          >
            agents/
          </div>
          <p
            className="text-xs text-slate-400 leading-[1.6] font-sans"
            style={{ margin: "0 0 10px" }}
          >
            {SKILLS_VS_AGENTS.agents.description}
          </p>
          <ul className="m-0 pl-4 flex flex-col gap-1">
            {SKILLS_VS_AGENTS.agents.characteristics.map(
              (c: string, i: number) => (
                <li
                  key={i}
                  className="text-[11px] leading-[1.6] text-slate-500 font-sans"
                >
                  {c}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
