import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router";

import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckIcon,
  CloseIcon,
  FileIcon,
  FolderIcon,
  InfoIcon,
  LightbulbIcon,
  MapPinIcon,
  TerminalIcon,
} from "~/components/icons";
import { EmptyState } from "~/components/empty-state";
import { Footer } from "~/components/footer";
import { SearchInput } from "~/components/search-input";
import directoryData from "~/data/directory-structure.json";
import { useModalLock } from "~/hooks/useModalLock";

interface Entry {
  path: string;
  type: "file" | "directory";
  name: string;
  description: string;
  detail: string;
  usage: string;
  bestPractice: string;
  vcs: boolean | null;
  recommended: "recommended" | "optional" | "advanced";
}

interface Section {
  id: string;
  name: string;
  basePath: string;
  description: string;
  entries: Entry[];
  bestPractices: string[];
}

interface PrecedenceItem {
  level: number;
  name: string;
  description: string;
  color: string;
}

const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  global: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  "project-root": { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  "project-claude": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  home: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  managed: { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
};

const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  global: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  "project-root": () => <FolderIcon width={18} height={18} />,
  "project-claude": () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  home: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  managed: () => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
};

const RECOMMEND_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; title: string }
> = {
  recommended: {
    label: "推奨",
    color: "#6EE7B7",
    bg: "rgba(16, 185, 129, 0.15)",
    title: "ほとんどのユーザーに設定をおすすめします",
  },
  optional: {
    label: "任意",
    color: "#64748B",
    bg: "rgba(100,116,139,0.15)",
    title: "必要に応じて設定してください",
  },
  advanced: {
    label: "上級",
    color: "#C4B5FD",
    bg: "rgba(139, 92, 246, 0.15)",
    title: "仕組みを理解した上で設定してください",
  },
};

const VCS_CONFIG = {
  true: {
    label: "VCS ○",
    color: "#6EE7B7",
    bg: "rgba(16, 185, 129, 0.15)",
    title: "Git 等のバージョン管理にコミットしてチームで共有できます",
  },
  false: {
    label: "VCS ×",
    color: "#64748B",
    bg: "rgba(100,116,139,0.15)",
    title: "個人環境のみ。Git 等のバージョン管理にはコミットしません",
  },
  null: {
    label: "OS 管理",
    color: "#FDBA74",
    bg: "rgba(249, 115, 22, 0.15)",
    title: "OS のシステムディレクトリで管理される設定です",
  },
};

function getVcsKey(vcs: boolean | null): "true" | "false" | "null" {
  if (vcs === null) return "null";
  return String(vcs) as "true" | "false";
}

function BadgeWithTooltip({
  label,
  color,
  bg,
  title,
}: {
  label: string;
  color: string;
  bg: string;
  title: string;
}): React.JSX.Element {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const show = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);
  const hide = useCallback(() => setPos(null), []);

  return (
    <>
      <span
        ref={ref}
        className="text-[10px] font-semibold whitespace-nowrap rounded cursor-help"
        style={{ padding: "2px 8px", background: bg, color }}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {label}
      </span>
      {pos &&
        createPortal(
          <span
            className="fixed pointer-events-none px-2.5 py-1.5 rounded-md bg-slate-800 text-slate-200 text-[11px] leading-snug whitespace-nowrap shadow-lg border border-slate-700 z-[9999] -translate-x-1/2"
            style={{
              left: pos.x,
              top: pos.y - 8,
              transform: "translate(-50%, -100%)",
            }}
          >
            {title}
          </span>,
          document.body,
        )}
    </>
  );
}

export function meta(): Array<{
  title?: string;
  name?: string;
  content?: string;
}> {
  return [
    { title: "Claude Code ディレクトリ構成ガイド" },
    {
      name: "description",
      content:
        "Claude Code の設定ファイル・ディレクトリ構成のベストプラクティスガイド",
    },
  ];
}

const SECTIONS: Section[] = directoryData.sections as unknown as Section[];
const PRECEDENCE: PrecedenceItem[] =
  directoryData.precedence as PrecedenceItem[];
const COMMIT_GUIDE = directoryData.commitGuide;
const SKILLS_VS_AGENTS = directoryData.skillsVsAgents;

const TOTAL = SECTIONS.flatMap((s) => s.entries).length;

