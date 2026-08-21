import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DiagramDef, DiagramNode, NodeKind } from "@/content/types";

const toneVar: Record<NodeKind, string> = {
  actor: "--violet",
  network: "--cyan",
  service: "--primary",
  data: "--chart-4",
  platform: "--muted-foreground",
  observe: "--chart-5",
};

const groupTone: Record<string, string> = {
  primary: "--primary",
  cyan: "--cyan",
  violet: "--violet",
  neutral: "--muted-foreground",
};

interface Anchor {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  path: string;
}

function nodeBox(n: DiagramNode) {
  const w = n.w ?? 176;
  const h = n.h ?? 96;
  return { x: n.x - w / 2, y: n.y - h / 2, w, h };
}

function edgePath(a: DiagramNode, b: DiagramNode, bend = 0): Anchor {
  const A = nodeBox(a);
  const B = nodeBox(b);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let x1: number, y1: number, x2: number, y2: number, path: string;

  if (Math.abs(dx) >= Math.abs(dy)) {
    const s = Math.sign(dx) || 1;
    x1 = a.x + (s * A.w) / 2;
    y1 = a.y;
    x2 = b.x - (s * B.w) / 2 - s * 10;
    y2 = b.y;
    const mx = (x1 + x2) / 2;
    path = `M ${x1} ${y1} C ${mx} ${y1 + bend} ${mx} ${y2 + bend} ${x2} ${y2}`;
  } else {
    const s = Math.sign(dy) || 1;
    x1 = a.x;
    y1 = a.y + (s * A.h) / 2;
    x2 = b.x;
    y2 = b.y - (s * B.h) / 2 - s * 10;
    const my = (y1 + y2) / 2;
    path = `M ${x1} ${y1} C ${x1 + bend} ${my} ${x2 + bend} ${my} ${x2} ${y2}`;
  }
  return { x1, y1, x2, y2, path };
}

interface Props {
  diagram: DiagramDef;
  title: string;
  className?: string;
  compact?: boolean;
}

