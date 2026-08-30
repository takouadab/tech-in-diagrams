import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const MONO = "mono";
const MDB = "mdb";
const MDEP = "mdep";
const MSCALE = "mscale";

const S_ORD = "s-ord";
const S_BILL = "s-bill";
const S_USER = "s-user";
const CALLS = "calls";
const MIDEP = "midep";
const MISCALE = "miscale";

const R_DEPLOY = "r-deploy";
const R_SCALE = "r-scale";
const R_FAIL = "r-fail";

const P_MDB = "p-mdb";
const P_OB = "p-ob";
const P_OU = "p-ou";
const P_BU = "p-bu";
const P_D1 = "p-d1";
const P_D2 = "p-d2";
const P_D3 = "p-d3";

const related: Record<string, string[]> = {
  [MONO]: [MDB, P_MDB, MDEP, MSCALE, R_DEPLOY, R_SCALE, R_FAIL],
  [MDB]: [MONO, P_MDB],
  [MDEP]: [MONO, R_DEPLOY],
  [MSCALE]: [MONO, R_SCALE],
  [S_ORD]: [S_BILL, S_USER, CALLS, P_OB, P_OU, P_D1, MIDEP, MISCALE],
  [S_BILL]: [S_ORD, S_USER, CALLS, P_OB, P_BU, P_D2, MIDEP],
  [S_USER]: [S_ORD, S_BILL, CALLS, P_OU, P_BU, P_D3, MIDEP],
  [CALLS]: [S_ORD, S_BILL, S_USER, P_OB, P_OU, P_BU, R_FAIL],
  [MIDEP]: [S_ORD, S_BILL, S_USER, P_D1, P_D2, P_D3, R_DEPLOY],
  [MISCALE]: [S_ORD, R_SCALE],
  [R_DEPLOY]: [MDEP, MIDEP, MONO, S_ORD],
  [R_SCALE]: [MSCALE, MISCALE, MONO, S_ORD],
  [R_FAIL]: [MONO, CALLS, S_ORD, S_BILL, S_USER],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1600;
const H = 920;

/* monolith zone */
const M_X = 44;
const M_W = 600;
const Z_Y = 108;
const Z_H = 762;

const MS_X = 84;
const MS_W = 520;
const MS_Y = 176;
const MS_H = 288;

const MDB_Y = 494;
const MDB_H = 92;

const MDEP_Y = 616;
const MDEP_H = 96;

const MSC_Y = 736;
const MSC_H = 112;

/* rail */
const R_X = 676;
const R_W = 260;
const RC_X = 692;
const RC_W = 228;
const ROW_Y = [190, 424, 658] as const;
const ROW_H = 196;

/* microservices zone */
const I_X = 968;
const I_W = 588;

const SV_W = 246;
const SV_H = 112;
const DBP_H = 52;
const ORD_X = 1000;
const ORD_Y = 186;
const BIL_X = 1290;
const BIL_Y = 186;
const USR_X = 1145;
const USR_Y = 432;

const MID_X = 1000;
const MID_W = 536;
const MID_Y = 654;
const MID_H = 92;
const MISC_Y = 766;
const MISC_H = 92;

/* paths */
const pMdb = `M ${MS_X + MS_W / 2} ${MS_Y + MS_H} L ${MS_X + MS_W / 2} ${MDB_Y - 4}`;
const pOb = `M ${ORD_X + SV_W} ${ORD_Y + 62} L ${BIL_X - 4} ${ORD_Y + 62}`;
const pOu = `M ${ORD_X + 70} ${ORD_Y + SV_H + DBP_H + 6} C ${ORD_X + 70} ${USR_Y - 40}, ${USR_X + 24} ${USR_Y - 44}, ${USR_X + 62} ${USR_Y - 4}`;
const pBu = `M ${BIL_X + SV_W - 70} ${BIL_Y + SV_H + DBP_H + 6} C ${BIL_X + SV_W - 70} ${USR_Y - 40}, ${USR_X + SV_W - 24} ${USR_Y - 44}, ${USR_X + SV_W - 62} ${USR_Y - 4}`;
const pD1 = `M ${ORD_X + SV_W / 2} ${MID_Y - 4} L ${ORD_X + SV_W / 2} ${MID_Y - 4}`;

/* --------------------------------- copy ---------------------------------- */

const monoLayers = [
  { label: "User interface", sub: "Screens and pages" },
  { label: "API layer", sub: "Requests in, responses out" },
  { label: "Business logic", sub: "Orders · Billing · Users" },
  { label: "Data access", sub: "One connection, one schema" },
] as const;

const services = [
  {
    key: S_ORD,
    x: ORD_X,
    y: ORD_Y,
    name: "Orders",
    sub: "Baskets and checkout",
    store: "orders db",
  },
  {
    key: S_BILL,
    x: BIL_X,
    y: BIL_Y,
    name: "Billing",
    sub: "Invoices and payments",
    store: "billing db",
  },
  {
    key: S_USER,
    x: USR_X,
    y: USR_Y,
    name: "Users",
    sub: "Accounts and profiles",
    store: "users db",
  },
] as const;

const railRows = [
  {
    key: R_DEPLOY,
    label: "DEPLOY",
    title: "Release unit",
    mono: "One artifact, everything in it",
    micro: "One service at a time",
  },
  {
    key: R_SCALE,
    label: "SCALE",
    title: "What grows",
    mono: "Another copy of the whole app",
    micro: "Only the busy service",
  },
  {
    key: R_FAIL,
    label: "FAILURE",
    title: "Blast radius",
    mono: "One bad change hits everything",
    micro: "Contained — but calls can fail",
  },
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case MONO:
      return {
        eyebrow: "Monolith",
        title: "One application, one release",
        body: "Interface, API, business rules and data access live in a single codebase and ship as one artifact. Calls between the parts are ordinary function calls: fast, reliable, easy to follow in a debugger. This is usually the simplest way to start.",
      };
    case MDB:
      return {
        eyebrow: "Monolith",
        title: "One shared database",
        body: "Every part of the application reads and writes the same schema, so a join across orders, billing and users is trivial. The cost is coupling: a change to a shared table can affect code you did not touch.",
      };
    case MDEP:
      return {
        eyebrow: "Monolith",
        title: "Everything moves together",
        body: "A one-line fix in billing is packaged and released with all the rest. Coordination is easy while one team owns the whole thing, and increasingly awkward once several teams want to release on different days.",
      };
    case MSCALE:
      return {
        eyebrow: "Monolith",
        title: "Scaling means more whole copies",
        body: "If checkout is busy you run more copies of the entire application, including the parts that are idle. That is often perfectly affordable — it only becomes wasteful when one component needs far more capacity than the rest.",
      };
    case S_ORD:
      return {
        eyebrow: "Service",
        title: "Orders",
        body: "One clear responsibility and, where it makes sense, its own data. It can be released this afternoon and scaled up on a busy Friday without touching billing or users.",
      };
    case S_BILL:
      return {
        eyebrow: "Service",
        title: "Billing",
        body: "A separate team can ship billing on its own schedule. The price of that independence is a versioned interface: other services depend on the contract, so it cannot change casually.",
      };
    case S_USER:
      return {
        eyebrow: "Service",
        title: "Users",
        body: "Accounts and profiles behind their own boundary. Data that used to be one join away now lives on the other side of a network call, which is exactly where the extra complexity comes from.",
      };
    case CALLS:
      return {
        eyebrow: "Trade-off",
        title: "In-process call becomes a network call",
        body: "What was a function call is now a request that can be slow, retried, timed out or lost. Every boundary adds latency, partial failure and a need for tracing to understand what actually happened.",
      };
    case MIDEP:
      return {
        eyebrow: "Microservices",
        title: "Independent deployments",
        body: "Each service is built and released on its own. That is the real reason to split: separate teams stop queueing behind one shared release, at the cost of more pipelines, environments and versioning to run.",
      };
    case MISCALE:
      return {
        eyebrow: "Microservices",
        title: "Scale only what is busy",
        body: "Run six copies of orders and one of billing. Capacity follows demand per component instead of being sized for the whole application at once.",
      };
    case R_DEPLOY:
      return {
        eyebrow: "Comparison",
        title: "Release unit",
        body: "The monolith has one deployment unit, so every change waits for the same release. Microservices have many, so a change can ship the moment it is ready — provided the interfaces between services stay compatible.",
      };
    case R_SCALE:
      return {
        eyebrow: "Comparison",
        title: "Scaling granularity",
        body: "A monolith scales as a block; microservices scale per component. This only matters when components have genuinely different load profiles — otherwise the block is cheaper and simpler.",
      };
    case R_FAIL:
      return {
        eyebrow: "Comparison",
        title: "Blast radius",
        body: "In a monolith a bad change can take down everything at once. Split services contain that, but introduce a new failure mode: the calls between them. Neither shape is automatically safer — you are choosing which failures you prefer to handle.",
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

function Flow({ d, on, op, color, dashed }: { d: string; on: boolean; op: number; color: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      opacity={op}
      stroke={on ? color : "var(--border-strong)"}
      strokeWidth={on ? 3.2 : 1.9}
      strokeLinecap="round"
      strokeDasharray={dashed ? "6 9" : undefined}
      className={dashed ? "motion-safe:animate-[dash-travel_5s_linear_infinite]" : undefined}
      style={{ transition: "opacity .3s ease, stroke-width .25s ease, stroke .25s ease" }}
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

  const card = (key: string, x: number, y: number, w: number, h: number, accent: string, r = 24) => (
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
      aria-label="A split comparison. On the left, a monolith: one application containing user interface, API, business logic and data access, shipping as a single release against one shared database, and scaling by running more copies of the whole thing. On the right, the same domain split into Orders, Billing and Users services, each with its own data and its own deployment, calling each other over the network. A central rail compares release unit, scaling granularity and blast radius."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 840 }}
    >
      <defs>
        <linearGradient id={`${uid}-mono`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={`${uid}-micro`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.13" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.09" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={M_X} y={48} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 11 — SAME CAPABILITIES, DIFFERENT BOUNDARIES
        </text>
        <text x={W - 44} y={48} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          SIMPLICITY ⟷ INDEPENDENCE
        </text>
        <line x1={M_X} y1={68} x2={W - 44} y2={68} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* zones */}
      <g opacity={op(MONO)} style={{ transition: "opacity .3s ease" }}>
        <rect x={M_X} y={Z_Y} width={M_W} height={Z_H} rx={34} fill={`url(#${uid}-mono)`} stroke="color-mix(in oklab, var(--primary) 20%, transparent)" />
        <text x={M_X + 40} y={Z_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          MONOLITH — ONE DEPLOYABLE UNIT
        </text>
      </g>

      <g opacity={op(CALLS)} style={{ transition: "opacity .3s ease" }}>
        <rect x={I_X} y={Z_Y} width={I_W} height={Z_H} rx={34} fill={`url(#${uid}-micro)`} stroke="color-mix(in oklab, var(--cyan) 24%, transparent)" />
        <text x={I_X + 36} y={Z_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          MICROSERVICES — MANY DEPLOYABLE UNITS
        </text>
      </g>

      {/* ------------------------------ monolith ------------------------------ */}
      <Flow d={pMdb} on={lit(P_MDB) && hover !== null} op={op(P_MDB)} color="var(--violet)" />
      <g opacity={op(P_MDB)}>
        <Token path={pMdb} dur="2.6s" begin="0.2s" color="var(--violet)" />
      </g>

      <g {...interactive(MONO, "Monolith — one application containing every layer")} opacity={op(MONO)}>
        <rect
          x={MS_X}
          y={MS_Y}
          width={MS_W}
          height={MS_H}
          rx={26}
          fill={on(MONO) ? "color-mix(in oklab, var(--primary) 6%, var(--surface))" : "var(--surface)"}
          stroke={on(MONO) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(MONO) ? 2 : 1.2}
          filter={`url(#${uid}-lift)`}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={MS_X + 26} y={MS_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          ONE CODEBASE · ONE ARTIFACT
        </text>
        {monoLayers.map((l, i) => {
          const y = MS_Y + 54 + i * 56;
          return (
            <g key={l.label} aria-hidden="true">
              <rect
                x={MS_X + 24}
                y={y}
                width={MS_W - 48}
                height={48}
                rx={13}
                fill="color-mix(in oklab, var(--primary) 6%, transparent)"
                stroke="color-mix(in oklab, var(--primary) 26%, transparent)"
              />
              <text x={MS_X + 44} y={y + 30} fontSize={15.5} fontWeight={720} fill="var(--foreground)">
                {l.label}
              </text>
              <text x={MS_X + MS_W - 44} y={y + 30} textAnchor="end" fontSize={12.5} fill="var(--muted-foreground)">
                {l.sub}
              </text>
            </g>
          );
        })}
        <text x={MS_X + 26} y={MS_Y + MS_H - 12} fontSize={12.5} fill="var(--muted-foreground)">
          Calls between layers are in-process — fast and reliable
        </text>
      </g>

      <g {...interactive(MDB, "One shared database")} opacity={op(MDB)}>
        {card(MDB, MS_X, MDB_Y, MS_W, MDB_H, "var(--violet)", 22)}
        <g aria-hidden="true" transform={`translate(${MS_X + 26} ${MDB_Y + 22})`}>
          <ellipse cx={17} cy={9} rx={17} ry={6} fill="none" stroke="var(--violet)" strokeWidth={1.6} />
          <path d="M0 9v30c0 3.5 7.6 6 17 6s17-2.5 17-6V9" fill="none" stroke="var(--violet)" strokeWidth={1.6} />
          <path d="M0 24c0 3.5 7.6 6 17 6s17-2.5 17-6" fill="none" stroke="var(--violet)" strokeWidth={1.6} />
        </g>
        <text x={MS_X + 84} y={MDB_Y + 42} fontSize={18} fontWeight={760} fill="var(--foreground)">
          One shared database
        </text>
        <text x={MS_X + 84} y={MDB_Y + 68} fontSize={13} fill="var(--muted-foreground)">
          Joins are easy — and the schema is shared by everything
        </text>
      </g>

      <g {...interactive(MDEP, "Monolith deployment — everything ships together")} opacity={op(MDEP)}>
        {card(MDEP, MS_X, MDEP_Y, MS_W, MDEP_H, "var(--primary)", 22)}
        <text x={MS_X + 24} y={MDEP_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          DEPLOY
        </text>
        <text x={MS_X + 24} y={MDEP_Y + 60} fontSize={18} fontWeight={760} fill="var(--foreground)">
          One release, all of it
        </text>
        <text x={MS_X + 24} y={MDEP_Y + 82} fontSize={13} fill="var(--muted-foreground)">
          A one-line billing fix ships with everything else
        </text>
      </g>

      <g {...interactive(MSCALE, "Monolith scaling — more copies of the whole application")} opacity={op(MSCALE)}>
        {card(MSCALE, MS_X, MSC_Y, MS_W, MSC_H, "var(--primary)", 22)}
        <text x={MS_X + 24} y={MSC_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          SCALE
        </text>
        <text x={MS_X + 24} y={MSC_Y + 60} fontSize={18} fontWeight={760} fill="var(--foreground)">
          The whole thing grows together
        </text>
        <text x={MS_X + 24} y={MSC_Y + 84} fontSize={13} fill="var(--muted-foreground)">
          Busy checkout? Run another full copy.
        </text>
        <g aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={MS_X + MS_W - 130 + i * 30}
              y={MSC_Y + 34}
              width={22}
              height={54}
              rx={7}
              fill="color-mix(in oklab, var(--primary) 14%, transparent)"
              stroke="color-mix(in oklab, var(--primary) 38%, transparent)"
            />
          ))}
        </g>
      </g>

      {/* -------------------------------- rail -------------------------------- */}
      <g aria-hidden="true">
        <rect x={R_X} y={Z_Y} width={R_W} height={Z_H} rx={30} fill="var(--surface)" opacity={0.6} stroke="var(--border)" />
        <text x={R_X + R_W / 2} y={Z_Y + 42} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          COMPARE
        </text>
      </g>

      {railRows.map((r, i) => (
        <g key={r.key} {...interactive(r.key, `${r.title} — monolith versus microservices`)} opacity={op(r.key)}>
          {card(r.key, RC_X, ROW_Y[i]!, RC_W, ROW_H, "var(--cyan)", 22)}
          <text x={RC_X + 20} y={ROW_Y[i]! + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
            {r.label}
          </text>
          <text x={RC_X + 20} y={ROW_Y[i]! + 58} fontSize={17} fontWeight={760} fill="var(--foreground)">
            {r.title}
          </text>
          <rect
            x={RC_X + 20}
            y={ROW_Y[i]! + 74}
            width={RC_W - 40}
            height={52}
            rx={12}
            fill="color-mix(in oklab, var(--primary) 7%, transparent)"
            stroke="color-mix(in oklab, var(--primary) 26%, transparent)"
          />
          <text x={RC_X + 32} y={ROW_Y[i]! + 94} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
            MONOLITH
          </text>
          <text x={RC_X + 32} y={ROW_Y[i]! + 116} fontSize={12.5} fill="var(--foreground)">
            {r.mono}
          </text>
          <rect
            x={RC_X + 20}
            y={ROW_Y[i]! + 134}
            width={RC_W - 40}
            height={52}
            rx={12}
            fill="color-mix(in oklab, var(--cyan) 8%, transparent)"
            stroke="color-mix(in oklab, var(--cyan) 30%, transparent)"
          />
          <text x={RC_X + 32} y={ROW_Y[i]! + 154} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            MICROSERVICES
          </text>
          <text x={RC_X + 32} y={ROW_Y[i]! + 176} fontSize={12.5} fill="var(--foreground)">
            {r.micro}
          </text>
        </g>
      ))}

      {/* ----------------------------- microservices -------------------------- */}
      <Flow d={pOb} on={lit(P_OB) && hover !== null} op={op(P_OB)} color="var(--cyan)" dashed />
      <Flow d={pOu} on={lit(P_OU) && hover !== null} op={op(P_OU)} color="var(--cyan)" dashed />
      <Flow d={pBu} on={lit(P_BU) && hover !== null} op={op(P_BU)} color="var(--cyan)" dashed />
      <g opacity={op(P_OU)}>
        <Token path={pOu} dur="3.4s" begin="0.4s" color="var(--cyan)" />
      </g>
      <g opacity={op(P_BU)}>
        <Token path={pBu} dur="3.8s" begin="1.4s" color="var(--cyan)" />
      </g>

      {services.map((s) => (
        <g key={s.key} {...interactive(s.key, `${s.name} service — ${s.sub}`)} opacity={op(s.key)}>
          <rect
            x={s.x}
            y={s.y}
            width={SV_W}
            height={SV_H}
            rx={24}
            fill={on(s.key) ? "color-mix(in oklab, var(--cyan) 8%, var(--surface))" : "var(--surface)"}
            stroke={on(s.key) ? "color-mix(in oklab, var(--cyan) 60%, transparent)" : "var(--border-strong)"}
            strokeWidth={on(s.key) ? 2 : 1.2}
            filter={`url(#${uid}-lift)`}
            style={{ transition: "fill .3s ease, stroke .3s ease" }}
          />
          <text x={s.x + 22} y={s.y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
            SERVICE
          </text>
          <text x={s.x + 22} y={s.y + 64} fontSize={20} fontWeight={780} fill="var(--foreground)">
            {s.name}
          </text>
          <text x={s.x + 22} y={s.y + 90} fontSize={13} fill="var(--muted-foreground)">
            {s.sub}
          </text>
          <rect
            x={s.x}
            y={s.y + SV_H + 6}
            width={SV_W}
            height={DBP_H}
            rx={16}
            fill="color-mix(in oklab, var(--violet) 6%, transparent)"
            stroke="color-mix(in oklab, var(--violet) 30%, transparent)"
          />
          <g aria-hidden="true" transform={`translate(${s.x + 20} ${s.y + SV_H + 18})`}>
            <ellipse cx={11} cy={6} rx={11} ry={4} fill="none" stroke="var(--violet)" strokeWidth={1.4} />
            <path d="M0 6v17c0 2.2 4.9 4 11 4s11-1.8 11-4V6" fill="none" stroke="var(--violet)" strokeWidth={1.4} />
          </g>
          <text x={s.x + 58} y={s.y + SV_H + 38} fontSize={13} fontFamily="var(--font-mono)" fill="var(--violet)">
            {s.store}
          </text>
          <text x={s.x + SV_W - 20} y={s.y + SV_H + 38} textAnchor="end" fontSize={12} fill="var(--muted-foreground)">
            owns its data
          </text>
        </g>
      ))}

      {/* network call annotation */}
      <g {...interactive(CALLS, "Network calls between services add latency and partial failure")} opacity={op(CALLS)}>
        <rect
          x={ORD_X + SV_W + 6}
          y={ORD_Y + 20}
          width={BIL_X - ORD_X - SV_W - 12}
          height={30}
          rx={12}
          fill={on(CALLS) ? "color-mix(in oklab, var(--cyan) 14%, var(--surface))" : "var(--surface)"}
          stroke="color-mix(in oklab, var(--cyan) 40%, transparent)"
          style={{ transition: "fill .3s ease" }}
        />
        <text x={ORD_X + SV_W + (BIL_X - ORD_X - SV_W) / 2} y={ORD_Y + 40} textAnchor="middle" fontSize={11.5} fontFamily="var(--font-mono)" fill="var(--cyan)">
          API
        </text>
        <text x={I_X + I_W - 32} y={USR_Y - 66} textAnchor="end" fontSize={13} fill="var(--muted-foreground)">
          Network calls: latency, retries, partial failure
        </text>
      </g>

      <g {...interactive(MIDEP, "Independent deployments")} opacity={op(MIDEP)}>
        {card(MIDEP, MID_X, MID_Y, MID_W, MID_H, "var(--cyan)", 22)}
        <text x={MID_X + 24} y={MID_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          DEPLOY
        </text>
        <text x={MID_X + 24} y={MID_Y + 60} fontSize={18} fontWeight={760} fill="var(--foreground)">
          Each service ships on its own
        </text>
        <text x={MID_X + 24} y={MID_Y + 82} fontSize={13} fill="var(--muted-foreground)">
          More pipelines, environments and versions to run
        </text>
        <g aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={MID_X + MID_W - 116 + i * 30}
              y={MID_Y + 34}
              width={22}
              height={40}
              rx={7}
              fill="color-mix(in oklab, var(--cyan) 16%, transparent)"
              stroke="color-mix(in oklab, var(--cyan) 42%, transparent)"
            />
          ))}
        </g>
      </g>

      <g {...interactive(MISCALE, "Scale only the busy service")} opacity={op(MISCALE)}>
        {card(MISCALE, MID_X, MISC_Y, MID_W, MISC_H, "var(--cyan)", 22)}
        <text x={MID_X + 24} y={MISC_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          SCALE
        </text>
        <text x={MID_X + 24} y={MISC_Y + 60} fontSize={18} fontWeight={760} fill="var(--foreground)">
          Only what is busy
        </text>
        <text x={MID_X + 24} y={MISC_Y + 82} fontSize={13} fill="var(--muted-foreground)">
          Six copies of orders, one of billing
        </text>
        <g aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={MID_X + MID_W - 146 + i * 24}
              y={MISC_Y + 34}
              width={16}
              height={44}
              rx={6}
              fill="color-mix(in oklab, var(--cyan) 16%, transparent)"
              stroke="color-mix(in oklab, var(--cyan) 42%, transparent)"
            />
          ))}
          <rect
            x={MID_X + MID_W - 44}
            y={MISC_Y + 44}
            width={16}
            height={24}
            rx={6}
            fill="color-mix(in oklab, var(--violet) 12%, transparent)"
            stroke="color-mix(in oklab, var(--violet) 38%, transparent)"
          />
        </g>
      </g>
    </svg>
  );
}

/* -------------------------------- mobile --------------------------------- */

function MobileStack({ activeKey, onToggle }: { activeKey: string | null; onToggle: (key: string) => void }) {
  const btn = "w-full rounded-3xl border bg-surface px-4 py-4 text-left";

  return (
    <div className="space-y-3 px-4 py-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">MONOLITH — ONE DEPLOYABLE UNIT</p>

      <button type="button" onClick={() => onToggle(MONO)} aria-expanded={activeKey === MONO} className={`${btn} border-border shadow-soft`}>
        <span className="block text-[17px] font-extrabold">One application</span>
        <span className="mt-1.5 block space-y-1">
          {monoLayers.map((l) => (
            <span key={l.label} className="block rounded-lg border border-primary/25 bg-primary/5 px-2.5 py-1.5 text-[13px] font-semibold">
              {l.label}
            </span>
          ))}
        </span>
        <span className="mt-2 block text-[12.5px] text-muted-foreground">Calls between layers are in-process — fast and reliable.</span>
      </button>

      <button type="button" onClick={() => onToggle(MDB)} aria-expanded={activeKey === MDB} className={`${btn} border-violet/35`}>
        <span className="block text-[15.5px] font-bold">One shared database</span>
        <span className="block text-[12.5px] text-muted-foreground">Joins are easy — and the schema is shared by everything.</span>
      </button>

      <button type="button" onClick={() => onToggle(MDEP)} aria-expanded={activeKey === MDEP} className={`${btn} border-border`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">DEPLOY</span>
        <span className="mt-1 block text-[15.5px] font-bold">One release, all of it</span>
        <span className="block text-[12.5px] text-muted-foreground">A one-line billing fix ships with everything else.</span>
      </button>

      <button type="button" onClick={() => onToggle(MSCALE)} aria-expanded={activeKey === MSCALE} className={`${btn} border-border`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">SCALE</span>
        <span className="mt-1 block text-[15.5px] font-bold">The whole thing grows together</span>
        <span className="block text-[12.5px] text-muted-foreground">Busy checkout? Run another full copy.</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">MICROSERVICES — MANY DEPLOYABLE UNITS</p>

      {services.map((s) => (
        <button key={s.key} type="button" onClick={() => onToggle(s.key)} aria-expanded={activeKey === s.key} className={`${btn} border-cyan/40 shadow-soft`}>
          <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">SERVICE</span>
          <span className="mt-1 block text-[17px] font-extrabold">{s.name}</span>
          <span className="block text-[12.5px] text-muted-foreground">{s.sub}</span>
          <span className="mt-1.5 inline-block rounded-lg border border-violet/30 bg-violet/5 px-2 py-1 font-mono text-[12px] text-violet">
            {s.store} · owns its data
          </span>
        </button>
      ))}

      <button type="button" onClick={() => onToggle(CALLS)} aria-expanded={activeKey === CALLS} className={`${btn} border-dashed border-cyan/40`}>
        <span className="block text-[15.5px] font-bold">Calls cross the network</span>
        <span className="block text-[12.5px] text-muted-foreground">Latency, retries and partial failure replace a simple function call.</span>
      </button>

      <button type="button" onClick={() => onToggle(MIDEP)} aria-expanded={activeKey === MIDEP} className={`${btn} border-cyan/30`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">DEPLOY</span>
        <span className="mt-1 block text-[15.5px] font-bold">Each service ships on its own</span>
        <span className="block text-[12.5px] text-muted-foreground">More pipelines, environments and versions to run.</span>
      </button>

      <button type="button" onClick={() => onToggle(MISCALE)} aria-expanded={activeKey === MISCALE} className={`${btn} border-cyan/30`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">SCALE</span>
        <span className="mt-1 block text-[15.5px] font-bold">Only what is busy</span>
        <span className="block text-[12.5px] text-muted-foreground">Six copies of orders, one of billing.</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">COMPARE</p>

      {railRows.map((r) => (
        <button key={r.key} type="button" onClick={() => onToggle(r.key)} aria-expanded={activeKey === r.key} className={`${btn} border-border`}>
          <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">{r.label}</span>
          <span className="mt-1 block text-[15.5px] font-bold">{r.title}</span>
          <span className="mt-1.5 block rounded-xl border border-primary/25 bg-primary/5 px-2.5 py-2 text-[12.5px]">
            <span className="block font-mono text-[10.5px] tracking-[0.14em] text-primary">MONOLITH</span>
            {r.mono}
          </span>
          <span className="mt-1.5 block rounded-xl border border-cyan/30 bg-cyan/5 px-2.5 py-2 text-[12.5px]">
            <span className="block font-mono text-[10.5px] tracking-[0.14em] text-cyan">MICROSERVICES</span>
            {r.micro}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function MonolithMicroservicesDiagram() {
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
              Same capabilities · different boundaries
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Monolith", color: "var(--primary)" },
              { label: "Services", color: "var(--cyan)" },
              { label: "Data", color: "var(--violet)" },
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
        The same capabilities drawn two ways: one application released and scaled as a block, or
        several services released and scaled on their own — paying for that independence with network
        calls and more moving parts to operate.
      </figcaption>
      <StageHint text="Hover a side or a comparison row to isolate it; click any component for a short explanation." />
    </figure>
  );
}
