import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/release-note/index.tsx"),
  route("version/:version", "routes/version-detail/index.tsx"),
  route("commands", "routes/commands/index.tsx"),
  route("plugins", "routes/plugins/index.tsx"),
  route("directory", "routes/directory/index.tsx"),
  route("setup", "routes/setup/index.tsx"),
  route("best-practices", "routes/best-practices/index.tsx"),
  route("llm-infra-guide", "routes/llm-infra-guide/index.tsx"),
] satisfies RouteConfig;
