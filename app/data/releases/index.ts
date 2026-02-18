import releases20x from "~/data/releases/releases-2.0.x.json";
import releases21x0x from "~/data/releases/releases-2.1.0x.json";
import releases21x1x from "~/data/releases/releases-2.1.1x.json";
import releases21x2x from "~/data/releases/releases-2.1.2x.json";
import releases21x3x from "~/data/releases/releases-2.1.3x.json";
import releases21x4x from "~/data/releases/releases-2.1.4x.json";
import versionDetails21x2x from "~/data/releases/version-details-2.1.2x.json";
import versionDetails21x3x from "~/data/releases/version-details-2.1.3x.json";
import versionDetails21x4x from "~/data/releases/version-details-2.1.4x.json";

export const RELEASES = [
  ...releases20x,
  ...releases21x0x,
  ...releases21x1x,
  ...releases21x2x,
  ...releases21x3x,
  ...releases21x4x,
].reverse();

export const VERSION_DETAILS = {
  ...versionDetails21x2x,
  ...versionDetails21x3x,
  ...versionDetails21x4x,
};
