import envData from "~/data/env-vars/env-vars.json";

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
  auth: { color: "#C4B5FD", bg: "rgba(139, 92, 246, 0.15)" },
  model: { color: "#93C5FD", bg: "rgba(59, 130, 246, 0.15)" },
  provider: { color: "#6EE7B7", bg: "rgba(16, 185, 129, 0.15)" },
  "bash-context": { color: "#5EEAD4", bg: "rgba(20, 184, 166, 0.15)" },
  mcp: { color: "#67E8F9", bg: "rgba(6, 182, 212, 0.15)" },
  ui: { color: "#FDBA74", bg: "rgba(249, 115, 22, 0.15)" },
  telemetry: { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.15)" },
  proxy: { color: "#FDE68A", bg: "rgba(234, 179, 8, 0.15)" },
  misc: { color: "#94A3B8", bg: "rgba(100, 116, 139, 0.15)" },
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
