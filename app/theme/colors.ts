export const PALETTE = {
  green: { color: "#6EE7B7", bg: "rgba(16,185,129,0.15)" },
  blue: { color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  blueDark: { color: "#3B82F6", bg: "rgba(59,130,246,0.25)" },
  purple: { color: "#C4B5FD", bg: "rgba(139,92,246,0.15)" },
  cyan: { color: "#67E8F9", bg: "rgba(6,182,212,0.15)" },
  orange: { color: "#FDBA74", bg: "rgba(249,115,22,0.15)" },
  red: { color: "#FCA5A5", bg: "rgba(239,68,68,0.15)" },
  teal: { color: "#5EEAD4", bg: "rgba(20,184,166,0.15)" },
  yellow: { color: "#FDE68A", bg: "rgba(234,179,8,0.15)" },
  pink: { color: "#F9A8D4", bg: "rgba(244,114,182,0.15)" },
  pinkBright: { color: "#F472B6", bg: "rgba(244,114,182,0.15)" },
  slate: { color: "#94A3B8", bg: "rgba(100,116,139,0.15)" },
  indigo: { color: "#A5B4FC", bg: "rgba(99,102,241,0.15)" },
} as const;

export type ColorPair = { readonly color: string; readonly bg: string };
export type PaletteKey = keyof typeof PALETTE;
