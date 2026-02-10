import { CheckIcon } from "~/components/icons";
import { COMMIT_GUIDE } from "./constants";

export function CommitGuidePanel(): React.JSX.Element {
  return (
    <div className="bg-surface rounded-xl border border-slate-700 p-6">
      <div
        className="text-[14px] font-bold tracking-wide uppercase font-mono mb-5 flex items-center gap-2"
        style={{ color: "#5EEAD4" }}
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
          <circle cx="12" cy="12" r="4" />
          <line x1="1.05" y1="12" x2="7" y2="12" />
          <line x1="17.01" y1="12" x2="22.96" y2="12" />
        </svg>
        コミット判断ガイド
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
        <div
          className="rounded-[10px]"
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            padding: "16px 18px",
            border: "1px solid rgba(110, 231, 183, 0.125)",
          }}
        >
          <div
            className="text-xs font-bold mb-3 flex items-center gap-1.5 font-mono"
            style={{ color: "#6EE7B7" }}
          >
            <CheckIcon width={14} height={14} />
            コミットする
          </div>
          <ul className="m-0 pl-4 flex flex-col gap-1">
            {COMMIT_GUIDE.commit.map((item, i) => (
              <li
                key={i}
                className="text-xs leading-[1.7] text-slate-400 font-sans"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div
          className="rounded-[10px]"
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            padding: "16px 18px",
            border: "1px solid rgba(252, 165, 165, 0.125)",
          }}
        >
          <div
            className="text-xs font-bold mb-3 flex items-center gap-1.5 font-mono"
            style={{ color: "#FCA5A5" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            コミットしない
          </div>
          <ul className="m-0 pl-4 flex flex-col gap-1">
            {COMMIT_GUIDE.noCommit.map((item, i) => (
              <li
                key={i}
                className="text-xs leading-[1.7] text-slate-400 font-sans"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
