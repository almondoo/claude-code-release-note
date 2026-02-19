import { TAG_COLORS, TAG_LABELS } from "~/components/badge";
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
import { RELEASES, VERSION_DETAILS } from "~/data/releases";

export interface ReleaseItem {
  t: string;
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

export { RELEASES };

export const ALL_TAGS = Object.keys(TAG_COLORS);

export const VERSION_DETAILS_AVAILABLE = new Set(Object.keys(VERSION_DETAILS));

export const totalAll = RELEASES.reduce((sum, r) => sum + r.items.length, 0);

export const TAB_DEFS: TabDef[] = [
  { id: "all", label: "すべて", color: "#3B82F6" },
  ...ALL_TAGS.map((tag) => ({
    id: tag,
    label: TAG_LABELS[tag] ?? tag,
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
