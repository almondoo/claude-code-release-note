/**
 * Infrastructure diagrams for the survey report.
 * Internally uses ReactFlow via rf-converter for interactive rendering.
 * External API (InfraDiagramProps) is preserved for backward compatibility.
 */
import { useMemo } from "react";
import { ReactFlowDiagram, ClientOnly } from "./rf-client";
import { convertInfraDiagram } from "./rf-converter";

// ── Props ────────────────────────────────────────────────────────────────

export interface InfraDiagramProps {
  variant: "network" | "dataflow" | "cloudArch";
  title?: string;
  caption?: string;
  zones?: {
    label: string;
    color: string;
    items: { label: string; sublabel?: string }[];
  }[];
  connections?: {
    from: string;
    to: string;
    label?: string;
    style?: "solid" | "dashed";
  }[];
  stages?: { label: string; color: string; items: string[] }[];
  provider?: "aws" | "gcp" | "azure" | "generic";
  layers?: {
    label: string;
    color: string;
    services: { name: string; description?: string }[];
  }[];
}

// ── Height calculation ───────────────────────────────────────────────────

function computeDiagramHeight(props: InfraDiagramProps): number {
  if (props.variant === "dataflow") {
    const stages = props.stages ?? [];
    const maxItems = Math.max(...stages.map((s) => s.items.length), 1);
    const maxLabelLen = Math.max(...stages.flatMap((s) => s.items.map((item) => item.length)), 0);
    const itemSpacing = maxLabelLen > 15 ? 65 : 50;
    return Math.max(200, maxItems * itemSpacing + 100);
  }

  if (props.variant === "network") {
    const zones = props.zones ?? [];
    const hasLong = zones.some((z) => z.items.some((item) => (item.sublabel ?? "").length > 20));
    return Math.max(250, (zones.length || 1) * (hasLong ? 200 : 160));
  }

  const layers = props.layers ?? [];
  const hasLong = layers.some((l) => l.services.some((s) => (s.description ?? "").length > 20));
  return Math.max(250, (layers.length || 1) * (hasLong ? 180 : 150));
}

// ── Unified Export ────────────────────────────────────────────────────────

export function InfraDiagram(props: InfraDiagramProps): React.JSX.Element {
  const { nodes, edges } = useMemo(() => convertInfraDiagram(props), [props]);

  const height = useMemo(() => computeDiagramHeight(props), [props]);

  return (
    <ClientOnly
      fallback={
        <div
          className="rounded-xl border border-slate-700 flex items-center justify-center text-slate-600 text-[13px]"
          style={{ background: "rgba(15,23,42,0.6)", height }}
        >
          構成図を読み込み中...
        </div>
      }
    >
      <ReactFlowDiagram
        nodes={nodes}
        edges={edges}
        title={props.title}
        caption={props.caption}
        height={height}
      />
    </ClientOnly>
  );
}
