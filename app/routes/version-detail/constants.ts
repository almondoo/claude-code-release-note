import releases20x from "~/data/releases/releases-2.0.x.json";
import releases21x from "~/data/releases/releases-2.1.x.json";
import versionDetails21x from "~/data/releases/version-details-2.1.x.json";

export interface ReleaseItem {
  t: string;
  tags: string[];
}

export interface DetailItem {
  t: string;
  tags: string[];
  detail: string;
  category: string;
}

export const RELEASES = [...releases20x, ...releases21x].reverse();
export const VERSION_DETAILS: Record<string, DetailItem[]> = {
  ...versionDetails21x,
};

export function getAdjacentVersions(version: string): { prev: string | null; next: string | null } {
  const idx = RELEASES.findIndex((r) => r.v === version);
  return {
    prev: idx < RELEASES.length - 1 ? RELEASES[idx + 1].v : null,
    next: idx > 0 ? RELEASES[idx - 1].v : null,
  };
}
