import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const C1 = "c1";
const C2 = "c2";
const C3 = "c3";
const CLIENTS = "clients";
const LANES = "lanes";
const AUTH = "auth";
const LOGIC = "logic";
const RESP = "resp";
const DB = "db";
const STORAGE = "storage";
const CONC = "conc";
const DEP = "dep";
const P2P = "p2p";

const PR1 = "pr1";
const PR2 = "pr2";
const PR3 = "pr3";
const PS1 = "ps1";
const PS2 = "ps2";
const PS3 = "ps3";
const P_AUTH = "p-auth";
const P_LOGIC = "p-logic";
const P_RAIL = "p-rail";
const P_DB = "p-db";
const P_ST = "p-st";

const related: Record<string, string[]> = {
  [C1]: [PR1, PS1, LANES, AUTH, LOGIC, RESP, P_RAIL, CLIENTS],
  [C2]: [PR2, PS2, LANES, AUTH, LOGIC, RESP, P_RAIL, CLIENTS],
  [C3]: [PR3, PS3, LANES, AUTH, LOGIC, RESP, P_RAIL, CLIENTS],
  [CLIENTS]: [C1, C2, C3, PR1, PR2, PR3, PS1, PS2, PS3],
  [LANES]: [C1, C2, C3, PR1, PR2, PR3, PS1, PS2, PS3, P_AUTH, AUTH, CONC, P_RAIL, RESP],
  [AUTH]: [LANES, P_AUTH, P_LOGIC, LOGIC],
  [LOGIC]: [AUTH, P_LOGIC, P_DB, DB, STORAGE, RESP, P_ST],
  [RESP]: [LOGIC, P_RAIL, LANES, PS1, PS2, PS3, C1, C2, C3],
  [DB]: [LOGIC, P_DB, STORAGE, P_ST],
  [STORAGE]: [DB, P_ST, P_DB, LOGIC],
  [CONC]: [LANES, PR1, PR2, PR3],
  [DEP]: [LANES, AUTH, LOGIC, C1, C2, C3],
  [P2P]: [],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1600;
const H = 960;

/* clients */
const CX = 44;
const CW = 300;
const CH = 150;
const CY = [140, 330, 520] as const;
const CRESP_Y = 710;
const CRESP_H = 150;

/* server zone */
const Z_X = 640;
const Z_W = 620;
const Z_Y = 100;
const Z_H = 560;

const IN_X = 676;
const IN_W = 548;

const LN_Y = 170;
const LN_H = 180;
const laneY = [246, 288, 330] as const;

const AU_Y = 386;
const AU_H = 110;
const AU_W = 262;
const LG_X = 962;

const RS_Y = 528;
const RS_W = 380;
const RS_H = 100;

const RAIL_X = 658;

/* data zone (beneath) */
const D_Y = 700;
const D_H = 200;
const ST_X = 676;
const DB_X = 962;
const D_CY = 740;
const D_CH = 140;
const D_CW = 262;

/* right rail notes */
const N_X = 1300;
const N_W = 260;

/* ---------------------------------- paths -------------------------------- */

const reqPath = (i: number) =>
  `M ${CX + CW} ${CY[i]! + 56} C ${CX + CW + 130} ${CY[i]! + 56}, ${Z_X - 130} ${laneY[i]! - 13}, ${Z_X} ${laneY[i]! - 13}`;
const resPath = (i: number) =>
  `M ${Z_X} ${laneY[i]! + 13} C ${Z_X - 130} ${laneY[i]! + 13}, ${CX + CW + 130} ${CY[i]! + 108}, ${CX + CW} ${CY[i]! + 108}`;

const pReq = [reqPath(0), reqPath(1), reqPath(2)];
const pRes = [resPath(0), resPath(1), resPath(2)];

const pStub = laneY.map((y) => `M ${Z_X} ${y} L ${IN_X - 4} ${y}`);

const pAuth = `M ${IN_X + AU_W / 2} ${LN_Y + LN_H} L ${IN_X + AU_W / 2} ${AU_Y - 4}`;
const pLogic = `M ${IN_X + AU_W} ${AU_Y + AU_H / 2} L ${LG_X - 4} ${AU_Y + AU_H / 2}`;
const pRail = `M ${IN_X} ${RS_Y + RS_H / 2} L ${RAIL_X} ${RS_Y + RS_H / 2} L ${RAIL_X} ${LN_Y + LN_H + 40} C ${RAIL_X} ${LN_Y + LN_H + 6}, ${IN_X + 6} ${LN_Y + LN_H + 24}, ${IN_X + 34} ${LN_Y + LN_H}`;
const pRespIn = `M ${LG_X + AU_W / 2} ${AU_Y + AU_H} L ${LG_X + AU_W / 2} ${RS_Y + RS_H / 2} L ${IN_X + RS_W} ${RS_Y + RS_H / 2}`;
const pDb = `M ${LG_X + AU_W / 2} ${AU_Y + AU_H} C ${LG_X + AU_W / 2 + 90} ${AU_Y + AU_H + 60}, ${DB_X + D_CW / 2 + 60} ${D_CY - 90}, ${DB_X + D_CW / 2} ${D_CY - 4}`;
const pSt = `M ${DB_X} ${D_CY + D_CH / 2} L ${ST_X + D_CW} ${D_CY + D_CH / 2}`;

/* --------------------------------- copy ---------------------------------- */

const clients = [
  {
    key: C1,
    eyebrow: "CLIENT 01",
    title: "Browser",
    sub: "Renders the page, sends HTTPS requests",
    mono: "GET /orders",
  },
  {
    key: C2,
    eyebrow: "CLIENT 02",
    title: "Mobile app",
    sub: "Same service, different front end",
    mono: "POST /orders",
  },
  {
    key: C3,
    eyebrow: "CLIENT 03",
    title: "Another application",
    sub: "A machine client, no user interface",
    mono: "GET /orders/42",
  },
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case C1:
      return {
        eyebrow: "Client",
        title: "A browser asks, it does not decide",
        body: "The browser renders what it is given and collects input. It holds no authoritative state: to know the current orders it must ask the server, because another client may have changed them a second ago.",
      };
    case C2:
      return {
        eyebrow: "Client",
        title: "A different client, the same service",
        body: "A mobile app speaks to exactly the same server over the same interface. Clients can look completely different and still share one set of rules, because the rules live on the server side.",
      };
    case C3:
      return {
        eyebrow: "Client",
        title: "Clients are not always people",
        body: "Another application can be a client too — a scheduled job, a partner system, a script. Anything that sends a request and waits for a response is a client in this shape.",
      };
    case CLIENTS:
      return {
        eyebrow: "Responsibilities",
        title: "What the client owns",
        body: "Presentation, local interaction, and carrying credentials on each request. What it does not own: validating the rules, deciding what is true, or storing shared data. A client can be reinstalled or replaced without losing anything important.",
      };
    case LANES:
      return {
        eyebrow: "Server",
        title: "Listening on one address",
        body: "The server waits on a known address and port. Each arriving request gets its own lane — its own connection and context — so requests from different clients are handled side by side rather than one after the other.",
      };
    case CONC:
      return {
        eyebrow: "Concurrency",
        title: "Many clients, one server, at once",
        body: "Requests overlap in time. The server keeps each one separate, tracks who sent it, and returns every response to the connection it arrived on — which is why two clients never receive each other's answers.",
      };
    case AUTH:
      return {
        eyebrow: "Server",
        title: "Who is asking?",
        body: "Before doing any work the server identifies the caller where it matters, checks the request is well-formed, and decides whether this caller is allowed this action. A request that fails here never reaches the application logic.",
      };
    case LOGIC:
      return {
        eyebrow: "Server",
        title: "Application logic — the authority",
        body: "Here the rules run: totals are calculated, limits enforced, changes accepted or refused. Centralising this means every client gets the same behaviour, and a modified client cannot invent its own rules.",
      };
    case RESP:
      return {
        eyebrow: "Response",
        title: "Back down the same connection",
        body: "The result is returned to the exact connection the request arrived on, with a status and a body. The client renders it — and the next question starts the round trip again.",
      };
    case DB:
      return {
        eyebrow: "Behind the server",
        title: "Shared data lives here",
        body: "The server reads and writes the database on the clients' behalf. Clients never touch it directly, which is what keeps one consistent version of the data behind one set of rules.",
      };
    case STORAGE:
      return {
        eyebrow: "Behind the server",
        title: "Files and object storage",
        body: "Uploads, images and documents usually sit in a storage layer next to the database. Same principle: the server decides who may read or write, the client only asks.",
      };
    case DEP:
      return {
        eyebrow: "Trade-off",
        title: "The centre is also the dependency",
        body: "Centralising processing and data is the strength of this shape and its cost. If the server is unreachable, every client loses the service at once — which is why real deployments run more than one copy of it.",
      };
    case P2P:
      return {
        eyebrow: "Contrast",
        title: "Peer-to-peer",
        body: "In a peer-to-peer shape every participant is both client and server, so there is no single centre to fail — and no single place holding the authoritative rules or data either.",
      };
    default:
      return null;
  }
}

