import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const NET = "internet";
const VPC = "vpc";
const IGW = "igw";
const PUB = "public";
const WEB = "web";
const NAT = "nat";
const PRIV = "private";
const APP = "app";
const DB = "db";
const ROUTE = "route";
const SEC = "sec";
const EW = "eastwest";
const BLOCK = "blocked";

const related: Record<string, string[]> = {
  [NET]: [IGW, PUB, WEB, BLOCK, NAT],
  [VPC]: [PUB, PRIV, IGW, WEB, APP, DB, NAT, EW, ROUTE, SEC],
  [IGW]: [NET, PUB, WEB, NAT, ROUTE, SEC],
  [PUB]: [WEB, NAT, IGW, EW, VPC],
  [WEB]: [IGW, PUB, EW, APP, SEC],
  [NAT]: [APP, PRIV, IGW, PUB, NET],
  [PRIV]: [APP, DB, NAT, EW, BLOCK, VPC],
  [APP]: [WEB, DB, EW, NAT, PRIV],
  [DB]: [APP, PRIV, SEC],
  [ROUTE]: [IGW, NAT, PUB, PRIV, VPC],
  [SEC]: [WEB, DB, BLOCK, APP],
  [EW]: [WEB, APP, DB],
  [BLOCK]: [NET, PRIV, SEC],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1600;
const H = 990;

/* internet, outside the boundary */
const N_X = 40;
const N_Y = 300;
const N_W = 230;
const N_H = 180;

/* virtual network frame */
const V_X = 320;
const V_Y = 110;
const V_W = 1250;
const V_H = 800;

/* gateway */
const G_X = 360;
const G_Y = 300;
const G_W = 190;
const G_H = 180;

/* subnet zones */
const PZ_X = 600;
const PZ_Y = 150;
const PZ_W = 430;
const PZ_H = 330;

const RZ_X = 600;
const RZ_Y = 545;
const RZ_W = 430;
const RZ_H = 340;

/* cards inside zones */
const CX = 626;
const CW = 378;
const WEB_Y = 226;
const WEB_H = 132;
const NAT_Y = 382;
const NAT_H = 82;
const APP_Y = 622;
const APP_H = 128;
const DB_Y = 768;
const DB_H = 100;

/* control cards */
const K_X = 1090;
const K_W = 440;
const RT_Y = 150;
const RT_H = 260;
const SC_Y = 452;
const SC_H = 268;

/* paths */
const pInA = `M ${N_X + N_W} 372 L ${G_X} 356`;
const pInB = `M ${G_X + G_W} 340 C 585 340, 590 292, ${CX} 292`;
const pEW = `M 700 ${WEB_Y + WEB_H} L 700 ${APP_Y}`;
const pEW2 = `M 760 ${APP_Y + APP_H} L 760 ${DB_Y}`;
const pOutA = `M 900 ${APP_Y} L 900 ${NAT_Y + NAT_H}`;
const pOutB = `M ${CX} 440 C 590 440, 585 452, ${G_X + G_W} 452`;
const pOutC = `M ${G_X} 436 L ${N_X + N_W} 436`;
const pBlock = `M 155 ${N_Y + N_H} L 155 700 L 300 700`;
const pRoute = `M ${K_X} 300 C 1050 300, 1046 292, ${CX + CW} 292`;
const pSec = `M ${K_X} 600 C 1050 600, 1046 ${APP_Y + 60}, ${CX + CW} ${APP_Y + 60}`;

/* --------------------------------- copy ---------------------------------- */

const routeRows = [
  { dest: "To the internet", target: "Internet gateway" },
  { dest: "Inside this network", target: "Stays local" },
  { dest: "Private → internet", target: "NAT egress" },
] as const;

const secRows = [
  { rule: "Web tier: allow visitors in", state: "ALLOW" },
  { rule: "Database: only from the app", state: "ALLOW" },
  { rule: "Anything else from outside", state: "DENY" },
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case NET:
      return {
        eyebrow: "Outside",
        title: "The public internet",
        body: "Everything beyond your boundary: real visitors, bots and scanners alike. Nothing here is trusted, so it can only enter at the one place you deliberately opened.",
      };
    case VPC:
      return {
        eyebrow: "Virtual network",
        title: "Your own software-defined network",
        body: "A VPC or VNet is a private network you define with software instead of cables and racks. It uses the same ideas as any network — addresses, subnets, routes and filtering — but you create and change them with configuration.",
      };
    case IGW:
      return {
        eyebrow: "Edge",
        title: "Internet gateway",
        body: "The single door between your virtual network and the internet. Traffic can only cross here, and only for resources whose routes and security rules permit it.",
      };
    case PUB:
      return {
        eyebrow: "Subnet",
        title: "Public subnet",
        body: "A slice of the network whose route table has a path to the internet gateway. Only the components that genuinely must be reachable from outside belong here.",
      };
    case WEB:
      return {
        eyebrow: "Public subnet",
        title: "Internet-facing entry point",
        body: "The web tier accepts requests from visitors and passes them inward. It is the only part of the system exposed to the internet, which keeps the attack surface small.",
      };
    case NAT:
      return {
        eyebrow: "Egress",
        title: "Outbound only, through NAT",
        body: "Private resources still need updates and outbound API calls. NAT lets them start a connection outward and receive the reply, but it never lets someone outside open a new connection inward — the conversation must begin inside.",
      };
    case PRIV:
      return {
        eyebrow: "Subnet",
        title: "Private subnet",
        body: "No route from the internet gateway reaches this subnet, so it is not directly addressable from outside. Traffic gets here only from inside the virtual network.",
      };
    case APP:
      return {
        eyebrow: "Private subnet",
        title: "Application tier",
        body: "Business logic runs here, reachable only from the web tier. It talks to the database and, when it needs to, out to the internet through NAT.",
      };
    case DB:
      return {
        eyebrow: "Private subnet",
        title: "Database",
        body: "The most restricted resource in the network. Its rules accept connections from the application tier and nothing else, so even a compromised web tier cannot query it directly.",
      };
    case ROUTE:
      return {
        eyebrow: "Routing",
        title: "Where traffic is allowed to go",
        body: "A route table answers one question: for this destination, which next hop? A subnet with a route to the gateway is public; one without it is private. Routing decides direction — never permission.",
      };
    case SEC:
      return {
        eyebrow: "Filtering",
        title: "Whether traffic is allowed at all",
        body: "Security rules sit on top of routing. Even when a route exists, a rule can refuse the traffic. Route says where a packet may travel; the rule says whether it may pass.",
      };
    case EW:
      return {
        eyebrow: "East-west",
        title: "Traffic between tiers",
        body: "Most traffic in a real system never touches the internet. Web calls app, app calls database — all inside the virtual network, governed by the same routes and rules.",
      };
    case BLOCK:
      return {
        eyebrow: "Boundary",
        title: "No direct path inward",
        body: "An attempt to reach the database or application straight from the internet has nowhere to land: no route points there and no rule permits it. That is the whole point of separating public from private.",
      };
    default:
      return null;
  }
}

