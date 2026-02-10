/**
 * Five detailed security architecture diagrams (A–E) from the Mermaid definitions.
 * Each exports { nodes, edges } for ReactFlow.
 */
import type { Node, Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";

const arrow = { type: MarkerType.ArrowClosed as const, color: "#475569" };

function e(id: string, source: string, target: string, label?: string, opts?: Partial<Edge>): Edge {
  return {
    id,
    source,
    target,
    label,
    markerEnd: arrow,
    ...opts,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Diagram A: AWS Cloud-Native LLM Security Architecture
// ═══════════════════════════════════════════════════════════════════════════

const A_NODES: Node[] = [
  // Internet zone
  { id: "a-z-internet", type: "zone", position: { x: 280, y: 0 }, data: { label: "インターネット", color: "#64748B" }, style: { width: 220, height: 70 } },
  { id: "a-user", type: "service", position: { x: 20, y: 30 }, data: { label: "ユーザー / クライアント", color: "#64748B" }, parentId: "a-z-internet", extent: "parent" },

  // Public Subnet
  { id: "a-z-public", type: "zone", position: { x: 180, y: 120 }, data: { label: "Public Subnet", color: "#F59E0B" }, style: { width: 420, height: 80 } },
  { id: "a-waf", type: "security", position: { x: 20, y: 32 }, data: { label: "AWS WAF", sublabel: "レート制限 / ペイロード検査", color: "#F59E0B" }, parentId: "a-z-public", extent: "parent" },
  { id: "a-alb", type: "service", position: { x: 230, y: 32 }, data: { label: "ALB", sublabel: "Load Balancer", color: "#F59E0B" }, parentId: "a-z-public", extent: "parent" },

  // Private Subnet (App)
  { id: "a-z-private", type: "zone", position: { x: 60, y: 250 }, data: { label: "Private Subnet (App)", color: "#3B82F6" }, style: { width: 660, height: 200 } },
  { id: "a-apigw", type: "service", position: { x: 20, y: 36 }, data: { label: "API Gateway", sublabel: "REST / HTTP", color: "#3B82F6" }, parentId: "a-z-private", extent: "parent" },
  { id: "a-lambda", type: "security", position: { x: 180, y: 36 }, data: { label: "Lambda Authorizer", sublabel: "JWT / RBAC / OPA", color: "#8B5CF6" }, parentId: "a-z-private", extent: "parent" },
  { id: "a-gw", type: "service", position: { x: 20, y: 120 }, data: { label: "LLM Gateway", sublabel: "Portkey / LiteLLM", color: "#3B82F6" }, parentId: "a-z-private", extent: "parent" },
  { id: "a-dlp", type: "security", position: { x: 180, y: 120 }, data: { label: "DLP Engine", sublabel: "PII検出 / マスキング", color: "#EF4444" }, parentId: "a-z-private", extent: "parent" },
  { id: "a-input", type: "security", position: { x: 350, y: 36 }, data: { label: "入力ガードレール", sublabel: "Injection検出", color: "#EF4444" }, parentId: "a-z-private", extent: "parent" },
  { id: "a-output", type: "security", position: { x: 350, y: 120 }, data: { label: "出力ガードレール", sublabel: "有害コンテンツ検出", color: "#EF4444" }, parentId: "a-z-private", extent: "parent" },
  { id: "a-log", type: "service", position: { x: 520, y: 80 }, data: { label: "ログ収集", sublabel: "Fluentd / Vector", color: "#06B6D4" }, parentId: "a-z-private", extent: "parent" },

  // Private Subnet (Data)
  { id: "a-z-data", type: "zone", position: { x: 100, y: 500 }, data: { label: "Private Subnet (Data)", color: "#10B981" }, style: { width: 580, height: 80 } },
  { id: "a-sm", type: "service", position: { x: 15, y: 32 }, data: { label: "Secrets Manager", color: "#10B981" }, parentId: "a-z-data", extent: "parent" },
  { id: "a-kms", type: "service", position: { x: 155, y: 32 }, data: { label: "KMS", sublabel: "暗号化キー", color: "#10B981" }, parentId: "a-z-data", extent: "parent" },
  { id: "a-s3", type: "service", position: { x: 285, y: 32 }, data: { label: "S3", sublabel: "監査ログ保管", color: "#10B981" }, parentId: "a-z-data", extent: "parent" },
  { id: "a-os", type: "service", position: { x: 415, y: 32 }, data: { label: "OpenSearch", sublabel: "ログ分析", color: "#10B981" }, parentId: "a-z-data", extent: "parent" },

  // VPC Endpoint
  { id: "a-vpce", type: "service", position: { x: 310, y: 630 }, data: { label: "VPC Endpoint", sublabel: "PrivateLink", color: "#8B5CF6" } },

  // LLM Providers
  { id: "a-z-providers", type: "zone", position: { x: 200, y: 720 }, data: { label: "LLM Providers", color: "#EC4899" }, style: { width: 380, height: 80 } },
  { id: "a-bedrock", type: "service", position: { x: 20, y: 32 }, data: { label: "AWS Bedrock", sublabel: "Claude / Titan", color: "#EC4899" }, parentId: "a-z-providers", extent: "parent" },
  { id: "a-extapi", type: "service", position: { x: 210, y: 32 }, data: { label: "外部API", sublabel: "OpenAI / Anthropic", color: "#EC4899" }, parentId: "a-z-providers", extent: "parent" },
];

const A_EDGES: Edge[] = [
  e("a-e1", "a-user", "a-waf", "HTTPS"),
  e("a-e2", "a-waf", "a-alb", "フィルタ済み"),
  e("a-e3", "a-alb", "a-apigw", "ルーティング"),
  e("a-e4", "a-apigw", "a-lambda", "認証"),
  e("a-e5", "a-lambda", "a-gw", "認可済み"),
  e("a-e6", "a-gw", "a-dlp"),
  e("a-e7", "a-dlp", "a-input"),
  e("a-e8", "a-input", "a-vpce", "検査済みプロンプト"),
  e("a-e9", "a-vpce", "a-bedrock", "PrivateLink"),
  e("a-e10", "a-vpce", "a-extapi", "PrivateLink"),
  e("a-e11", "a-bedrock", "a-output", "レスポンス"),
  e("a-e12", "a-extapi", "a-output", "レスポンス"),
  e("a-e13", "a-output", "a-gw", "検証済み"),
  e("a-e14", "a-gw", "a-log", "ログ"),
  e("a-e15", "a-log", "a-s3"),
  e("a-e16", "a-log", "a-os"),
  e("a-e17", "a-gw", "a-sm", "キー取得", { style: { strokeDasharray: "5 5" } }),
];

// ═══════════════════════════════════════════════════════════════════════════
// Diagram B: Zero Trust LLM Network
// ═══════════════════════════════════════════════════════════════════════════

const B_NODES: Node[] = [
  // External
  { id: "b-z-ext", type: "zone", position: { x: 200, y: 0 }, data: { label: "External Trust Boundary", color: "#64748B" }, style: { width: 340, height: 80 } },
  { id: "b-user", type: "service", position: { x: 20, y: 32 }, data: { label: "ユーザー", color: "#64748B" }, parentId: "b-z-ext", extent: "parent" },
  { id: "b-device", type: "service", position: { x: 180, y: 32 }, data: { label: "デバイス (MDM)", color: "#64748B" }, parentId: "b-z-ext", extent: "parent" },

  // Edge
  { id: "b-z-edge", type: "zone", position: { x: 220, y: 130 }, data: { label: "Edge Trust Boundary", color: "#F59E0B" }, style: { width: 300, height: 80 } },
  { id: "b-iap", type: "security", position: { x: 20, y: 32 }, data: { label: "Identity-Aware Proxy", sublabel: "デバイスチェック / OIDC", color: "#F59E0B" }, parentId: "b-z-edge", extent: "parent" },

  // K8s - Gateway
  { id: "b-z-gw", type: "zone", position: { x: 120, y: 260 }, data: { label: "NS: llm-gateway (mTLS)", color: "#3B82F6" }, style: { width: 200, height: 80 } },
  { id: "b-gw", type: "service", position: { x: 20, y: 32 }, data: { label: "LLM Gateway", color: "#3B82F6" }, parentId: "b-z-gw", extent: "parent" },

  // K8s - Security
  { id: "b-z-sec", type: "zone", position: { x: 420, y: 260 }, data: { label: "NS: llm-security (mTLS)", color: "#EF4444" }, style: { width: 200, height: 80 } },
  { id: "b-dlp", type: "security", position: { x: 20, y: 32 }, data: { label: "DLP / Guardrails", sublabel: "PII検出 / Prompt検証", color: "#EF4444" }, parentId: "b-z-sec", extent: "parent" },

  // K8s - Inference
  { id: "b-z-inf", type: "zone", position: { x: 120, y: 390 }, data: { label: "NS: llm-inference (mTLS)", color: "#8B5CF6" }, style: { width: 200, height: 80 } },
  { id: "b-inf", type: "service", position: { x: 20, y: 32 }, data: { label: "推論サーバー", sublabel: "vLLM / TGI", color: "#8B5CF6" }, parentId: "b-z-inf", extent: "parent" },

  // K8s - Tools
  { id: "b-z-tools", type: "zone", position: { x: 420, y: 390 }, data: { label: "NS: llm-tools (mTLS)", color: "#10B981" }, style: { width: 200, height: 80 } },
  { id: "b-tools", type: "service", position: { x: 20, y: 32 }, data: { label: "ツールサンドボックス", sublabel: "Egress制限 / ReadOnly", color: "#10B981" }, parentId: "b-z-tools", extent: "parent" },
];

const B_EDGES: Edge[] = [
  e("b-e1", "b-user", "b-device"),
  e("b-e2", "b-device", "b-iap", "TLS 1.3"),
  e("b-e3", "b-iap", "b-gw", "認証済み (JWT)"),
  e("b-e4", "b-gw", "b-dlp", "mTLS"),
  e("b-e5", "b-dlp", "b-inf", "mTLS"),
  e("b-e6", "b-inf", "b-tools", "ツール呼出 mTLS"),
];

// ═══════════════════════════════════════════════════════════════════════════
// Diagram C: Multi-Cloud / Hybrid
// ═══════════════════════════════════════════════════════════════════════════

const C_NODES: Node[] = [
  // Client
  { id: "c-client", type: "service", position: { x: 300, y: 0 }, data: { label: "クライアント", color: "#64748B" } },

  // Unified Gateway
  { id: "c-z-gw", type: "zone", position: { x: 100, y: 80 }, data: { label: "統一 LLM ゲートウェイ", color: "#8B5CF6" }, style: { width: 520, height: 170 } },
  { id: "c-router", type: "service", position: { x: 20, y: 36 }, data: { label: "リクエストルーター", sublabel: "データ分類ルーティング", color: "#8B5CF6" }, parentId: "c-z-gw", extent: "parent" },
  { id: "c-policy", type: "security", position: { x: 190, y: 36 }, data: { label: "ポリシーエンジン", sublabel: "OPA", color: "#8B5CF6" }, parentId: "c-z-gw", extent: "parent" },
  { id: "c-dlp", type: "security", position: { x: 20, y: 110 }, data: { label: "統一DLPレイヤー", color: "#EF4444" }, parentId: "c-z-gw", extent: "parent" },
  { id: "c-cache", type: "service", position: { x: 190, y: 110 }, data: { label: "セマンティックキャッシュ", sublabel: "Redis + Embedding", color: "#06B6D4" }, parentId: "c-z-gw", extent: "parent" },

  // On-premise
  { id: "c-z-onprem", type: "zone", position: { x: 0, y: 320 }, data: { label: "オンプレミス", color: "#10B981" }, style: { width: 200, height: 170 } },
  { id: "c-ongw", type: "service", position: { x: 15, y: 36 }, data: { label: "オンプレGW", sublabel: "DLP / キャッシュ", color: "#10B981" }, parentId: "c-z-onprem", extent: "parent" },
  { id: "c-inf", type: "service", position: { x: 15, y: 110 }, data: { label: "推論サーバー", sublabel: "vLLM + TGI", color: "#10B981" }, parentId: "c-z-onprem", extent: "parent" },

  // Cloud Providers
  { id: "c-z-cloud", type: "zone", position: { x: 260, y: 320 }, data: { label: "クラウドプロバイダー", color: "#3B82F6" }, style: { width: 460, height: 80 } },
  { id: "c-bedrock", type: "service", position: { x: 15, y: 32 }, data: { label: "AWS Bedrock", sublabel: "ap-northeast-1", color: "#FF9900" }, parentId: "c-z-cloud", extent: "parent" },
  { id: "c-azure", type: "service", position: { x: 165, y: 32 }, data: { label: "Azure OpenAI", sublabel: "Japan East", color: "#0078D4" }, parentId: "c-z-cloud", extent: "parent" },
  { id: "c-vertex", type: "service", position: { x: 315, y: 32 }, data: { label: "Vertex AI", sublabel: "asia-northeast1", color: "#4285F4" }, parentId: "c-z-cloud", extent: "parent" },
];

const C_EDGES: Edge[] = [
  e("c-e1", "c-client", "c-router", "HTTPS"),
  e("c-e2", "c-router", "c-policy"),
  e("c-e3", "c-policy", "c-dlp"),
  e("c-e4", "c-dlp", "c-ongw", "Restricted"),
  e("c-e5", "c-dlp", "c-bedrock", "Confidential (日本)"),
  e("c-e6", "c-dlp", "c-azure", "Confidential (日本)"),
  e("c-e7", "c-dlp", "c-vertex", "Internal"),
  e("c-e8", "c-ongw", "c-inf"),
];

// ═══════════════════════════════════════════════════════════════════════════
// Diagram D: Audit / Compliance Pipeline (LR)
// ═══════════════════════════════════════════════════════════════════════════

const D_NODES: Node[] = [
  // Sources
  { id: "d-z-src", type: "zone", position: { x: 0, y: 0 }, data: { label: "ログソース", color: "#64748B" }, style: { width: 160, height: 240 } },
  { id: "d-gwlog", type: "service", position: { x: 15, y: 36 }, data: { label: "GWログ", color: "#64748B" }, parentId: "d-z-src", extent: "parent" },
  { id: "d-dlplog", type: "service", position: { x: 15, y: 88 }, data: { label: "DLPログ", color: "#64748B" }, parentId: "d-z-src", extent: "parent" },
  { id: "d-authlog", type: "service", position: { x: 15, y: 140 }, data: { label: "認証/認可ログ", color: "#64748B" }, parentId: "d-z-src", extent: "parent" },
  { id: "d-inflog", type: "service", position: { x: 15, y: 192 }, data: { label: "推論サーバーログ", color: "#64748B" }, parentId: "d-z-src", extent: "parent" },

  // Pipeline
  { id: "d-z-pipe", type: "zone", position: { x: 220, y: 30 }, data: { label: "ログ収集パイプライン", color: "#3B82F6" }, style: { width: 170, height: 170 } },
  { id: "d-collector", type: "service", position: { x: 15, y: 36 }, data: { label: "Fluentd / Vector", sublabel: "集約・正規化", color: "#3B82F6" }, parentId: "d-z-pipe", extent: "parent" },
  { id: "d-kafka", type: "service", position: { x: 15, y: 110 }, data: { label: "Apache Kafka", sublabel: "バッファリング", color: "#3B82F6" }, parentId: "d-z-pipe", extent: "parent" },

  // Realtime
  { id: "d-z-rt", type: "zone", position: { x: 450, y: 0 }, data: { label: "リアルタイム処理", color: "#EF4444" }, style: { width: 170, height: 200 } },
  { id: "d-stream", type: "service", position: { x: 15, y: 36 }, data: { label: "ストリーム処理", sublabel: "Flink / Kinesis", color: "#EF4444" }, parentId: "d-z-rt", extent: "parent" },
  { id: "d-anomaly", type: "security", position: { x: 15, y: 100 }, data: { label: "異常検知エンジン", color: "#EF4444" }, parentId: "d-z-rt", extent: "parent" },
  { id: "d-alert", type: "result", position: { x: 25, y: 160 }, data: { label: "アラート通知", variant: "warning" }, parentId: "d-z-rt", extent: "parent" },

  // Storage
  { id: "d-z-store", type: "zone", position: { x: 450, y: 250 }, data: { label: "ストレージ層", color: "#10B981" }, style: { width: 170, height: 200 } },
  { id: "d-hot", type: "service", position: { x: 15, y: 36 }, data: { label: "Hot: OpenSearch", sublabel: "30日", color: "#10B981" }, parentId: "d-z-store", extent: "parent" },
  { id: "d-warm", type: "service", position: { x: 15, y: 100 }, data: { label: "Warm: S3 Standard", sublabel: "1年", color: "#10B981" }, parentId: "d-z-store", extent: "parent" },
  { id: "d-cold", type: "service", position: { x: 15, y: 164 }, data: { label: "Cold: S3 Glacier", sublabel: "3年+", color: "#10B981" }, parentId: "d-z-store", extent: "parent" },

  // Analytics
  { id: "d-z-analytics", type: "zone", position: { x: 680, y: 100 }, data: { label: "分析・可視化", color: "#8B5CF6" }, style: { width: 170, height: 130 } },
  { id: "d-dashboard", type: "service", position: { x: 15, y: 36 }, data: { label: "Grafana ダッシュボード", color: "#8B5CF6" }, parentId: "d-z-analytics", extent: "parent" },
  { id: "d-export", type: "service", position: { x: 15, y: 90 }, data: { label: "監査エクスポート", color: "#8B5CF6" }, parentId: "d-z-analytics", extent: "parent" },
];

const D_EDGES: Edge[] = [
  e("d-e1", "d-gwlog", "d-collector"),
  e("d-e2", "d-dlplog", "d-collector"),
  e("d-e3", "d-authlog", "d-collector"),
  e("d-e4", "d-inflog", "d-collector"),
  e("d-e5", "d-collector", "d-kafka"),
  e("d-e6", "d-kafka", "d-stream"),
  e("d-e7", "d-stream", "d-anomaly"),
  e("d-e8", "d-anomaly", "d-alert", "閾値超過"),
  e("d-e9", "d-kafka", "d-hot"),
  e("d-e10", "d-hot", "d-warm", "30日経過"),
  e("d-e11", "d-warm", "d-cold", "1年経過"),
  e("d-e12", "d-hot", "d-dashboard"),
  e("d-e13", "d-warm", "d-export"),
  e("d-e14", "d-cold", "d-export"),
];

// ═══════════════════════════════════════════════════════════════════════════
// Diagram E: Prompt Security Multi-Layer Defense
// ═══════════════════════════════════════════════════════════════════════════

const E_NODES: Node[] = [
  // User input
  { id: "e-user", type: "service", position: { x: 280, y: 0 }, data: { label: "ユーザー入力", color: "#64748B" } },

  // Input layer
  { id: "e-z-input", type: "zone", position: { x: 80, y: 80 }, data: { label: "入力側ガードレール", color: "#F59E0B" }, style: { width: 560, height: 170 } },
  { id: "e-blocklist", type: "security", position: { x: 15, y: 36 }, data: { label: "ブロックリスト", color: "#F59E0B" }, parentId: "e-z-input", extent: "parent" },
  { id: "e-pii", type: "security", position: { x: 160, y: 36 }, data: { label: "PII検出器", sublabel: "Presidio / GiNZA", color: "#F59E0B" }, parentId: "e-z-input", extent: "parent" },
  { id: "e-classifier", type: "security", position: { x: 340, y: 36 }, data: { label: "Injection分類器", sublabel: "Lakera / NeMo", color: "#F59E0B" }, parentId: "e-z-input", extent: "parent" },
  { id: "e-input-dec", type: "decision", position: { x: 210, y: 100 }, data: { label: "検出結果", color: "#F59E0B" }, parentId: "e-z-input", extent: "parent" },

  // Block response
  { id: "e-block", type: "result", position: { x: 0, y: 290 }, data: { label: "⛔ ブロック応答", variant: "error" } },

  // Process layer
  { id: "e-z-proc", type: "zone", position: { x: 160, y: 290 }, data: { label: "LLM処理層", color: "#3B82F6" }, style: { width: 420, height: 110 } },
  { id: "e-sysprompt", type: "service", position: { x: 15, y: 36 }, data: { label: "システムプロンプト保護", color: "#3B82F6" }, parentId: "e-z-proc", extent: "parent" },
  { id: "e-context", type: "service", position: { x: 190, y: 36 }, data: { label: "コンテキスト分離", color: "#3B82F6" }, parentId: "e-z-proc", extent: "parent" },
  { id: "e-llm", type: "service", position: { x: 105, y: 70 }, data: { label: "LLM (推論実行)", color: "#8B5CF6" }, parentId: "e-z-proc", extent: "parent" },

  // Output layer
  { id: "e-z-output", type: "zone", position: { x: 80, y: 440 }, data: { label: "出力側ガードレール", color: "#10B981" }, style: { width: 560, height: 170 } },
  { id: "e-toxic", type: "security", position: { x: 15, y: 36 }, data: { label: "有害コンテンツ検出", color: "#10B981" }, parentId: "e-z-output", extent: "parent" },
  { id: "e-pii-re", type: "security", position: { x: 190, y: 36 }, data: { label: "PII再検出", color: "#10B981" }, parentId: "e-z-output", extent: "parent" },
  { id: "e-schema", type: "security", position: { x: 370, y: 36 }, data: { label: "構造化バリデーション", color: "#10B981" }, parentId: "e-z-output", extent: "parent" },
  { id: "e-out-dec", type: "decision", position: { x: 210, y: 100 }, data: { label: "検証結果", color: "#10B981" }, parentId: "e-z-output", extent: "parent" },

  // Results
  { id: "e-safe", type: "result", position: { x: 200, y: 650 }, data: { label: "✅ 検証済み応答", variant: "success" } },
  { id: "e-fallback", type: "result", position: { x: 440, y: 650 }, data: { label: "⚠️ フォールバック", variant: "warning" } },

  // Feedback
  { id: "e-z-fb", type: "zone", position: { x: 150, y: 730 }, data: { label: "フィードバックループ", color: "#A855F7" }, style: { width: 440, height: 80 } },
  { id: "e-report", type: "service", position: { x: 15, y: 32 }, data: { label: "誤検知レポート", color: "#A855F7" }, parentId: "e-z-fb", extent: "parent" },
  { id: "e-analysis", type: "service", position: { x: 160, y: 32 }, data: { label: "分析エンジン", color: "#A855F7" }, parentId: "e-z-fb", extent: "parent" },
  { id: "e-policy", type: "service", position: { x: 300, y: 32 }, data: { label: "ポリシー更新", color: "#A855F7" }, parentId: "e-z-fb", extent: "parent" },
];

const E_EDGES: Edge[] = [
  e("e-e1", "e-user", "e-blocklist"),
  e("e-e2", "e-blocklist", "e-pii"),
  e("e-e3", "e-pii", "e-classifier"),
  e("e-e4", "e-classifier", "e-input-dec"),
  e("e-e5", "e-input-dec", "e-sysprompt", "安全"),
  e("e-e6", "e-input-dec", "e-block", "ブロック"),
  e("e-e7", "e-sysprompt", "e-context"),
  e("e-e8", "e-context", "e-llm"),
  e("e-e9", "e-llm", "e-toxic"),
  e("e-e10", "e-toxic", "e-pii-re"),
  e("e-e11", "e-pii-re", "e-schema"),
  e("e-e12", "e-schema", "e-out-dec"),
  e("e-e13", "e-out-dec", "e-safe", "安全"),
  e("e-e14", "e-out-dec", "e-llm", "要修正", { style: { strokeDasharray: "5 5" } }),
  e("e-e15", "e-out-dec", "e-fallback", "ブロック"),
  e("e-e16", "e-safe", "e-report", undefined, { style: { strokeDasharray: "5 5" } }),
  e("e-e17", "e-block", "e-report", undefined, { style: { strokeDasharray: "5 5" } }),
  e("e-e18", "e-report", "e-analysis"),
  e("e-e19", "e-analysis", "e-policy"),
  e("e-e20", "e-policy", "e-blocklist", "ルール更新", { style: { strokeDasharray: "5 5" } }),
  e("e-e21", "e-policy", "e-classifier", "モデル更新", { style: { strokeDasharray: "5 5" } }),
];

// ═══════════════════════════════════════════════════════════════════════════
// Export registry
// ═══════════════════════════════════════════════════════════════════════════

export interface DiagramDef {
  id: string;
  title: string;
  caption: string;
  nodes: Node[];
  edges: Edge[];
  height?: number;
}

export const RF_DIAGRAMS: Record<string, DiagramDef> = {
  "aws-security": {
    id: "aws-security",
    title: "構成図A: クラウドネイティブ LLMセキュリティアーキテクチャ（AWS基準）",
    caption: "VPC設計、セキュリティレイヤーの配置、データフロー上の各チェックポイント",
    nodes: A_NODES,
    edges: A_EDGES,
    height: 580,
  },
  "zero-trust": {
    id: "zero-trust",
    title: "構成図B: ゼロトラスト LLMネットワーク構成",
    caption: "Identity-Aware Proxy → Istio mTLS → マイクロセグメンテーション",
    nodes: B_NODES,
    edges: B_EDGES,
    height: 480,
  },
  "multi-cloud": {
    id: "multi-cloud",
    title: "構成図C: マルチクラウド/ハイブリッド構成",
    caption: "統一ゲートウェイによるデータ分類ベースのルーティングとポリシー制御",
    nodes: C_NODES,
    edges: C_EDGES,
    height: 450,
  },
  "audit-pipeline": {
    id: "audit-pipeline",
    title: "構成図D: 監査・コンプライアンス基盤",
    caption: "ログ収集パイプライン → リアルタイム処理 → 3層ストレージ → 分析",
    nodes: D_NODES,
    edges: D_EDGES,
    height: 500,
  },
  "prompt-defense": {
    id: "prompt-defense",
    title: "構成図E: プロンプトセキュリティ多層防御",
    caption: "入力ガードレール → LLM処理 → 出力ガードレール → フィードバックループ",
    nodes: E_NODES,
    edges: E_EDGES,
    height: 580,
  },
};
