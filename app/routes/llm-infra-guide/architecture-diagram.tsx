/**
 * CSS-drawn architecture diagrams for the survey report.
 * Three variants: "architecture" (horizontal flow), "layers" (vertical stack), "comparison" (columns).
 */

// ── Shared primitives ────────────────────────────────────────────────────

interface DiagramBoxProps {
  label: string;
  sublabel?: string;
  color: string;
  small?: boolean;
}

function DiagramBox({ label, sublabel, color, small }: DiagramBoxProps): React.JSX.Element {
  return (
    <div
      className="rounded-lg border-2 flex flex-col items-center justify-center text-center gap-0.5 shrink-0"
      style={{
        borderColor: color,
        background: `color-mix(in srgb, ${color} 8%, #0F172A)`,
        padding: small ? "6px 10px" : "10px 16px",
        minWidth: small ? 80 : 110,
      }}
    >
      <span className="text-[12px] font-semibold text-slate-200 leading-tight">{label}</span>
      {sublabel && <span className="text-[10px] text-slate-500 leading-tight">{sublabel}</span>}
    </div>
  );
}

interface ArrowProps {
  direction?: "right" | "down";
  label?: string;
  color?: string;
}

function Arrow({ direction = "right", label, color = "#475569" }: ArrowProps): React.JSX.Element {
  if (direction === "down") {
    return (
      <div className="flex flex-col items-center gap-0.5 py-1">
        <div className="w-px h-4" style={{ background: color }} />
        {label && <span className="text-[10px] text-slate-500">{label}</span>}
        <span style={{ color }} className="text-[11px] leading-none">&darr;</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-0.5 px-0.5 shrink-0">
      <div className="h-px w-4 md:w-6" style={{ background: color }} />
      {label && <span className="text-[10px] text-slate-500 whitespace-nowrap">{label}</span>}
      <span style={{ color }} className="text-[11px] leading-none">&rarr;</span>
    </div>
  );
}

function DiagramCaption({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="text-[12px] text-slate-500 text-center mt-2 italic">{children}</div>
  );
}

/** Shared background for diagram containers. */
const DIAGRAM_BG = "rgba(15,23,42,0.6)" as const;

// ── Architecture Diagram (horizontal flow) ───────────────────────────────

export interface ArchNode {
  label: string;
  sublabel?: string;
  color: string;
}

interface ArchitectureDiagramProps {
  title?: string;
  caption?: string;
  sources: ArchNode[];
  middleware: ArchNode[];
  destinations: ArchNode[];
  monitoring?: ArchNode;
}

export function ArchitectureDiagram({ title, caption, sources, middleware, destinations, monitoring }: ArchitectureDiagramProps): React.JSX.Element {
  return (
    <div
      className="rounded-xl border border-slate-700 px-5 py-5 flex flex-col gap-4"
      style={{ background: DIAGRAM_BG }}
    >
      {title && <div className="text-[13px] font-semibold text-slate-300 text-center">{title}</div>}

      {/* Main flow — stacks vertically on mobile, horizontal on desktop */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-3 md:gap-2 overflow-x-auto">
        {/* Sources */}
        <div className="flex flex-col gap-2 items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">ソース</span>
          {sources.map((s, i) => <DiagramBox key={i} {...s} />)}
        </div>

        <Arrow direction="right" />

        {/* Middleware stack */}
        <div className="flex flex-col gap-2 items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">処理レイヤー</span>
          {middleware.map((m, i) => <DiagramBox key={i} {...m} />)}
        </div>

        <Arrow direction="right" />

        {/* Destinations */}
        <div className="flex flex-col gap-2 items-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">LLM API</span>
          {destinations.map((d, i) => <DiagramBox key={i} {...d} small />)}
        </div>
      </div>

      {/* Monitoring (bottom bar) */}
      {monitoring && (
        <>
          <Arrow direction="down" label="ログ / メトリクス" color={monitoring.color} />
          <div className="flex justify-center">
            <DiagramBox {...monitoring} />
          </div>
        </>
      )}

      {caption && <DiagramCaption>{caption}</DiagramCaption>}
    </div>
  );
}

// ── Layer Stack Diagram (vertical) ───────────────────────────────────────

export interface LayerDef {
  label: string;
  items: string[];
  color: string;
}

interface LayerStackDiagramProps {
  title?: string;
  caption?: string;
  layers: LayerDef[];
}

export function LayerStackDiagram({ title, caption, layers }: LayerStackDiagramProps): React.JSX.Element {
  return (
    <div
      className="rounded-xl border border-slate-700 px-5 py-5 flex flex-col gap-3"
      style={{ background: DIAGRAM_BG }}
    >
      {title && <div className="text-[13px] font-semibold text-slate-300 text-center">{title}</div>}

      <div className="flex flex-col gap-0">
        {layers.map((layer, i) => (
          <div key={i} className="relative">
            {/* Layer bar */}
            <div
              className="rounded-lg border-2 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2"
              style={{
                borderColor: layer.color,
                background: `color-mix(in srgb, ${layer.color} 6%, #0F172A)`,
                marginTop: i > 0 ? -1 : 0,
              }}
            >
              <span
                className="text-[12px] font-bold shrink-0 sm:w-[140px]"
                style={{ color: layer.color }}
              >
                {layer.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {layer.items.map((item, j) => (
                  <span
                    key={j}
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{
                      background: `color-mix(in srgb, ${layer.color} 12%, transparent)`,
                      color: `color-mix(in srgb, ${layer.color} 80%, #E2E8F0)`,
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            {/* Connector arrow */}
            {i < layers.length - 1 && (
              <div className="flex justify-center -my-0.5 relative z-10">
                <span className="text-[11px] text-slate-600">&darr;</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {caption && <DiagramCaption>{caption}</DiagramCaption>}
    </div>
  );
}

// ── Comparison Columns Diagram ───────────────────────────────────────────

export interface ComparisonColumn {
  title: string;
  color: string;
  icon?: string;
  items: string[];
  footer?: string;
}

interface ComparisonDiagramProps {
  title?: string;
  caption?: string;
  columns: ComparisonColumn[];
}

export function ComparisonDiagram({ title, caption, columns }: ComparisonDiagramProps): React.JSX.Element {
  return (
    <div
      className="rounded-xl border border-slate-700 px-5 py-5 flex flex-col gap-4"
      style={{ background: DIAGRAM_BG }}
    >
      {title && <div className="text-[13px] font-semibold text-slate-300 text-center">{title}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {columns.map((col, i) => (
          <div
            key={i}
            className="rounded-lg border-2 px-4 py-4 flex flex-col gap-3"
            style={{
              borderColor: col.color,
              background: `color-mix(in srgb, ${col.color} 4%, #0F172A)`,
            }}
          >
            {/* Header */}
            <div className="text-[13px] font-bold text-center" style={{ color: col.color }}>
              {col.title}
            </div>

            {/* Items */}
            <div className="flex flex-col gap-1.5">
              {col.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2">
                  <span className="text-[11px] mt-0.5" style={{ color: col.color }}>&bull;</span>
                  <span className="text-[12px] text-slate-400 leading-snug">{item}</span>
                </div>
              ))}
            </div>

            {/* Footer badge */}
            {col.footer && (
              <div className="mt-auto pt-2 border-t" style={{ borderColor: `color-mix(in srgb, ${col.color} 20%, transparent)` }}>
                <span className="text-[11px] font-medium" style={{ color: col.color }}>{col.footer}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {caption && <DiagramCaption>{caption}</DiagramCaption>}
    </div>
  );
}

// ── Unified Diagram Block (dispatches to correct variant) ────────────────

export interface DiagramData {
  variant: "architecture" | "layers" | "comparison";
  title?: string;
  caption?: string;
  // architecture
  sources?: ArchNode[];
  middleware?: ArchNode[];
  destinations?: ArchNode[];
  monitoring?: ArchNode;
  // layers
  layers?: LayerDef[];
  // comparison
  columns?: ComparisonColumn[];
}

export function DiagramBlock({ data }: { data: DiagramData }): React.JSX.Element {
  const { title, caption } = data;

  switch (data.variant) {
    case "architecture":
      return (
        <ArchitectureDiagram
          title={title}
          caption={caption}
          sources={data.sources ?? []}
          middleware={data.middleware ?? []}
          destinations={data.destinations ?? []}
          monitoring={data.monitoring}
        />
      );
    case "layers":
      return <LayerStackDiagram title={title} caption={caption} layers={data.layers ?? []} />;
    case "comparison":
      return <ComparisonDiagram title={title} caption={caption} columns={data.columns ?? []} />;
  }
}
