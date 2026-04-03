import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/release-note/index.tsx"),
  route("version/:version", "routes/version-detail/index.tsx"),
  route("quick-reference", "routes/quick-reference/index.tsx"),
  route("setup", "routes/setup/index.tsx"),
  route("best-practices", "routes/best-practices/index.tsx"),
  route("llm-infra-guide", "routes/llm-infra-guide/index.tsx"),
  route("hands-on", "routes/hands-on/index.tsx"),
  route("hands-on/:topic", "routes/hands-on-topic/index.tsx"),
  route("harness-engineering", "routes/harness-engineering/index.tsx"),
] satisfies RouteConfig;
