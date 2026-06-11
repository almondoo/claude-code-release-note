import React from "react";

import { useT } from "~/i18n/useT";

// ---------------------------------------------------------------------------
// Color tokens
// ---------------------------------------------------------------------------

const C = {
  nodeStroke: "#94a3b8", // slate-400
  nodeFill: "#1e293b", // slate-800
  text: "#cbd5e1", // slate-300
  subText: "#94a3b8", // slate-400
  accent: "#e0734d", // coral
  verifier: "#7ba6c9", // slate-blue
  discardedStroke: "#475569", // slate-600
  doneFill: "#0f172a", // near-black
  doneBorder: "#334155", // slate-700
} as const;

// ---------------------------------------------------------------------------
// Geometry helpers — keep arrow tips on the node boundary (no overlap)
// ---------------------------------------------------------------------------

// Endpoint of an arrow that starts at (sx,sy) and points toward (cx,cy),
// stopped `gap` px outside a circle of radius `r`. Diamonds/effective shapes
// pass an approximate radius.
const toShape = (
  sx: number,
  sy: number,
  cx: number,
  cy: number,
  r: number,
  gap = 5,
): [number, number] => {
  const d = Math.hypot(cx - sx, cy - sy) || 1;
  return [cx - ((cx - sx) / d) * (r + gap), cy - ((cy - sy) / d) * (r + gap)];
};

// Both endpoints of a connector between two circles, each stopped `gap` px
// outside its circle (used for bidirectional arrows).
const betweenCircles = (
  ax: number,
  ay: number,
  ar: number,
  bx: number,
  by: number,
  br: number,
  gap = 5,
): [number, number, number, number] => {
  const d = Math.hypot(bx - ax, by - ay) || 1;
  const ux = (bx - ax) / d;
  const uy = (by - ay) / d;
  return [ax + ux * (ar + gap), ay + uy * (ar + gap), bx - ux * (br + gap), by - uy * (br + gap)];
};

// ---------------------------------------------------------------------------
// Shared SVG defs (markers)
// ---------------------------------------------------------------------------

const SvgDefs = () => (
  <defs>
    {/* Default slate arrow */}
    <marker id="arrow-slate" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill={C.nodeStroke} />
    </marker>
    {/* Accent (coral) arrow */}
    <marker id="arrow-accent" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill={C.accent} />
    </marker>
    {/* Verifier (slate-blue) arrow */}
    <marker id="arrow-verifier" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill={C.verifier} />
    </marker>
    {/* Verifier arrow at start (for bidirectional) */}
    <marker
      id="arrow-verifier-start"
      markerWidth="8"
      markerHeight="8"
      refX="2"
      refY="3"
      orient="auto-start-reverse"
    >
      <path d="M0,0 L0,6 L8,3 z" fill={C.verifier} />
    </marker>
    {/* Discarded (dashed grey) arrow */}
    <marker id="arrow-discard" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill={C.discardedStroke} />
    </marker>
    {/* Accent arrow at start (for loop arc) */}
    <marker
      id="arrow-accent-start"
      markerWidth="8"
      markerHeight="8"
      refX="2"
      refY="3"
      orient="auto-start-reverse"
    >
      <path d="M0,0 L0,6 L8,3 z" fill={C.accent} />
    </marker>
  </defs>
);

// ---------------------------------------------------------------------------
// 1. ClassifyAndActDiagram
// ---------------------------------------------------------------------------

