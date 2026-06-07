import { TAG_COLORS } from "~/components/badge";
import {
  AgentGearIcon,
  BoltIcon,
  BriefcaseIcon,
  CodeIcon,
  LinkIcon,
  MonitorIcon,
  ServerIcon,
  ShieldIcon,
  StarIcon,
  TriangleAlertIcon,
  TrendingUpIcon,
  WindowsIcon,
  WrenchIcon,
} from "~/components/icons";
import type { Dictionary } from "~/i18n/dict";
import { RELEASES as RAW_RELEASES, VERSION_DETAILS } from "~/data/releases";

export interface ReleaseItem {
  t: string;
  t_en?: string;
  tags: string[];
}

export interface ReleaseVersion {
  v: string;
  items: ReleaseItem[];
}

export interface TabDef {
  id: string;
  label: string;
  color: string;
}

// JSON 推論型を、英語フィールド(t_en?)を含む ReleaseVersion[] へ型付け。
export const RELEASES = RAW_RELEASES as ReleaseVersion[];

export const ALL_TAGS = Object.keys(TAG_COLORS);

export const VERSION_DETAILS_AVAILABLE = new Set(Object.keys(VERSION_DETAILS));

export const totalAll = RELEASES.reduce((sum, r) => sum + r.items.length, 0);

export const getTabDefs = (t: Dictionary): TabDef[] => [
  { id: "all", label: t.releaseNote.tabAll, color: "#3B82F6" },
  ...ALL_TAGS.map((tag) => ({
    id: tag,
    label: t.tags[tag] ?? tag,
    color: TAG_COLORS[tag]?.text ?? "#3B82F6",
  })),
];

export const TAG_ICONS: Record<string, () => React.JSX.Element> = {
  新機能: () => <StarIcon />,
  バグ修正: () => <WrenchIcon />,
  改善: () => <TrendingUpIcon />,
  SDK: () => <CodeIcon />,
  IDE: () => <MonitorIcon />,
  Platform: () => <ServerIcon />,
  Security: () => <ShieldIcon />,
  Perf: () => <BoltIcon width={18} height={18} />,
  非推奨: () => <TriangleAlertIcon />,
  Plugin: () => <BriefcaseIcon />,
  MCP: () => <LinkIcon />,
  Agent: () => <AgentGearIcon />,
  Windows: () => <WindowsIcon />,
};
