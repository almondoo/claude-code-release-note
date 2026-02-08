import { Link } from "react-router";

import { ChevronLeftIcon, ChevronRightIcon } from "~/components/icons";

export function NavButton({ to, label, direction }: { to: string; label: string; direction: "prev" | "next" }): React.JSX.Element {
  return (
    <Link
      to={`/version/${to}`}
      className={`nav-button flex items-center gap-2 py-2.5 px-4 rounded-lg bg-surface border border-slate-700 text-slate-400 no-underline text-[13px] font-sans transition-all ${
        direction === "next" ? "flex-row-reverse" : ""
      }`}
    >
      {direction === "prev" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      <div className={direction === "next" ? "text-right" : "text-left"}>
        <div className="text-[11px] text-slate-500 mb-0.5">
          {direction === "prev" ? "前のバージョン" : "次のバージョン"}
        </div>
        <div className="font-mono font-semibold">v{label}</div>
      </div>
    </Link>
  );
}
