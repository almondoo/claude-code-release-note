import { motion, useReducedMotion } from "motion/react";
import { Link, useLocation } from "react-router";
import { ArrowLeftIcon } from "~/components/icons";

const ALL_PAGES = [
  { to: "/", label: "リリースノート" },
  { to: "/commands", label: "コマンド一覧" },
  { to: "/plugins", label: "公式プラグイン" },
  { to: "/directory", label: "設定ガイド" },
  { to: "/setup", label: "セットアップ" },
  { to: "/customization", label: "カスタマイズ" },
  { to: "/best-practices", label: "ベストプラクティス" },
  { to: "/hands-on", label: "ハンズオン" },
];

interface Stat {
  value: number | string;
  label: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  stats?: Stat[];
  extraStats?: React.ReactNode;
  gradient?: [string, string];
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  stats,
  extraStats,
  gradient,
  children,
}: PageHeaderProps): React.JSX.Element {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const currentPath = location.pathname;
  const isIndex = currentPath === "/";

  const navLinks = ALL_PAGES.filter((p) => p.to !== currentPath);

  const [g1, g2] = gradient ?? ["rgba(59,130,246,0.08)", "rgba(168,85,247,0.05)"];

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <motion.div
      initial={m ? false : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center mb-7 relative overflow-hidden rounded-2xl border border-slate-700 px-6 py-9 bg-gradient-to-br from-slate-800 to-slate-900"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${g1}, transparent 60%), radial-gradient(ellipse at 70% 80%, ${g2}, transparent 60%)`,
        }}
      />
      <div className="relative">
        <div className="text-xs font-semibold text-slate-500 tracking-[3px] uppercase mb-3 font-mono">
          CLAUDE CODE
        </div>
        <h1 className="text-[29px] font-bold m-0 mb-2.5 text-slate-100 tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-slate-400 m-0 mb-3.5 max-w-[520px] mx-auto leading-relaxed">
            {description}
          </p>
        )}
        {(stats || extraStats) && (
          <div className="flex justify-center items-baseline gap-6 text-[14px] text-slate-400 flex-wrap">
            {stats?.map((stat, i) => (
              <span key={i}>
                <strong className="text-slate-100">{stat.value}</strong> {stat.label}
              </span>
            ))}
            {extraStats}
          </div>
        )}
        {children}
        <div className="flex justify-center gap-3 mt-3.5 flex-wrap">
          {navLinks.map((link) => {
            const isBack = !isIndex && link.to === "/";
            return (
              <Link
                key={link.to}
                to={link.to}
                className="nav-link inline-flex items-center gap-1.5 text-slate-500 no-underline text-xs font-sans rounded-md border border-slate-700 transition-all py-1 px-3"
              >
                {isBack && <ArrowLeftIcon />}
                {link.label}
                {!isBack && " →"}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
