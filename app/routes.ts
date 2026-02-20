import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/release-note/index.tsx"),
  route("version/:version", "routes/version-detail/index.tsx"),
  route("commands", "routes/commands/index.tsx"),
  route("plugins", "routes/plugins/index.tsx"),
  route("directory", "routes/directory/index.tsx"),
  route("setup", "routes/setup/index.tsx"),
  route("customization", "routes/customization/index.tsx"),
  route("best-practices", "routes/best-practices/index.tsx"),
  route("token-usage", "routes/token-usage/index.tsx"),
  route("llm-infra-guide", "routes/llm-infra-guide/index.tsx"),
  route("hands-on", "routes/hands-on/index.tsx"),
  route("hands-on/:topic", "routes/hands-on-topic/index.tsx"),
] satisfies RouteConfig;
