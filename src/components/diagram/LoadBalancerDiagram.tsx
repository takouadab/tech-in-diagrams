import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* -------------------------------- model --------------------------------- */

interface Client {
  id: string;
  label: string;
  sub: string;
}

const clients: Client[] = [
  { id: "c1", label: "Mobile app", sub: "GET /orders" },
  { id: "c2", label: "Browser", sub: "GET /" },
  { id: "c3", label: "Partner API", sub: "POST /events" },
  { id: "c4", label: "Browser", sub: "GET /search" },
];

interface Instance {
  id: string;
  label: string;
  sub: string;
  healthy: boolean;
  detail: string;
}

const instances: Instance[] = [
  {
    id: "a",
    label: "Instance A",
    sub: "Healthy · in rotation",
    healthy: true,
    detail:
      "One of several identical copies of the same service. Because every instance can answer any request, the load balancer is free to pick whichever one is healthy and least busy.",
  },
  {
    id: "b",
    label: "Instance B",
    sub: "Healthy · in rotation",
    healthy: true,
    detail:
      "Identical to instance A — same code, same configuration. Interchangeability is what makes balancing possible: no request depends on landing on a particular machine.",
  },
  {
    id: "c",
    label: "Instance C",
    sub: "Failing health check",
    healthy: false,
    detail:
      "This instance stopped answering its health probe, so the load balancer removed it from rotation. Traffic stops immediately, the probe keeps running, and the instance returns automatically once it passes again.",
  },
  {
    id: "d",
    label: "Instance D",
    sub: "Healthy · in rotation",
    healthy: true,
    detail:
      "Added later to absorb growth. New instances join the same pool behind the same public address — clients never learn that anything changed.",
  },
];

const CLIENTS_KEY = "clients";
const LB_KEY = "lb";
const HEALTH_KEY = "health";
const SCALE_KEY = "scale";

/* ------------------------------- geometry ------------------------------- */

const W = 1560;
const H = 720;

const CL_X = 44;
const CL_W = 224;
const CL_H = 84;
const CL_GAP = 30;
const CL_TOP = 168;
const clY = (i: number) => CL_TOP + i * (CL_H + CL_GAP);

const LB_X = 486;
const LB_W = 300;
const LB_Y = 262;
const LB_H = 208;
const LB_CY = LB_Y + LB_H / 2;

const POOL_X = 916;
const POOL_W = 600;
const POOL_Y = 54;

const IN_X = 964;
const IN_W = 508;
const IN_H = 96;
const IN_GAP = 28;
const IN_TOP = 118;
const inY = (i: number) => IN_TOP + i * (IN_H + IN_GAP);
const GHOST_Y = inY(instances.length);
const POOL_H = GHOST_Y + IN_H + 46 - POOL_Y;

/* -------------------------------- desktop -------------------------------- */

