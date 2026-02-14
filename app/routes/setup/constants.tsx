import setupData from "~/data/setup/setup.json";

export interface CodeBlock {
  lang: string;
  label: string;
  value: string;
  recommended?: boolean;
}

export interface Callout {
  type: "info" | "warning" | "tip" | "important";
  text: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  content: string;
  code: CodeBlock[];
  callouts: Callout[];
  tags: string[];
}

export interface SetupSection {
  id: string;
  name: string;
  description: string;
  steps: Step[];
}

export const SECTIONS = setupData.sections as SetupSection[];
export const TOTAL_STEPS = SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  installation: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  "initial-setup": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "claude-md": { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  hooks: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  mcp: { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  ide: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
  permissions: { color: "#FDE68A", bg: "rgba(234, 179, 8, 0.15)" },
  tips: { color: "#F472B6", bg: "rgba(244, 114, 182, 0.15)" },
  troubleshooting: { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
  "best-practices": { color: "#A5B4FC", bg: "rgba(99, 102, 241, 0.15)" },
};

export const SECTION_ICONS: Record<string, () => React.JSX.Element> = {
  installation: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  "initial-setup": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  "claude-md": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  hooks: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  mcp: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  ide: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  permissions: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  tips: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  troubleshooting: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  "best-practices": () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  "必須": { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  "初心者向け": { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  "中級者向け": { color: "#FCD34D", bg: "rgba(250, 204, 21, 0.15)" },
  "上級者向け": { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  "チーム向け": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "CI/CD": { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
};

export const CALLOUT_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  info: { color: "#60A5FA", bg: "rgba(59, 130, 246, 0.08)", border: "#3B82F6", label: "Info" },
  warning: { color: "#FBBF24", bg: "rgba(234, 179, 8, 0.08)", border: "#EAB308", label: "Warning" },
  tip: { color: "#34D399", bg: "rgba(16, 185, 129, 0.08)", border: "#10B981", label: "Tip" },
  important: { color: "#F87171", bg: "rgba(239, 68, 68, 0.08)", border: "#EF4444", label: "Important" },
};
