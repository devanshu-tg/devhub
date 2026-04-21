"use client";

import { useMemo } from "react";

type Props = {
  density?: number;
  opacity?: number;
  color?: string;
  edgeColor?: string;
  width?: number;
  height?: number;
  seed?: number;
  className?: string;
};

export function GraphMotif({
  density = 1,
  opacity = 1,
  color = "var(--tg-orange)",
  edgeColor,
  width = 1200,
  height = 600,
  seed = 7,
  className,
}: Props) {
  const { nodes, edges } = useMemo(() => {
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    const n = Math.max(6, Math.round(24 * density));
    const ns: Array<{ x: number; y: number; r: number }> = [];
    for (let i = 0; i < n; i++) {
      ns.push({ x: rand() * width, y: rand() * height, r: 1.5 + rand() * 2.5 });
    }
    const es: Array<[number, number, number]> = [];
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[i].x - ns[j].x;
        const dy = ns[i].y - ns[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 180 && rand() > 0.55) es.push([i, j, d]);
      }
    }
    return { nodes: ns, edges: es };
  }, [density, width, height, seed]);

  const resolvedEdge = edgeColor ?? "rgba(245, 130, 32, 0.22)";

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity,
        pointerEvents: "none",
      }}
    >
      <defs>
        <radialGradient id={`gm-${seed}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      {edges.map(([a, b, d], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke={resolvedEdge}
          strokeWidth={0.7}
          opacity={Math.max(0.1, 1 - d / 180)}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r * 3} fill={`url(#gm-${seed})`} opacity={0.35} />
          <circle cx={n.x} cy={n.y} r={n.r} fill={color} />
        </g>
      ))}
    </svg>
  );
}