const PRECEDENCE_COLORS: Record<string, { color: string; bg: string }> = {
  red: { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
  orange: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  yellow: { color: "#FDE68A", bg: "rgba(234, 179, 8, 0.15)" },
  green: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  blue: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
};

const SPECIAL_TABS = ["precedence", "commit-guide", "skills-agents"] as const;

function EntryCard({
  entry,
  accentColor,
  onClick,
}: {
  entry: Entry;
  accentColor: string;
  onClick: () => void;
}): React.JSX.Element {
  const recommendCfg = RECOMMEND_CONFIG[entry.recommended];
  const vcsCfg = VCS_CONFIG[getVcsKey(entry.vcs)];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="hover-card bg-surface rounded-xl border border-slate-700 flex flex-col gap-2.5 cursor-pointer relative overflow-hidden h-[200px]"
      style={{ padding: "18px 20px", ["--accent" as string]: accentColor }}
    >
      <div
        className="absolute top-0 left-0 right-0 rounded-t-xl"
        style={{
          height: "3px",
          background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
        }}
      />

      <div className="flex items-center gap-2">
        <span
          className="shrink-0 flex items-center"
          style={{ color: accentColor }}
        >
          {entry.type === "directory" ? <FolderIcon /> : <FileIcon />}
        </span>
        <code
          className="font-mono text-[13px] font-bold overflow-hidden text-ellipsis whitespace-nowrap"
          style={{ color: accentColor }}
        >
          {entry.path}
        </code>
      </div>

      <div className="text-sm font-semibold text-slate-100 font-sans leading-[1.4]">
        {entry.name}
      </div>

      <p className="m-0 text-xs leading-[1.6] text-slate-400 font-sans flex-1 line-clamp-2">
        {entry.description}
      </p>

      <div className="flex gap-1.5 mt-auto flex-wrap">
        <BadgeWithTooltip {...recommendCfg} />
        <BadgeWithTooltip {...vcsCfg} />
      </div>
    </div>
  );
}

const MODAL_SECTION_META: Record<
  string,
  { label: string; icon: React.JSX.Element }
> = {
  detail: { label: "詳細", icon: <BookOpenIcon /> },
  usage: { label: "使い方", icon: <TerminalIcon /> },
  location: { label: "配置場所", icon: <MapPinIcon /> },
  bestPractices: { label: "ベストプラクティス", icon: <LightbulbIcon /> },
};

