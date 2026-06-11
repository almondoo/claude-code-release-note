import { Link } from "react-router";

import { ChevronLeftIcon, ChevronRightIcon } from "~/components/icons";
import { useT } from "~/i18n/useT";

export const NavButton = ({
  to,
  label,
  direction,
}: {
  to: string;
  label: string;
  direction: "prev" | "next";
}): React.JSX.Element => {
  const t = useT();
  return (
    <Link
      to={`/version/${to}`}
      className={`nav-button flex items-center gap-2 py-2.5 px-4 rounded-lg bg-surface border border-slate-700 text-slate-300 no-underline text-[14px] font-sans transition-all ${
        direction === "next" ? "flex-row-reverse" : ""
      }`}
    >
      {direction === "prev" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      <div className={direction === "next" ? "text-right" : "text-left"}>
        <div className="text-[12px] text-slate-500 mb-0.5">
          {direction === "prev" ? t.versionDetail.prevVersion : t.versionDetail.nextVersion}
        </div>
        <div className="font-mono font-semibold">v{label}</div>
      </div>
    </Link>
  );
};
