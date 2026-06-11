import { RELEASES, VERSION_DETAILS as VERSION_DETAILS_DATA } from "~/data/releases";

export interface ReleaseItem {
  t: string;
  t_en?: string;
  tags: string[];
}

export interface DetailItem {
  t: string;
  t_en?: string;
  tags: string[];
  detail: string;
  detail_en?: string;
  category: string;
  category_en?: string;
}

export { RELEASES };
export const VERSION_DETAILS: Record<string, DetailItem[]> = VERSION_DETAILS_DATA as Record<
  string,
  DetailItem[]
>;

export function getAdjacentVersions(version: string): { prev: string | null; next: string | null } {
  const idx = RELEASES.findIndex((r) => r.v === version);
  return {
    prev: idx < RELEASES.length - 1 ? RELEASES[idx + 1].v : null,
    next: idx > 0 ? RELEASES[idx - 1].v : null,
  };
}
