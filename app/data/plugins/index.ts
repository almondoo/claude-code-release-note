import cloudInfra from "./plugins-cloud-infra.json";
import codeIntelligence from "./plugins-code-intelligence.json";
import codeReviewGit from "./plugins-code-review-git.json";
import community from "./plugins-community.json";
import dataAi from "./plugins-data-ai.json";
import database from "./plugins-database.json";
import devTools from "./plugins-dev-tools.json";
import externalIntegrations from "./plugins-external-integrations.json";
import messaging from "./plugins-messaging.json";
import outputStyles from "./plugins-output-styles.json";
import security from "./plugins-security.json";
import webContent from "./plugins-web-content.json";

export const pluginsData = {
  categories: [
    codeIntelligence,
    devTools,
    codeReviewGit,
    security,
    cloudInfra,
    database,
    externalIntegrations,
    dataAi,
    webContent,
    messaging,
    outputStyles,
    community,
  ],
  usage: {
    install:
      "Claude Code 内で /plugin install <プラグイン名>@claude-plugins-official を実行",
    browse: "/plugin を実行して Discover タブからブラウズ",
    manage: "/plugin を実行して Installed タブで管理",
    marketplaceAdd: "/plugin marketplace add <owner/repo> でマーケットプレイスを追加",
  },
};
