import { RELEASES, VERSION_DETAILS as VERSION_DETAILS_DATA } from "~/data/releases";

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

export { RELEASES };
export const VERSION_DETAILS: Record<string, DetailItem[]> = VERSION_DETAILS_DATA as Record<string, DetailItem[]>;

export function getAdjacentVersions(version: string): { prev: string | null; next: string | null } {
  const idx = RELEASES.findIndex((r) => r.v === version);
  return {
    prev: idx < RELEASES.length - 1 ? RELEASES[idx + 1].v : null,
    next: idx > 0 ? RELEASES[idx - 1].v : null,
  };
}