/* -------------------------------- helpers -------------------------------- */

function Token({ path, dur, begin, color }: { path: string; dur: string; begin: string; color: string }) {
  return (
    <g>
      <rect x={-8} y={-8} width={16} height={16} rx={5} fill="var(--surface)" stroke={color} strokeWidth={1.8} />
      <circle r={2.6} fill={color} />
      <animateMotion dur={dur} begin={begin} repeatCount="indefinite" path={path} calcMode="linear" />
    </g>
  );
}

function Flow({ d, on, color, dashed }: { d: string; on: boolean; color: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={on ? color : "var(--border-strong)"}
      strokeWidth={on ? 3.2 : 1.9}
      strokeLinecap="round"
      strokeDasharray={dashed ? "6 9" : undefined}
      className={dashed ? "motion-safe:animate-[dash-travel_5s_linear_infinite]" : undefined}
      style={{ transition: "stroke .25s ease, stroke-width .25s ease" }}
    />
  );
}

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
  const lit = (id: string) => hover === null || hover === id || (related[hover] ?? []).includes(id);
  const op = (id: string) => (lit(id) ? 1 : 0.52);
  const on = (id: string) => hover === id || activeKey === id;

  const interactive = (key: string, label: string) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    "aria-pressed": activeKey === key,
    className: "outline-none",
    style: { cursor: "pointer", transition: "opacity .3s ease" },
    onMouseEnter: () => setHover(key),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(key),
    onBlur: () => setHover(null),
    onClick: () => onToggle(key),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(key);
      }
    },
  });

  const card = (key: string, x: number, y: number, w: number, h: number, accent: string, r = 22) => (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={r}
      fill={on(key) ? `color-mix(in oklab, ${accent} 7%, var(--surface))` : "var(--surface)"}
      stroke={on(key) ? `color-mix(in oklab, ${accent} 55%, transparent)` : "var(--border-strong)"}
      strokeWidth={on(key) ? 2 : 1.2}
      style={{ transition: "fill .3s ease, stroke .3s ease" }}
    />
  );

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="A cloud virtual network cutaway. The public internet sits outside the boundary on the left and can only enter through an internet gateway. Inside, a public subnet holds the internet-facing web tier and a NAT egress component, while a deeper private subnet holds the application tier and database. A route table card shows where traffic may travel and a separate security-rule card shows whether it is permitted. Animated packets show an allowed inbound path, east-west traffic between tiers, and a private outbound path through NAT, while a direct attempt from the internet to the private subnet is blocked at the boundary."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 880 }}
    >
      <defs>
        <linearGradient id={`${uid}-vpc`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`${uid}-pub`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`${uid}-priv`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.13" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.05" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={N_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 13 — ONE BOUNDARY, TWO KINDS OF SUBNET
        </text>
        <text x={W - 44} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          ROUTES ⟷ RULES
        </text>
        <line x1={N_X} y1={52} x2={W - 44} y2={52} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* --------------------------- virtual network -------------------------- */}
      <g opacity={op(VPC)}>
        <g {...interactive(VPC, "Virtual network boundary — your software-defined network")}>
          <rect
            x={V_X}
            y={V_Y}
            width={V_W}
            height={V_H}
            rx={36}
            fill={`url(#${uid}-vpc)`}
            stroke={on(VPC) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "color-mix(in oklab, var(--primary) 28%, transparent)"}
            strokeWidth={on(VPC) ? 2.4 : 1.6}
            style={{ transition: "stroke .3s ease" }}
          />
          <text x={V_X + 34} y={V_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
            VIRTUAL NETWORK — VPC / VNET
          </text>
          <text x={V_X + 34} y={V_Y + 74} fontSize={20} fontWeight={780} fill="var(--foreground)">
            Your private, software-defined network
          </text>
        </g>
      </g>

      {/* ------------------------------- internet ----------------------------- */}
      <g {...interactive(NET, "The public internet, outside your boundary")} opacity={op(NET)}>
        {card(NET, N_X, N_Y, N_W, N_H, "var(--cyan)", 24)}
        <g aria-hidden="true" transform={`translate(${N_X + 26} ${N_Y + 26})`}>
          <circle cx={20} cy={20} r={19} fill="none" stroke="var(--cyan)" strokeWidth={1.8} />
          <ellipse cx={20} cy={20} rx={8} ry={19} fill="none" stroke="var(--cyan)" strokeWidth={1.3} />
          <line x1={1} y1={20} x2={39} y2={20} stroke="var(--cyan)" strokeWidth={1.3} />
        </g>
        <text x={N_X + 26} y={N_Y + 108} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Internet
        </text>
        <text x={N_X + 26} y={N_Y + 136} fontSize={13} fill="var(--muted-foreground)">
          Visitors, bots, scanners —
        </text>
        <text x={N_X + 26} y={N_Y + 156} fontSize={13} fill="var(--muted-foreground)">
          all untrusted by default
        </text>
      </g>

      {/* --------------------------- inbound allowed -------------------------- */}
      <g opacity={op(IGW)}>
        <Flow d={pInA} on={on(NET) || on(IGW) || on(WEB)} color="var(--cyan)" />
        <Flow d={pInB} on={on(IGW) || on(WEB) || on(PUB)} color="var(--cyan)" />
        <Token path={pInA} dur="1.6s" begin="0s" color="var(--cyan)" />
        <Token path={pInB} dur="1.8s" begin="0.5s" color="var(--cyan)" />
      </g>

      {/* ------------------------------- gateway ------------------------------ */}
      <g {...interactive(IGW, "Internet gateway — the single controlled door")} opacity={op(IGW)}>
        <rect
          x={G_X}
          y={G_Y}
          width={G_W}
          height={G_H}
          rx={24}
          fill={on(IGW) ? "color-mix(in oklab, var(--cyan) 9%, var(--surface))" : "var(--surface)"}
          stroke={on(IGW) ? "color-mix(in oklab, var(--cyan) 60%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(IGW) ? 2 : 1.2}
          filter={`url(#${uid}-lift)`}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={G_X + 24} y={G_Y + 38} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          EDGE
        </text>
        <text x={G_X + 24} y={G_Y + 74} fontSize={18.5} fontWeight={780} fill="var(--foreground)">
          Internet
        </text>
        <text x={G_X + 24} y={G_Y + 100} fontSize={18.5} fontWeight={780} fill="var(--foreground)">
          gateway
        </text>
        <text x={G_X + 24} y={G_Y + 132} fontSize={13} fill="var(--muted-foreground)">
          The one crossing
        </text>
        <text x={G_X + 24} y={G_Y + 152} fontSize={13} fill="var(--muted-foreground)">
          point, both ways
        </text>
      </g>

      {/* ---------------------------- public subnet --------------------------- */}
      <g {...interactive(PUB, "Public subnet — has a route to the internet gateway")} opacity={op(PUB)}>
        <rect
          x={PZ_X}
          y={PZ_Y}
          width={PZ_W}
          height={PZ_H}
          rx={28}
          fill={`url(#${uid}-pub)`}
          stroke={on(PUB) ? "color-mix(in oklab, var(--cyan) 60%, transparent)" : "color-mix(in oklab, var(--cyan) 30%, transparent)"}
          strokeWidth={on(PUB) ? 2.2 : 1.4}
          style={{ transition: "stroke .3s ease" }}
        />
        <text x={PZ_X + 26} y={PZ_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          PUBLIC SUBNET
        </text>
        <text x={PZ_X + PZ_W - 26} y={PZ_Y + 36} textAnchor="end" fontSize={12.5} fill="var(--cyan)">
          Reachable from outside
        </text>
      </g>

      <g {...interactive(WEB, "Web tier — the internet-facing entry point")} opacity={op(WEB)}>
        {card(WEB, CX, WEB_Y, CW, WEB_H, "var(--cyan)", 20)}
        <text x={CX + 26} y={WEB_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          ENTRY POINT
        </text>
        <text x={CX + 26} y={WEB_Y + 70} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Web tier
        </text>
        <text x={CX + 26} y={WEB_Y + 100} fontSize={13} fill="var(--muted-foreground)">
          Accepts visitor requests and
        </text>
        <text x={CX + 26} y={WEB_Y + 120} fontSize={13} fill="var(--muted-foreground)">
          passes them further inside
        </text>
      </g>

      <g {...interactive(NAT, "NAT egress — outbound only for private resources")} opacity={op(NAT)}>
        {card(NAT, CX, NAT_Y, CW, NAT_H, "var(--violet)", 20)}
        <text x={CX + 26} y={NAT_Y + 34} fontSize={16.5} fontWeight={740} fill="var(--foreground)">
          NAT egress
        </text>
        <text x={CX + 26} y={NAT_Y + 60} fontSize={13} fill="var(--muted-foreground)">
          Outbound only — replies allowed, new inbound is not
        </text>
      </g>

      {/* ---------------------------- private subnet -------------------------- */}
      <g {...interactive(PRIV, "Private subnet — no route from the internet")} opacity={op(PRIV)}>
        <rect
          x={RZ_X}
          y={RZ_Y}
          width={RZ_W}
          height={RZ_H}
          rx={28}
          fill={`url(#${uid}-priv)`}
          stroke={on(PRIV) ? "color-mix(in oklab, var(--violet) 60%, transparent)" : "color-mix(in oklab, var(--violet) 30%, transparent)"}
          strokeWidth={on(PRIV) ? 2.2 : 1.4}
          style={{ transition: "stroke .3s ease" }}
        />
        <text x={RZ_X + 26} y={RZ_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          PRIVATE SUBNET
        </text>
        <text x={RZ_X + RZ_W - 26} y={RZ_Y + 36} textAnchor="end" fontSize={12.5} fill="var(--violet)">
          No inbound route
        </text>
      </g>

      <g {...interactive(APP, "Application tier — reachable only from inside")} opacity={op(APP)}>
        {card(APP, CX, APP_Y, CW, APP_H, "var(--primary)", 20)}
        <text x={CX + 26} y={APP_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          BACKEND
        </text>
        <text x={CX + 26} y={APP_Y + 70} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Application tier
        </text>
        <text x={CX + 26} y={APP_Y + 100} fontSize={13} fill="var(--muted-foreground)">
          Business logic — called by the web tier only
        </text>
      </g>

      <g {...interactive(DB, "Database — accepts connections only from the app tier")} opacity={op(DB)}>
        {card(DB, CX, DB_Y, CW, DB_H, "var(--violet)", 20)}
        <g aria-hidden="true" transform={`translate(${CX + 26} ${DB_Y + 24})`}>
          <ellipse cx={15} cy={8} rx={15} ry={5.5} fill="none" stroke="var(--violet)" strokeWidth={1.6} />
          <path d="M0 8v26c0 3 6.7 5.5 15 5.5S30 37 30 34V8" fill="none" stroke="var(--violet)" strokeWidth={1.6} />
          <path d="M0 21c0 3 6.7 5.5 15 5.5S30 24 30 21" fill="none" stroke="var(--violet)" strokeWidth={1.6} />
        </g>
        <text x={CX + 78} y={DB_Y + 44} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Database
        </text>
        <text x={CX + 78} y={DB_Y + 70} fontSize={13} fill="var(--muted-foreground)">
          The most restricted resource
        </text>
      </g>

      {/* ------------------------------ east-west ----------------------------- */}
      <g opacity={op(EW)}>
        <Flow d={pEW} on={on(EW) || on(WEB) || on(APP)} color="var(--primary)" />
        <Flow d={pEW2} on={on(EW) || on(APP) || on(DB)} color="var(--primary)" />
        <Token path={pEW} dur="1.9s" begin="0.3s" color="var(--primary)" />
        <Token path={pEW2} dur="1.9s" begin="1s" color="var(--primary)" />
        <g {...interactive(EW, "East-west traffic between tiers inside the network")}>
          <rect
            x={392}
            y={520}
            width={182}
            height={38}
            rx={13}
            fill={on(EW) ? "color-mix(in oklab, var(--primary) 12%, var(--surface))" : "var(--surface)"}
            stroke="color-mix(in oklab, var(--primary) 42%, transparent)"
          />
          <text x={483} y={545} textAnchor="middle" fontSize={12.5} fill="var(--primary)">
            East-west traffic
          </text>
        </g>
      </g>

      {/* --------------------------- outbound via NAT ------------------------- */}
      <g opacity={op(NAT)}>
        <Flow d={pOutA} on={on(NAT) || on(APP)} color="var(--violet)" dashed />
        <Flow d={pOutB} on={on(NAT) || on(IGW)} color="var(--violet)" dashed />
        <Flow d={pOutC} on={on(NAT) || on(IGW) || on(NET)} color="var(--violet)" dashed />
        <Token path={pOutA} dur="1.8s" begin="0s" color="var(--violet)" />
        <Token path={pOutB} dur="1.6s" begin="0.8s" color="var(--violet)" />
        <Token path={pOutC} dur="1.4s" begin="1.4s" color="var(--violet)" />
      </g>

      {/* ------------------------------- blocked ------------------------------ */}
      <g opacity={op(BLOCK)}>
        <path
          d={pBlock}
          fill="none"
          stroke="color-mix(in oklab, var(--ember) 70%, transparent)"
          strokeWidth={on(BLOCK) ? 3 : 2}
          strokeDasharray="8 8"
          strokeLinecap="round"
        />
        <g {...interactive(BLOCK, "Blocked — no direct path from the internet to private resources")}>
          <circle
            cx={V_X}
            cy={700}
            r={22}
            fill={on(BLOCK) ? "color-mix(in oklab, var(--ember) 18%, var(--surface))" : "var(--surface)"}
            stroke="color-mix(in oklab, var(--ember) 70%, transparent)"
            strokeWidth={2}
          />
          <path d="M-8 -8 L8 8 M8 -8 L-8 8" transform={`translate(${V_X} 700)`} stroke="var(--ember)" strokeWidth={2.6} strokeLinecap="round" />
          <rect
            x={V_X + 34}
            y={676}
            width={244}
            height={48}
            rx={14}
            fill={on(BLOCK) ? "color-mix(in oklab, var(--ember) 10%, var(--surface))" : "var(--surface)"}
            stroke="color-mix(in oklab, var(--ember) 45%, transparent)"
          />
          <text x={V_X + 54} y={696} fontSize={13.5} fontWeight={700} fill="var(--foreground)">
            Direct hit on private resources
          </text>
          <text x={V_X + 54} y={715} fontSize={12.5} fill="var(--muted-foreground)">
            No route, no rule — it never lands
          </text>
        </g>
      </g>

      {/* ----------------------------- route table ---------------------------- */}
      <g opacity={op(ROUTE)}>
        <Flow d={pRoute} on={on(ROUTE)} color="var(--primary)" dashed />
        <g {...interactive(ROUTE, "Route table — where traffic is allowed to go")}>
          {card(ROUTE, K_X, RT_Y, K_W, RT_H, "var(--primary)", 24)}
          <text x={K_X + 28} y={RT_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
            ROUTE TABLE
          </text>
          <text x={K_X + 28} y={RT_Y + 68} fontSize={18.5} fontWeight={780} fill="var(--foreground)">
            Where may this go?
          </text>
          {routeRows.map((r, i) => {
            const y = RT_Y + 92 + i * 52;
            return (
              <g key={r.dest} aria-hidden="true">
                <rect x={K_X + 24} y={y} width={K_W - 48} height={44} rx={13} fill="color-mix(in oklab, var(--primary) 5%, transparent)" stroke="color-mix(in oklab, var(--primary) 22%, transparent)" />
                <text x={K_X + 42} y={y + 28} fontSize={13.5} fill="var(--muted-foreground)">
                  {r.dest}
                </text>
                <text x={K_X + K_W - 42} y={y + 28} textAnchor="end" fontSize={13.5} fontWeight={700} fill="var(--primary)">
                  → {r.target}
                </text>
              </g>
            );
          })}
        </g>
      </g>

      {/* ---------------------------- security rules -------------------------- */}
      <g opacity={op(SEC)}>
        <Flow d={pSec} on={on(SEC)} color="var(--ember)" dashed />
        <g {...interactive(SEC, "Security rules — whether traffic is allowed at all")}>
          {card(SEC, K_X, SC_Y, K_W, SC_H, "var(--ember)", 24)}
          <text x={K_X + 28} y={SC_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
            SECURITY RULES
          </text>
          <text x={K_X + 28} y={SC_Y + 68} fontSize={18.5} fontWeight={780} fill="var(--foreground)">
            Is it allowed at all?
          </text>
          {secRows.map((r, i) => {
            const y = SC_Y + 92 + i * 52;
            const deny = r.state === "DENY";
            const accent = deny ? "var(--ember)" : "var(--cyan)";
            return (
              <g key={r.rule} aria-hidden="true">
                <rect x={K_X + 24} y={y} width={K_W - 48} height={44} rx={13} fill={`color-mix(in oklab, ${accent} 5%, transparent)`} stroke={`color-mix(in oklab, ${accent} 24%, transparent)`} />
                <text x={K_X + 42} y={y + 28} fontSize={13.5} fill="var(--muted-foreground)">
                  {r.rule}
                </text>
                <text x={K_X + K_W - 42} y={y + 28} textAnchor="end" fontSize={11.5} fontFamily="var(--font-mono)" letterSpacing="0.1em" fill={accent}>
                  {r.state}
                </text>
              </g>
            );
          })}
          <text x={K_X + 28} y={SC_Y + SC_H - 16} fontSize={12.5} fill="var(--muted-foreground)">
            Routing says where. Filtering says whether.
          </text>
        </g>
      </g>

      <g aria-hidden="true" opacity={op(VPC)}>
        <text x={V_X + 34} y={V_H + V_Y - 34} fontSize={13} fill="var(--muted-foreground)">
          Same old networking ideas — addresses, subnets, routes, filtering — created with configuration instead of cables.
        </text>
      </g>
    </svg>
  );
}

/* -------------------------------- mobile --------------------------------- */

function MobileStack({ activeKey, onToggle }: { activeKey: string | null; onToggle: (key: string) => void }) {
  const btn = "w-full rounded-3xl border bg-surface px-4 py-4 text-left";

  return (
    <div className="space-y-3 px-4 py-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">INBOUND</p>

      <button type="button" onClick={() => onToggle(NET)} aria-expanded={activeKey === NET} className={`${btn} border-cyan/40 shadow-soft`}>
        <span className="block text-[17px] font-extrabold">Internet</span>
        <span className="block text-[12.5px] text-muted-foreground">Everything outside the boundary — untrusted by default.</span>
      </button>

      <button type="button" onClick={() => onToggle(IGW)} aria-expanded={activeKey === IGW} className={`${btn} border-cyan/40 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">EDGE</span>
        <span className="mt-1 block text-[17px] font-extrabold">Internet gateway</span>
        <span className="block text-[12.5px] text-muted-foreground">The single crossing point into the virtual network.</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">VIRTUAL NETWORK · VPC / VNET</p>

      <button type="button" onClick={() => onToggle(PUB)} aria-expanded={activeKey === PUB} className={`${btn} border-cyan/30 bg-cyan/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">PUBLIC SUBNET</span>
        <span className="mt-1 block text-[15.5px] font-bold">Reachable from outside</span>
        <span className="mt-2 block space-y-2">
          <span
            className="block rounded-2xl border border-cyan/30 bg-surface px-3 py-2.5"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(WEB);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onToggle(WEB);
              }
            }}
          >
            <span className="block text-[15px] font-bold">Web tier</span>
            <span className="block text-[12.5px] text-muted-foreground">Accepts visitor requests, passes them inward.</span>
          </span>
          <span
            className="block rounded-2xl border border-violet/30 bg-surface px-3 py-2.5"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(NAT);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onToggle(NAT);
              }
            }}
          >
            <span className="block text-[15px] font-bold">NAT egress</span>
            <span className="block text-[12.5px] text-muted-foreground">Outbound only — new inbound connections cannot use it.</span>
          </span>
        </span>
      </button>

      <button type="button" onClick={() => onToggle(EW)} aria-expanded={activeKey === EW} className={`${btn} border-primary/30`}>
        <span className="block text-[15.5px] font-bold">East-west traffic</span>
        <span className="block text-[12.5px] text-muted-foreground">Web → app → database, all inside the network.</span>
      </button>

      <button type="button" onClick={() => onToggle(PRIV)} aria-expanded={activeKey === PRIV} className={`${btn} border-violet/30 bg-violet/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">PRIVATE SUBNET</span>
        <span className="mt-1 block text-[15.5px] font-bold">No inbound route</span>
        <span className="mt-2 block space-y-2">
          <span
            className="block rounded-2xl border border-primary/30 bg-surface px-3 py-2.5"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(APP);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onToggle(APP);
              }
            }}
          >
            <span className="block text-[15px] font-bold">Application tier</span>
            <span className="block text-[12.5px] text-muted-foreground">Called by the web tier only.</span>
          </span>
          <span
            className="block rounded-2xl border border-violet/30 bg-surface px-3 py-2.5"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(DB);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onToggle(DB);
              }
            }}
          >
            <span className="block text-[15px] font-bold">Database</span>
            <span className="block text-[12.5px] text-muted-foreground">Accepts connections from the app tier and nothing else.</span>
          </span>
        </span>
      </button>

      <button type="button" onClick={() => onToggle(BLOCK)} aria-expanded={activeKey === BLOCK} className={`${btn} border-dashed border-ember/50`}>
        <span className="block text-[15.5px] font-bold">Internet → private, directly</span>
        <span className="block text-[12.5px] text-muted-foreground">Blocked at the boundary: no route, no rule.</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">ROUTING VS FILTERING</p>

      <button type="button" onClick={() => onToggle(ROUTE)} aria-expanded={activeKey === ROUTE} className={`${btn} border-primary/30`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">ROUTE TABLE</span>
        <span className="mt-1 block text-[15.5px] font-bold">Where may this go?</span>
        <span className="mt-2 block space-y-1.5">
          {routeRows.map((r) => (
            <span key={r.dest} className="block rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5 text-[13px]">
              {r.dest} <span className="font-semibold text-primary">→ {r.target}</span>
            </span>
          ))}
        </span>
      </button>

      <button type="button" onClick={() => onToggle(SEC)} aria-expanded={activeKey === SEC} className={`${btn} border-ember/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">SECURITY RULES</span>
        <span className="mt-1 block text-[15.5px] font-bold">Is it allowed at all?</span>
        <span className="mt-2 block space-y-1.5">
          {secRows.map((r) => (
            <span key={r.rule} className="block rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px]">
              {r.rule}{" "}
              <span className={r.state === "DENY" ? "font-mono text-[11px] text-ember" : "font-mono text-[11px] text-cyan"}>{r.state}</span>
            </span>
          ))}
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function CloudNetworkDiagram() {
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
              <span className="size-2 rounded-full bg-cyan/70" />
              <span className="size-2 rounded-full bg-primary/70" />
              <span className="size-2 rounded-full bg-violet/50" />
            </span>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              One boundary, two kinds of subnet
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Inbound", color: "var(--cyan)" },
              { label: "East-west", color: "var(--primary)" },
              { label: "Outbound via NAT", color: "var(--violet)" },
              { label: "Blocked", color: "var(--ember)" },
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
              <DesktopStage uid={uid} hover={hover} activeKey={activeKey} setHover={setHover} onToggle={toggle} />
            </div>
          )}
        </div>

        {panel && (
          <ExplainPanel eyebrow={panel.eyebrow} title={panel.title} body={panel.body} onClose={() => setActiveKey(null)} side="left" />
        )}
      </div>
      <figcaption className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        Routes decide where a packet may travel; security rules decide whether it may pass. Public
        subnets have a path to the gateway, private ones reach the internet only outbound through NAT.
      </figcaption>
      <StageHint text="Hover the internet, gateway, a subnet, the route table or the security rules to isolate the relevant path; click any component for a short explanation." />
    </figure>
  );
}
