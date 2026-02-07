import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/release-note.tsx"),
  route("version/:version", "routes/version-detail.tsx"),
  route("commands", "routes/commands.tsx"),
  route("plugins", "routes/plugins.tsx"),
] satisfies RouteConfig;