export const ClassifyAndActDiagram = (): React.JSX.Element => {
  const t = useT();
  const tip = [230, 110] as const; // classifier diamond right vertex (branch source)
  const r = 22;
  const eDiamond = toShape(100, 110, 200, 110, 30, 5); // task → classifier
  const eA = toShape(tip[0], tip[1], 360, 48, r);
  const eB = toShape(tip[0], tip[1], 360, 110, r);
  const eC = toShape(tip[0], tip[1], 360, 172, r);
  return (
    <svg
      viewBox="0 0 520 220"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={t.workflows.svgAriaClassify}
      xmlns="http://www.w3.org/2000/svg"
    >
      <SvgDefs />

      {/* task box */}
      <rect
        x="20"
        y="90"
        width="80"
        height="40"
        rx="8"
        fill={C.nodeFill}
        stroke={C.nodeStroke}
        strokeWidth="2"
      />
      <text x="60" y="115" textAnchor="middle" fill={C.text} fontSize="13" fontFamily="inherit">
        task
      </text>

      {/* task → diamond */}
      <line
        x1="100"
        y1="110"
        x2={eDiamond[0]}
        y2={eDiamond[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />

      {/* diamond (classifier) */}
      <polygon
        points="200,85 230,110 200,135 170,110"
        fill={C.nodeFill}
        stroke={C.nodeStroke}
        strokeWidth="2"
      />
      <text x="200" y="155" textAnchor="middle" fill={C.subText} fontSize="11" fontFamily="inherit">
        classifier
      </text>

      {/* diamond → agent A (top) */}
      <line
        x1={tip[0]}
        y1={tip[1]}
        x2={eA[0]}
        y2={eA[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />
      {/* diamond → agent B (middle, accent) */}
      <line
        x1={tip[0]}
        y1={tip[1]}
        x2={eB[0]}
        y2={eB[1]}
        stroke={C.accent}
        strokeWidth="2.5"
        markerEnd="url(#arrow-accent)"
      />
      {/* diamond → agent C (bottom) */}
      <line
        x1={tip[0]}
        y1={tip[1]}
        x2={eC[0]}
        y2={eC[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />

      {/* agent A circle (empty node, external label) */}
      <circle cx="360" cy="48" r="22" fill={C.nodeFill} stroke={C.nodeStroke} strokeWidth="2" />
      <text x="392" y="52" fill={C.subText} fontSize="12" fontFamily="inherit">
        agent A
      </text>

      {/* agent B circle (accent stroke, empty node, external label) */}
      <circle cx="360" cy="110" r="22" fill={C.nodeFill} stroke={C.accent} strokeWidth="2.5" />
      <text x="392" y="114" fill={C.accent} fontSize="12" fontFamily="inherit">
        agent B
      </text>

      {/* agent C circle (empty node, external label) */}
      <circle cx="360" cy="172" r="22" fill={C.nodeFill} stroke={C.nodeStroke} strokeWidth="2" />
      <text x="392" y="176" fill={C.subText} fontSize="12" fontFamily="inherit">
        agent C
      </text>
    </svg>
  );
};

// ---------------------------------------------------------------------------
// 2. FanOutSynthesizeDiagram
// ---------------------------------------------------------------------------

export const FanOutSynthesizeDiagram = (): React.JSX.Element => {
  const t = useT();
  const workers = [48, 100, 140, 192];
  const eSynth = toShape(254, 120, 368, 120, 24, 5); // barrier → synthesize
  return (
    <svg
      viewBox="0 0 520 240"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={t.workflows.svgAriaFanOut}
      xmlns="http://www.w3.org/2000/svg"
    >
      <SvgDefs />

      {/* task box */}
      <rect
        x="20"
        y="100"
        width="80"
        height="40"
        rx="8"
        fill={C.nodeFill}
        stroke={C.nodeStroke}
        strokeWidth="2"
      />
      <text x="60" y="125" textAnchor="middle" fill={C.text} fontSize="13" fontFamily="inherit">
        task
      </text>

      {/* fan-out lines to 4 workers (stop on each circle's left edge) */}
      {workers.map((cy, i) => {
        const e = toShape(100, 120, 210, cy, 18, 4);
        return (
          <line
            key={i}
            x1="100"
            y1="120"
            x2={e[0]}
            y2={e[1]}
            stroke={C.nodeStroke}
            strokeWidth="2"
            markerEnd="url(#arrow-slate)"
          />
        );
      })}

      {/* worker circles */}
      {workers.map((cy, i) => (
        <circle
          key={i}
          cx="210"
          cy={cy}
          r="18"
          fill={C.nodeFill}
          stroke={C.nodeStroke}
          strokeWidth="2"
        />
      ))}

      {/* barrier – thick accent vertical rectangle */}
      <rect x="238" y="24" width="16" height="192" rx="4" fill={C.accent} />

      {/* lines from workers to barrier */}
      {workers.map((cy, i) => (
        <line key={i} x1="228" y1={cy} x2="238" y2={cy} stroke={C.nodeStroke} strokeWidth="2" />
      ))}

      {/* barrier label */}
      <text x="246" y="18" textAnchor="middle" fill={C.accent} fontSize="11" fontFamily="inherit">
        barrier
      </text>

      {/* barrier → synthesize */}
      <line
        x1="254"
        y1="120"
        x2={eSynth[0]}
        y2={eSynth[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />

      {/* synthesize circle (empty node, external label) */}
      <circle cx="368" cy="120" r="24" fill={C.nodeFill} stroke={C.nodeStroke} strokeWidth="2" />
      <text x="368" y="160" textAnchor="middle" fill={C.subText} fontSize="12" fontFamily="inherit">
        synthesize
      </text>
    </svg>
  );
};

// ---------------------------------------------------------------------------
// 3. AdversarialVerificationDiagram
// ---------------------------------------------------------------------------

export const AdversarialVerificationDiagram = (): React.JSX.Element => {
  const t = useT();
  const worker = [120, 110, 28] as const;
  const verifiers = [55, 110, 165];
  return (
    <svg
      viewBox="0 0 480 220"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={t.workflows.svgAriaAdversarial}
      xmlns="http://www.w3.org/2000/svg"
    >
      <SvgDefs />

      {/* worker circle (empty node, external label) */}
      <circle cx="120" cy="110" r="28" fill={C.nodeFill} stroke={C.nodeStroke} strokeWidth="2" />
      <text x="120" y="154" textAnchor="middle" fill={C.subText} fontSize="12" fontFamily="inherit">
        worker
      </text>

      {/* verifiers label */}
      <text x="340" y="22" textAnchor="middle" fill={C.verifier} fontSize="12" fontFamily="inherit">
        verifiers
      </text>

      {/* verifier circles (empty nodes) */}
      {verifiers.map((cy, i) => (
        <circle
          key={i}
          cx="340"
          cy={cy}
          r="24"
          fill={C.nodeFill}
          stroke={C.verifier}
          strokeWidth="2"
        />
      ))}

      {/* bidirectional arrows: worker ↔ verifiers (stop on both circle edges) */}
      {verifiers.map((cy, i) => {
        const g = betweenCircles(worker[0], worker[1], worker[2], 340, cy, 24, 5);
        return (
          <line
            key={i}
            x1={g[0]}
            y1={g[1]}
            x2={g[2]}
            y2={g[3]}
            stroke={C.verifier}
            strokeWidth="2"
            markerStart="url(#arrow-verifier-start)"
            markerEnd="url(#arrow-verifier)"
          />
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------
// 4. GenerateAndFilterDiagram
// ---------------------------------------------------------------------------

export const GenerateAndFilterDiagram = (): React.JSX.Element => {
  const t = useT();
  return (
    <svg
      viewBox="0 0 540 260"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={t.workflows.svgAriaGenerationFilter}
      xmlns="http://www.w3.org/2000/svg"
    >
      <SvgDefs />

      {/* generators label */}
      <text x="50" y="28" textAnchor="middle" fill={C.subText} fontSize="11" fontFamily="inherit">
        generators
      </text>

      {/* generator circles */}
      {[55, 110, 165].map((cy, i) => (
        <circle
          key={i}
          cx="50"
          cy={cy}
          r="20"
          fill={C.nodeFill}
          stroke={C.nodeStroke}
          strokeWidth="2"
        />
      ))}

      {/* generator → ideas lines */}
      {[55, 110, 165].map((cy, i) => (
        <line
          key={i}
          x1="72"
          y1={cy}
          x2="148"
          y2={cy}
          stroke={C.nodeStroke}
          strokeWidth="2"
          markerEnd="url(#arrow-slate)"
        />
      ))}

      {/* ideas rectangles (5 items, spread across y) */}
      {[40, 70, 105, 140, 170].map((cy, i) => (
        <rect
          key={i}
          x="155"
          y={cy}
          width="50"
          height="22"
          rx="4"
          fill={C.nodeFill}
          stroke={C.nodeStroke}
          strokeWidth="1.5"
        />
      ))}
      <text x="180" y="210" textAnchor="middle" fill={C.subText} fontSize="11" fontFamily="inherit">
        ideas
      </text>

      {/* ideas → filter convergence lines (fan into the filter; no stacked arrowheads) */}
      {[51, 81, 116, 151, 181].map((cy, i) => (
        <line key={i} x1="205" y1={cy} x2="277" y2={110} stroke={C.nodeStroke} strokeWidth="1.5" />
      ))}

      {/* filter box (accent) */}
      <rect
        x="277"
        y="82"
        width="80"
        height="56"
        rx="8"
        fill={C.nodeFill}
        stroke={C.accent}
        strokeWidth="2"
      />
      <text
        x="317"
        y="107"
        textAnchor="middle"
        fill={C.accent}
        fontSize="13"
        fontFamily="inherit"
        fontWeight="600"
      >
        filter
      </text>
      <text x="317" y="125" textAnchor="middle" fill={C.subText} fontSize="10" fontFamily="inherit">
        rubric + dedupe
      </text>

      {/* filter → best (accent solid arrow, upper right) */}
      <line
        x1="357"
        y1="98"
        x2="418"
        y2="68"
        stroke={C.accent}
        strokeWidth="2"
        markerEnd="url(#arrow-accent)"
      />

      {/* best boxes */}
      <rect
        x="425"
        y="45"
        width="52"
        height="20"
        rx="4"
        fill={C.nodeFill}
        stroke={C.accent}
        strokeWidth="1.5"
      />
      <rect
        x="425"
        y="70"
        width="52"
        height="20"
        rx="4"
        fill={C.nodeFill}
        stroke={C.accent}
        strokeWidth="1.5"
      />
      <text x="451" y="38" textAnchor="middle" fill={C.accent} fontSize="11" fontFamily="inherit">
        best
      </text>

      {/* filter → discarded (dashed grey arrow, lower right) */}
      <line
        x1="357"
        y1="124"
        x2="418"
        y2="162"
        stroke={C.discardedStroke}
        strokeWidth="2"
        strokeDasharray="5,4"
        markerEnd="url(#arrow-discard)"
      />

      {/* discarded box */}
      <rect
        x="425"
        y="152"
        width="80"
        height="22"
        rx="4"
        fill={C.nodeFill}
        stroke={C.discardedStroke}
        strokeWidth="1.5"
        strokeDasharray="5,4"
      />
      <text x="465" y="167" textAnchor="middle" fill={C.subText} fontSize="11" fontFamily="inherit">
        discarded
      </text>
    </svg>
  );
};

// ---------------------------------------------------------------------------
// 5. TournamentDiagram
// ---------------------------------------------------------------------------

export const TournamentDiagram = (): React.JSX.Element => {
  const t = useT();
  const eUp1 = toShape(68, 45, 200, 95, 20, 3);
  const eUp2 = toShape(68, 95, 200, 95, 20, 3);
  const eLo1 = toShape(68, 145, 200, 165, 20, 3);
  const eLo2 = toShape(68, 195, 200, 165, 20, 3);
  const eFin1 = toShape(222, 95, 340, 140, 24, 3);
  const eFin2 = toShape(222, 165, 340, 140, 24, 3);
  return (
    <svg
      viewBox="0 0 520 240"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={t.workflows.svgAriaTournament}
      xmlns="http://www.w3.org/2000/svg"
    >
      <SvgDefs />

      {/* attempts label */}
      <text x="50" y="22" textAnchor="middle" fill={C.subText} fontSize="11" fontFamily="inherit">
        attempts
      </text>

      {/* attempt circles */}
      {[45, 95, 145, 195].map((cy, i) => (
        <circle
          key={i}
          cx="50"
          cy={cy}
          r="18"
          fill={C.nodeFill}
          stroke={C.nodeStroke}
          strokeWidth="2"
        />
      ))}

      {/* top pair → upper judge */}
      <line
        x1="68"
        y1="45"
        x2={eUp1[0]}
        y2={eUp1[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />
      <line
        x1="68"
        y1="95"
        x2={eUp2[0]}
        y2={eUp2[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />

      {/* bottom pair → lower judge */}
      <line
        x1="68"
        y1="145"
        x2={eLo1[0]}
        y2={eLo1[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />
      <line
        x1="68"
        y1="195"
        x2={eLo2[0]}
        y2={eLo2[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />

      {/* pairwise judges label */}
      <text x="200" y="52" textAnchor="middle" fill={C.subText} fontSize="10" fontFamily="inherit">
        pairwise
      </text>
      <text x="200" y="64" textAnchor="middle" fill={C.subText} fontSize="10" fontFamily="inherit">
        judges
      </text>

      {/* upper judge diamond */}
      <polygon
        points="200,75 222,95 200,115 178,95"
        fill={C.nodeFill}
        stroke={C.accent}
        strokeWidth="2"
      />

      {/* lower judge diamond */}
      <polygon
        points="200,145 222,165 200,185 178,165"
        fill={C.nodeFill}
        stroke={C.accent}
        strokeWidth="2"
      />

      {/* upper judge → final */}
      <line
        x1="222"
        y1="95"
        x2={eFin1[0]}
        y2={eFin1[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />

      {/* lower judge → final */}
      <line
        x1="222"
        y1="165"
        x2={eFin2[0]}
        y2={eFin2[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />

      {/* final diamond */}
      <polygon
        points="340,120 368,140 340,160 312,140"
        fill={C.nodeFill}
        stroke={C.accent}
        strokeWidth="2"
      />
      <text x="340" y="178" textAnchor="middle" fill={C.accent} fontSize="11" fontFamily="inherit">
        final
      </text>

      {/* final → winner */}
      <line
        x1="368"
        y1="140"
        x2="408"
        y2="140"
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />

      {/* winner box */}
      <rect
        x="415"
        y="118"
        width="80"
        height="44"
        rx="8"
        fill={C.nodeFill}
        stroke={C.nodeStroke}
        strokeWidth="2"
      />
      <text x="455" y="145" textAnchor="middle" fill={C.text} fontSize="13" fontFamily="inherit">
        winner
      </text>
    </svg>
  );
};

// ---------------------------------------------------------------------------
// 6. LoopUntilDoneDiagram
// ---------------------------------------------------------------------------

export const LoopUntilDoneDiagram = (): React.JSX.Element => {
  const t = useT();
  const eDiamond = toShape(108, 140, 255, 140, 40, 5); // agent → new findings?
  return (
    <svg
      viewBox="0 0 500 240"
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={t.workflows.svgAriaLoopUntilDone}
      xmlns="http://www.w3.org/2000/svg"
    >
      <SvgDefs />

      {/* agent circle (empty node, external label) */}
      <circle cx="80" cy="140" r="28" fill={C.nodeFill} stroke={C.nodeStroke} strokeWidth="2" />
      <text x="80" y="184" textAnchor="middle" fill={C.subText} fontSize="12" fontFamily="inherit">
        agent
      </text>

      {/* agent → diamond */}
      <line
        x1="108"
        y1="140"
        x2={eDiamond[0]}
        y2={eDiamond[1]}
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />

      {/* diamond (new findings?) */}
      <polygon
        points="255,110 295,140 255,170 215,140"
        fill={C.nodeFill}
        stroke={C.nodeStroke}
        strokeWidth="2"
      />
      <text x="255" y="190" textAnchor="middle" fill={C.subText} fontSize="11" fontFamily="inherit">
        new findings?
      </text>

      {/* diamond → done (right, "no") */}
      <line
        x1="295"
        y1="140"
        x2="378"
        y2="140"
        stroke={C.nodeStroke}
        strokeWidth="2"
        markerEnd="url(#arrow-slate)"
      />
      <text x="335" y="132" textAnchor="middle" fill={C.subText} fontSize="11" fontFamily="inherit">
        no
      </text>

      {/* done box (black square, empty, external label) */}
      <rect
        x="385"
        y="118"
        width="60"
        height="44"
        rx="4"
        fill={C.doneFill}
        stroke={C.doneBorder}
        strokeWidth="2"
      />
      <text x="415" y="182" textAnchor="middle" fill={C.subText} fontSize="12" fontFamily="inherit">
        done
      </text>

      {/* arc from diamond top back to agent top (yes — spawn another) */}
      <path
        d="M255,110 C255,40 80,40 80,107"
        fill="none"
        stroke={C.accent}
        strokeWidth="2"
        markerEnd="url(#arrow-accent)"
      />
      <text x="170" y="30" textAnchor="middle" fill={C.accent} fontSize="11" fontFamily="inherit">
        yes — spawn another
      </text>
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Pattern diagram map (fixed interface contract)
// ---------------------------------------------------------------------------

export const PATTERN_DIAGRAMS: Record<string, () => React.JSX.Element> = {
  "classify-and-act": ClassifyAndActDiagram,
  "fan-out-and-synthesize": FanOutSynthesizeDiagram,
  "adversarial-verification": AdversarialVerificationDiagram,
  "generate-and-filter": GenerateAndFilterDiagram,
  tournament: TournamentDiagram,
  "loop-until-done": LoopUntilDoneDiagram,
};