function DetailModal({
  entry,
  section,
  accentColor,
  onClose,
  reducedMotion,
}: {
  entry: Entry;
  section: Section;
  accentColor: string;
  onClose: () => void;
  reducedMotion: boolean | null;
}): React.JSX.Element {
  const overlayRef = useRef<HTMLDivElement>(null);
  const recommendCfg = RECOMMEND_CONFIG[entry.recommended];
  const vcsCfg = VCS_CONFIG[getVcsKey(entry.vcs)];

  useModalLock(onClose);

  const fullPath = section.basePath + entry.path;
  const detailParagraphs = entry.detail.split("\n\n").filter(Boolean);
  const usageParagraphs = entry.usage
    ? entry.usage.split("\n\n").filter(Boolean)
    : [];

  function ModalSection({
    id,
    children,
  }: {
    id: string;
    children: React.ReactNode;
  }): React.JSX.Element {
    const meta = MODAL_SECTION_META[id];
    return (
      <div className="flex flex-col gap-2.5">
        <div
          className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase font-mono"
          style={{ color: accentColor }}
        >
          {meta?.icon}
          {meta?.label}
        </div>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={overlayRef}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[1000] bg-overlay backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-surface rounded-2xl w-full max-w-[640px] overflow-hidden flex flex-col"
        style={{
          maxHeight: "85vh",
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px ${accentColor}15`,
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-start gap-3.5 relative"
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #334155",
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          }}
        >
          <div
            className="absolute top-0 left-0 right-0"
            style={{
              height: "3px",
              background: `linear-gradient(90deg, ${accentColor}, ${accentColor}40)`,
            }}
          />
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              background:
                SECTION_COLORS[section.id]?.bg || "rgba(59, 130, 246, 0.25)",
              color: accentColor,
            }}
          >
            {entry.type === "directory" ? <FolderIcon /> : <FileIcon />}
          </div>
          <div className="flex-1 min-w-0">
            <code
              className="font-mono text-[15px] font-bold break-all"
              style={{ color: accentColor }}
            >
              {entry.path}
            </code>
            <div className="text-sm font-semibold text-slate-100 mt-1 font-sans">
              {entry.name}
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <BadgeWithTooltip {...recommendCfg} />
              <BadgeWithTooltip {...vcsCfg} />
              <span
                className="text-[10px] font-semibold bg-slate-900 text-slate-500 rounded"
                style={{ padding: "2px 8px" }}
              >
                {entry.type === "directory" ? "ディレクトリ" : "ファイル"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="close-btn bg-transparent border-none text-slate-500 cursor-pointer p-1 rounded-md flex items-center justify-center transition-colors shrink-0"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          <ModalSection id="detail">
            {detailParagraphs.map((p, i) => (
              <p
                key={i}
                className="m-0 text-[13px] leading-[1.8] text-slate-400 font-sans"
              >
                {p}
              </p>
            ))}
          </ModalSection>

          {usageParagraphs.length > 0 && (
            <ModalSection id="usage">
              <div
                className="rounded-[10px] flex flex-col gap-2"
                style={{
                  background: "rgba(20, 184, 166, 0.15)",
                  border: "1px solid rgba(94, 234, 212, 0.125)",
                  padding: "14px 16px",
                }}
              >
                {usageParagraphs.map((p, i) => (
                  <p
                    key={i}
                    className="m-0 text-xs leading-[1.8] text-slate-400 font-sans"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </ModalSection>
          )}

          <ModalSection id="location">
            <div
              className="bg-slate-900 rounded-[10px] border border-slate-700 flex flex-col gap-2"
              style={{ padding: "14px 16px" }}
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  パス:
                </span>
                <code
                  className="font-mono text-[13px] font-semibold"
                  style={{ color: accentColor }}
                >
                  {fullPath}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  スコープ:
                </span>
                <span className="text-xs text-slate-100 font-sans">
                  {section.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  ベースパス:
                </span>
                <code className="font-mono text-xs text-slate-400">
                  {section.basePath}
                </code>
              </div>
            </div>
          </ModalSection>

          {entry.bestPractice && (
            <ModalSection id="bestPractices">
              <div
                className="rounded-[10px]"
                style={{
                  background: "rgba(15, 23, 42, 0.5)",
                  border: "1px solid rgba(51, 65, 85, 0.375)",
                  padding: "14px 16px",
                }}
              >
                <p className="m-0 text-xs leading-[1.7] text-slate-400 font-sans">
                  {entry.bestPractice}
                </p>
              </div>
            </ModalSection>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function PrecedencePanel(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-surface rounded-xl border border-slate-700 p-6">
        <div
          className="text-[13px] font-bold tracking-wide uppercase font-mono mb-5 flex items-center gap-2"
          style={{ color: "#FDBA74" }}
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
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          設定の優先順位
        </div>
        <div className="flex flex-col gap-2.5">
          {PRECEDENCE.map((item) => {
            const pc = PRECEDENCE_COLORS[item.color] || {
              color: "#F1F5F9",
              bg: "#0F172A",
            };
            return (
              <div key={item.level} className="flex gap-3 items-center">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-mono shrink-0"
                  style={{ background: pc.bg, color: pc.color }}
                >
                  {item.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: pc.color }}
                    >
                      {item.name}
                    </span>
                    <span className="text-xs text-slate-500 font-sans">
                      {item.description}
                    </span>
                  </div>
                </div>
                {item.level === 1 && (
                  <span
                    className="text-[10px] font-semibold rounded whitespace-nowrap shrink-0"
                    style={{
                      padding: "2px 8px",
                      background: "rgba(239, 68, 68, 0.15)",
                      color: "#FCA5A5",
                    }}
                  >
                    最優先
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div
          className="mt-4 rounded-lg text-xs leading-[1.7] text-slate-400 font-sans"
          style={{
            padding: "12px 14px",
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px solid rgba(51, 65, 85, 0.25)",
          }}
        >
          上位の設定が下位の設定を上書きします。同じキーが複数の階層で定義されている場合、番号の小さい方が優先されます。
        </div>
      </div>
    </div>
  );
}

function CommitGuidePanel(): React.JSX.Element {
  return (
    <div className="bg-surface rounded-xl border border-slate-700 p-6">
      <div
        className="text-[13px] font-bold tracking-wide uppercase font-mono mb-5 flex items-center gap-2"
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

function SkillsVsAgentsPanel(): React.JSX.Element {
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

interface TabDef {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  type: "section" | "info";
}

const TAB_DEFS: TabDef[] = [
  ...SECTIONS.map((s) => ({
    id: s.id,
    label: s.name,
    shortLabel: s.name
      .replace("（企業管理者向け）", "")
      .replace("マネージド設定", "マネージド"),
    color: SECTION_COLORS[s.id]?.color || "#3B82F6",
    type: "section" as const,
  })),
  {
    id: "precedence",
    label: "優先順位",
    shortLabel: "優先順位",
    color: "#FDBA74",
    type: "info",
  },
  {
    id: "commit-guide",
    label: "コミットガイド",
    shortLabel: "コミット",
    color: "#5EEAD4",
    type: "info",
  },
  {
    id: "skills-agents",
    label: "Skills vs Agents",
    shortLabel: "Skills/Agents",
    color: "#C4B5FD",
    type: "info",
  },
];

export default function Directory(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<string>("global");
  const [query, setQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: Entry;
    section: Section;
  } | null>(null);
  const reducedMotion = useReducedMotion();
  const hasMounted = useRef(false);
  const tabScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const lowerQuery = query.toLowerCase();

  const activeSection = SECTIONS.find((s) => s.id === activeTab);

  const filteredEntries = useMemo(() => {
    if (!activeSection) return [];
    return activeSection.entries.filter(
      (e) =>
        !query ||
        e.path.toLowerCase().includes(lowerQuery) ||
        e.name.toLowerCase().includes(lowerQuery) ||
        e.description.toLowerCase().includes(lowerQuery) ||
        e.detail.toLowerCase().includes(lowerQuery) ||
        e.usage.toLowerCase().includes(lowerQuery),
    );
  }, [activeSection, query, lowerQuery]);

  const isInfoTab = SPECIAL_TABS.includes(
    activeTab as (typeof SPECIAL_TABS)[number],
  );

  const openModal = useCallback((entry: Entry, section: Section) => {
    setSelectedEntry({ entry, section });
  }, []);

  const closeModal = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  const m = reducedMotion
    ? { initial: undefined, animate: undefined, transition: undefined }
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100">
      <div className="max-w-[1100px] mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-7 rounded-2xl relative overflow-hidden border border-slate-700"
          style={{
            padding: "36px 24px",
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(139,92,246,0.08), transparent 60%), " +
                "radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.05), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="text-xs font-semibold text-slate-500 tracking-[3px] uppercase mb-3 font-mono">
              CLAUDE CODE
            </div>
            <h1 className="text-[28px] font-bold m-0 mb-2.5 text-slate-100 tracking-tight">
              ディレクトリ構成ガイド
            </h1>
            <p
              className="text-sm text-slate-400 mx-auto leading-[1.7] max-w-[520px]"
              style={{ margin: "0 auto 14px" }}
            >
              設定ファイルの配置場所・使い方・ベストプラクティスを網羅したガイド
            </p>
            <div className="flex justify-center gap-6 text-[13px] text-slate-400 flex-wrap">
              <span>
                <strong className="text-slate-100">{TOTAL}</strong> エントリ
              </span>
              <span>
                <strong className="text-slate-100">{SECTIONS.length}</strong>{" "}
                セクション
              </span>
            </div>
            {/* Nav links */}
            <div className="flex justify-center gap-3 mt-3.5">
              {[
                {
                  to: "/",
                  label: "リリースノート",
                  icon: <ArrowLeftIcon />,
                  trailing: false,
                },
                {
                  to: "/commands",
                  label: "コマンド一覧",
                  icon: null,
                  trailing: true,
                },
                {
                  to: "/plugins",
                  label: "公式プラグイン",
                  icon: null,
                  trailing: true,
                },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="nav-link inline-flex items-center gap-1.5 text-slate-500 no-underline text-xs font-sans rounded-md border border-slate-700 transition-all"
                  style={{ padding: "4px 12px" }}
                >
                  {link.icon}
                  {link.label}
                  {link.trailing && " →"}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={m ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          ref={tabScrollRef}
          className="flex gap-1 mb-5 overflow-x-auto pb-1 scrollbar-none"
        >
          {TAB_DEFS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setQuery("");
                }}
                className={`shrink-0 rounded-[10px] text-[13px] font-sans cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive ? "font-semibold" : "font-medium tab-btn-inactive"
                }`}
                style={{
                  padding: "10px 16px",
                  border: isActive
                    ? `1px solid ${tab.color}40`
                    : "1px solid transparent",
                  background: isActive ? tab.color + "18" : "transparent",
                  color: isActive ? tab.color : "#64748B",
                }}
              >
                {tab.type === "section" && SECTION_ICONS[tab.id] && (
                  <span className="flex items-center scale-[0.8]">
                    {SECTION_ICONS[tab.id]()}
                  </span>
                )}
                {tab.type === "info" && (
                  <span className="flex items-center">
                    <InfoIcon />
                  </span>
                )}
                <span className="tab-full-label inline">{tab.shortLabel}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Best practices -- only for section tabs */}
        {!isInfoTab && activeSection && activeSection.bestPractices.length > 0 && (
          <motion.div
            initial={m ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.12 }}
            className="mb-4"
          >
            <div
              className="rounded-xl border flex gap-3"
              style={{
                padding: "14px 18px",
                background: `${SECTION_COLORS[activeSection.id]?.bg || "rgba(59, 130, 246, 0.08)"}`,
                borderColor: `${SECTION_COLORS[activeSection.id]?.color || "#3B82F6"}25`,
              }}
            >
              <div
                className="shrink-0 mt-0.5"
                style={{ color: SECTION_COLORS[activeSection.id]?.color || "#3B82F6" }}
              >
                <LightbulbIcon width={16} height={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[11px] font-bold tracking-wide uppercase font-mono mb-2"
                  style={{ color: SECTION_COLORS[activeSection.id]?.color || "#3B82F6" }}
                >
                  ベストプラクティス
                </div>
                <ul className="m-0 pl-4 flex flex-col gap-1">
                  {activeSection.bestPractices.map((tip, i) => (
                    <li
                      key={i}
                      className="text-xs leading-[1.7] text-slate-400 font-sans"
                    >
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search -- only for section tabs */}
        {!isInfoTab && (
          <motion.div
            initial={m ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mb-4"
          >
            <SearchInput value={query} onChange={setQuery} placeholder="ファイル名やキーワードで検索..." />
          </motion.div>
        )}

        {/* Tab content */}
        <AnimatePresence mode="popLayout">
          {isInfoTab ? (
            <motion.div
              key={activeTab}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "precedence" && <PrecedencePanel />}
              {activeTab === "commit-guide" && <CommitGuidePanel />}
              {activeTab === "skills-agents" && <SkillsVsAgentsPanel />}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Section description */}
              {activeSection && (
                <div className="flex items-center gap-2.5 mb-4 px-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background:
                        SECTION_COLORS[activeSection.id]?.bg ||
                        "rgba(59, 130, 246, 0.25)",
                      color:
                        SECTION_COLORS[activeSection.id]?.color || "#3B82F6",
                    }}
                  >
                    {SECTION_ICONS[activeSection.id]?.()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <code
                        className="text-xs text-slate-500 font-mono bg-surface rounded"
                        style={{ padding: "2px 8px" }}
                      >
                        {activeSection.basePath}
                      </code>
                      <span className="text-xs text-slate-500">
                        {filteredEntries.length} /{" "}
                        {activeSection.entries.length} エントリ
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-sans">
                      {activeSection.description}
                    </span>
                  </div>
                </div>
              )}

              {/* Card grid */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3.5">
                <AnimatePresence mode="popLayout">
                  {filteredEntries.map((entry, i) => (
                    <motion.div
                      key={entry.path}
                      layout={!reducedMotion}
                      initial={reducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={
                        reducedMotion
                          ? undefined
                          : {
                              opacity: 0,
                              scale: 0.96,
                              transition: { duration: 0.15 },
                            }
                      }
                      transition={{
                        duration: 0.2,
                        delay:
                          reducedMotion || hasMounted.current
                            ? 0
                            : Math.min(i * 0.04, 0.4),
                      }}
                    >
                      <EntryCard
                        entry={entry}
                        accentColor={
                          SECTION_COLORS[activeTab]?.color || "#3B82F6"
                        }
                        onClick={() => openModal(entry, activeSection!)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Empty state */}
              {filteredEntries.length === 0 && (
                <EmptyState message="条件に一致するエントリはありません" reducedMotion={reducedMotion} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <DetailModal
            entry={selectedEntry.entry}
            section={selectedEntry.section}
            accentColor={
              SECTION_COLORS[selectedEntry.section.id]?.color || "#3B82F6"
            }
            onClose={closeModal}
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
