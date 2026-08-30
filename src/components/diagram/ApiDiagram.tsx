import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const CLIENT = "client";
const REQ = "request";
const ENDPOINT = "endpoint";
const AUTH = "auth";
const ROUTE = "route";
const RESP = "response";
const SERVICE = "service";
const DB = "db";
const OTHER = "other";
const RECEIVED = "received";
const CONTRACT = "contract";

const P_REQ = "p-req";
const P_IN = "p-in";
const P_DB = "p-db";
const P_OTHER = "p-other";
const P_BACK = "p-back";
const P_OUT = "p-out";

const related: Record<string, string[]> = {
  [CLIENT]: [REQ, P_REQ, ENDPOINT, CONTRACT, RECEIVED, P_OUT, RESP],
  [REQ]: [CLIENT, P_REQ, ENDPOINT, AUTH, CONTRACT],
  [ENDPOINT]: [REQ, P_REQ, CLIENT, AUTH, CONTRACT],
  [AUTH]: [ENDPOINT, ROUTE, CONTRACT, REQ],
  [ROUTE]: [AUTH, P_IN, SERVICE, CONTRACT],
  [SERVICE]: [P_IN, ROUTE, DB, OTHER, P_DB, P_OTHER, P_BACK, RESP],
  [DB]: [SERVICE, P_DB],
  [OTHER]: [SERVICE, P_OTHER],
  [RESP]: [SERVICE, P_BACK, P_OUT, RECEIVED, CLIENT, CONTRACT],
  [RECEIVED]: [RESP, P_OUT, CLIENT],
  [CONTRACT]: [ENDPOINT, AUTH, ROUTE, RESP, P_REQ, P_OUT, P_IN, P_BACK],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1560;
const H = 800;

/* client column */
const C_X = 44;
const C_W = 300;
const CLIENT_Y = 148;
const CLIENT_H = 122;
const REQ_Y = 312;
const REQ_H = 214;
const RECV_Y = 578;
const RECV_H = 158;

/* api boundary */
const B_X = 552;
const B_W = 396;
const B_Y = 112;
const B_H = 636;
const R_X = B_X + 30;
const R_W = B_W - 60;
const R_H = 100;
const rowY = (i: number) => B_Y + 96 + i * (R_H + 30);

/* backend */
const S_X = 1092;
const S_W = 424;
const SV_Y = 176;
const SV_H = 126;
const DB_Y = 372;
const DB_H = 126;
const OT_Y = 552;
const OT_H = 112;

/* paths */
const pReq = `M ${C_X + C_W} ${CLIENT_Y + CLIENT_H / 2} C ${C_X + C_W + 110} ${CLIENT_Y + CLIENT_H / 2}, ${B_X - 110} ${rowY(0) + R_H / 2}, ${B_X - 6} ${rowY(0) + R_H / 2}`;
const pIn = `M ${B_X + B_W + 6} ${rowY(2) + R_H / 2} C ${B_X + B_W + 90} ${rowY(2) + R_H / 2}, ${S_X - 90} ${SV_Y + SV_H / 2}, ${S_X - 6} ${SV_Y + SV_H / 2}`;
const pDb = `M ${S_X + 90} ${SV_Y + SV_H} C ${S_X + 90} ${SV_Y + SV_H + 40}, ${S_X + 90} ${DB_Y - 40}, ${S_X + 90} ${DB_Y - 4}`;
const pOther = `M ${S_X + S_W - 96} ${SV_Y + SV_H} C ${S_X + S_W - 96} ${OT_Y - 90}, ${S_X + S_W - 96} ${OT_Y - 46}, ${S_X + S_W - 96} ${OT_Y - 4}`;
const pBack = `M ${S_X - 6} ${SV_Y + SV_H - 10} C ${S_X - 90} ${H - 76}, ${B_X + B_W + 90} ${H - 76}, ${B_X + B_W + 6} ${rowY(3) + R_H / 2}`;
const pOut = `M ${B_X - 6} ${rowY(3) + R_H / 2} C ${B_X - 120} ${rowY(3) + R_H / 2}, ${C_X + C_W + 110} ${RECV_Y + RECV_H / 2}, ${C_X + C_W} ${RECV_Y + RECV_H / 2}`;

/* --------------------------------- data ---------------------------------- */

const rows = [
  {
    id: ENDPOINT,
    kicker: "01 · ENDPOINT",
    label: "GET /users/{id}",
    sub: "A named, documented address",
  },
  {
    id: AUTH,
    kicker: "02 · AUTH & VALIDATION",
    label: "Verify token, check shape",
    sub: "401 Unauthorized · 400 Bad Request",
  },
  {
    id: ROUTE,
    kicker: "03 · ROUTING",
    label: "Hand off to the service",
    sub: "The caller never sees this part",
  },
  {
    id: RESP,
    kicker: "04 · RESPONSE",
    label: "Status code + body",
    sub: "200 OK · 404 Not Found",
  },
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case CLIENT:
      return {
        eyebrow: "Caller",
        title: "Client application",
        body: "A mobile app, a web page or another service. It knows only the published interface — which addresses exist, what to send and what will come back. It has no idea what language the backend is written in or where its data lives.",
      };
    case REQ:
      return {
        eyebrow: "Request",
        title: "Method, path, headers, body",
        body: "Every call carries four things: a method (GET, POST), an endpoint path, headers such as the authorisation token and content type, and — for writes — a body. Together they are the question being asked.",
      };
    case ENDPOINT:
      return {
        eyebrow: "Interface",
        title: "The endpoint",
        body: "One callable address in the API, for example GET /users/42 or POST /orders. Endpoints and their schemas are the promise: as long as they stay stable, everything behind them is free to change.",
      };
    case AUTH:
      return {
        eyebrow: "Gate",
        title: "Authentication and validation",
        body: "Before any work happens the API checks who is calling and whether the request is well formed. A missing or expired token returns 401 Unauthorized; a malformed body returns 400 Bad Request — and the backend is never touched.",
      };
    case ROUTE:
      return {
        eyebrow: "Routing",
        title: "Into the implementation",
        body: "A valid request is passed to the code that actually does the work. This hand-off is invisible to the caller, which is exactly why the service behind it can be rewritten, split or moved.",
      };
    case SERVICE:
      return {
        eyebrow: "Implementation",
        title: "Business logic",
        body: "The service applies the rules: look up a record, calculate a price, refuse an action. It may read or write a database and call other internal services before deciding what the answer should be.",
      };
    case DB:
      return {
        eyebrow: "Data",
        title: "Database",
        body: "Where the state actually lives. Callers never talk to it directly — they ask the API, which is what allows the storage engine or schema to change without breaking a single client.",
      };
    case OTHER:
      return {
        eyebrow: "Internal call",
        title: "Another service",
        body: "APIs compose. One service often calls another to complete a request. Those internal hops stay behind the boundary and are not part of the contract the client depends on.",
      };
    case RESP:
      return {
        eyebrow: "Answer",
        title: "Status code and body",
        body: "The reply comes back through the same interface: a status code that says how it went — 200 OK, 404 Not Found, 401 Unauthorized — and a structured body the caller can parse because its shape was agreed in advance.",
      };
    case RECEIVED:
      return {
        eyebrow: "Received",
        title: "200 OK",
        body: "The client gets a predictable answer it can render straight away. Because the shape is part of the contract, the same parsing code keeps working across releases of the backend.",
      };
    case CONTRACT:
      return {
        eyebrow: "The idea",
        title: "The contract is the product",
        body: "The membrane in the middle is the API: everything to the left depends on the interface, everything to the right is implementation. Swap the database, rewrite the service, move it to another cloud — as long as the contract holds, no caller notices.",
      };
    default:
      return null;
  }
}