/* -------------------------------- helpers -------------------------------- */

function Token({
  path,
  dur,
  begin,
  color,
  reverse,
}: {
  path: string;
  dur: string;
  begin: string;
  color: string;
  reverse?: boolean;
}) {
  return (
    <g>
      <rect x={-8} y={-8} width={16} height={16} rx={5} fill="var(--surface)" stroke={color} strokeWidth={1.8} />
      <circle r={2.6} fill={color} />
      <animateMotion
        dur={dur}
        begin={begin}
        repeatCount="indefinite"
        path={path}
        keyPoints={reverse ? "1;0" : "0;1"}
        keyTimes="0;1"
        calcMode="linear"
      />
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
      aria-label="A client-server architecture scene: a browser, a mobile app and another application on the left each send a request over the network to one central server. The server listens on one address with a lane per concurrent request, identifies the caller, runs the application logic, and returns each response down the same connection. Beneath the server, a database and an object storage layer hold the shared data. Notes on the right cover concurrency, the dependency on the central server, and a peer-to-peer contrast."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 860 }}
    >
      <defs>
        <linearGradient id={`${uid}-req`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
        <linearGradient id={`${uid}-res`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--cyan)" />
        </linearGradient>
        <linearGradient id={`${uid}-zone`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.14" />
          <stop offset="60%" stopColor="var(--primary)" stopOpacity="0.09" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.1" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={CX} y={48} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 10 — ASK, PROCESS, ANSWER
        </text>
        <text x={W - 44} y={48} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          MANY CLIENTS → ONE SERVER → SHARED DATA
        </text>
        <line x1={CX} y1={68} x2={W - 44} y2={68} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* server zone */}
      <g opacity={op(LANES)} style={{ transition: "opacity .3s ease" }}>
        <rect
          x={Z_X}
          y={Z_Y}
          width={Z_W}
          height={Z_H}
          rx={34}
          fill={`url(#${uid}-zone)`}
          stroke="color-mix(in oklab, var(--primary) 22%, transparent)"
        />
        <text x={Z_X + 36} y={Z_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          SERVER — CENTRALISED PROCESSING &amp; RULES
        </text>
      </g>

      {/* data zone */}
      <g opacity={op(DB)} style={{ transition: "opacity .3s ease" }}>
        <rect
          x={Z_X}
          y={D_Y}
          width={Z_W}
          height={D_H}
          rx={30}
          fill="color-mix(in oklab, var(--violet) 4.5%, transparent)"
          stroke="color-mix(in oklab, var(--violet) 20%, transparent)"
        />
        <text x={Z_X + 36} y={D_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          BEHIND THE SERVER — SHARED STATE
        </text>
      </g>

      {/* flows */}
      {pReq.map((d, i) => (
        <Flow key={`r${i}`} d={d} on={lit([PR1, PR2, PR3][i]!) && hover !== null} op={op([PR1, PR2, PR3][i]!)} color={`url(#${uid}-req)`} />
      ))}
      {pRes.map((d, i) => (
        <Flow key={`s${i}`} d={d} on={lit([PS1, PS2, PS3][i]!) && hover !== null} op={op([PS1, PS2, PS3][i]!)} color={`url(#${uid}-res)`} />
      ))}
      {pStub.map((d, i) => (
        <Flow key={`t${i}`} d={d} on={false} op={op([PR1, PR2, PR3][i]!)} color="var(--primary)" />
      ))}
      <Flow d={pAuth} on={lit(P_AUTH) && hover !== null} op={op(P_AUTH)} color="var(--primary)" />
      <Flow d={pLogic} on={lit(P_LOGIC) && hover !== null} op={op(P_LOGIC)} color="var(--primary)" />
      <Flow d={pRespIn} on={lit(P_RAIL) && hover !== null} op={op(P_RAIL)} color="var(--cyan)" />
      <Flow d={pRail} on={lit(P_RAIL) && hover !== null} op={op(P_RAIL)} color="var(--cyan)" />
      <Flow d={pDb} on={lit(P_DB) && hover !== null} op={op(P_DB)} color="var(--violet)" />
      <Flow d={pSt} on={lit(P_ST) && hover !== null} op={op(P_ST)} color="var(--violet)" dashed />

      {/* animated packets */}
      {pReq.map((d, i) => (
        <g key={`rt${i}`} opacity={op([PR1, PR2, PR3][i]!)}>
          <Token path={d} dur={`${3.6 + i * 0.5}s`} begin={`${i * 0.7}s`} color="var(--primary)" />
        </g>
      ))}
      {pRes.map((d, i) => (
        <g key={`st${i}`} opacity={op([PS1, PS2, PS3][i]!)}>
          <Token path={d} dur={`${3.6 + i * 0.5}s`} begin={`${1.6 + i * 0.7}s`} color="var(--cyan)" />
        </g>
      ))}
      <g opacity={op(P_DB)}>
        <Token path={pDb} dur="3.4s" begin="0.6s" color="var(--violet)" />
      </g>

      {/* flow labels */}
      <g aria-hidden="true" opacity={op(PR1)}>
        <text x={CX + CW + 40} y={CY[0]! + 40} fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
          REQUEST
        </text>
      </g>
      <g aria-hidden="true" opacity={op(PS3)}>
        <text x={CX + CW + 40} y={CY[2]! + CH + 26} fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
          RESPONSE
        </text>
      </g>
      <g aria-hidden="true" opacity={op(PR2)}>
        <text x={470} y={112} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)" textAnchor="middle">
          NETWORK · HTTPS
        </text>
      </g>

      {/* ------------------------------- clients ----------------------------- */}
      <g aria-hidden="true" opacity={op(CLIENTS)}>
        <text x={CX} y={112} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          CLIENTS — ASK FOR SERVICES
        </text>
      </g>

      {clients.map((c, i) => (
        <g key={c.key} {...interactive(c.key, `${c.title} — ${c.sub}`)} opacity={op(c.key)}>
          <rect
            x={CX}
            y={CY[i]!}
            width={CW}
            height={CH}
            rx={26}
            fill={on(c.key) ? "color-mix(in oklab, var(--primary) 7%, var(--surface))" : "var(--surface)"}
            stroke={on(c.key) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border-strong)"}
            strokeWidth={on(c.key) ? 2 : 1.2}
            filter={`url(#${uid}-lift)`}
            style={{ transition: "fill .3s ease, stroke .3s ease" }}
          />
          <text x={CX + 24} y={CY[i]! + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
            {c.eyebrow}
          </text>
          <text x={CX + 24} y={CY[i]! + 64} fontSize={20} fontWeight={780} fill="var(--foreground)">
            {c.title}
          </text>
          <text x={CX + 24} y={CY[i]! + 90} fontSize={13} fill="var(--muted-foreground)">
            {c.sub}
          </text>
          <rect
            x={CX + 24}
            y={CY[i]! + 104}
            width={168}
            height={30}
            rx={11}
            fill="color-mix(in oklab, var(--primary) 8%, transparent)"
            stroke="color-mix(in oklab, var(--primary) 30%, transparent)"
          />
          <text x={CX + 38} y={CY[i]! + 124} fontSize={12.5} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--primary)">
            {c.mono}
          </text>
        </g>
      ))}

      {/* client responsibilities */}
      <g {...interactive(CLIENTS, "Client responsibilities")} opacity={op(CLIENTS)}>
        {card(CLIENTS, CX, CRESP_Y, CW, CRESP_H, "var(--primary)")}
        <text x={CX + 24} y={CRESP_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          CLIENT SIDE
        </text>
        <text x={CX + 24} y={CRESP_Y + 62} fontSize={18} fontWeight={760} fill="var(--foreground)">
          Presentation &amp; input
        </text>
        <text x={CX + 24} y={CRESP_Y + 90} fontSize={13} fill="var(--muted-foreground)">
          Sends credentials with each request
        </text>
        <text x={CX + 24} y={CRESP_Y + 114} fontSize={13} fill="var(--muted-foreground)">
          Holds no authoritative state
        </text>
      </g>

      {/* ------------------------------ server lanes -------------------------- */}
      <g {...interactive(LANES, "Listener — one address, one lane per concurrent request")} opacity={op(LANES)}>
        {card(LANES, IN_X, LN_Y, IN_W, LN_H, "var(--cyan)", 22)}
        <text x={IN_X + 24} y={LN_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          01 · LISTENER · :443
        </text>
        <text x={IN_X + IN_W - 24} y={LN_Y + 32} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
          3 REQUESTS IN FLIGHT
        </text>
        {laneY.map((y, i) => (
          <g key={y} aria-hidden="true">
            <rect
              x={IN_X + 24}
              y={y - 15}
              width={IN_W - 48}
              height={30}
              rx={10}
              fill="color-mix(in oklab, var(--cyan) 7%, transparent)"
              stroke="color-mix(in oklab, var(--cyan) 28%, transparent)"
            />
            <circle cx={IN_X + 44} cy={y} r={4} fill="var(--cyan)" />
            <text x={IN_X + 60} y={y + 5} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--foreground)">
              {clients[i]!.mono}
            </text>
            <text x={IN_X + IN_W - 44} y={y + 5} textAnchor="end" fontSize={12} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              {`lane ${i + 1} · ${clients[i]!.title.toLowerCase()}`}
            </text>
          </g>
        ))}
      </g>

      {/* auth */}
      <g {...interactive(AUTH, "Identify and validate the caller")} opacity={op(AUTH)}>
        {card(AUTH, IN_X, AU_Y, AU_W, AU_H, "var(--primary)", 22)}
        <text x={IN_X + 22} y={AU_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          02 · IDENTIFY
        </text>
        <text x={IN_X + 22} y={AU_Y + 62} fontSize={19} fontWeight={760} fill="var(--foreground)">
          Who is asking?
        </text>
        <text x={IN_X + 22} y={AU_Y + 88} fontSize={13} fill="var(--muted-foreground)">
          Authenticate, then allow or refuse
        </text>
      </g>

      {/* logic */}
      <g {...interactive(LOGIC, "Application logic — the authority")} opacity={op(LOGIC)}>
        {card(LOGIC, LG_X, AU_Y, AU_W, AU_H, "var(--primary)", 22)}
        <text x={LG_X + 22} y={AU_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          03 · APPLICATION LOGIC
        </text>
        <text x={LG_X + 22} y={AU_Y + 62} fontSize={19} fontWeight={760} fill="var(--foreground)">
          The rules run here
        </text>
        <text x={LG_X + 22} y={AU_Y + 88} fontSize={13} fill="var(--muted-foreground)">
          Same behaviour for every client
        </text>
      </g>

      {/* response */}
      <g {...interactive(RESP, "Response returned on the same connection")} opacity={op(RESP)}>
        {card(RESP, IN_X, RS_Y, RS_W, RS_H, "var(--cyan)", 22)}
        <text x={IN_X + 22} y={RS_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          04 · RESPONSE
        </text>
        <text x={IN_X + 22} y={RS_Y + 62} fontSize={19} fontWeight={760} fill="var(--foreground)">
          Back to the same caller
        </text>
        <text x={IN_X + 22} y={RS_Y + 86} fontSize={13} fill="var(--muted-foreground)">
          200 OK · returned on the lane it arrived on
        </text>
      </g>

      {/* ------------------------------- data --------------------------------- */}
      <g {...interactive(DB, "Database — the shared data behind the server")} opacity={op(DB)}>
        {card(DB, DB_X, D_CY, D_CW, D_CH, "var(--violet)", 22)}
        <g aria-hidden="true" transform={`translate(${DB_X + 24} ${D_CY + 36})`}>
          <ellipse cx={20} cy={10} rx={20} ry={7} fill="none" stroke="var(--violet)" strokeWidth={1.7} />
          <path d="M0 10v30c0 4 9 7 20 7s20-3 20-7V10" fill="none" stroke="var(--violet)" strokeWidth={1.7} />
          <path d="M0 25c0 4 9 7 20 7s20-3 20-7" fill="none" stroke="var(--violet)" strokeWidth={1.7} />
        </g>
        <text x={DB_X + 84} y={D_CY + 62} fontSize={19} fontWeight={760} fill="var(--foreground)">
          Database
        </text>
        <text x={DB_X + 24} y={D_CY + 104} fontSize={13} fill="var(--muted-foreground)">
          One consistent version of the data
        </text>
        <text x={DB_X + 24} y={D_CY + 126} fontSize={13} fill="var(--muted-foreground)">
          Clients never connect to it directly
        </text>
      </g>

      <g {...interactive(STORAGE, "Object storage for files and uploads")} opacity={op(STORAGE)}>
        {card(STORAGE, ST_X, D_CY, D_CW, D_CH, "var(--violet)", 22)}
        <text x={ST_X + 24} y={D_CY + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          OPTIONAL
        </text>
        <text x={ST_X + 24} y={D_CY + 66} fontSize={19} fontWeight={760} fill="var(--foreground)">
          File / object storage
        </text>
        <text x={ST_X + 24} y={D_CY + 96} fontSize={13} fill="var(--muted-foreground)">
          Uploads, images, documents
        </text>
        <text x={ST_X + 24} y={D_CY + 118} fontSize={13} fill="var(--muted-foreground)">
          The server decides who may read
        </text>
      </g>

      {/* ------------------------------- notes -------------------------------- */}
      <g {...interactive(CONC, "Concurrency — many clients at the same time")} opacity={op(CONC)}>
        {card(CONC, N_X, 170, N_W, 180, "var(--cyan)")}
        <text x={N_X + 22} y={202} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          CONCURRENCY
        </text>
        <text x={N_X + 22} y={236} fontSize={18} fontWeight={760} fill="var(--foreground)">
          Many at once
        </text>
        <g aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={N_X + 22}
              y={256 + i * 18}
              width={140 + i * 36}
              height={9}
              rx={4.5}
              fill="color-mix(in oklab, var(--cyan) 45%, transparent)"
            />
          ))}
        </g>
        <text x={N_X + 22} y={332} fontSize={13} fill="var(--muted-foreground)">
          Overlapping, kept separate
        </text>
      </g>

      <g {...interactive(DEP, "Dependency on the central server")} opacity={op(DEP)}>
        {card(DEP, N_X, 396, N_W, 176, "var(--chart-5)")}
        <text x={N_X + 22} y={428} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          TRADE-OFF
        </text>
        <text x={N_X + 22} y={462} fontSize={18} fontWeight={760} fill="var(--foreground)">
          One centre
        </text>
        <text x={N_X + 22} y={492} fontSize={13} fill="var(--muted-foreground)">
          If the server is unreachable,
        </text>
        <text x={N_X + 22} y={514} fontSize={13} fill="var(--muted-foreground)">
          every client loses the service
        </text>
        <text x={N_X + 22} y={544} fontSize={13} fill="var(--muted-foreground)">
          at the same moment.
        </text>
      </g>

      <g {...interactive(P2P, "Peer-to-peer contrast")} opacity={op(P2P)}>
        {card(P2P, N_X, 618, N_W, 160, "var(--violet)")}
        <text x={N_X + 22} y={650} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          CONTRAST
        </text>
        <text x={N_X + 22} y={682} fontSize={18} fontWeight={760} fill="var(--foreground)">
          Peer-to-peer
        </text>
        <g aria-hidden="true">
          <circle cx={N_X + 40} cy={714} r={8} fill="none" stroke="var(--violet)" strokeWidth={1.7} />
          <circle cx={N_X + 100} cy={706} r={8} fill="none" stroke="var(--violet)" strokeWidth={1.7} />
          <circle cx={N_X + 76} cy={744} r={8} fill="none" stroke="var(--violet)" strokeWidth={1.7} />
          <path
            d={`M ${N_X + 48} ${712} L ${N_X + 92} ${707} M ${N_X + 44} ${721} L ${N_X + 69} ${738} M ${N_X + 84} ${739} L ${N_X + 98} ${714}`}
            stroke="var(--violet)"
            strokeWidth={1.4}
          />
        </g>
        <text x={N_X + 128} y={724} fontSize={13} fill="var(--muted-foreground)">
          Everyone is both
        </text>
        <text x={N_X + 128} y={746} fontSize={13} fill="var(--muted-foreground)">
          client and server
        </text>
      </g>
    </svg>
  );
}

/* -------------------------------- mobile --------------------------------- */

function MobileStack({ activeKey, onToggle }: { activeKey: string | null; onToggle: (key: string) => void }) {
  const Step = ({ text, tone = "primary" }: { text: string; tone?: "primary" | "cyan" }) => (
    <div className="flex items-center gap-2 pl-6" aria-hidden="true">
      <span className={`h-6 w-px ${tone === "cyan" ? "bg-cyan/60" : "bg-border-strong"}`} />
      <span className="text-[11.5px] text-muted-foreground">{text}</span>
    </div>
  );

  const btn = "w-full rounded-3xl border bg-surface px-4 py-4 text-left";

  return (
    <div className="space-y-3 px-4 py-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">CLIENTS — ASK FOR SERVICES</p>

      {clients.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onToggle(c.key)}
          aria-expanded={activeKey === c.key}
          className={`${btn} border-border shadow-soft`}
        >
          <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">{c.eyebrow}</span>
          <span className="mt-1 block text-[17px] font-extrabold">{c.title}</span>
          <span className="block text-[12.5px] text-muted-foreground">{c.sub}</span>
          <span className="mt-1.5 inline-block rounded-lg border border-primary/30 bg-primary/5 px-2 py-1 font-mono text-[12px] font-bold text-primary">
            {c.mono}
          </span>
        </button>
      ))}

      <button
        type="button"
        onClick={() => onToggle(CLIENTS)}
        aria-expanded={activeKey === CLIENTS}
        className={`${btn} border-border`}
      >
        <span className="block text-[15.5px] font-bold">Client side</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Presentation and input; sends credentials; holds no authoritative state.
        </span>
      </button>

      <Step text="over the network · HTTPS" />

      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">SERVER</p>

      <div className="space-y-2 rounded-3xl border border-cyan/40 bg-surface-tint p-3">
        <button
          type="button"
          onClick={() => onToggle(LANES)}
          aria-expanded={activeKey === LANES}
          className="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-left"
        >
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground">01 · LISTENER · :443</span>
          <span className="mt-1 block text-[15.5px] font-bold">One address, a lane per request</span>
          <span className="mt-1.5 block space-y-1">
            {clients.map((c, i) => (
              <span key={c.key} className="block rounded-lg border border-cyan/25 bg-cyan/5 px-2 py-1 font-mono text-[11.5px]">
                {`lane ${i + 1} · ${c.mono}`}
              </span>
            ))}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onToggle(AUTH)}
          aria-expanded={activeKey === AUTH}
          className="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-left"
        >
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground">02 · IDENTIFY</span>
          <span className="mt-1 block text-[15.5px] font-bold">Who is asking?</span>
          <span className="block text-[12.5px] text-muted-foreground">Authenticate, then allow or refuse.</span>
        </button>
        <button
          type="button"
          onClick={() => onToggle(LOGIC)}
          aria-expanded={activeKey === LOGIC}
          className="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-left"
        >
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground">03 · APPLICATION LOGIC</span>
          <span className="mt-1 block text-[15.5px] font-bold">The rules run here</span>
          <span className="block text-[12.5px] text-muted-foreground">Same behaviour for every client.</span>
        </button>
      </div>

      <Step text="reads and writes shared state" />

      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">BEHIND THE SERVER</p>

      <button
        type="button"
        onClick={() => onToggle(DB)}
        aria-expanded={activeKey === DB}
        className={`${btn} border-violet/35`}
      >
        <span className="block text-[15.5px] font-bold">Database</span>
        <span className="block text-[12.5px] text-muted-foreground">
          One consistent version of the data — clients never connect to it directly.
        </span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(STORAGE)}
        aria-expanded={activeKey === STORAGE}
        className={`${btn} border-violet/25`}
      >
        <span className="block text-[15.5px] font-bold">File / object storage</span>
        <span className="block text-[12.5px] text-muted-foreground">Uploads and documents, still behind the server.</span>
      </button>

      <Step text="response travels back" tone="cyan" />

      <button
        type="button"
        onClick={() => onToggle(RESP)}
        aria-expanded={activeKey === RESP}
        className={`${btn} border-cyan/45`}
      >
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">04 · RESPONSE</span>
        <span className="mt-1 block text-[15.5px] font-bold">Back to the same caller</span>
        <span className="block text-[12.5px] text-muted-foreground">200 OK, returned on the lane it arrived on.</span>
      </button>

      <div className="pt-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">NOTES</p>
      </div>

      <button
        type="button"
        onClick={() => onToggle(CONC)}
        aria-expanded={activeKey === CONC}
        className={`${btn} border-cyan/30`}
      >
        <span className="block text-[15.5px] font-bold">Many clients at once</span>
        <span className="block text-[12.5px] text-muted-foreground">Requests overlap; each answer returns to its own caller.</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(DEP)}
        aria-expanded={activeKey === DEP}
        className={`${btn} border-border-strong`}
      >
        <span className="block text-[15.5px] font-bold">One centre</span>
        <span className="block text-[12.5px] text-muted-foreground">
          If the server is unreachable, every client loses the service at the same moment.
        </span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(P2P)}
        aria-expanded={activeKey === P2P}
        className={`${btn} border-dashed border-border-strong`}
      >
        <span className="block text-[15.5px] font-bold">Peer-to-peer, for contrast</span>
        <span className="block text-[12.5px] text-muted-foreground">Everyone is both client and server — no single centre.</span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function ClientServerDiagram() {
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
              Clients ask · the server decides
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Request path", color: "var(--primary)" },
              { label: "Response path", color: "var(--cyan)" },
              { label: "Server ↔ data", color: "var(--violet)" },
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
        Several different clients send requests over the network to one server. It listens on a single
        address, handles the requests side by side, identifies the caller, applies the rules, reads or
        writes the shared data behind it, and returns each response to the client that asked.
      </figcaption>
      <StageHint text="Hover a client, a server stage or the data layer to isolate its path; click any component for a short explanation." />
    </figure>
  );
}