function DesktopStage({
  uid,
  hover,
  activeKey,
  setHover,
  onToggle,
}: {
  uid: string;
  hover: string | null;
  activeKey: string | null;
  setHover: (v: string | null) => void;
  onToggle: (key: string) => void;
}) {
  const isClient = hover !== null && clients.some((c) => c.id === hover);
  const isInstance = hover !== null && instances.some((i) => i.id === hover);

  /** which elements stay lit while `hover` is active */
  const lit = (id: string) => {
    if (hover === null) return true;
    if (hover === id) return true;
    if (hover === LB_KEY) return true;
    if (hover === HEALTH_KEY) return id === LB_KEY || instances.some((i) => i.id === id);
    if (hover === SCALE_KEY) return id === SCALE_KEY;
    if (isClient || isInstance) return id === LB_KEY;
    return false;
  };
  const op = (id: string) => (lit(id) ? 1 : 0.52);

  const clientPath = (i: number) =>
    `M ${CL_X + CL_W} ${clY(i) + CL_H / 2} C ${CL_X + CL_W + 130} ${clY(i) + CL_H / 2}, ${LB_X - 130} ${LB_CY}, ${LB_X - 10} ${LB_CY}`;

  const trafficPath = (i: number) =>
    `M ${LB_X + LB_W} ${LB_CY - 26} C ${LB_X + LB_W + 90} ${LB_CY - 26}, ${IN_X - 100} ${inY(i) + 36}, ${IN_X - 10} ${inY(i) + 36}`;

  const healthPath = (i: number) =>
    `M ${LB_X + LB_W} ${LB_CY + 52} C ${LB_X + LB_W + 70} ${LB_CY + 52}, ${IN_X - 80} ${inY(i) + 72}, ${IN_X - 10} ${inY(i) + 72}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="An architecture scene: many clients on the left send requests to a single load balancer in the centre, which distributes traffic across a pool of four interchangeable backend instances on the right. One instance is failing its health check and receives no traffic, while dashed health-check paths continue to reach every instance. An empty slot shows horizontal scaling."
      className="w-full"
      style={{ minHeight: 600, maxHeight: 740 }}
    >
      <defs>
        <linearGradient id={`${uid}-flow`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.95" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text
          x={CL_X}
          y={52}
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.2em"
          fill="var(--muted-foreground)"
        >
          FIG. 05 — ONE ENTRY POINT, MANY INSTANCES
        </text>
        <text
          x={W - 44}
          y={52}
          textAnchor="end"
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.16em"
          fill="var(--muted-foreground)"
        >
          CLIENTS → LOAD BALANCER → SERVICE POOL
        </text>
        <line x1={CL_X} y1={72} x2={W - 44} y2={72} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* service pool zone */}
      <g opacity={op("pool")} style={{ transition: "opacity .3s ease" }}>
        <rect
          x={POOL_X}
          y={POOL_Y}
          width={POOL_W}
          height={POOL_H}
          rx={34}
          fill="color-mix(in oklab, var(--primary) 3.5%, transparent)"
          stroke="color-mix(in oklab, var(--primary) 22%, transparent)"
        />
        <text
          x={POOL_X + 34}
          y={POOL_Y + 42}
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.2em"
          fill="var(--muted-foreground)"
        >
          SERVICE POOL — INTERCHANGEABLE INSTANCES
        </text>
        <text
          x={POOL_X + POOL_W - 34}
          y={POOL_Y + 42}
          textAnchor="end"
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.12em"
          fill="var(--muted-foreground)"
        >
          {`${instances.filter((i) => i.healthy).length}/${instances.length} IN ROTATION`}
        </text>
      </g>

      {/* clients cluster label */}
      <g aria-hidden="true" opacity={op(CLIENTS_KEY)} style={{ transition: "opacity .3s ease" }}>
        <text
          x={CL_X}
          y={132}
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.2em"
          fill="var(--muted-foreground)"
        >
          CLIENTS
        </text>
      </g>

      {/* client → load balancer traffic */}
      {clients.map((c, i) => {
        const on = hover === c.id || activeKey === c.id;
        return (
          <g key={`p-${c.id}`} opacity={op(c.id)} style={{ transition: "opacity .3s ease" }}>
            <path
              d={clientPath(i)}
              fill="none"
              stroke={on ? `url(#${uid}-flow)` : "var(--border-strong)"}
              strokeWidth={on ? 3.4 : 2}
              strokeLinecap="round"
              style={{ transition: "stroke-width .25s ease" }}
            />
            <circle r={5} fill="var(--primary)">
              <animateMotion
                dur="3.2s"
                begin={`${i * 0.5}s`}
                repeatCount="indefinite"
                path={clientPath(i)}
              />
            </circle>
          </g>
        );
      })}

      {/* clients */}
      {clients.map((c, i) => {
        const on = hover === c.id || activeKey === c.id;
        return (
          <g
            key={c.id}
            role="button"
            tabIndex={0}
            aria-label={`${c.label} client sending ${c.sub}`}
            opacity={op(c.id)}
            style={{
              cursor: "pointer",
              transition: "opacity .3s ease",
              animation: `fade-rise .7s cubic-bezier(.22,1,.36,1) ${i * 70}ms both`,
            }}
            onMouseEnter={() => setHover(c.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(c.id)}
            onBlur={() => setHover(null)}
            onClick={() => onToggle(CLIENTS_KEY)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(CLIENTS_KEY);
              }
            }}
          >
            <rect
              x={CL_X}
              y={clY(i)}
              width={CL_W}
              height={CL_H}
              rx={22}
              fill={on ? "color-mix(in oklab, var(--primary) 7%, var(--surface))" : "var(--surface)"}
              stroke={on ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border)"}
              strokeWidth={on ? 1.8 : 1}
              filter={on ? `url(#${uid}-lift)` : undefined}
              style={{ transition: "fill .3s ease, stroke .3s ease" }}
            />
            <circle cx={CL_X + 30} cy={clY(i) + CL_H / 2} r={9} fill="none" stroke="var(--primary)" strokeWidth={1.8} />
            <circle cx={CL_X + 30} cy={clY(i) + CL_H / 2} r={3} fill="var(--primary)" />
            <text x={CL_X + 52} y={clY(i) + 38} fontSize={17} fontWeight={740} fill="var(--foreground)">
              {c.label}
            </text>
            <text
              x={CL_X + 52}
              y={clY(i) + 60}
              fontSize={12.5}
              fontFamily="var(--font-mono)"
              fill="var(--muted-foreground)"
            >
              {c.sub}
            </text>
          </g>
        );
      })}

      {/* health-check paths (control plane) */}
      {instances.map((inst, i) => (
        <g key={`h-${inst.id}`} opacity={hover === HEALTH_KEY || hover === inst.id ? 1 : op(inst.id) * 0.9}>
          <path
            d={healthPath(i)}
            fill="none"
            stroke={
              inst.healthy
                ? "color-mix(in oklab, var(--violet) 55%, transparent)"
                : "color-mix(in oklab, var(--ember) 65%, transparent)"
            }
            strokeWidth={hover === HEALTH_KEY || hover === inst.id ? 2.2 : 1.4}
            strokeDasharray="5 8"
            className="motion-safe:animate-[dash-travel_5s_linear_infinite]"
            style={{ transition: "stroke-width .25s ease" }}
          />
        </g>
      ))}

      {/* traffic paths to healthy instances only */}
      {instances.map((inst, i) => {
        if (!inst.healthy) return null;
        const on = hover === inst.id || activeKey === inst.id || hover === LB_KEY;
        return (
          <g key={`t-${inst.id}`} opacity={op(inst.id)} style={{ transition: "opacity .3s ease" }}>
            <path
              d={trafficPath(i)}
              fill="none"
              stroke={on ? `url(#${uid}-flow)` : "var(--border-strong)"}
              strokeWidth={on ? 3.4 : 2}
              strokeLinecap="round"
              style={{ transition: "stroke-width .25s ease" }}
            />
            <circle r={5} fill="var(--cyan)">
              <animateMotion
                dur="2.6s"
                begin={`${i * 0.42}s`}
                repeatCount="indefinite"
                path={trafficPath(i)}
              />
            </circle>
          </g>
        );
      })}

      {/* severed route to the unhealthy instance */}
      {instances.map((inst, i) => {
        if (inst.healthy) return null;
        const cut = `M ${LB_X + LB_W} ${LB_CY - 26} C ${LB_X + LB_W + 90} ${LB_CY - 26}, ${IN_X - 190} ${inY(i) + 36}, ${IN_X - 120} ${inY(i) + 36}`;
        const cx = IN_X - 112;
        const cy = inY(i) + 36;
        return (
          <g
            key={`x-${inst.id}`}
            role="button"
            tabIndex={0}
            aria-label="Unhealthy instance removed from traffic rotation"
            style={{ cursor: "pointer" }}
            opacity={op(inst.id)}
            onMouseEnter={() => setHover(inst.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(inst.id)}
            onBlur={() => setHover(null)}
            onClick={() => onToggle(HEALTH_KEY)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(HEALTH_KEY);
              }
            }}
          >
            <path
              d={cut}
              fill="none"
              stroke="color-mix(in oklab, var(--ember) 42%, transparent)"
              strokeWidth={2}
              strokeDasharray="3 9"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r={15} fill="var(--surface)" stroke="var(--ember)" strokeWidth={2} />
            <path
              d={`M ${cx - 5.5} ${cy - 5.5} l 11 11 M ${cx + 5.5} ${cy - 5.5} l -11 11`}
              stroke="var(--ember)"
              strokeWidth={2.2}
              strokeLinecap="round"
            />
            <text
              x={cx}
              y={cy + 36}
              textAnchor="middle"
              fontSize={12}
              fontFamily="var(--font-mono)"
              letterSpacing="0.1em"
              fill="var(--ember)"
            >
              NO TRAFFIC
            </text>
          </g>
        );
      })}

      {/* load balancer — focal node */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Load balancer — the single public entry point"
        style={{
          cursor: "pointer",
          transition: "opacity .3s ease",
          animation: "fade-rise .8s cubic-bezier(.22,1,.36,1) 120ms both",
        }}
        opacity={op(LB_KEY)}
        onMouseEnter={() => setHover(LB_KEY)}
        onMouseLeave={() => setHover(null)}
        onFocus={() => setHover(LB_KEY)}
        onBlur={() => setHover(null)}
        onClick={() => onToggle(LB_KEY)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(LB_KEY);
          }
        }}
      >
        <rect
          x={LB_X - 22}
          y={LB_Y - 74}
          width={LB_W + 44}
          height={LB_H + 122}
          rx={38}
          fill="color-mix(in oklab, var(--cyan) 4%, transparent)"
          stroke="color-mix(in oklab, var(--cyan) 26%, transparent)"
          strokeDasharray="8 8"
        />
        <text
          x={LB_X - 2}
          y={LB_Y - 44}
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.2em"
          fill="var(--muted-foreground)"
        >
          PUBLIC ENTRY POINT
        </text>
        <text
          x={LB_X - 2}
          y={LB_Y + LB_H + 34}
          fontSize={12.5}
          fontFamily="var(--font-mono)"
          fill="var(--muted-foreground)"
        >
          shop.example.com
        </text>

        <rect
          x={LB_X}
          y={LB_Y}
          width={LB_W}
          height={LB_H}
          rx={28}
          fill={
            hover === LB_KEY || activeKey === LB_KEY
              ? "color-mix(in oklab, var(--primary) 8%, var(--surface))"
              : "var(--surface)"
          }
          stroke={
            hover === LB_KEY || activeKey === LB_KEY
              ? "color-mix(in oklab, var(--primary) 60%, transparent)"
              : "var(--border-strong)"
          }
          strokeWidth={hover === LB_KEY || activeKey === LB_KEY ? 2 : 1.3}
          filter={`url(#${uid}-lift)`}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <rect x={LB_X + 26} y={LB_Y + 24} width={LB_W - 52} height={3} rx={2} fill="var(--primary)" />
        <text x={LB_X + 26} y={LB_Y + 70} fontSize={24} fontWeight={800} fill="var(--foreground)">
          Load balancer
        </text>
        <text x={LB_X + 26} y={LB_Y + 98} fontSize={14.5} fill="var(--muted-foreground)">
          Distributes each request
        </text>

        {/* ports / status micro-detail */}
        <g opacity={0.9}>
          <rect
            x={LB_X + 26}
            y={LB_Y + 118}
            width={LB_W - 52}
            height={62}
            rx={16}
            fill="var(--surface-tint)"
            stroke="var(--border)"
          />
          <text
            x={LB_X + 42}
            y={LB_Y + 142}
            fontSize={11}
            fontFamily="var(--font-mono)"
            letterSpacing="0.12em"
            fill="var(--muted-foreground)"
          >
            ROTATION
          </text>
          {instances.map((inst, i) => (
            <g key={`led-${inst.id}`}>
              <rect
                x={LB_X + 42 + i * 44}
                y={LB_Y + 152}
                width={30}
                height={12}
                rx={6}
                fill={
                  inst.healthy
                    ? "color-mix(in oklab, var(--cyan) 65%, transparent)"
                    : "color-mix(in oklab, var(--ember) 60%, transparent)"
                }
              />
            </g>
          ))}
          <text
            x={LB_X + LB_W - 42}
            y={LB_Y + 163}
            textAnchor="end"
            fontSize={12}
            fontFamily="var(--font-mono)"
            fill="var(--muted-foreground)"
          >
            {`${instances.filter((i) => i.healthy).length} healthy`}
          </text>
        </g>
      </g>

      {/* health-check control label */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Health checks — the control path that decides which instances receive traffic"
        style={{ cursor: "pointer", transition: "opacity .3s ease" }}
        opacity={op(HEALTH_KEY)}
        onMouseEnter={() => setHover(HEALTH_KEY)}
        onMouseLeave={() => setHover(null)}
        onFocus={() => setHover(HEALTH_KEY)}
        onBlur={() => setHover(null)}
        onClick={() => onToggle(HEALTH_KEY)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(HEALTH_KEY);
          }
        }}
      >
        <rect
          x={LB_X + 4}
          y={H - 132}
          width={352}
          height={68}
          rx={20}
          fill="color-mix(in oklab, var(--violet) 5%, transparent)"
          stroke={
            hover === HEALTH_KEY || activeKey === HEALTH_KEY
              ? "color-mix(in oklab, var(--violet) 55%, transparent)"
              : "color-mix(in oklab, var(--violet) 28%, transparent)"
          }
          strokeDasharray="6 7"
          style={{ transition: "stroke .3s ease" }}
        />
        <text x={LB_X + 26} y={H - 104} fontSize={16} fontWeight={740} fill="var(--foreground)">
          Health checks
        </text>
        <text x={LB_X + 26} y={H - 82} fontSize={13} fill="var(--muted-foreground)">
          Control path — every instance, every few seconds
        </text>
      </g>

      {/* instances */}
      {instances.map((inst, i) => {
        const on = hover === inst.id || activeKey === inst.id;
        const accent = inst.healthy ? "var(--cyan)" : "var(--ember)";
        return (
          <g
            key={inst.id}
            role="button"
            tabIndex={0}
            aria-label={`${inst.label}, ${inst.sub}`}
            opacity={op(inst.id)}
            style={{
              cursor: "pointer",
              transition: "opacity .3s ease",
              animation: `fade-rise .75s cubic-bezier(.22,1,.36,1) ${180 + i * 80}ms both`,
            }}
            onMouseEnter={() => setHover(inst.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(inst.id)}
            onBlur={() => setHover(null)}
            onClick={() => onToggle(inst.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(inst.id);
              }
            }}
          >
            <rect
              x={IN_X}
              y={inY(i)}
              width={IN_W}
              height={IN_H}
              rx={24}
              fill={
                on
                  ? `color-mix(in oklab, ${accent} 8%, var(--surface))`
                  : inst.healthy
                    ? "var(--surface)"
                    : "color-mix(in oklab, var(--ember) 4%, var(--surface))"
              }
              stroke={
                on
                  ? `color-mix(in oklab, ${accent} 60%, transparent)`
                  : inst.healthy
                    ? "var(--border)"
                    : "color-mix(in oklab, var(--ember) 40%, transparent)"
              }
              strokeWidth={on ? 1.9 : 1.1}
              strokeDasharray={inst.healthy ? undefined : "10 7"}
              filter={on ? `url(#${uid}-lift)` : undefined}
              style={{ transition: "fill .3s ease, stroke .3s ease" }}
            />
            <rect x={IN_X + 22} y={inY(i) + 22} width={4} height={IN_H - 44} rx={2} fill={accent} opacity={0.8} />
            <text x={IN_X + 44} y={inY(i) + 44} fontSize={19} fontWeight={760} fill="var(--foreground)">
              {inst.label}
            </text>
            <text x={IN_X + 44} y={inY(i) + 70} fontSize={13.5} fill="var(--muted-foreground)">
              {inst.sub}
            </text>

            {/* status chip */}
            <g>
              <rect
                x={IN_X + IN_W - 168}
                y={inY(i) + 30}
                width={144}
                height={36}
                rx={18}
                fill={`color-mix(in oklab, ${accent} 10%, transparent)`}
                stroke={`color-mix(in oklab, ${accent} 40%, transparent)`}
              />
              <circle cx={IN_X + IN_W - 146} cy={inY(i) + 48} r={5} fill={accent}>
                {inst.healthy && (
                  <animate
                    attributeName="opacity"
                    values="1;0.35;1"
                    dur="2.4s"
                    repeatCount="indefinite"
                    begin={`${i * 0.3}s`}
                  />
                )}
              </circle>
              <text
                x={IN_X + IN_W - 132}
                y={inY(i) + 53}
                fontSize={12}
                fontFamily="var(--font-mono)"
                letterSpacing="0.08em"
                fill="var(--muted-foreground)"
              >
                {inst.healthy ? "200 OK" : "TIMEOUT"}
              </text>
            </g>
          </g>
        );
      })}

      {/* horizontal scaling motif */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Horizontal scaling — add another instance to the same pool"
        style={{ cursor: "pointer", transition: "opacity .3s ease" }}
        opacity={op(SCALE_KEY)}
        onMouseEnter={() => setHover(SCALE_KEY)}
        onMouseLeave={() => setHover(null)}
        onFocus={() => setHover(SCALE_KEY)}
        onBlur={() => setHover(null)}
        onClick={() => onToggle(SCALE_KEY)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(SCALE_KEY);
          }
        }}
      >
        <rect
          x={IN_X}
          y={GHOST_Y}
          width={IN_W}
          height={IN_H}
          rx={24}
          fill="transparent"
          stroke={
            hover === SCALE_KEY || activeKey === SCALE_KEY
              ? "color-mix(in oklab, var(--primary) 55%, transparent)"
              : "color-mix(in oklab, var(--primary) 28%, transparent)"
          }
          strokeDasharray="9 9"
          style={{ transition: "stroke .3s ease" }}
        />
        <circle cx={IN_X + 46} cy={GHOST_Y + IN_H / 2} r={16} fill="none" stroke="var(--primary)" strokeWidth={1.8} />
        <path
          d={`M ${IN_X + 38} ${GHOST_Y + IN_H / 2} h 16 M ${IN_X + 46} ${GHOST_Y + IN_H / 2 - 8} v 16`}
          stroke="var(--primary)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <text x={IN_X + 78} y={GHOST_Y + 44} fontSize={17} fontWeight={720} fill="var(--foreground)">
          Add another instance
        </text>
        <text x={IN_X + 78} y={GHOST_Y + 68} fontSize={13.5} fill="var(--muted-foreground)">
          Horizontal scaling — same entry point, more capacity
        </text>
      </g>
    </svg>
  );
}

