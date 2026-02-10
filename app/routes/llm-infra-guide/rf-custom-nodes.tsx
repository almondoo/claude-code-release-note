import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CSSProperties } from "react";

// ── Shared styles & helpers ─────────────────────────────────────────────

export interface NodeData {
  label: string;
  sublabel?: string;
  color?: string;
  [key: string]: unknown;
}

function handleStyle(color: string): CSSProperties {
  return { background: color, width: 6, height: 6 };
}

const labelStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: "#E2E8F0", lineHeight: 1.3 };
const sublabelStyle: CSSProperties = { fontSize: 10, color: "#94A3B8", lineHeight: 1.3, marginTop: 2 };

function NodeLabel({ label, sublabel }: { label: string; sublabel?: string }): React.JSX.Element {
  return (
    <>
      <div style={labelStyle}>{label}</div>
      {sublabel && <div style={sublabelStyle}>{sublabel}</div>}
    </>
  );
}

// ── Service Node ─────────────────────────────────────────────────────────

export function ServiceNode({ data }: NodeProps): React.JSX.Element {
  const d = data as NodeData;
  const color = d.color || "#3B82F6";
  return (
    <div
      style={{
        background: `color-mix(in srgb, ${color} 10%, #0F172A)`,
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: "8px 14px",
        minWidth: 100,
        maxWidth: 160,
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle(color)} />
      <NodeLabel label={d.label} sublabel={d.sublabel} />
      <Handle type="source" position={Position.Bottom} style={handleStyle(color)} />
    </div>
  );
}

// ── Security Node ────────────────────────────────────────────────────────

export function SecurityNode({ data }: NodeProps): React.JSX.Element {
  const d = data as NodeData;
  const color = d.color || "#EF4444";
  return (
    <div
      style={{
        background: `color-mix(in srgb, ${color} 12%, #0F172A)`,
        border: `2px solid ${color}`,
        borderRadius: 8,
        padding: "8px 14px",
        minWidth: 100,
        maxWidth: 160,
        textAlign: "center",
        boxShadow: `0 0 8px ${color}20`,
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle(color)} />
      <NodeLabel label={d.label} sublabel={d.sublabel} />
      <Handle type="source" position={Position.Bottom} style={handleStyle(color)} />
    </div>
  );
}

// ── Zone Node (group) ────────────────────────────────────────────────────

export function ZoneNode({ data }: NodeProps): React.JSX.Element {
  const d = data as NodeData;
  const color = d.color || "#64748B";
  return (
    <div
      style={{
        background: `color-mix(in srgb, ${color} 5%, rgba(15,23,42,0.8))`,
        border: `2px dashed ${color}50`,
        borderRadius: 12,
        padding: "32px 12px 12px",
        width: "100%",
        height: "100%",
        minWidth: 200,
        minHeight: 80,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 12,
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color,
        }}
      >
        {d.label}
      </div>
    </div>
  );
}

// ── Decision Node ────────────────────────────────────────────────────────

export function DecisionNode({ data }: NodeProps): React.JSX.Element {
  const d = data as NodeData;
  const color = d.color || "#F59E0B";
  return (
    <div
      style={{
        width: 100,
        height: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle(color)} />
      <div
        style={{
          width: 80,
          height: 80,
          transform: "rotate(45deg)",
          background: `color-mix(in srgb, ${color} 12%, #0F172A)`,
          border: `2px solid ${color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            transform: "rotate(-45deg)",
            fontSize: 10,
            fontWeight: 600,
            color: "#E2E8F0",
            textAlign: "center",
            lineHeight: 1.2,
            padding: 4,
          }}
        >
          {d.label}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} style={handleStyle(color)} />
      <Handle type="source" position={Position.Right} id="right" style={handleStyle(color)} />
      <Handle type="source" position={Position.Left} id="left" style={handleStyle(color)} />
    </div>
  );
}

// ── Result Node ──────────────────────────────────────────────────────────

interface ResultNodeData {
  label: string;
  variant?: "success" | "error" | "warning";
  [key: string]: unknown;
}

export function ResultNode({ data }: NodeProps): React.JSX.Element {
  const d = data as ResultNodeData;
  const colorMap = { success: "#10B981", error: "#EF4444", warning: "#F59E0B" };
  const color = colorMap[d.variant || "success"];
  return (
    <div
      style={{
        background: `color-mix(in srgb, ${color} 12%, #0F172A)`,
        border: `2px solid ${color}`,
        borderRadius: 20,
        padding: "6px 16px",
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Top} style={handleStyle(color)} />
      <div style={{ fontSize: 11, fontWeight: 600, color, lineHeight: 1.3 }}>{d.label}</div>
    </div>
  );
}

// ── Node type registry ───────────────────────────────────────────────────

export const customNodeTypes = {
  service: ServiceNode,
  security: SecurityNode,
  zone: ZoneNode,
  decision: DecisionNode,
  result: ResultNode,
};
