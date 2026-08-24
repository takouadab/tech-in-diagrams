import { useId, useMemo, useState } from "react";
import { X, Sparkle, MousePointerClick } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toMobileDiagram } from "./mobile-layout";
import type { DiagramDef, DiagramEdge, DiagramNode, NodeKind } from "@/content/types";

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

/** Minimal 20x20 vector glyphs, drawn in the node accent colour. */
function NodeGlyph({ kind, color }: { kind: NodeKind; color: string }) {
  const s = { fill: "none", stroke: color, strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "actor":
      return (
        <g {...s}>
          <circle cx="10" cy="7" r="3.1" />
          <path d="M4.4 16c0-3.1 2.5-5 5.6-5s5.6 1.9 5.6 5" />
        </g>
      );
    case "network":
      return (
        <g {...s}>
          <circle cx="10" cy="10" r="6.4" />
          <path d="M3.6 10h12.8M10 3.6c1.8 2 2.7 4.1 2.7 6.4S11.8 14.4 10 16.4C8.2 14.4 7.3 12.3 7.3 10S8.2 5.6 10 3.6Z" />
        </g>
      );
    case "data":
      return (
        <g {...s}>
          <ellipse cx="10" cy="5.6" rx="5.6" ry="2.3" />
          <path d="M4.4 5.6v8.8c0 1.3 2.5 2.3 5.6 2.3s5.6-1 5.6-2.3V5.6" />
          <path d="M4.4 10c0 1.3 2.5 2.3 5.6 2.3s5.6-1 5.6-2.3" />
        </g>
      );
    case "platform":
      return (
        <g {...s}>
          <rect x="3.6" y="4" width="12.8" height="5" rx="1.6" />
          <rect x="3.6" y="11" width="12.8" height="5" rx="1.6" />
          <path d="M6.4 6.5h.01M6.4 13.5h.01" strokeWidth={2} />
        </g>
      );
    case "observe":
      return (
        <g {...s}>
          <path d="M3.4 12.2h3.1l2-5.2 2.6 8 1.9-4.3h3.6" />
        </g>
      );
    default:
      return (
        <g {...s}>
          <rect x="3.6" y="3.6" width="12.8" height="12.8" rx="3.4" />
          <path d="M7.6 10h4.8M10 7.6v4.8" />
        </g>
      );
  }
}

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

function edgePath(a: DiagramNode, b: DiagramNode, e: DiagramEdge = { from: "", to: "" }): Anchor {
  const bend = e.bend ?? 0;
  const dir = e.dir;
  if (e.path) {
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y, path: e.path };
  }
  const A = nodeBox(a);
  const B = nodeBox(b);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  let x1: number, y1: number, x2: number, y2: number, path: string;

  const horizontal = dir ? dir === "h" : Math.abs(dx) >= Math.abs(dy);
  if (horizontal) {
    const s = Math.sign(dx) || 1;
    x1 = a.x + (s * A.w) / 2 + s * 6;
    y1 = a.y;
    x2 = b.x - (s * B.w) / 2 - s * 12;
    y2 = b.y;
    const mx = (x1 + x2) / 2;
    path = `M ${x1} ${y1} C ${mx} ${y1 + bend} ${mx} ${y2 + bend} ${x2} ${y2}`;
  } else {
    const s = Math.sign(dy) || 1;
    x1 = a.x;
    y1 = a.y + (s * A.h) / 2 + s * 6;
    // aim at the part of the target closest to the source so parallel drops stay tidy
    x2 = Math.min(Math.max(a.x, B.x + 40), B.x + B.w - 40);
    y2 = b.y - (s * B.h) / 2 - s * 12;
    const my = (y1 + y2) / 2;
    path = `M ${x1} ${y1} C ${x1 + bend} ${my} ${x2 + bend} ${my} ${x2} ${y2}`;
  }
  return { x1, y1, x2, y2, path };
}

interface Props {
  diagram: DiagramDef;
  title: string;
  className?: string;
  /** small preview rendering used inside cards */
  compact?: boolean;
  /** taller, immersive stage used on concept pages and the hero */
  stage?: boolean;
  /** hides the caption/legend/hint footer */
  bare?: boolean;
}