/* -------------------------------- mobile --------------------------------- */

function MobileStack({
  activeKey,
  onToggle,
}: {
  activeKey: string | null;
  onToggle: (key: string) => void;
}) {
  const healthy = instances.filter((i) => i.healthy).length;
  return (
    <div className="space-y-3 px-4 py-5">
      <button
        type="button"
        onClick={() => onToggle(CLIENTS_KEY)}
        aria-expanded={activeKey === CLIENTS_KEY}
        className="w-full rounded-3xl border border-border bg-surface px-4 py-4 text-left shadow-soft"
      >
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">CLIENTS</span>
        <span className="mt-1 block text-[18px] font-extrabold">Many requests</span>
        <span className="mt-2 flex flex-wrap gap-1.5">
          {clients.map((c) => (
            <span
              key={c.id}
              className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
            >
              {c.sub}
            </span>
          ))}
        </span>
      </button>

      <div className="flex items-center gap-2 pl-6" aria-hidden="true">
        <span className="h-6 w-px bg-border-strong" />
        <span className="text-[11.5px] text-muted-foreground">one public address</span>
      </div>

      <button
        type="button"
        onClick={() => onToggle(LB_KEY)}
        aria-expanded={activeKey === LB_KEY}
        className="w-full rounded-3xl border border-primary/40 bg-surface-tint px-4 py-4 text-left shadow-soft"
      >
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
          PUBLIC ENTRY POINT
        </span>
        <span className="mt-1 block text-[20px] font-extrabold">Load balancer</span>
        <span className="block text-[13px] text-muted-foreground">
          Distributes each request · {healthy} of {instances.length} in rotation
        </span>
      </button>

      <div className="flex items-center gap-2 pl-6" aria-hidden="true">
        <span className="h-6 w-px bg-border-strong" />
        <span className="text-[11.5px] text-muted-foreground">balanced across healthy instances</span>
      </div>

      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">SERVICE POOL</p>

      {instances.map((inst, i) => (
        <button
          key={inst.id}
          type="button"
          onClick={() => onToggle(inst.id)}
          aria-expanded={activeKey === inst.id}
          className="flex w-full items-start gap-3 rounded-3xl border px-4 py-4 text-left"
          style={{
            animation: `fade-rise .6s cubic-bezier(.22,1,.36,1) ${i * 60}ms both`,
            borderColor: inst.healthy
              ? "var(--border)"
              : "color-mix(in oklab, var(--ember) 40%, transparent)",
            background: inst.healthy
              ? "var(--surface)"
              : "color-mix(in oklab, var(--ember) 5%, transparent)",
          }}
        >
          <span
            className="mt-1.5 size-2.5 shrink-0 rounded-full"
            style={{ background: inst.healthy ? "var(--cyan)" : "var(--ember)" }}
            aria-hidden="true"
          />
          <span className="flex-1">
            <span className="block text-[16.5px] font-bold">{inst.label}</span>
            <span className="block text-[12.5px] text-muted-foreground">{inst.sub}</span>
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {inst.healthy ? "200 OK" : "no traffic"}
          </span>
        </button>
      ))}

      <button
        type="button"
        onClick={() => onToggle(SCALE_KEY)}
        aria-expanded={activeKey === SCALE_KEY}
        className="w-full rounded-3xl border border-dashed border-primary/40 px-4 py-4 text-left"
      >
        <span className="block text-[15.5px] font-bold">+ Add another instance</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Horizontal scaling — same entry point, more capacity.
        </span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(HEALTH_KEY)}
        aria-expanded={activeKey === HEALTH_KEY}
        className="w-full rounded-2xl border border-dashed border-violet/40 bg-surface-tint px-4 py-3.5 text-left"
      >
        <span className="block text-[14.5px] font-bold">Health checks (control path)</span>
        <span className="block text-[12.5px] leading-relaxed text-muted-foreground">
          Probes reach every instance, including the failing one — that is how it comes back.
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  const inst = instances.find((i) => i.id === key);
  if (inst) return { eyebrow: inst.healthy ? "In rotation" : "Removed from rotation", title: inst.label, body: inst.detail };
  if (key === CLIENTS_KEY)
    return {
      eyebrow: "Clients",
      title: "Many requests, one address",
      body: "Every client — browsers, mobile apps, partner systems — talks to a single public name. None of them knows how many instances exist behind it, which is exactly what lets that number change.",
    };
  if (key === LB_KEY)
    return {
      eyebrow: "Entry point",
      title: "Load balancer",
      body: "It receives all incoming traffic and forwards each request to one healthy instance. Because instances are interchangeable, spreading the load is safe — and a request never waits behind a machine that is already busy or broken.",
    };
  if (key === HEALTH_KEY)
    return {
      eyebrow: "Control path",
      title: "Health checks",
      body: "A small probe runs against every instance every few seconds. Passing instances stay in rotation; a failing one is taken out automatically and receives no traffic. The probe keeps running, so the instance rejoins on its own once it recovers.",
    };
  if (key === SCALE_KEY)
    return {
      eyebrow: "Horizontal scaling",
      title: "Add another instance",
      body: "More capacity means more copies behind the same entry point, not a bigger machine. The new instance registers, passes its health check, and starts taking a share of the traffic.",
    };
  return null;
}

