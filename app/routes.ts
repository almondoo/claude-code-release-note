import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/release-note.tsx"),
  route("version/:version", "routes/version-detail.tsx"),
  route("commands", "routes/commands.tsx"),
  route("plugins", "routes/plugins.tsx"),
  route("directory", "routes/directory.tsx"),
  route("setup", "routes/setup.tsx"),
  route("best-practices", "routes/best-practices.tsx"),
] satisfies RouteConfig;
