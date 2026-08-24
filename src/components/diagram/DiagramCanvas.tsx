import { useEffect, useId, useMemo, useState } from "react";
import { X, Sparkle, MousePointerClick, MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { toMobileDiagram, toPreviewDiagram } from "./mobile-layout";
import { Glyph } from "./parts";
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

/** per-kind surface accents so semantics are readable at a glance */
const kindStyle: Record<NodeKind, { tileR: (s: number) => number; rail: boolean; tick: boolean }> = {
  actor: { tileR: (s) => s / 2, rail: false, tick: false },
  network: { tileR: () => 16, rail: false, tick: true },
  service: { tileR: () => 14, rail: false, tick: false },
  data: { tileR: () => 10, rail: true, tick: false },
  platform: { tileR: () => 8, rail: true, tick: true },
  observe: { tileR: () => 15, rail: false, tick: true },
};


interface Anchor {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  path: string;
}

function nodeBox(n: DiagramNode) {
  const w = n.w ?? 210;
  const h = n.h ?? 112;
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

/** true below the desktop composition breakpoint */
function useNarrow(breakpoint = 900) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const sync = () => setNarrow(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [breakpoint]);
  return narrow;
}

export function DiagramCanvas({ diagram: source, title, className, compact, stage, bare }: Props) {
  const narrow = useNarrow();
  const diagram = useMemo(
    () => (compact ? toPreviewDiagram(source) : narrow ? toMobileDiagram(source) : source),
    [narrow, compact, source],
  );
  /** wide desktop compositions pan horizontally instead of shrinking their text */
  const panWidth = !compact && !narrow && diagram.width > 1500 ? diagram.width * 0.94 : undefined;
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

  /**
   * Edge labels are optional decoration: any label that would collide with a
   * node or another label is dropped, and its meaning lives in the panel.
   */
  const labelPlan = useMemo(() => {
    type Box = { x: number; y: number; w: number; h: number };
    const hit = (a: Box, b: Box) =>
      a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    const grow = (b: Box, p: number) => ({ x: b.x - p, y: b.y - p, w: b.w + p * 2, h: b.h + p * 2 });
    const taken: Box[] = diagram.nodes.map((n) => grow(nodeBox(n), 10));
    const plan = new Map<number, Box>();
    diagram.edges.forEach((e, i) => {
      if (!e.label) return;
      const a = nodeMap[e.from];
      const b = nodeMap[e.to];
      if (!a || !b) return;
      const { x1, y1, x2, y2 } = edgePath(a, b, e);
      if (Math.hypot(x2 - x1, y2 - y1) < e.label.length * 7.2 + 56) return;
      const w = e.label.length * 6.9 + 20;
      const h = 21;
      const box = {
        x: (x1 + x2) / 2 - w / 2,
        y: (y1 + y2) / 2 - 13 - h / 2 + (e.bend ?? 0) / 2,
        w,
        h,
      };
      if (taken.some((t) => hit(box, t))) return;
      taken.push(grow(box, 8));
      plan.set(i, box);
    });
    return plan;
  }, [diagram.nodes, diagram.edges, nodeMap]);

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

        <div
          className={cn(
            "relative",
            panWidth ? "overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "",
          )}
        >
        <svg
          viewBox={`0 0 ${diagram.width} ${diagram.height}`}
          className={cn("relative w-full", stage ? "p-1.5 sm:p-3" : "")}
          role="img"
          aria-label={`${title} diagram`}
          style={{ maxHeight: compact ? 260 : undefined, ...(panWidth ? { minWidth: panWidth } : {}) }}
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
              refX="7.4"
              refY="5"
              markerWidth="7.5"
              markerHeight="7.5"
              orient="auto-start-reverse"
            >
              <path d="M 1 1.2 L 8.4 5 L 1 8.8" fill="none" stroke="var(--border-strong)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker
              id={arrowOnId}
              viewBox="0 0 10 10"
              refX="7.4"
              refY="5"
              markerWidth="7.5"
              markerHeight="7.5"
              orient="auto-start-reverse"
            >
              <path d="M 1 1.2 L 8.4 5 L 1 8.8" fill="none" stroke="var(--primary)" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
            </marker>

          </defs>

          {/* groups */}
          {diagram.groups?.map((g) => {
            const tone = groupTone[g.tone ?? "neutral"];
            const c = 18; // corner tick length
            return (
              <g key={g.id} style={{ animation: "fade-rise .7s cubic-bezier(.22,1,.36,1) both" }}>
                <rect
                  x={g.x}
                  y={g.y}
                  width={g.w}
                  height={g.h}
                  rx={26}
                  fill={`color-mix(in oklab, var(${tone}) 5%, transparent)`}
                  stroke={`color-mix(in oklab, var(${tone}) 16%, transparent)`}
                  strokeWidth={1}
                />
                <rect
                  x={g.x + 10}
                  y={g.y + 10}
                  width={g.w - 20}
                  height={g.h - 20}
                  rx={20}
                  fill="none"
                  stroke={`color-mix(in oklab, var(${tone}) 20%, transparent)`}
                  strokeWidth={1}
                  strokeDasharray="1 8"
                  strokeLinecap="round"
                />
                {/* technical corner details */}
                {[
                  [g.x + 10, g.y + 10, 1, 1],
                  [g.x + g.w - 10, g.y + 10, -1, 1],
                  [g.x + 10, g.y + g.h - 10, 1, -1],
                  [g.x + g.w - 10, g.y + g.h - 10, -1, -1],
                ].map(([cx, cy, sx, sy], ci) => (
                  <path
                    key={ci}
                    d={`M ${cx! + sx! * c} ${cy} H ${cx} V ${cy! + sy! * c}`}
                    fill="none"
                    stroke={`color-mix(in oklab, var(${tone}) 55%, transparent)`}
                    strokeWidth={1.4}
                    strokeLinecap="round"
                  />
                ))}
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
            const { path } = edgePath(a, b, e);
            const isRelated = focus ? e.from === focus || e.to === focus : false;
            const dim = focus ? !isRelated : false;
            return (
              <g
                key={i}
                style={{
                  opacity: dim ? 0.22 : 1,

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
                {e.label && labelPlan.has(i) && (
                  <g>
                    <rect
                      x={labelPlan.get(i)!.x}
                      y={labelPlan.get(i)!.y}
                      width={labelPlan.get(i)!.w}
                      height={labelPlan.get(i)!.h}
                      rx={10.5}
                      fill="var(--surface)"
                      stroke="var(--border)"
                    />
                    <text
                      x={labelPlan.get(i)!.x + labelPlan.get(i)!.w / 2}
                      y={labelPlan.get(i)!.y + 14.5}
                      textAnchor="middle"
                      fontSize={11.5}
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
            const hasIcon = box.h >= 70 && box.w >= 170;
            const iconSize = compact ? 42 : box.w >= 210 ? 48 : 44;
            const padX = compact ? 20 : 26;
            const textX = box.x + (hasIcon ? padX + iconSize + 18 : padX);
            const ks = kindStyle[kind];

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
                  opacity: dim ? 0.52 : 1,
                  transformOrigin: `${n.x}px ${n.y}px`,
                  transform: isFocus ? "scale(1.025)" : "scale(1)",
                  transition: "opacity .3s ease, transform .35s cubic-bezier(.22,1,.36,1)",
                  animation: `node-in .6s cubic-bezier(.22,1,.36,1) ${idx * 55}ms both`,
                }}
                className="outline-none"
              >
                {isFocus && (
                  <>
                    <rect
                      x={box.x - 7}
                      y={box.y - 7}
                      width={box.w + 14}
                      height={box.h + 14}
                      rx={24}
                      fill="none"
                      stroke={`var(${tone})`}
                      strokeWidth={1.1}
                      opacity={0.34}
                    />
                    <rect
                      x={box.x - 14}
                      y={box.y - 14}
                      width={box.w + 28}
                      height={box.h + 28}
                      rx={30}
                      fill="none"
                      stroke={`var(${tone})`}
                      strokeWidth={0.9}
                      opacity={0.14}
                    />
                  </>
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
                  d={`M ${box.x + 16} ${box.y + 1} H ${box.x + box.w - 16}`}
                  stroke={`color-mix(in oklab, var(${tone}) ${isFocus ? 45 : 18}%, var(--surface))`}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  opacity={0.9}
                />
                {ks.rail && (
                  <rect
                    x={box.x}
                    y={box.y + 18}
                    width={3}
                    height={box.h - 36}
                    rx={1.5}
                    fill={`var(${tone})`}
                    opacity={isFocus ? 0.8 : 0.4}
                  />
                )}
                {ks.tick && (
                  <g opacity={isFocus ? 0.8 : 0.45}>
                    {[0, 1, 2].map((t) => (
                      <circle
                        key={t}
                        cx={box.x + box.w - 20 - t * 8}
                        cy={box.y + 16}
                        r={2}
                        fill={`var(${tone})`}
                        opacity={1 - t * 0.28}
                      />
                    ))}
                  </g>
                )}
                {hasIcon && (
                  <>
                    <rect
                      x={box.x + padX}
                      y={n.y - iconSize / 2}
                      width={iconSize}
                      height={iconSize}
                      rx={ks.tileR(iconSize)}
                      fill={`color-mix(in oklab, var(${tone}) ${isFocus ? 18 : 10}%, var(--surface))`}
                      stroke={`color-mix(in oklab, var(${tone}) ${isFocus ? 55 : 26}%, transparent)`}
                      style={{ transition: "fill .25s ease, stroke .25s ease" }}
                    />
                    <g transform={`translate(${box.x + padX + (iconSize - 30) / 2} ${n.y - 15})`}>
                      <Glyph kind={kind} color={`var(${tone})`} size={30} />
                    </g>
                  </>
                )}
                <text
                  x={textX}
                  y={n.y + (n.sub ? -4 : 6)}
                  fontSize={compact ? 20 : 19}
                  fontWeight={720}
                  letterSpacing="-0.01em"
                  fill="var(--foreground)"
                >
                  {n.label}
                </text>
                {n.sub && (
                  <text x={textX} y={n.y + 22} fontSize={compact ? 14 : 14} fill="var(--muted-foreground)">
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
        </div>
        {panWidth && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 w-16"
              style={{ background: "linear-gradient(to left, var(--surface), transparent)" }}
            />
            <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/85 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
              <MoveHorizontal className="size-3.5 text-primary" /> scroll to pan
            </span>
          </>
        )}

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