/* -------------------------------- desktop -------------------------------- */

function Envelope({
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
    <g className="motion-safe:block">
      <g transform="translate(-15 -10)">
        <rect
          width={30}
          height={20}
          rx={5}
          fill="var(--surface)"
          stroke={color}
          strokeWidth={1.6}
        />
        <path d="M 3 5.5 L 15 13 L 27 5.5" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      </g>
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

function Flow({
  id,
  d,
  on,
  op,
  color,
  dashed,
}: {
  id: string;
  d: string;
  on: boolean;
  op: number;
  color: string;
  dashed?: boolean;
}) {
  return (
    <g key={id} opacity={op} style={{ transition: "opacity .3s ease" }}>
      <path
        d={d}
        fill="none"
        stroke={on ? color : "var(--border-strong)"}
        strokeWidth={on ? 3.2 : 1.9}
        strokeLinecap="round"
        strokeDasharray={dashed ? "6 9" : undefined}
        className={dashed ? "motion-safe:animate-[dash-travel_5s_linear_infinite]" : undefined}
        style={{ transition: "stroke-width .25s ease, stroke .25s ease" }}
      />
    </g>
  );
}

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

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="An architecture scene: a client application on the left sends a request envelope carrying a method, endpoint, headers and body into a central API boundary. The boundary checks authentication, validates the request and routes it to a service on the right, which reads a database and calls another internal service. A response envelope with a status code returns through the same boundary to the client."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 780 }}
    >
      <defs>
        <linearGradient id={`${uid}-req`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
        <linearGradient id={`${uid}-res`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--cyan)" />
        </linearGradient>
        <linearGradient id={`${uid}-membrane`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.14" />
          <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.09" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.12" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={C_X} y={52} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 08 — ONE CONTRACT, TWO SIDES
        </text>
        <text x={W - 44} y={52} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          CLIENT → API CONTRACT → IMPLEMENTATION
        </text>
        <line x1={C_X} y1={72} x2={W - 44} y2={72} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* implementation zone */}
      <g opacity={op(SERVICE)} style={{ transition: "opacity .3s ease" }}>
        <rect
          x={S_X - 44}
          y={B_Y}
          width={S_W + 88}
          height={B_H}
          rx={34}
          fill="color-mix(in oklab, var(--primary) 3.5%, transparent)"
          stroke="color-mix(in oklab, var(--primary) 20%, transparent)"
        />
        <text x={S_X - 12} y={B_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          IMPLEMENTATION — HIDDEN FROM THE CALLER
        </text>
      </g>

      {/* flows */}
      <Flow id={P_REQ} d={pReq} on={lit(P_REQ) && hover !== null} op={op(P_REQ)} color={`url(#${uid}-req)`} />
      <Flow id={P_IN} d={pIn} on={lit(P_IN) && hover !== null} op={op(P_IN)} color={`url(#${uid}-req)`} />
      <Flow id={P_BACK} d={pBack} on={lit(P_BACK) && hover !== null} op={op(P_BACK)} color={`url(#${uid}-res)`} />
      <Flow id={P_OUT} d={pOut} on={lit(P_OUT) && hover !== null} op={op(P_OUT)} color={`url(#${uid}-res)`} />
      <Flow id={P_DB} d={pDb} on={lit(P_DB) && hover !== null} op={op(P_DB)} color="var(--violet)" dashed />
      <Flow id={P_OTHER} d={pOther} on={lit(P_OTHER) && hover !== null} op={op(P_OTHER)} color="var(--violet)" dashed />

      <g opacity={op(P_REQ)}>
        <Envelope path={pReq} dur="4.2s" begin="0s" color="var(--primary)" />
      </g>
      <g opacity={op(P_IN)}>
        <Envelope path={pIn} dur="3.4s" begin="1.4s" color="var(--primary)" />
      </g>
      <g opacity={op(P_BACK)}>
        <Envelope path={pBack} dur="3.4s" begin="0.6s" color="var(--cyan)" reverse />
      </g>
      <g opacity={op(P_OUT)}>
        <Envelope path={pOut} dur="4.2s" begin="2.1s" color="var(--cyan)" reverse />
      </g>

      {/* flow labels */}
      <g aria-hidden="true" opacity={op(P_REQ)}>
        <text x={C_X + C_W + 40} y={CLIENT_Y + 4} fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
          REQUEST
        </text>
      </g>
      <g aria-hidden="true" opacity={op(P_OUT)}>
        <text x={C_X + C_W + 40} y={RECV_Y + RECV_H / 2 + 40} fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
          RESPONSE
        </text>
      </g>

      {/* ---------------------------- client column --------------------------- */}
      <g aria-hidden="true" opacity={op(CLIENT)} style={{ transition: "opacity .3s ease" }}>
        <text x={C_X} y={116} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          CALLER
        </text>
      </g>

      <g
        {...interactive(CLIENT, "Client application — the caller")}
        opacity={op(CLIENT)}
      >
        <rect
          x={C_X}
          y={CLIENT_Y}
          width={C_W}
          height={CLIENT_H}
          rx={26}
          fill={on(CLIENT) ? "color-mix(in oklab, var(--primary) 7%, var(--surface))" : "var(--surface)"}
          stroke={on(CLIENT) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(CLIENT) ? 2 : 1.2}
          filter={`url(#${uid}-lift)`}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <circle cx={C_X + 44} cy={CLIENT_Y + CLIENT_H / 2} r={13} fill="none" stroke="var(--violet)" strokeWidth={1.9} />
        <circle cx={C_X + 44} cy={CLIENT_Y + CLIENT_H / 2} r={4.4} fill="var(--violet)" />
        <text x={C_X + 74} y={CLIENT_Y + 54} fontSize={21} fontWeight={780} fill="var(--foreground)">
          Client app
        </text>
        <text x={C_X + 74} y={CLIENT_Y + 80} fontSize={13.5} fill="var(--muted-foreground)">
          Mobile · web · another service
        </text>
      </g>

      {/* request envelope card */}
      <g {...interactive(REQ, "Request: method, endpoint, headers and body")} opacity={op(REQ)}>
        <rect
          x={C_X}
          y={REQ_Y}
          width={C_W}
          height={REQ_H}
          rx={24}
          fill={on(REQ) ? "color-mix(in oklab, var(--primary) 6%, var(--surface))" : "var(--surface)"}
          stroke={on(REQ) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border)"}
          strokeWidth={on(REQ) ? 1.9 : 1.1}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <path
          d={`M ${C_X + 1} ${REQ_Y + 30} L ${C_X + C_W / 2} ${REQ_Y + 70} L ${C_X + C_W - 1} ${REQ_Y + 30}`}
          fill="none"
          stroke="color-mix(in oklab, var(--primary) 32%, transparent)"
          strokeWidth={1.4}
        />
        <text x={C_X + 24} y={REQ_Y + 100} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          REQUEST ENVELOPE
        </text>
        <text x={C_X + 24} y={REQ_Y + 132} fontSize={18} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--primary)">
          GET /users/42
        </text>
        <text x={C_X + 24} y={REQ_Y + 160} fontSize={13} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
          Authorization: Bearer …
        </text>
        <text x={C_X + 24} y={REQ_Y + 182} fontSize={13} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
          Accept: application/json
        </text>
        <text x={C_X + 24} y={REQ_Y + 204} fontSize={13} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
          body: — (POST /orders sends one)
        </text>
      </g>

      {/* response received card */}
      <g {...interactive(RECEIVED, "Response received by the client, 200 OK")} opacity={op(RECEIVED)}>
        <rect
          x={C_X}
          y={RECV_Y}
          width={C_W}
          height={RECV_H}
          rx={24}
          fill={on(RECEIVED) ? "color-mix(in oklab, var(--cyan) 8%, var(--surface))" : "var(--surface)"}
          stroke={on(RECEIVED) ? "color-mix(in oklab, var(--cyan) 60%, transparent)" : "var(--border)"}
          strokeWidth={on(RECEIVED) ? 1.9 : 1.1}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={C_X + 24} y={RECV_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          RESPONSE ENVELOPE
        </text>
        <rect
          x={C_X + 24}
          y={RECV_Y + 50}
          width={104}
          height={32}
          rx={16}
          fill="color-mix(in oklab, var(--cyan) 12%, transparent)"
          stroke="color-mix(in oklab, var(--cyan) 45%, transparent)"
        />
        <text x={C_X + 76} y={RECV_Y + 71} textAnchor="middle" fontSize={13} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--foreground)">
          200 OK
        </text>
        <text x={C_X + 24} y={RECV_Y + 108} fontSize={13} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
          {"{ \"id\": 42, \"name\": \"Ada\" }"}
        </text>
        <text x={C_X + 24} y={RECV_Y + 134} fontSize={12.5} fill="var(--muted-foreground)">
          Shape agreed in advance
        </text>
      </g>

      {/* --------------------------- API membrane ---------------------------- */}
      <g {...interactive(CONTRACT, "The API contract — the boundary between caller and implementation")} opacity={op(CONTRACT)}>
        <rect
          x={B_X}
          y={B_Y}
          width={B_W}
          height={B_H}
          rx={38}
          fill={`url(#${uid}-membrane)`}
          stroke={
            on(CONTRACT)
              ? "color-mix(in oklab, var(--cyan) 65%, transparent)"
              : "color-mix(in oklab, var(--cyan) 34%, transparent)"
          }
          strokeWidth={on(CONTRACT) ? 2.2 : 1.5}
          style={{ transition: "stroke .3s ease" }}
        />
        <rect
          x={B_X + 10}
          y={B_Y + 10}
          width={B_W - 20}
          height={B_H - 20}
          rx={30}
          fill="none"
          stroke="color-mix(in oklab, var(--primary) 22%, transparent)"
          strokeDasharray="9 10"
          className="motion-safe:animate-[dash-travel_18s_linear_infinite]"
        />
        <text x={B_X + 34} y={B_Y + 48} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          API CONTRACT
        </text>
        <text x={B_X + B_W - 34} y={B_Y + 48} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.12em" fill="var(--muted-foreground)">
          THE INTERFACE
        </text>
        <text
          x={B_X + B_W / 2}
          y={B_Y + B_H - 30}
          textAnchor="middle"
          fontSize={13}
          fill="var(--muted-foreground)"
        >
          Clients depend on this, not on what is behind it
        </text>
      </g>

      {rows.map((r, i) => (
        <g key={r.id} {...interactive(r.id, `${r.kicker.split("· ")[1]}: ${r.label}`)} opacity={op(r.id)}>
          <rect
            x={R_X}
            y={rowY(i)}
            width={R_W}
            height={R_H}
            rx={22}
            fill={on(r.id) ? "color-mix(in oklab, var(--primary) 8%, var(--surface))" : "var(--surface)"}
            stroke={on(r.id) ? "color-mix(in oklab, var(--primary) 58%, transparent)" : "var(--border)"}
            strokeWidth={on(r.id) ? 1.9 : 1.1}
            filter={on(r.id) ? `url(#${uid}-lift)` : undefined}
            style={{
              transition: "fill .3s ease, stroke .3s ease",
              animation: `fade-rise .7s cubic-bezier(.22,1,.36,1) ${i * 70}ms both`,
            }}
          />
          <rect
            x={R_X}
            y={rowY(i) + 22}
            width={3}
            height={R_H - 44}
            rx={2}
            fill={r.id === RESP ? "var(--cyan)" : "var(--primary)"}
            opacity={on(r.id) ? 0.9 : 0.5}
          />
          <text x={R_X + 24} y={rowY(i) + 30} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
            {r.kicker}
          </text>
          <text
            x={R_X + 24}
            y={rowY(i) + 60}
            fontSize={18.5}
            fontWeight={740}
            fontFamily={r.id === ENDPOINT ? "var(--font-mono)" : undefined}
            fill="var(--foreground)"
          >
            {r.label}
          </text>
          <text x={R_X + 24} y={rowY(i) + 84} fontSize={13} fill="var(--muted-foreground)">
            {r.sub}
          </text>
        </g>
      ))}

      {/* --------------------------- implementation --------------------------- */}
      <g {...interactive(SERVICE, "User service — business logic behind the API")} opacity={op(SERVICE)}>
        <rect
          x={S_X}
          y={SV_Y}
          width={S_W}
          height={SV_H}
          rx={26}
          fill={on(SERVICE) ? "color-mix(in oklab, var(--primary) 8%, var(--surface))" : "var(--surface)"}
          stroke={on(SERVICE) ? "color-mix(in oklab, var(--primary) 58%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(SERVICE) ? 2 : 1.2}
          filter={`url(#${uid}-lift)`}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <rect x={S_X + 26} y={SV_Y + 24} width={S_W - 52} height={3} rx={2} fill="var(--primary)" opacity={0.75} />
        <text x={S_X + 26} y={SV_Y + 68} fontSize={21} fontWeight={780} fill="var(--foreground)">
          User service
        </text>
        <text x={S_X + 26} y={SV_Y + 96} fontSize={13.5} fill="var(--muted-foreground)">
          Applies the rules and decides the answer
        </text>
      </g>

      <g {...interactive(DB, "Database read and written by the service")} opacity={op(DB)}>
        <rect
          x={S_X}
          y={DB_Y}
          width={S_W}
          height={DB_H}
          rx={26}
          fill={on(DB) ? "color-mix(in oklab, var(--violet) 8%, var(--surface))" : "var(--surface)"}
          stroke={on(DB) ? "color-mix(in oklab, var(--violet) 55%, transparent)" : "var(--border)"}
          strokeWidth={on(DB) ? 1.9 : 1.1}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <g transform={`translate(${S_X + 30} ${DB_Y + 34})`}>
          <ellipse cx="16" cy="9" rx="12" ry="4.6" fill="none" stroke="var(--violet)" strokeWidth={1.7} />
          <path d="M4 9v22c0 2.6 5.4 4.6 12 4.6s12-2 12-4.6V9" fill="none" stroke="var(--violet)" strokeWidth={1.7} />
          <path d="M4 20c0 2.6 5.4 4.6 12 4.6s12-2 12-4.6" fill="none" stroke="var(--violet)" strokeWidth={1.7} />
        </g>
        <text x={S_X + 88} y={DB_Y + 60} fontSize={20} fontWeight={760} fill="var(--foreground)">
          Database
        </text>
        <text x={S_X + 88} y={DB_Y + 86} fontSize={13.5} fill="var(--muted-foreground)">
          users table · never called directly
        </text>
      </g>

      <g {...interactive(OTHER, "Another internal service called during the request")} opacity={op(OTHER)}>
        <rect
          x={S_X}
          y={OT_Y}
          width={S_W}
          height={OT_H}
          rx={24}
          fill={on(OTHER) ? "color-mix(in oklab, var(--violet) 7%, var(--surface))" : "var(--surface)"}
          stroke={on(OTHER) ? "color-mix(in oklab, var(--violet) 50%, transparent)" : "var(--border)"}
          strokeWidth={on(OTHER) ? 1.9 : 1.1}
          strokeDasharray={on(OTHER) ? undefined : "1 0"}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={S_X + 26} y={OT_Y + 46} fontSize={19} fontWeight={740} fill="var(--foreground)">
          Billing service
        </text>
        <text x={S_X + 26} y={OT_Y + 74} fontSize={13.5} fill="var(--muted-foreground)">
          An internal call the client never sees
        </text>
      </g>

      {/* stability note */}
      <g aria-hidden="true" opacity={op(CONTRACT)}>
        <text
          x={S_X - 12}
          y={B_Y + B_H - 30}
          fontSize={12.5}
          fill="var(--muted-foreground)"
        >
          Rewrite the service, swap the database — the contract still holds
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
  const Step = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 pl-6" aria-hidden="true">
      <span className="h-6 w-px bg-border-strong" />
      <span className="text-[11.5px] text-muted-foreground">{text}</span>
    </div>
  );

  return (
    <div className="space-y-3 px-4 py-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">CALLER</p>

      <button
        type="button"
        onClick={() => onToggle(CLIENT)}
        aria-expanded={activeKey === CLIENT}
        className="w-full rounded-3xl border border-border bg-surface px-4 py-4 text-left shadow-soft"
      >
        <span className="block text-[18px] font-extrabold">Client app</span>
        <span className="block text-[13px] text-muted-foreground">Mobile · web · another service</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(REQ)}
        aria-expanded={activeKey === REQ}
        className="w-full rounded-3xl border border-primary/35 bg-surface px-4 py-4 text-left"
      >
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
          REQUEST ENVELOPE
        </span>
        <span className="mt-1 block font-mono text-[16px] font-bold text-primary">GET /users/42</span>
        <span className="mt-1.5 block font-mono text-[12px] leading-relaxed text-muted-foreground">
          Authorization: Bearer …
          <br />
          Accept: application/json
        </span>
      </button>

      <Step text="crosses the boundary" />

      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">API CONTRACT</p>

      <div className="space-y-2 rounded-3xl border border-cyan/40 bg-surface-tint p-3">
        {rows.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onToggle(r.id)}
            aria-expanded={activeKey === r.id}
            className="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-left"
          >
            <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground">
              {r.kicker}
            </span>
            <span
              className={`mt-1 block text-[15.5px] font-bold ${r.id === ENDPOINT ? "font-mono" : ""}`}
            >
              {r.label}
            </span>
            <span className="block text-[12.5px] text-muted-foreground">{r.sub}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => onToggle(CONTRACT)}
          aria-expanded={activeKey === CONTRACT}
          className="w-full rounded-2xl border border-dashed border-primary/40 px-3.5 py-3 text-left"
        >
          <span className="block text-[13.5px] font-semibold">Why the boundary matters</span>
          <span className="block text-[12.5px] text-muted-foreground">
            Clients depend on the interface, not the implementation.
          </span>
        </button>
      </div>

      <Step text="routed to the implementation" />

      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
        IMPLEMENTATION — HIDDEN
      </p>

      <button
        type="button"
        onClick={() => onToggle(SERVICE)}
        aria-expanded={activeKey === SERVICE}
        className="w-full rounded-3xl border border-border bg-surface px-4 py-4 text-left shadow-soft"
      >
        <span className="block text-[17px] font-extrabold">User service</span>
        <span className="block text-[13px] text-muted-foreground">
          Applies the rules and decides the answer
        </span>
      </button>

      <div className="grid gap-2">
        <button
          type="button"
          onClick={() => onToggle(DB)}
          aria-expanded={activeKey === DB}
          className="w-full rounded-2xl border border-violet/35 bg-surface px-4 py-3.5 text-left"
        >
          <span className="block text-[15.5px] font-bold">Database</span>
          <span className="block text-[12.5px] text-muted-foreground">
            users table · never called directly
          </span>
        </button>
        <button
          type="button"
          onClick={() => onToggle(OTHER)}
          aria-expanded={activeKey === OTHER}
          className="w-full rounded-2xl border border-violet/25 bg-surface px-4 py-3.5 text-left"
        >
          <span className="block text-[15.5px] font-bold">Billing service</span>
          <span className="block text-[12.5px] text-muted-foreground">
            An internal call the client never sees
          </span>
        </button>
      </div>

      <Step text="answer returns through the same contract" />

      <button
        type="button"
        onClick={() => onToggle(RECEIVED)}
        aria-expanded={activeKey === RECEIVED}
        className="w-full rounded-3xl border border-cyan/45 bg-surface px-4 py-4 text-left"
      >
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
          RESPONSE ENVELOPE
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {["200 OK", "401 Unauthorized", "404 Not Found"].map((s, i) => (
            <span
              key={s}
              className="rounded-full border px-2.5 py-1 font-mono text-[11px]"
              style={{
                borderColor:
                  i === 0
                    ? "color-mix(in oklab, var(--cyan) 45%, transparent)"
                    : "var(--border)",
                color: i === 0 ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {s}
            </span>
          ))}
        </span>
        <span className="mt-2 block font-mono text-[12.5px] text-muted-foreground">
          {"{ \"id\": 42, \"name\": \"Ada\" }"}
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function ApiDiagram() {
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
              Interfaces · request and response
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Request path", color: "var(--primary)" },
              { label: "Response path", color: "var(--cyan)" },
              { label: "Internal calls", color: "var(--violet)" },
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
        A request crosses the API boundary as a method, path, headers and body; the answer returns as
        a status code and a structured body. Everything to the right of the boundary can change
        without breaking the caller.
      </figcaption>
      <StageHint text="Hover a component to isolate its path; click the client, the request, any contract step, the service, the database or the response for a short explanation." />
    </figure>
  );
}
