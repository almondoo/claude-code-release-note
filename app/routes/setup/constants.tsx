import type { Callout } from "~/components/callout-box";
import type { CodeBlock } from "~/components/code-block-view";
import { SECTIONS as RAW_SECTIONS } from "~/data/setup";

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

export const SECTIONS = RAW_SECTIONS as SetupSection[];
export const TOTAL_STEPS = SECTIONS.reduce((sum, s) => sum + s.steps.length, 0);

export const SECTION_COLORS: Record<string, { color: string; bg: string }> = {
  installation: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  "initial-setup": { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "claude-md": { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  "first-steps": { color: "#86EFAC", bg: "rgba(34, 197, 94, 0.15)" },
  skills: { color: "#F9A8D4", bg: "rgba(244, 114, 182, 0.15)" },
  hooks: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  mcp: { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  ide: { color: "#3B82F6", bg: "rgba(59, 130, 246, 0.25)" },
  permissions: { color: "#FDE68A", bg: "rgba(234, 179, 8, 0.15)" },
  tips: { color: "#F472B6", bg: "rgba(244, 114, 182, 0.15)" },
  troubleshooting: { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
  "best-practices": { color: "#A5B4FC", bg: "rgba(99, 102, 241, 0.15)" },
};

export { SECTION_ICONS } from "./section-icons";

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  必須: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  初心者向け: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  中級者向け: { color: "#FCD34D", bg: "rgba(250, 204, 21, 0.15)" },
  上級者向け: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  チーム向け: { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  "CI/CD": { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
};
