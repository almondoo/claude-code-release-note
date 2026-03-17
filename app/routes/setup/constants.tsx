import type { Callout } from "~/components/callout-box";
import type { CodeBlock } from "~/components/code-block-view";
import { SECTIONS as RAW_SECTIONS } from "~/data/setup";
import { PALETTE } from "~/theme/colors";

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
  installation: PALETTE.green,
  "initial-setup": PALETTE.cyan,
  "claude-md": PALETTE.purple,
  "first-steps": { color: "#86EFAC", bg: "rgba(34, 197, 94, 0.15)" },
  skills: PALETTE.pink,
  hooks: PALETTE.orange,
  mcp: PALETTE.teal,
  ide: PALETTE.blueDark,
  permissions: PALETTE.yellow,
  tips: PALETTE.pinkBright,
  troubleshooting: PALETTE.red,
  "best-practices": PALETTE.indigo,
};

export { SECTION_ICONS } from "./section-icons";

export const TAG_COLORS: Record<string, { color: string; bg: string }> = {
  必須: { color: "#F87171", bg: "rgba(239, 68, 68, 0.15)" },
  初心者向け: PALETTE.green,
  中級者向け: { color: "#FCD34D", bg: "rgba(250, 204, 21, 0.15)" },
  上級者向け: PALETTE.purple,
  チーム向け: PALETTE.cyan,
  "CI/CD": PALETTE.orange,
};
