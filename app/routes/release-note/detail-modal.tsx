import { Link } from "react-router";

import { Badge } from "~/components/badge";
import { DetailModalShell } from "~/components/detail-modal";

import type { ReleaseItem } from "./constants";
import { VERSION_DETAILS_AVAILABLE } from "./constants";
import { computeSortedTagCounts, TagCountBadge } from "./version-card";

export function DetailModal({
  version,
  items,
  onClose,
  reducedMotion,
}: {
  version: string;
  items: ReleaseItem[];
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const hasDetails = VERSION_DETAILS_AVAILABLE.has(version);
  const sortedTags = computeSortedTagCounts(items);

  return (
    <DetailModalShell
      accentColor="#3B82F6"
      onClose={onClose}
      reducedMotion={reducedMotion}
      maxWidth="680px"
      icon={<span className="text-[18px]">📋</span>}
      bodyClassName="overflow-y-auto flex-1 px-6 pt-4 pb-6"
      headerContent={
        <>
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-[23px] font-bold text-slate-100 tracking-tight">
              v{version}
            </span>
            <span className="font-mono text-xs text-slate-500 bg-slate-900 px-2 py-[2px] rounded">
              {items.length}件の変更
            </span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {sortedTags.map(([tag, count]) => (
              <TagCountBadge key={tag} tag={tag} count={count} />
            ))}
          </div>
        </>
      }
    >
      {/* Items list */}
      <div className="flex flex-col gap-[2px]">
        {items.map((item, i) => (
          <div
            key={i}
            className="modal-item rounded-lg transition-colors"
            style={{ padding: "10px 12px" }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex gap-[3px] flex-wrap">
                {item.tags.map((tag) => (
                  <Badge key={tag} tag={tag} small />
                ))}
              </div>
              <span className="text-slate-100 text-[14px] leading-relaxed break-words font-sans">
                {item.t}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Version page link */}
      <Link
        to={`/version/${version}`}
        className={`flex items-center justify-center gap-1.5 mt-4 py-2.5 px-4 rounded-lg text-[14px] font-semibold font-sans transition-all ${
          hasDetails
            ? "text-blue-500 bg-blue-500/[0.08] border border-blue-500/25 modal-link-detail"
            : "text-slate-500 bg-transparent border border-slate-700 modal-link-plain"
        }`}
      >
        {hasDetails ? "バージョン詳細ページへ →" : "バージョンページへ →"}
      </Link>
    </DetailModalShell>
  );
}
