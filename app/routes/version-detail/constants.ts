import releases from "~/data/releases.json";
import versionDetails from "~/data/version-details.json";

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

export const RELEASES = [...releases].reverse();
export const VERSION_DETAILS: Record<string, DetailItem[]> = versionDetails;

export function getAdjacentVersions(version: string): { prev: string | null; next: string | null } {
  const idx = RELEASES.findIndex((r) => r.v === version);
  return {
    prev: idx < RELEASES.length - 1 ? RELEASES[idx + 1].v : null,
    next: idx > 0 ? RELEASES[idx - 1].v : null,
  };
}
