/**
 * Converts existing InfraDiagramProps data into ReactFlow nodes & edges.
 */
import type { Node, Edge } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";
import type { InfraDiagramProps } from "./infra-diagram";

interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

const GRID = { x: 180, y: 140, padding: 40 };

// ── Network variant ──────────────────────────────────────────────────────

function convertNetwork(
  props: Pick<InfraDiagramProps, "zones" | "connections">,
): FlowData {
  const zones = props.zones || [];
  const connections = props.connections || [];
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  let yOffset = 0;

  zones.forEach((zone, zi) => {
    const zoneId = `zone-${zi}`;
    const itemCount = zone.items.length;
    const zoneW = Math.max(300, itemCount * GRID.x + GRID.padding * 2);
    // Increase height when sublabels are long (text wraps inside nodes)
    const maxSublabelLen = Math.max(
      ...zone.items.map((item) => (item.sublabel || "").length),
      0,
    );
    const zoneH = maxSublabelLen > 20 ? 140 : 120;

    nodes.push({
      id: zoneId,
      type: "zone",
      position: { x: 0, y: yOffset },
      data: { label: zone.label, color: zone.color },
      style: { width: zoneW, height: zoneH },
    });

    zone.items.forEach((item, ii) => {
      nodes.push({
        id: `${zoneId}-item-${ii}`,
        type: "service",
        position: { x: GRID.padding + ii * GRID.x, y: 36 },
        data: { label: item.label, sublabel: item.sublabel, color: zone.color },
        parentId: zoneId,
        extent: "parent" as const,
      });
    });

    // Edge to next zone
    if (zi < zones.length - 1) {
      const conn = connections.find((c) => c.from === zone.label);
      edges.push({
        id: `e-zone-${zi}-${zi + 1}`,
        source: zoneId,
        target: `zone-${zi + 1}`,
        sourceHandle: "bottom",
        targetHandle: "top",
        label: conn?.label,
        animated: conn?.style === "dashed",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#475569" },
      });
    }

    yOffset += zoneH + 60;
  });

  // Non-adjacent connections
  const zoneLabels = zones.map((z) => z.label);
  connections.forEach((conn, ci) => {
    const fi = zoneLabels.indexOf(conn.from);
    const ti = zoneLabels.indexOf(conn.to);
    if (fi !== -1 && ti !== -1 && ti !== fi + 1) {
      edges.push({
        id: `e-side-${ci}`,
        source: `zone-${fi}`,
        target: `zone-${ti}`,
        sourceHandle: "bottom",
        targetHandle: "top",
        label: conn.label,
        animated: conn.style === "dashed",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#475569" },
        style: { strokeDasharray: conn.style === "dashed" ? "5 5" : undefined },
      });
    }
  });

  return { nodes, edges };
}

// ── Dataflow variant ─────────────────────────────────────────────────────

function convertDataflow(
  props: Pick<InfraDiagramProps, "stages">,
): FlowData {
  const stages = props.stages || [];
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Estimate per-item height: short text fits in 50px, long text needs 65px
  const maxLabelLen = Math.max(
    ...stages.flatMap((s) => s.items.map((item) => item.length)),
    0,
  );
  const itemSpacing = maxLabelLen > 15 ? 65 : 50;

  stages.forEach((stage, si) => {
    const stageId = `stage-${si}`;
    const maxItems = Math.max(...stages.map((s) => s.items.length));
    const stageH = Math.max(120, maxItems * itemSpacing + 60);
    const stageW = 200;

    nodes.push({
      id: stageId,
      type: "zone",
      position: { x: si * (stageW + 60), y: 0 },
      data: { label: stage.label, color: stage.color },
      style: { width: stageW, height: stageH },
    });

    stage.items.forEach((item, ii) => {
      nodes.push({
        id: `${stageId}-item-${ii}`,
        type: "service",
        position: { x: 20, y: 36 + ii * itemSpacing },
        data: { label: item, color: stage.color },
        parentId: stageId,
        extent: "parent" as const,
      });
    });

    if (si < stages.length - 1) {
      edges.push({
        id: `e-stage-${si}`,
        source: stageId,
        target: `stage-${si + 1}`,
        sourceHandle: "right",
        targetHandle: "left",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#475569" },
      });
    }
  });

  return { nodes, edges };
}

// ── CloudArch variant ────────────────────────────────────────────────────

function convertCloudArch(
  props: Pick<InfraDiagramProps, "layers" | "provider">,
): FlowData {
  const layers = props.layers || [];
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const PROVIDER_COLORS: Record<string, string> = {
    aws: "#FF9900", gcp: "#4285F4", azure: "#0078D4", generic: "#64748B",
  };
  const providerColor = PROVIDER_COLORS[props.provider || "generic"] || "#64748B";

  let yOffset = 0;

  layers.forEach((layer, li) => {
    const layerId = `layer-${li}`;
    const svcCount = layer.services.length;
    const layerW = Math.max(350, svcCount * GRID.x + GRID.padding * 2);
    // Estimate height: sublabels with long descriptions need more room
    const maxDescLen = Math.max(
      ...layer.services.map((s) => (s.description || "").length),
      0,
    );
    const layerH = maxDescLen > 20 ? 130 : 110;

    nodes.push({
      id: layerId,
      type: "zone",
      position: { x: 0, y: yOffset },
      data: { label: layer.label, color: layer.color || providerColor },
      style: { width: layerW, height: layerH },
    });

    layer.services.forEach((svc, si) => {
      nodes.push({
        id: `${layerId}-svc-${si}`,
        type: "service",
        position: { x: GRID.padding + si * GRID.x, y: 36 },
        data: { label: svc.name, sublabel: svc.description, color: layer.color || providerColor },
        parentId: layerId,
        extent: "parent" as const,
      });
    });

    if (li < layers.length - 1) {
      edges.push({
        id: `e-layer-${li}`,
        source: layerId,
        target: `layer-${li + 1}`,
        sourceHandle: "bottom",
        targetHandle: "top",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#475569" },
      });
    }

    yOffset += layerH + 50;
  });

  return { nodes, edges };
}

// ── Public API ───────────────────────────────────────────────────────────

export function convertInfraDiagram(props: InfraDiagramProps): FlowData {
  switch (props.variant) {
    case "network":
      return convertNetwork(props);
    case "dataflow":
      return convertDataflow(props);
    case "cloudArch":
      return convertCloudArch(props);
    default:
      return { nodes: [], edges: [] };
  }
}
