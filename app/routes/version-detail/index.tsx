import { motion, useReducedMotion } from "motion/react";
import { Link, useParams } from "react-router";

import { TAG_COLORS } from "~/components/badge";
import { Footer } from "~/components/footer";
import { ArrowLeftIcon } from "~/components/icons";
import { LanguageToggle } from "~/components/language-toggle";
import { dictFromMatches } from "~/i18n/meta";
import { useT } from "~/i18n/useT";

import { RELEASES, VERSION_DETAILS, getAdjacentVersions } from "./constants";
import { computeSortedTagCounts } from "../release-note/version-card";
import { DetailCard, FallbackCard } from "./detail-card";
import { NavButton } from "./nav-button";

export const meta = ({
  matches,
  params,
}: {
  matches: readonly ({ data?: unknown } | undefined)[];
  params: { version?: string };
}): Array<{ title?: string; name?: string; content?: string }> => {
  const d = dictFromMatches(matches);
  const v = params.version ?? "";
  return [
    { title: d.versionDetail.metaTitle(v) },
    { name: "description", content: d.versionDetail.metaDescription(v) },
  ];
};

const VersionDetail = (): React.JSX.Element => {
  const { version } = useParams();
  const reducedMotion = useReducedMotion();
  const t = useT();

  const release = RELEASES.find((r) => r.v === version);
  const details = version ? VERSION_DETAILS[version] : null;
  const { prev, next } = version ? getAdjacentVersions(version) : { prev: null, next: null };

  if (!release) {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">{t.versionDetail.notFound}</h1>
        <Link to="/" className="text-blue-500 no-underline flex items-center gap-1.5 text-sm">
          <ArrowLeftIcon />
          {t.versionDetail.backToList}
        </Link>
      </div>
    );
  }

  const sortedTags = computeSortedTagCounts(release.items);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1400px] mx-auto py-8 px-4">
        {/* Back link */}
        <motion.div
          initial={m ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/"
            className="back-link inline-flex items-center gap-1.5 text-slate-500 no-underline text-[14px] font-sans mb-6 py-1.5 px-3 rounded-md transition-all"
          >
            <ArrowLeftIcon />
            {t.versionDetail.backLinkLabel}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={m ? false : { opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-7 px-6 py-9 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl relative overflow-hidden border border-slate-700"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.08), transparent 60%), " +
                "radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.05), transparent 60%)",
            }}
          />
          <div className="relative">
            <LanguageToggle className="absolute top-0 right-0" />
            <div className="text-xs font-semibold text-slate-500 tracking-[3px] uppercase mb-3 font-mono">
              CLAUDE CODE
            </div>
            <h1 className="text-4xl font-extrabold m-0 mb-4 text-slate-100 tracking-tight font-mono">
              v{version}
            </h1>
            <div className="flex gap-3 flex-wrap items-center mb-3">
              <span className="text-[14px] text-slate-300">
                <strong className="text-slate-100">{release.items.length}</strong>{" "}
                {t.versionDetail.statChanges}
              </span>
              {details && (
                <span
                  className="text-[12px] py-0.5 px-2 rounded font-semibold"
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    color: "#6EE7B7",
                  }}
                >
                  {t.versionDetail.hasDetail}
                </span>
              )}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {sortedTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-[3px] px-[9px] py-[2px] rounded-md text-[12px] font-semibold"
                  style={{
                    background: TAG_COLORS[tag]?.bg ?? "rgba(100,116,139,0.15)",
                    color: TAG_COLORS[tag]?.text ?? "#94A3B8",
                    letterSpacing: "0.2px",
                  }}
                >
                  {t.tags[tag] ?? tag}
                  <span className="opacity-50 ml-0.5">{count}</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Items */}
        <div className="flex flex-col gap-2 mb-7">
          {details
            ? details.map((item, i) => (
                <DetailCard key={i} item={item} index={i} reducedMotion={reducedMotion} />
              ))
            : release.items.map((item, i) => <FallbackCard key={i} item={item} />)}
        </div>

        {/* Navigation */}
        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="flex justify-between gap-3 mb-6"
        >
          <div>{prev && <NavButton to={prev} label={prev} direction="prev" />}</div>
          <div>{next && <NavButton to={next} label={next} direction="next" />}</div>
        </motion.div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default VersionDetail;
