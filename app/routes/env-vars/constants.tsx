import envData from "~/data/env-vars/env-vars.json";
import { PALETTE } from "~/theme/colors";

export interface EnvLink {
  label: string;
  url: string;
}

export interface EnvVar {
  name: string;
  description: string;
  detail: string;
  values: string | null;
  default: string | null;
  example: string | null;
  links: EnvLink[];
  deprecated: boolean;
}

export interface EnvCategory {
  id: string;
  name: string;
  description: string;
  vars: EnvVar[];
}

export const CATEGORY_COLORS: Record<string, { color: string; bg: string }> = {
  auth: PALETTE.purple,
  model: { color: "#93C5FD", bg: "rgba(59, 130, 246, 0.15)" },
  provider: PALETTE.green,
  "bash-context": PALETTE.teal,
  mcp: PALETTE.cyan,
  ui: PALETTE.orange,
  telemetry: PALETTE.red,
  proxy: PALETTE.yellow,
  misc: PALETTE.slate,
};

export const CATEGORIES: EnvCategory[] = envData.categories as unknown as EnvCategory[];

export const ALL_VARS = CATEGORIES.flatMap((c) => c.vars);
export const TOTAL = ALL_VARS.length;

const VAR_CATEGORY_MAP = new Map<string, EnvCategory>();
for (const c of CATEGORIES) {
  for (const v of c.vars) {
    VAR_CATEGORY_MAP.set(v.name, c);
  }
}
export function getCategoryForVar(v: EnvVar): EnvCategory {
  return VAR_CATEGORY_MAP.get(v.name) ?? CATEGORIES[0];
}
