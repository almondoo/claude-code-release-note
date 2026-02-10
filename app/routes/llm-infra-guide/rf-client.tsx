import { useState, useEffect, type ReactNode } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { customNodeTypes } from "./rf-custom-nodes";

// ── ClientOnly wrapper for SSR safety ────────────────────────────────────

export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }): ReactNode {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return fallback ?? null;
  return <>{children}</>;
}

// ── Shared constants ─────────────────────────────────────────────────────

const DEFAULT_EDGE_OPTIONS = {
  style: { stroke: "#475569", strokeWidth: 1.5 },
  labelStyle: { fill: "#94A3B8", fontSize: 10 },
  labelBgStyle: { fill: "#0F172A", fillOpacity: 0.8 },
};

const BACKGROUND_PROPS = {
  variant: BackgroundVariant.Dots as const,
  color: "#1E293B",
  gap: 20,
  size: 1,
};

const EXPAND_BUTTON_BG = "rgba(15,23,42,0.85)";
const EXPAND_BUTTON_HOVER_BG = "rgba(51,65,85,0.9)";

// ── Shared hover handlers ────────────────────────────────────────────────

function onButtonEnter(e: React.MouseEvent<HTMLButtonElement>): void {
  e.currentTarget.style.background = EXPAND_BUTTON_HOVER_BG;
  e.currentTarget.style.color = "#E2E8F0";
}

function onButtonLeave(e: React.MouseEvent<HTMLButtonElement>, bg: string): void {
  e.currentTarget.style.background = bg;
  e.currentTarget.style.color = "#94A3B8";
}

// ── Expand / Close icons ─────────────────────────────────────────────────

function ExpandIcon(): React.JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function CloseIcon(): React.JSX.Element {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// ── Fullscreen overlay ───────────────────────────────────────────────────

function FullscreenOverlay({
  nodes,
  edges,
  title,
  caption,
  onClose,
}: {
  nodes: Node[];
  edges: Edge[];
  title?: string;
  caption?: string;
  onClose: () => void;
}): React.JSX.Element {
  useEffect(() => {
    function handler(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const closeBg = "rgba(30,41,59,0.6)";

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{ background: "#0B1120" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 shrink-0">
        <span className="text-[14px] font-semibold text-slate-200">
          {title || "構成図"}
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-slate-400 border border-slate-700 cursor-pointer transition-colors"
          style={{ background: closeBg }}
          onMouseEnter={onButtonEnter}
          onMouseLeave={(e) => onButtonLeave(e, closeBg)}
        >
          <CloseIcon />
          ESC
        </button>
      </div>

      {/* Diagram */}
      <div className="rf-dark flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={customNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          minZoom={0.1}
          maxZoom={4}
          defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        >
          <Background {...BACKGROUND_PROPS} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {/* Caption */}
      {caption && (
        <div className="text-[12px] text-slate-500 text-center py-2 border-t border-slate-800 italic shrink-0">
          {caption}
        </div>
      )}
    </div>
  );
}

// ── Expand button ────────────────────────────────────────────────────────

function ExpandButton({ onClick, className }: { onClick: () => void; className?: string }): React.JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] text-slate-400 border border-slate-700 cursor-pointer ${className || ""}`}
      style={{ background: EXPAND_BUTTON_BG }}
      onMouseEnter={onButtonEnter}
      onMouseLeave={(e) => onButtonLeave(e, EXPAND_BUTTON_BG)}
    >
      <ExpandIcon />
      拡大表示
    </button>
  );
}

// ── ReactFlow diagram component ──────────────────────────────────────────

export interface ReactFlowDiagramProps {
  nodes: Node[];
  edges: Edge[];
  title?: string;
  caption?: string;
  height?: number;
}

export function ReactFlowDiagram({
  nodes,
  edges,
  title,
  caption,
  height = 500,
}: ReactFlowDiagramProps): React.JSX.Element {
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <>
      <div
        className="rounded-xl border border-slate-700 overflow-hidden flex flex-col relative group"
        style={{ background: "rgba(15,23,42,0.6)" }}
      >
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex-1" />
            <span className="text-[13px] font-semibold text-slate-300">{title}</span>
            <div className="flex-1 flex justify-end">
              <ExpandButton onClick={() => setFullscreen(true)} />
            </div>
          </div>
        )}
        {!title && (
          <ExpandButton
            onClick={() => setFullscreen(true)}
            className="absolute top-2 right-2 z-10"
          />
        )}
        <ClientOnly
          fallback={
            <div
              className="flex items-center justify-center text-slate-600 text-[13px]"
              style={{ height }}
            >
              構成図を読み込み中...
            </div>
          }
        >
          <div className="rf-dark" style={{ height }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={customNodeTypes}
              fitView
              fitViewOptions={{ padding: 0.05 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              proOptions={{ hideAttribution: true }}
              minZoom={0.3}
              maxZoom={2}
              defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
            >
              <Background {...BACKGROUND_PROPS} />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </ClientOnly>
        {caption && (
          <div className="text-[12px] text-slate-500 text-center py-2 border-t border-slate-800 italic">
            {caption}
          </div>
        )}
      </div>

      {fullscreen && (
        <FullscreenOverlay
          nodes={nodes}
          edges={edges}
          title={title}
          caption={caption}
          onClose={() => setFullscreen(false)}
        />
      )}
    </>
  );
}
