import { useEffect, useState } from "react";
import { MousePointerClick, Sparkle, X } from "lucide-react";
import type { NodeKind } from "@/content/types";

export const toneVar: Record<NodeKind, string> = {
  actor: "--violet",
  network: "--cyan",
  service: "--primary",
  data: "--chart-4",
  platform: "--muted-foreground",
  observe: "--chart-5",
};

/** true below the desktop composition breakpoint */
export function useNarrow(breakpoint = 940) {
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

/** Illustrative 32-unit glyphs, drawn in the node accent colour. */
export function Glyph({ kind, color, size = 32 }: { kind: NodeKind; color: string; size?: number }) {
  const k = size / 32;
  const s = {
    fill: "none",
    stroke: color,
    strokeWidth: 1.7 / k,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const body = () => {
    switch (kind) {
      case "actor":
        return (
          <g {...s}>
            <circle cx="16" cy="11" r="4.6" />
            <path d="M6.6 26c0-4.8 4.2-7.7 9.4-7.7s9.4 2.9 9.4 7.7" />
          </g>
        );
      case "network":
        return (
          <g {...s}>
            <circle cx="16" cy="16" r="10" />
            <path d="M6 16h20M16 6c2.9 3.1 4.4 6.4 4.4 10S18.9 22.9 16 26c-2.9-3.1-4.4-6.4-4.4-10S13.1 9.1 16 6Z" />
            <circle cx="16" cy="16" r="1.5" fill={color} stroke="none" />
          </g>
        );
      case "data":
        return (
          <g {...s}>
            <ellipse cx="16" cy="9" rx="8.6" ry="3.6" />
            <path d="M7.4 9v14c0 2 3.9 3.6 8.6 3.6s8.6-1.6 8.6-3.6V9" />
            <path d="M7.4 16c0 2 3.9 3.6 8.6 3.6s8.6-1.6 8.6-3.6" />
          </g>
        );
      case "platform":
        return (
          <g {...s}>
            <rect x="5.5" y="6" width="21" height="7.4" rx="2.2" />
            <rect x="5.5" y="18.6" width="21" height="7.4" rx="2.2" />
            <path d="M9.6 9.7h.01M9.6 22.3h.01" strokeWidth={2.6 / k} />
            <path d="M20 9.7h3.2M20 22.3h3.2" opacity={0.7} />
          </g>
        );
      case "observe":
        return (
          <g {...s}>
            <path d="M4.5 19.6h4.1l3-8.4 3.6 13 2.8-7.2 2.2 4.1h6.3" />
            <circle cx="26.5" cy="21.1" r="1.6" fill={color} stroke="none" />
          </g>
        );
      default:
        return (
          <g {...s}>
            <rect x="5.6" y="5.6" width="20.8" height="20.8" rx="6" />
            <path d="M11.4 16h9.2M16 11.4v9.2" />
          </g>
        );
    }
  };
  return <g transform={`scale(${k})`}>{body()}</g>;
}

/** Shared gradients, filters and markers for bespoke maps. */
export function MapDefs({ uid }: { uid: string }) {
  return (
    <defs>
      <linearGradient id={`${uid}-flow`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--primary)" />
        <stop offset="100%" stopColor="var(--cyan)" />
      </linearGradient>
      <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--surface)" />
        <stop offset="100%" stopColor="var(--surface-tint)" />
      </linearGradient>
      <filter id={`${uid}-glow`} x="-70%" y="-70%" width="240%" height="240%">
        <feGaussianBlur stdDeviation="6" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="11" />
      </filter>
      <pattern id={`${uid}-grid`} width="34" height="34" patternUnits="userSpaceOnUse">
        <path d="M34 0H0v34" fill="none" stroke="var(--grid)" strokeWidth="1" opacity="0.5" />
      </pattern>
      <pattern
        id={`${uid}-hatch`}
        width="9"
        height="9"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <path d="M0 0v9" stroke="var(--grid)" strokeWidth="1.4" opacity="0.65" />
      </pattern>
      <marker
        id={`${uid}-arrow`}
        viewBox="0 0 10 10"
        refX="7.4"
        refY="5"
        markerWidth="7.5"
        markerHeight="7.5"
        orient="auto-start-reverse"
      >
        <path
          d="M 1 1.2 L 8.4 5 L 1 8.8"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>
      <marker
        id={`${uid}-arrow-on`}
        viewBox="0 0 10 10"
        refX="7.4"
        refY="5"
        markerWidth="7.5"
        markerHeight="7.5"
        orient="auto-start-reverse"
      >
        <path
          d="M 1 1.2 L 8.4 5 L 1 8.8"
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </marker>
    </defs>
  );
}

export interface MapEdge {
  id: string;
  from: string;
  to: string;
  d: string;
  dashed?: boolean;
  animated?: boolean;
  /** slower, quieter pulse for dependency lines */
  quiet?: boolean;
}

export function MapEdges({
  edges,
  uid,
  focus,
}: {
  edges: MapEdge[];
  uid: string;
  focus: string | null;
}) {
  return (
    <g>
      {edges.map((e, i) => {
        const on = focus ? e.from === focus || e.to === focus : false;
        const dim = focus ? !on : false;
        return (
          <g
            key={e.id}
            style={{
              opacity: dim ? 0.22 : 1,
              transition: "opacity .35s ease",
              animation: `fade-rise .8s cubic-bezier(.22,1,.36,1) ${120 + i * 40}ms both`,
            }}
          >
            {on && (
              <path
                d={e.d}
                fill="none"
                stroke={`url(#${uid}-flow)`}
                strokeWidth={9}
                strokeLinecap="round"
                opacity={0.18}
                filter={`url(#${uid}-glow)`}
              />
            )}
            <path
              d={e.d}
              fill="none"
              stroke={on ? `url(#${uid}-flow)` : e.dashed ? "var(--grid)" : "var(--border-strong)"}
              strokeWidth={on ? 2.4 : e.dashed ? 1.6 : 1.7}
              strokeLinecap="round"
              strokeDasharray={e.dashed ? "2 9" : undefined}
              markerEnd={`url(#${uid}-arrow${on ? "-on" : ""})`}
              style={{ transition: "stroke-width .25s ease" }}
            />
            {e.animated && (
              <>
                <circle r={e.quiet ? 2.2 : 3.4} fill={`url(#${uid}-flow)`} filter={`url(#${uid}-glow)`}>
                  <animateMotion dur={e.quiet ? "5.6s" : "3.6s"} repeatCount="indefinite" path={e.d} />
                </circle>
                {!e.quiet && (
                  <circle r={2} fill="var(--cyan)" opacity={0.6}>
                    <animateMotion dur="3.6s" begin="1.8s" repeatCount="indefinite" path={e.d} />
                  </circle>
                )}
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

export interface MapNode {
  id: string;
  label: string;
  sub?: string;
  kind: NodeKind;
  detail: string;
  x: number;
  y: number;
  w: number;
  h: number;
  variant?: "card" | "actor" | "surface" | "rail" | "strip";
  /** small inner tiles rendered by the `surface` and `strip` variants */
  tiles?: string[];
}

interface NodeProps {
  n: MapNode;
  uid: string;
  focused: boolean;
  active: boolean;
  dimmed: boolean;
  index?: number;
  onEnter: () => void;
  onLeave: () => void;
  onToggle: () => void;
}

/** One art-directed node surface. Variants differ in silhouette, not only colour. */
export function MapNodeShape({
  n,
  uid,
  focused,
  active,
  dimmed,
  index = 0,
  onEnter,
  onLeave,
  onToggle,
}: NodeProps) {
  const tone = toneVar[n.kind];
  const v = n.variant ?? "card";
  const r = v === "actor" ? Math.min(n.h / 2, 34) : v === "strip" ? 18 : 22;
  const iconSize = v === "surface" ? 52 : v === "strip" ? 42 : n.h >= 96 ? 48 : 40;
  const padX = 26;
  const textX = n.x + padX + iconSize + 20;
  const titleSize = v === "surface" ? 22 : 19;
  const subSize = v === "surface" ? 14.5 : 14;
  const stacked = v === "rail";

  return (
    <g
      tabIndex={0}
      role="button"
      aria-label={`${n.label}${n.sub ? `, ${n.sub}` : ""}`}
      aria-pressed={active}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onToggle}
      onKeyDown={(ev) => {
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          onToggle();
        }
      }}
      className="outline-none"
      style={{
        cursor: "pointer",
        opacity: dimmed ? 0.55 : 1,
        transformOrigin: `${n.x + n.w / 2}px ${n.y + n.h / 2}px`,
        transform: focused ? "scale(1.015)" : "scale(1)",
        transition: "opacity .35s ease, transform .4s cubic-bezier(.22,1,.36,1)",
        animation: `node-in .7s cubic-bezier(.22,1,.36,1) ${index * 60}ms both`,
      }}
    >
      {focused && (
        <rect
          x={n.x - 10}
          y={n.y - 10}
          width={n.w + 20}
          height={n.h + 20}
          rx={r + 10}
          fill={`color-mix(in oklab, var(${tone}) 22%, transparent)`}
          filter={`url(#${uid}-soft)`}
          opacity={0.75}
        />
      )}
      {/* drop shadow */}
      <rect
        x={n.x + 2}
        y={n.y + 8}
        width={n.w - 4}
        height={n.h}
        rx={r}
        fill={`color-mix(in oklab, var(${tone}) ${focused ? 14 : 8}%, transparent)`}
        style={{ filter: "blur(10px)" }}
      />
      <rect
        x={n.x}
        y={n.y}
        width={n.w}
        height={n.h}
        rx={r}
        fill={v === "strip" ? "color-mix(in oklab, var(--surface-sunken) 85%, var(--surface))" : `url(#${uid}-face)`}
        stroke={focused ? `var(${tone})` : "var(--border-strong)"}
        strokeWidth={focused ? 1.9 : 1.1}
        style={{ transition: "stroke .25s ease" }}
      />
      {v === "strip" && (
        <>
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={r}
            fill={`url(#${uid}-hatch)`}
            opacity={0.5}
          />
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            rx={r}
            fill="color-mix(in oklab, var(--surface) 60%, transparent)"
          />
        </>
      )}
      {/* top edge light */}
      <path
        d={`M ${n.x + 18} ${n.y + 1} H ${n.x + n.w - 18}`}
        stroke={`color-mix(in oklab, var(${tone}) ${focused ? 48 : 20}%, var(--surface))`}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      {/* left accent for surface + rail */}
      {(v === "surface" || v === "rail") && (
        <rect
          x={n.x}
          y={n.y + r}
          width={3}
          height={n.h - r * 2}
          rx={1.5}
          fill={`var(${tone})`}
          opacity={focused ? 0.85 : 0.45}
        />
      )}

      {stacked ? (
        <>
          <rect
            x={n.x + 24}
            y={n.y + 26}
            width={iconSize}
            height={iconSize}
            rx={14}
            fill={`color-mix(in oklab, var(${tone}) ${focused ? 20 : 11}%, var(--surface))`}
            stroke={`color-mix(in oklab, var(${tone}) ${focused ? 55 : 26}%, transparent)`}
          />
          <g transform={`translate(${n.x + 24 + (iconSize - 32) / 2} ${n.y + 26 + (iconSize - 32) / 2})`}>
            <Glyph kind={n.kind} color={`var(${tone})`} />
          </g>
          <text
            x={n.x + 24}
            y={n.y + 26 + iconSize + 38}
            fontSize={titleSize}
            fontWeight={720}
            letterSpacing="-0.01em"
            fill="var(--foreground)"
          >
            {n.label}
          </text>
          {n.sub && (
            <text
              x={n.x + 24}
              y={n.y + 26 + iconSize + 62}
              fontSize={subSize}
              fill="var(--muted-foreground)"
            >
              {n.sub}
            </text>
          )}
        </>
      ) : (
        <>
          <rect
            x={n.x + padX}
            y={v === "surface" ? n.y + 26 : n.y + (n.h - iconSize) / 2}
            width={iconSize}
            height={iconSize}
            rx={14}
            fill={`color-mix(in oklab, var(${tone}) ${focused ? 20 : 11}%, var(--surface))`}
            stroke={`color-mix(in oklab, var(${tone}) ${focused ? 55 : 26}%, transparent)`}
            style={{ transition: "fill .25s ease, stroke .25s ease" }}
          />
          <g
            transform={`translate(${n.x + padX + (iconSize - 32) / 2} ${
              (v === "surface" ? n.y + 26 : n.y + (n.h - iconSize) / 2) + (iconSize - 32) / 2
            })`}
          >
            <Glyph kind={n.kind} color={`var(${tone})`} />
          </g>
          <text
            x={textX}
            y={
              v === "surface"
                ? n.y + 26 + iconSize / 2 - 2
                : n.y + n.h / 2 + (n.sub ? -3 : 7)
            }
            fontSize={titleSize}
            fontWeight={720}
            letterSpacing="-0.01em"
            fill="var(--foreground)"
          >
            {n.label}
          </text>
          {n.sub && (
            <text
              x={textX}
              y={v === "surface" ? n.y + 26 + iconSize / 2 + 22 : n.y + n.h / 2 + 22}
              fontSize={subSize}
              fill="var(--muted-foreground)"
            >
              {n.sub}
            </text>
          )}
        </>
      )}

      {/* inner tiles */}
      {n.tiles && n.tiles.length > 0 && (
        <g>
          {n.tiles.map((t, i) => {
            const cols = n.tiles!.length;
            const gap = 14;
            const inset = 24;
            const strip = v === "strip";
            // strip lays its tiles along the right side, beside the label
            const zoneX = strip ? n.x + n.w * 0.4 : n.x + inset;
            const zoneW = strip ? n.w * 0.6 - inset : n.w - inset * 2;
            const tw = (zoneW - gap * (cols - 1)) / cols;
            const th = strip ? 46 : 52;
            const ty = strip ? n.y + (n.h - th) / 2 : n.y + n.h - th - 22;
            const tx = zoneX + i * (tw + gap);

            return (
              <g key={t}>
                <rect
                  x={tx}
                  y={ty}
                  width={tw}
                  height={th}
                  rx={13}
                  fill={`color-mix(in oklab, var(${tone}) ${focused ? 9 : 5}%, var(--surface))`}
                  stroke={`color-mix(in oklab, var(${tone}) 20%, transparent)`}
                />
                <circle cx={tx + 15} cy={ty + th / 2} r={3.2} fill={`var(${tone})`} opacity={0.6} />
                <text
                  x={tx + 27}
                  y={ty + th / 2 + 4.5}
                  fontSize={13}
                  fontWeight={600}
                  fill="var(--muted-foreground)"
                >
                  {t}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* connector ports */}
      <circle
        cx={n.x}
        cy={n.y + n.h / 2}
        r={3}
        fill="var(--surface)"
        stroke={`color-mix(in oklab, var(${tone}) 55%, transparent)`}
        strokeWidth={1.4}
      />
      <circle
        cx={n.x + n.w}
        cy={n.y + n.h / 2}
        r={3}
        fill="var(--surface)"
        stroke={`color-mix(in oklab, var(${tone}) 55%, transparent)`}
        strokeWidth={1.4}
      />
    </g>
  );
}

/** Environment boundary with technical corner marks and a header block. */
export function Zone({
  x,
  y,
  w,
  h,
  label,
  sub,
  tone = "--primary",
  uid,
  index = "",
  dimmed = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  tone?: string;
  uid: string;
  index?: string;
  dimmed?: boolean;
}) {
  const c = 20;
  return (
    <g
      style={{
        opacity: dimmed ? 0.6 : 1,
        transition: "opacity .35s ease",
        animation: "fade-rise .8s cubic-bezier(.22,1,.36,1) both",
      }}
    >
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={30}
        fill={`color-mix(in oklab, var(${tone}) 4.5%, transparent)`}
        stroke={`color-mix(in oklab, var(${tone}) 15%, transparent)`}
      />
      <clipPath id={`${uid}-clip-${label.replace(/\W/g, "")}`}>
        <rect x={x} y={y} width={w} height={h} rx={30} />
      </clipPath>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        fill={`url(#${uid}-grid)`}
        opacity={0.4}
        clipPath={`url(#${uid}-clip-${label.replace(/\W/g, "")})`}
      />
      {[
        [x + 12, y + 12, 1, 1],
        [x + w - 12, y + 12, -1, 1],
        [x + 12, y + h - 12, 1, -1],
        [x + w - 12, y + h - 12, -1, -1],
      ].map(([cx, cy, sx, sy], i) => (
        <path
          key={i}
          d={`M ${cx! + sx! * c} ${cy} H ${cx} V ${cy! + sy! * c}`}
          fill="none"
          stroke={`color-mix(in oklab, var(${tone}) 50%, transparent)`}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
      <rect x={x + 22} y={y + 20} width={4} height={17} rx={2} fill={`var(${tone})`} opacity={0.75} />
      <text
        x={x + 36}
        y={y + 33}
        fontSize={13}
        fontWeight={750}
        letterSpacing="0.14em"
        fill={`color-mix(in oklab, var(${tone}) 78%, var(--foreground))`}
      >
        {label.toUpperCase()}
      </text>
      {sub && (
        <text x={x + 36} y={y + 53} fontSize={12.5} fill="var(--muted-foreground)">
          {sub}
        </text>
      )}
      {index && (
        <text
          x={x + w - 22}
          y={y + 33}
          textAnchor="end"
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.1em"
          fill="var(--muted-foreground)"
          opacity={0.7}
        >
          {index}
        </text>
      )}
    </g>
  );
}

/** Floating explanation panel, anchored to a stage corner so the graph stays visible. */
export function ExplainPanel({
  eyebrow,
  title,
  body,
  onClose,
  side = "left",
}: {
  eyebrow: string;
  title: string;
  body: string;
  onClose: () => void;
  side?: "left" | "right";
}) {
  return (
    <div
      className={`animate-fade-rise absolute bottom-4 left-4 right-4 z-10 rounded-2xl p-4 shadow-lift glass sm:w-[24rem] sm:p-5 ${
        side === "left" ? "sm:right-auto sm:left-6" : "sm:left-auto sm:right-6"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 eyebrow">
            <Sparkle className="size-3" />
            {eyebrow}
          </p>
          <h4 className="mt-1.5 font-display text-[17px] font-bold tracking-tight">{title}</h4>
        </div>
        <button
          type="button"
          aria-label="Close explanation"
          onClick={onClose}
          className="shrink-0 rounded-full border border-transparent p-1.5 text-muted-foreground transition-colors hover:border-border hover:bg-surface hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="mt-3 rule-gradient" />
      <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export function StageHint({ text }: { text: string }) {
  return (
    <p className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
      <MousePointerClick className="size-3.5 text-primary" />
      {text}
    </p>
  );
}

export function StageBackdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-grid-fine opacity-60" aria-hidden="true" />
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(70% 55% at 62% 0%, color-mix(in oklab, var(--primary) 7%, transparent), transparent 72%), radial-gradient(55% 50% at 100% 100%, color-mix(in oklab, var(--cyan) 9%, transparent), transparent 70%), radial-gradient(45% 45% at 0% 60%, color-mix(in oklab, var(--violet) 6%, transparent), transparent 70%)",
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
    </>
  );
}

export function Legend({ items }: { items: { label: string; kind: NodeKind }[] }) {
  return (
    <span className="flex flex-wrap gap-x-4 gap-y-2">
      {items.map((l) => (
        <span key={l.label} className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span
            className="size-2 rounded-full ring-4"
            style={{
              background: `var(${toneVar[l.kind]})`,
              // @ts-expect-error CSS custom property passthrough
              "--tw-ring-color": `color-mix(in oklab, var(${toneVar[l.kind]}) 16%, transparent)`,
            }}
          />
          {l.label}
        </span>
      ))}
    </span>
  );
}