export function DiagramCanvas({ diagram, title, className, compact }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [activePill, setActivePill] = useState<number | null>(null);

  const nodeMap = useMemo(
    () => Object.fromEntries(diagram.nodes.map((n) => [n.id, n])),
    [diagram.nodes],
  );

  const focus = hovered ?? active;
  const relatedNodes = useMemo(() => {
    if (!focus) return null;
    const set = new Set<string>([focus]);
    diagram.edges.forEach((e) => {
      if (e.from === focus) set.add(e.to);
      if (e.to === focus) set.add(e.from);
    });
    return set;
  }, [focus, diagram.edges]);

  const activeNode = active ? nodeMap[active] : null;
  const pill = activePill !== null ? diagram.pills?.[activePill] : null;

  return (
    <figure className={cn("relative", className)}>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
        <div className="absolute inset-0 bg-grid opacity-[0.35]" aria-hidden="true" />
        <svg
          viewBox={`0 0 ${diagram.width} ${diagram.height}`}
          className="relative w-full"
          role="img"
          aria-label={`${title} diagram`}
          style={{ maxHeight: compact ? 260 : undefined }}
        >
          <defs>
            <marker
              id="tid-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
            </marker>
          </defs>

          {/* groups */}
          {diagram.groups?.map((g) => (
            <g key={g.id}>
              <rect
                x={g.x}
                y={g.y}
                width={g.w}
                height={g.h}
                rx={26}
                fill={`color-mix(in oklab, var(${groupTone[g.tone ?? "neutral"]}) 5%, transparent)`}
                stroke={`color-mix(in oklab, var(${groupTone[g.tone ?? "neutral"]}) 35%, transparent)`}
                strokeDasharray="6 6"
              />
              <text
                x={g.x + 22}
                y={g.y + 30}
                fontSize={15}
                fontWeight={700}
                fill="var(--foreground)"
              >
                {g.label}
              </text>
              {g.sub && (
                <text x={g.x + 22} y={g.y + 50} fontSize={12} fill="var(--muted-foreground)">
                  {g.sub}
                </text>
              )}
            </g>
          ))}

          {/* edges */}
          {diagram.edges.map((e, i) => {
            const a = nodeMap[e.from];
            const b = nodeMap[e.to];
            if (!a || !b) return null;
            const { path, x1, y1, x2, y2 } = edgePath(a, b, e.bend ?? 0);
            const isRelated = focus ? e.from === focus || e.to === focus : false;
            const dim = focus ? !isRelated : false;
            return (
              <g key={i} style={{ opacity: dim ? 0.18 : 1, transition: "opacity .25s ease" }}>
                <path
                  d={path}
                  fill="none"
                  stroke={isRelated ? "var(--primary)" : "var(--grid)"}
                  strokeWidth={isRelated ? 2.4 : 1.6}
                  strokeDasharray={e.dashed ? "5 6" : undefined}
                  markerEnd="url(#tid-arrow)"
                  style={{ transition: "stroke .25s ease" }}
                />
                {e.animated && (
                  <path
                    d={path}
                    fill="none"
                    stroke={isRelated ? "var(--primary)" : "var(--cyan)"}
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    strokeDasharray="2 22"
                    style={{ animation: "flow-dash 3.2s linear infinite" }}
                  />
                )}
                {e.label && (
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 10 + (e.bend ?? 0) / 2}
                    textAnchor="middle"
                    fontSize={11.5}
                    fill="var(--muted-foreground)"
                  >
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* nodes */}
          {diagram.nodes.map((n) => {
            const box = nodeBox(n);
            const tone = toneVar[n.kind ?? "service"];
            const isFocus = focus === n.id;
            const dim = relatedNodes ? !relatedNodes.has(n.id) : false;
            return (
              <g
                key={n.id}
                tabIndex={0}
                role="button"
                aria-label={`${n.label}${n.sub ? `, ${n.sub}` : ""}`}
                aria-pressed={active === n.id}
                onMouseEnter={() => setHovered(n.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(n.id)}
                onBlur={() => setHovered(null)}
                onClick={() => {
                  setActivePill(null);
                  setActive((cur) => (cur === n.id ? null : n.id));
                }}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    setActivePill(null);
                    setActive((cur) => (cur === n.id ? null : n.id));
                  }
                }}
                style={{
                  cursor: "pointer",
                  opacity: dim ? 0.32 : 1,
                  transition: "opacity .25s ease",
                }}
                className="outline-none"
              >
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  rx={16}
                  fill="var(--surface)"
                  stroke={isFocus ? `var(${tone})` : "var(--border)"}
                  strokeWidth={isFocus ? 2.2 : 1.4}
                  style={{
                    filter: isFocus
                      ? "drop-shadow(0 10px 22px color-mix(in oklab, var(--primary) 22%, transparent))"
                      : "drop-shadow(0 2px 6px color-mix(in oklab, var(--foreground) 6%, transparent))",
                    transition: "stroke .2s ease, filter .2s ease",
                  }}
                />
                <rect x={box.x} y={box.y + 12} width={4} height={box.h - 24} rx={2} fill={`var(${tone})`} />
                <text
                  x={box.x + 18}
                  y={n.y + (n.sub ? -2 : 5)}
                  fontSize={15}
                  fontWeight={650}
                  fill="var(--foreground)"
                >
                  {n.label}
                </text>
                {n.sub && (
                  <text x={box.x + 18} y={n.y + 18} fontSize={11.5} fill="var(--muted-foreground)">
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}

          {/* concept pills */}
          {diagram.pills?.map((p, i) => {
            const w = p.label.length * 7.1 + 30;
            const isOn = activePill === i;
            return (
              <g
                key={p.label}
                tabIndex={0}
                role="button"
                aria-label={p.label}
                onClick={() => {
                  setActive(null);
                  setActivePill((cur) => (cur === i ? null : i));
                }}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    setActive(null);
                    setActivePill((cur) => (cur === i ? null : i));
                  }
                }}
                style={{ cursor: "pointer" }}
                className="outline-none"
              >
                <rect
                  x={p.x - w / 2}
                  y={p.y - 15}
                  width={w}
                  height={30}
                  rx={15}
                  fill={
                    isOn
                      ? "color-mix(in oklab, var(--primary) 14%, var(--surface))"
                      : "var(--surface-tint)"
                  }
                  stroke={isOn ? "var(--primary)" : "var(--border)"}
                  strokeWidth={isOn ? 1.8 : 1.2}
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  fontSize={12.5}
                  fontWeight={600}
                  fill={isOn ? "var(--primary)" : "var(--muted-foreground)"}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* contextual panel */}
        {(activeNode || pill) && (
          <div className="animate-fade-rise pointer-events-auto absolute bottom-4 left-4 right-4 z-10 max-w-md rounded-2xl border border-border bg-popover/95 p-4 shadow-lift backdrop-blur sm:left-6 sm:right-auto sm:w-96">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                  {activeNode ? "Node" : "Cloud characteristic"}
                </p>
                <h4 className="mt-1 text-base font-semibold">{activeNode?.label ?? pill?.label}</h4>
              </div>
              <button
                type="button"
                aria-label="Close explanation"
                onClick={() => {
                  setActive(null);
                  setActivePill(null);
                }}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {activeNode?.detail ?? pill?.note}
            </p>
          </div>
        )}
      </div>

      {(diagram.legend || diagram.caption) && (
        <figcaption className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {diagram.caption && (
            <span className="text-sm text-muted-foreground">{diagram.caption}</span>
          )}
          {diagram.legend && (
            <span className="flex flex-wrap gap-x-4 gap-y-2">
              {diagram.legend.map((l) => (
                <span key={l.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ background: `var(${toneVar[l.tone]})` }}
                  />
                  {l.label}
                </span>
              ))}
            </span>
          )}
        </figcaption>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        Hover a node to highlight its connections. Click or press Enter on a node for a short
        explanation.
      </p>
    </figure>
  );
}