export function LoadBalancerDiagram() {
  const uid = useId().replace(/:/g, "");
  const narrow = useNarrow(940);
  const [hover, setHover] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const toggle = (key: string) => setActiveKey((k) => (k === key ? null : key));
  const panel = activeKey ? explain(activeKey) : null;

  return (
    <figure className="relative">
      <div className="relative overflow-hidden rounded-[30px] border border-border bg-surface shadow-stage">
        <StageBackdrop />

        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-3.5 sm:px-7">
          <div className="flex items-center gap-3">
            <span className="flex gap-1.5" aria-hidden="true">
              <span className="size-2 rounded-full bg-primary/70" />
              <span className="size-2 rounded-full bg-cyan/70" />
              <span className="size-2 rounded-full bg-violet/50" />
            </span>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Architecture · load balancing
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Request traffic", color: "var(--primary)" },
              { label: "Health checks", color: "var(--violet)" },
              { label: "Out of rotation", color: "var(--ember)" },
            ].map((l) => (
              <li key={l.label} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-[5px]"
                  style={{ background: `color-mix(in oklab, ${l.color} 82%, transparent)` }}
                  aria-hidden="true"
                />
                <span className="text-[11.5px] font-semibold text-muted-foreground">{l.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          {narrow ? (
            <MobileStack activeKey={activeKey} onToggle={toggle} />
          ) : (
            <div className="px-4 pb-6 pt-4">
              <DesktopStage
                uid={uid}
                hover={hover}
                activeKey={activeKey}
                setHover={setHover}
                onToggle={toggle}
              />
            </div>
          )}
        </div>

        {panel && (
          <ExplainPanel
            eyebrow={panel.eyebrow}
            title={panel.title}
            body={panel.body}
            onClose={() => setActiveKey(null)}
            side="left"
          />
        )}
      </div>
      <figcaption className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        One public entry point in front of interchangeable instances. Health checks decide who is in
        rotation; a failing instance stops receiving traffic while the probe keeps trying.
      </figcaption>
      <StageHint text="Hover a node to isolate its paths; click a client, the load balancer, an instance or the health checks for a short explanation." />
    </figure>
  );
}