export function DiagramCanvas({ diagram: source, title, className, compact, stage, bare }: Props) {
  const isMobile = useIsMobile();
  const diagram = useMemo(
    () => (isMobile && !compact ? toMobileDiagram(source) : source),
    [isMobile, compact, source],
  );
  const [hovered, setHovered] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [activePill, setActivePill] = useState<number | null>(null);
  const uid = useId().replace(/:/g, "");

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

  const gradId = `${uid}-flow`;
  const glowId = `${uid}-glow`;
  const arrowId = `${uid}-arrow`;
  const arrowOnId = `${uid}-arrow-on`;
  const faceId = `${uid}-face`;

  return (
    <figure className={cn("relative", className)}>
      <div
        className={cn(
          "group/stage relative overflow-hidden rounded-[26px] border border-border bg-surface",
          compact ? "shadow-soft" : "shadow-stage",
        )}
      >
        {/* layered stage background */}
        <div className="absolute inset-0 bg-grid-fine opacity-70" aria-hidden="true" />
        <div
          className="absolute inset-0 opacity-90"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(80% 60% at 50% 0%, color-mix(in oklab, var(--primary) 6%, transparent), transparent 70%), radial-gradient(60% 50% at 100% 100%, color-mix(in oklab, var(--cyan) 8%, transparent), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 45%, transparent), color-mix(in oklab, var(--cyan) 45%, transparent), transparent)",
          }}
        />

        <svg
          viewBox={`0 0 ${diagram.width} ${diagram.height}`}
          className={cn("relative w-full", stage ? "p-1.5 sm:p-3" : "")}
          role="img"
          aria-label={`${title} diagram`}
          style={{ maxHeight: compact ? 250 : undefined }}
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--cyan)" />
            </linearGradient>
            <linearGradient id={faceId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--surface)" />
              <stop offset="100%" stopColor="var(--surface-tint)" />
            </linearGradient>
            <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id={arrowId}
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 1 1.5 L 8 5 L 1 8.5" fill="none" stroke="var(--border-strong)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker
              id={arrowOnId}
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 1 1.5 L 8 5 L 1 8.5" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {/* groups */}
          {diagram.groups?.map((g) => {
            const tone = groupTone[g.tone ?? "neutral"];
            return (
              <g key={g.id} style={{ animation: "fade-rise .7s cubic-bezier(.22,1,.36,1) both" }}>
                <rect
                  x={g.x}
                  y={g.y}
                  width={g.w}
                  height={g.h}
                  rx={28}
                  fill={`color-mix(in oklab, var(${tone}) 4%, transparent)`}
                  stroke={`color-mix(in oklab, var(${tone}) 26%, transparent)`}
                  strokeWidth={1.2}
                  strokeDasharray="2 7"
                  strokeLinecap="round"
                />
                <rect
                  x={g.x + 18}
                  y={g.y + 14}
                  width={4}
                  height={16}
                  rx={2}
                  fill={`var(${tone})`}
                  opacity={0.7}
                />
                <text
                  x={g.x + 32}
                  y={g.y + 27}
                  fontSize={13}
                  fontWeight={700}
                  letterSpacing="0.12em"
                  fill={`color-mix(in oklab, var(${tone}) 80%, var(--foreground))`}
                >
                  {g.label.toUpperCase()}
                </text>
                {g.sub && (
                  <text x={g.x + 32} y={g.y + 46} fontSize={12} fill="var(--muted-foreground)">
                    {g.sub}
                  </text>
                )}
              </g>
            );
          })}

          {/* edges */}
          {diagram.edges.map((e, i) => {
            const a = nodeMap[e.from];
            const b = nodeMap[e.to];
            if (!a || !b) return null;
            const { path, x1, y1, x2, y2 } = edgePath(a, b, e);
            const isRelated = focus ? e.from === focus || e.to === focus : false;
            const dim = focus ? !isRelated : false;
            return (
              <g
                key={i}
                style={{
                  opacity: dim ? 0.12 : 1,
                  transition: "opacity .3s ease",
                }}
              >
                {isRelated && (
                  <path
                    d={path}
                    fill="none"
                    stroke={`url(#${gradId})`}
                    strokeWidth={7}
                    strokeLinecap="round"
                    opacity={0.16}
                    filter={`url(#${glowId})`}
                  />
                )}
                <path
                  d={path}
                  fill="none"
                  stroke={isRelated ? `url(#${gradId})` : "var(--grid)"}
                  strokeWidth={isRelated ? 2.2 : e.dashed ? 2 : 1.5}
                  strokeLinecap="round"
                  strokeDasharray={e.dashed ? "2 8" : undefined}
                  opacity={e.dashed && !isRelated ? 0.85 : 1}
                  markerEnd={`url(#${isRelated ? arrowOnId : arrowId})`}
                  style={{ transition: "stroke-width .25s ease" }}
                />
                {e.animated && !compact && (
                  <>
                    <circle r={3.2} fill={`url(#${gradId})`} filter={`url(#${glowId})`}>
                      <animateMotion dur="3.4s" repeatCount="indefinite" path={path} />
                    </circle>
                    <circle r={2} fill="var(--cyan)" opacity={0.55}>
                      <animateMotion dur="3.4s" begin="1.7s" repeatCount="indefinite" path={path} />
                    </circle>
                  </>
                )}
                {e.animated && compact && (
                  <path
                    d={path}
                    fill="none"
                    stroke="var(--cyan)"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeDasharray="2 22"
                    style={{ animation: "flow-dash 3.2s linear infinite" }}
                  />
                )}
                {e.label && (
                  <g>
                    <rect
                      x={(x1 + x2) / 2 - (e.label.length * 3.4 + 9)}
                      y={(y1 + y2) / 2 - 22 + (e.bend ?? 0) / 2}
                      width={e.label.length * 6.8 + 18}
                      height={19}
                      rx={9.5}
                      fill="var(--surface)"
                      stroke="var(--border)"
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 9 + (e.bend ?? 0) / 2}
                      textAnchor="middle"
                      fontSize={11}
                      fontWeight={600}
                      fill="var(--muted-foreground)"
                    >
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* nodes */}
          {diagram.nodes.map((n, idx) => {
            const box = nodeBox(n);
            const kind = n.kind ?? "service";
            const tone = toneVar[kind];
            const isFocus = focus === n.id;
            const isActive = active === n.id;
            const dim = relatedNodes ? !relatedNodes.has(n.id) : false;
            const hasIcon = box.h >= 70;
            const textX = box.x + (hasIcon ? 62 : 18);
            return (
              <g
                key={n.id}
                tabIndex={0}
                role="button"
                aria-label={`${n.label}${n.sub ? `, ${n.sub}` : ""}`}
                aria-pressed={isActive}
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
                  opacity: dim ? 0.28 : 1,
                  transformOrigin: `${n.x}px ${n.y}px`,
                  transform: isFocus ? "scale(1.025)" : "scale(1)",
                  transition: "opacity .3s ease, transform .35s cubic-bezier(.22,1,.36,1)",
                  animation: `node-in .6s cubic-bezier(.22,1,.36,1) ${idx * 55}ms both`,
                }}
                className="outline-none"
              >
                {isFocus && (
                  <rect
                    x={box.x - 5}
                    y={box.y - 5}
                    width={box.w + 10}
                    height={box.h + 10}
                    rx={22}
                    fill="none"
                    stroke={`var(${tone})`}
                    strokeWidth={1.2}
                    opacity={0.28}
                  />
                )}
                <rect
                  x={box.x}
                  y={box.y + 3}
                  width={box.w}
                  height={box.h}
                  rx={18}
                  fill={`color-mix(in oklab, var(${tone}) ${isFocus ? 16 : 7}%, transparent)`}
                  style={{ filter: "blur(9px)", transition: "fill .3s ease" }}
                />
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  rx={18}
                  fill={`url(#${faceId})`}
                  stroke={isFocus ? `var(${tone})` : "var(--border-strong)"}
                  strokeWidth={isFocus ? 1.8 : 1.1}
                  style={{ transition: "stroke .25s ease" }}
                />
                <path
                  d={`M ${box.x + 18} ${box.y + 0.6} H ${box.x + box.w - 18}`}
                  stroke="var(--surface)"
                  strokeWidth={1}
                  opacity={0.9}
                />
                {hasIcon && (
                  <>
                    <rect
                      x={box.x + 20}
                      y={n.y - iconSize / 2}
                      width={iconSize}
                      height={iconSize}
                      rx={13}
                      fill={`color-mix(in oklab, var(${tone}) ${isFocus ? 18 : 10}%, var(--surface))`}
                      stroke={`color-mix(in oklab, var(${tone}) ${isFocus ? 55 : 26}%, transparent)`}
                      style={{ transition: "fill .25s ease, stroke .25s ease" }}
                    />
                    <g transform={`translate(${box.x + 20 + (iconSize - 20) / 2} ${n.y - 10})`}>
                      <NodeGlyph kind={kind} color={`var(${tone})`} />
                    </g>
                  </>
                )}
                <text
                  x={textX}
                  y={n.y + (n.sub ? -3 : 6)}
                  fontSize={compact ? 15 : 17}
                  fontWeight={700}
                  letterSpacing="-0.01em"
                  fill="var(--foreground)"
                >
                  {n.label}
                </text>
                {n.sub && (
                  <text x={textX} y={n.y + 19} fontSize={compact ? 11.5 : 13} fill="var(--muted-foreground)">
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}

          {/* concept pills */}
          {diagram.pills?.map((p, i) => {
            const w = p.w ?? p.label.length * 7.2 + 42;
            const isOn = activePill === i;
            return (
              <g
                key={p.label}
                tabIndex={0}
                role="button"
                aria-label={p.label}
                aria-pressed={isOn}
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
                style={{
                  cursor: "pointer",
                  transformOrigin: `${p.x}px ${p.y}px`,
                  transform: isOn ? "scale(1.04)" : "scale(1)",
                  transition: "transform .3s cubic-bezier(.22,1,.36,1)",
                }}
                className="outline-none"
              >
                <rect
                  x={p.x - w / 2}
                  y={p.y - 16}
                  width={w}
                  height={32}
                  rx={16}
                  fill={
                    isOn
                      ? "color-mix(in oklab, var(--primary) 12%, var(--surface))"
                      : "color-mix(in oklab, var(--surface) 88%, transparent)"
                  }
                  stroke={isOn ? "var(--primary)" : "var(--border-strong)"}
                  strokeWidth={isOn ? 1.6 : 1}
                  style={{ transition: "fill .25s ease, stroke .25s ease" }}
                />
                <circle
                  cx={p.x - w / 2 + 15}
                  cy={p.y}
                  r={3.2}
                  fill={isOn ? "var(--primary)" : "var(--cyan)"}
                  opacity={isOn ? 1 : 0.65}
                />
                <text
                  x={p.x + 8}
                  y={p.y + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={650}
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
          <div className="animate-fade-rise pointer-events-auto absolute bottom-4 left-4 right-4 z-10 rounded-2xl p-4 shadow-lift glass sm:left-6 sm:right-auto sm:w-[26rem] sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 eyebrow">
                  <Sparkle className="size-3" />
                  {activeNode ? "Node" : "Characteristic"}
                </p>
                <h4 className="mt-1.5 font-display text-[17px] font-bold tracking-tight">
                  {activeNode?.label ?? pill?.label}
                </h4>
              </div>
              <button
                type="button"
                aria-label="Close explanation"
                onClick={() => {
                  setActive(null);
                  setActivePill(null);
                }}
                className="rounded-full border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-border hover:bg-surface hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-3 rule-gradient" />
            <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
              {activeNode?.detail ?? pill?.note}
            </p>
          </div>
        )}
      </div>

      {!bare && (diagram.legend || diagram.caption) && (
        <figcaption className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {diagram.caption && (
            <span className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {diagram.caption}
            </span>
          )}
          {diagram.legend && (
            <span className="flex flex-wrap gap-x-4 gap-y-2">
              {diagram.legend.map((l) => (
                <span
                  key={l.label}
                  className="flex items-center gap-2 text-xs font-medium text-muted-foreground"
                >
                  <span
                    className="size-2 rounded-full ring-4"
                    style={{
                      background: `var(${toneVar[l.tone]})`,
                      // @ts-expect-error CSS custom property passthrough
                      "--tw-ring-color": `color-mix(in oklab, var(${toneVar[l.tone]}) 16%, transparent)`,
                    }}
                  />
                  {l.label}
                </span>
              ))}
            </span>
          )}
        </figcaption>
      )}
      {!bare && !compact && (
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
          <MousePointerClick className="size-3.5 text-primary" />
          Hover a node to trace its connections · click or press Enter for a short explanation
        </p>
      )}
    </figure>
  );
}
