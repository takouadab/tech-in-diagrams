import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const CLIENT = "client";
const NET = "net";
const PORT = "port";
const QUEUE = "queue";
const APP = "app";
const HW = "hw";
const DATA = "data";
const RES = "res";
const FORM = "form";
const DOWN = "down";

const related: Record<string, string[]> = {
  [CLIENT]: [NET, PORT, RES, DOWN],
  [NET]: [CLIENT, PORT, RES],
  [PORT]: [NET, QUEUE, CLIENT, HW],
  [QUEUE]: [PORT, APP, HW],
  [APP]: [QUEUE, DATA, RES, HW],
  [HW]: [PORT, QUEUE, APP],
  [DATA]: [APP],
  [RES]: [APP, CLIENT, NET],
  [FORM]: [HW],
  [DOWN]: [CLIENT, PORT],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1660;
const H = 990;

/* clients */
const CL_X = 40;
const CL_W = 224;
const clients = [
  { id: "browser", y: 200, h: 140, name: "Browser", sub: "GET /orders" },
  { id: "mobile", y: 372, h: 130, name: "Mobile app", sub: "POST /orders" },
  { id: "service", y: 534, h: 140, name: "Another service", sub: "Machine-to-machine" },
] as const;

/* network */
const N_X = 316;
const N_Y = 300;
const N_W = 150;
const N_H = 260;

/* server chassis */
const SV_X = 520;
const SV_Y = 132;
const SV_W = 800;
const SV_H = 660;

/* server software */
const SVC_X = 548;
const SVC_Y = 196;
const SVC_W = 744;
const SVC_H = 390;

const ROW_Y = 282;
const ROW_H = 168;
const P_X = 572;
const Q_X = 812;
const A_X = 1052;
const CARD_W = 216;

/* hardware */
const HW_X = 548;
const HW_Y = 616;
const HW_W = 744;
const HW_H = 150;

const resources = [
  { label: "CPU", sub: "8 vCPU" },
  { label: "Memory", sub: "32 GB RAM" },
  { label: "Storage", sub: "Local disk" },
  { label: "Network", sub: "1 Gbps NIC" },
] as const;

/* data + down */
const D_X = 1372;
const D_W = 248;
const D_Y = 282;
const D_H = 170;
const DN_Y = 520;
const DN_H = 168;

/* form factor rail */
const FF_Y = 886;
const FF_H = 74;
const forms = [
  { label: "Physical machine", sub: "Rack hardware" },
  { label: "Virtual machine", sub: "Shared host" },
  { label: "Container", sub: "Shared kernel" },
  { label: "Cloud instance", sub: "Rented capacity" },
] as const;

/* paths */
const pIn = [
  `M ${CL_X + CL_W} 270 C 292 270, 296 360, ${N_X} 360`,
  `M ${CL_X + CL_W} 437 L ${N_X} 437`,
  `M ${CL_X + CL_W} 604 C 292 604, 296 500, ${N_X} 500`,
] as const;
const pNet = `M ${N_X + N_W} 400 C 510 400, 520 340, ${P_X} 340`;
const pPQ = `M ${P_X + CARD_W} 366 L ${Q_X} 366`;
const pQA = `M ${Q_X + CARD_W} 366 L ${A_X} 366`;
const pData = `M ${A_X + CARD_W} 352 L ${D_X} 352`;
const pDataBack = `M ${D_X} 392 L ${A_X + CARD_W} 392`;
const pRes = `M 1160 ${SV_Y + SV_H} C 1160 842, 800 842, 320 842 C 176 842, 152 800, 152 ${674}`;

/* --------------------------------- copy ---------------------------------- */

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case CLIENT:
      return {
        eyebrow: "Clients",
        title: "Whoever asks for the service",
        body: "A browser, a mobile app or another program can all be clients. They know the server's address and the port its service listens on, they send a request, and they wait for the answer. Nothing about a client requires a human to be watching.",
      };
    case NET:
      return {
        eyebrow: "Network",
        title: "How the request reaches the server",
        body: "The request is addressed to a host and a port number, then carried across the network. The server does not choose who arrives — it simply keeps listening, and anything that reaches its open port is handed to the service.",
      };
    case PORT:
      return {
        eyebrow: "Listening service",
        title: "The part that makes it a server",
        body: "Server software binds to a port and waits. That listening loop is the whole definition of the role: a process that accepts an incoming connection and takes responsibility for answering it. Stop the process and the machine is just a computer.",
      };
    case QUEUE:
      return {
        eyebrow: "Concurrency",
        title: "Several requests in flight at once",
        body: "Accepted requests go into a short queue and are picked up by workers — threads, processes or async tasks. A handful can be processed at the same time, which is why one server can serve many clients without them taking turns one by one.",
      };
    case APP:
      return {
        eyebrow: "Application logic",
        title: "The work the service actually does",
        body: "This is the code that understands the request: it validates the input, applies the rules, decides what should happen, and builds a response. Everything around it — the port, the queue, the hardware — exists so this step can run.",
      };
    case HW:
      return {
        eyebrow: "Server hardware",
        title: "The machine underneath the service",
        body: "CPU, memory, storage and a network interface are what the software runs on. The hardware provides capacity; it does not serve anyone by itself. Hardware and server software are two different things that people often call by the same word.",
      };
    case DATA:
      return {
        eyebrow: "Data dependency",
        title: "Reading and writing state",
        body: "Most requests need stored state, so the application calls a database or file storage, waits for the result, and folds it into the response. The data usually lives outside the process, so it survives a restart of the server software.",
      };
    case RES:
      return {
        eyebrow: "Response",
        title: "Back to the client that asked",
        body: "The answer travels back over the same connection to the client that opened it — not to every client. Once the response is sent, the server is free to work on the next request; it does not keep serving that client until asked again.",
      };
    case FORM:
      return {
        eyebrow: "Form factor",
        title: "A server is a role, not a size",
        body: "The same listening service can run on a rack machine, a virtual machine, a container or a rented cloud instance. These are different ways of providing the machine, not different kinds of server — the role is unchanged.",
      };
    case DOWN:
      return {
        eyebrow: "Unavailable",
        title: "If the service stops, clients get nothing",
        body: "When the process is not listening — crashed, stopped or unreachable — requests fail with no response. That is the plain consequence of depending on one server for a service; how teams avoid it is a separate topic.",
      };
    default:
      return null;
  }
}

/* -------------------------------- helpers -------------------------------- */

function Token({ path, dur, begin, color, faint }: { path: string; dur: string; begin: string; color: string; faint?: boolean }) {
  return (
    <g opacity={faint ? 0.4 : 1}>
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
      aria-label="A cutaway of a server. On the left, a browser, a mobile app and another service send requests across a network to one machine. Inside the server chassis, the server software is shown as a listening port, a short request queue worked by several workers, and the application logic. Beneath it a separate hardware layer provides CPU, memory, storage and a network interface. On the right the application reads and writes a database, and a restrained card notes that if the service stops listening, clients get no response. A response path loops back underneath to the client that asked, and a bottom rail shows the same server role running on a physical machine, a virtual machine, a container or a cloud instance."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 880 }}
    >
      <defs>
        <linearGradient id={`${uid}-chassis`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.11" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id={`${uid}-svc`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.04" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={CL_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 04 — INSIDE THE MACHINE THAT ANSWERS
        </text>
        <text x={W - 44} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          LISTEN · PROCESS · ANSWER
        </text>
        <line x1={CL_X} y1={52} x2={W - 44} y2={52} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* ------------------------------- clients ------------------------------ */}
      <g opacity={op(CLIENT)}>
        <text x={CL_X} y={168} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)" aria-hidden="true">
          CLIENTS
        </text>
        {clients.map((c) => (
          <g key={c.id} {...interactive(CLIENT, `${c.name} — a client asking the server for a service`)}>
            {card(CLIENT, CL_X, c.y, CL_W, c.h, "var(--cyan)", 22)}
            <text x={CL_X + 24} y={c.y + 52} fontSize={18.5} fontWeight={760} fill="var(--foreground)">
              {c.name}
            </text>
            <text x={CL_X + 24} y={c.y + 82} fontSize={13} fontFamily="var(--font-mono)" fill="var(--cyan)">
              {c.sub}
            </text>
            <text x={CL_X + 24} y={c.y + 110} fontSize={12.5} fill="var(--muted-foreground)">
              Sends a request, waits
            </text>
          </g>
        ))}
      </g>

      {/* request paths into the network */}
      <g opacity={op(NET)}>
        {pIn.map((d, i) => (
          <Flow key={d} d={d} on={on(NET) || on(CLIENT)} color="var(--cyan)" />
        ))}
        <Token path={pIn[0]!} dur="1.6s" begin="0s" color="var(--cyan)" />
        <Token path={pIn[1]!} dur="1.6s" begin="0.5s" color="var(--cyan)" faint />
        <Token path={pIn[2]!} dur="1.6s" begin="1s" color="var(--cyan)" faint />
      </g>

      <g {...interactive(NET, "Network — carries the request to the server address and port")} opacity={op(NET)}>
        {card(NET, N_X, N_Y, N_W, N_H, "var(--cyan)", 24)}
        <text x={N_X + N_W / 2} y={N_Y + 46} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          NETWORK
        </text>
        <text x={N_X + N_W / 2} y={N_Y + 96} textAnchor="middle" fontSize={18} fontWeight={760} fill="var(--foreground)">
          Addressed
        </text>
        <text x={N_X + N_W / 2} y={N_Y + 122} textAnchor="middle" fontSize={18} fontWeight={760} fill="var(--foreground)">
          to a port
        </text>
        <text x={N_X + N_W / 2} y={N_Y + 166} textAnchor="middle" fontSize={13} fontFamily="var(--font-mono)" fill="var(--cyan)">
          host:443
        </text>
        <text x={N_X + N_W / 2} y={N_Y + 212} textAnchor="middle" fontSize={12.5} fill="var(--muted-foreground)">
          Many clients,
        </text>
        <text x={N_X + N_W / 2} y={N_Y + 232} textAnchor="middle" fontSize={12.5} fill="var(--muted-foreground)">
          one address
        </text>
      </g>

      <g opacity={op(PORT)}>
        <Flow d={pNet} on={on(PORT) || on(NET)} color="var(--cyan)" />
        <Token path={pNet} dur="1.4s" begin="0.3s" color="var(--cyan)" />
      </g>

      {/* ------------------------------- chassis ------------------------------ */}
      <g aria-hidden="true">
        <rect x={SV_X} y={SV_Y} width={SV_W} height={SV_H} rx={34} fill={`url(#${uid}-chassis)`} stroke="color-mix(in oklab, var(--primary) 22%, transparent)" />
        <text x={SV_X + 32} y={SV_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          ONE SERVER — CUTAWAY
        </text>
        <text x={SV_X + SV_W - 32} y={SV_Y + 42} textAnchor="end" fontSize={12.5} fill="var(--muted-foreground)">
          Always listening
        </text>
      </g>

      {/* server software zone */}
      <g aria-hidden="true">
        <rect x={SVC_X} y={SVC_Y} width={SVC_W} height={SVC_H} rx={28} fill={`url(#${uid}-svc)`} stroke="color-mix(in oklab, var(--cyan) 26%, transparent)" />
        <text x={SVC_X + 26} y={SVC_Y + 38} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          SERVER SOFTWARE — THE RUNNING SERVICE
        </text>
      </g>

      {/* listening port */}
      <g {...interactive(PORT, "Listening port and service — the process that accepts requests")} opacity={op(PORT)}>
        <rect
          x={P_X}
          y={ROW_Y}
          width={CARD_W}
          height={ROW_H}
          rx={22}
          fill={on(PORT) ? "color-mix(in oklab, var(--cyan) 9%, var(--surface))" : "var(--surface)"}
          stroke={on(PORT) ? "color-mix(in oklab, var(--cyan) 55%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(PORT) ? 2 : 1.2}
          filter={`url(#${uid}-lift)`}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={P_X + 24} y={ROW_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          INGRESS
        </text>
        <text x={P_X + 24} y={ROW_Y + 72} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Listening port
        </text>
        <rect x={P_X + 24} y={ROW_Y + 90} width={104} height={32} rx={11} fill="color-mix(in oklab, var(--cyan) 12%, var(--surface))" stroke="color-mix(in oklab, var(--cyan) 45%, transparent)" />
        <text x={P_X + 76} y={ROW_Y + 112} textAnchor="middle" fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--cyan)">
          :443 OPEN
        </text>
        <text x={P_X + 24} y={ROW_Y + 146} fontSize={12.5} fill="var(--muted-foreground)">
          Accepts the connection
        </text>
      </g>

      <g opacity={op(QUEUE)}>
        <Flow d={pPQ} on={on(QUEUE) || on(PORT)} color="var(--primary)" />
        <Token path={pPQ} dur="1.1s" begin="0.6s" color="var(--primary)" />
      </g>

      {/* queue + workers */}
      <g {...interactive(QUEUE, "Request queue and workers — several requests handled at once")} opacity={op(QUEUE)}>
        {card(QUEUE, Q_X, ROW_Y, CARD_W, ROW_H, "var(--primary)", 22)}
        <text x={Q_X + 24} y={ROW_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          CONCURRENCY
        </text>
        <text x={Q_X + 24} y={ROW_Y + 70} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Queue · workers
        </text>
        <g aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={Q_X + 24 + i * 30}
              y={ROW_Y + 88}
              width={22}
              height={26}
              rx={7}
              fill={i < 3 ? "color-mix(in oklab, var(--primary) 16%, var(--surface))" : "var(--surface)"}
              stroke="color-mix(in oklab, var(--primary) 40%, transparent)"
            />
          ))}
        </g>
        <text x={Q_X + 24} y={ROW_Y + 146} fontSize={12.5} fill="var(--muted-foreground)">
          3 in flight, 1 waiting
        </text>
      </g>

      <g opacity={op(APP)}>
        <Flow d={pQA} on={on(APP) || on(QUEUE)} color="var(--primary)" />
        <Token path={pQA} dur="1.1s" begin="0.9s" color="var(--primary)" />
      </g>

      {/* application logic */}
      <g {...interactive(APP, "Application logic — the work the service performs")} opacity={op(APP)}>
        {card(APP, A_X, ROW_Y, CARD_W, ROW_H, "var(--violet)", 22)}
        <text x={A_X + 24} y={ROW_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          PROCESSING
        </text>
        <text x={A_X + 24} y={ROW_Y + 72} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Application
        </text>
        <text x={A_X + 24} y={ROW_Y + 98} fontSize={19} fontWeight={780} fill="var(--foreground)">
          logic
        </text>
        <text x={A_X + 24} y={ROW_Y + 130} fontSize={12.5} fill="var(--muted-foreground)">
          Validates, decides,
        </text>
        <text x={A_X + 24} y={ROW_Y + 150} fontSize={12.5} fill="var(--muted-foreground)">
          builds the response
        </text>
      </g>

      <text x={SVC_X + 26} y={SVC_Y + 300} fontSize={13} fill="var(--muted-foreground)" aria-hidden="true">
        The service is the software that listens and answers — the same code could run on any of the machines below.
      </text>
      <text x={SVC_X + 26} y={SVC_Y + 328} fontSize={13} fill="var(--muted-foreground)" aria-hidden="true">
        Nothing here depends on how large or small that machine happens to be.
      </text>

      {/* ------------------------------ hardware ------------------------------ */}
      <g {...interactive(HW, "Server hardware — CPU, memory, storage and network interface")} opacity={op(HW)}>
        {card(HW, HW_X, HW_Y, HW_W, HW_H, "var(--primary)", 26)}
        <text x={HW_X + 26} y={HW_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          SERVER HARDWARE — CAPACITY, NOT THE ROLE
        </text>
        {resources.map((r, i) => (
          <g key={r.label} aria-hidden="true">
            <rect
              x={HW_X + 24 + i * 180}
              y={HW_Y + 56}
              width={168}
              height={68}
              rx={16}
              fill="color-mix(in oklab, var(--primary) 6%, transparent)"
              stroke="color-mix(in oklab, var(--primary) 28%, transparent)"
            />
            <text x={HW_X + 44 + i * 180} y={HW_Y + 84} fontSize={15.5} fontWeight={720} fill="var(--foreground)">
              {r.label}
            </text>
            <text x={HW_X + 44 + i * 180} y={HW_Y + 108} fontSize={12.5} fill="var(--muted-foreground)">
              {r.sub}
            </text>
          </g>
        ))}
      </g>

      {/* -------------------------------- data -------------------------------- */}
      <g opacity={op(DATA)}>
        <Flow d={pData} on={on(DATA) || on(APP)} color="var(--violet)" />
        <Flow d={pDataBack} on={on(DATA) || on(APP)} color="var(--violet)" dashed />
        <Token path={pData} dur="1.3s" begin="1.2s" color="var(--violet)" />
      </g>

      <g {...interactive(DATA, "Database or storage — the state the server reads and writes")} opacity={op(DATA)}>
        {card(DATA, D_X, D_Y, D_W, D_H, "var(--violet)", 22)}
        <g aria-hidden="true" transform={`translate(${D_X + 24} ${D_Y + 28})`}>
          <ellipse cx={17} cy={9} rx={17} ry={6} fill="none" stroke="var(--violet)" strokeWidth={1.6} />
          <path d="M0 9v30c0 3.5 7.6 6 17 6s17-2.5 17-6V9" fill="none" stroke="var(--violet)" strokeWidth={1.6} />
          <path d="M0 24c0 3.5 7.6 6 17 6s17-2.5 17-6" fill="none" stroke="var(--violet)" strokeWidth={1.6} />
        </g>
        <text x={D_X + 80} y={D_Y + 52} fontSize={18.5} fontWeight={760} fill="var(--foreground)">
          Data store
        </text>
        <text x={D_X + 24} y={D_Y + 104} fontSize={13} fill="var(--muted-foreground)">
          Read and write the state
        </text>
        <text x={D_X + 24} y={D_Y + 126} fontSize={13} fill="var(--muted-foreground)">
          the response is built from
        </text>
        <text x={D_X + 24} y={D_Y + 150} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--violet)">
          SELECT · INSERT
        </text>
      </g>

      {/* ------------------------------ down state ---------------------------- */}
      <g {...interactive(DOWN, "If the server is down, clients get no response")} opacity={op(DOWN)}>
        {card(DOWN, D_X, DN_Y, D_W, DN_H, "var(--ember)", 22)}
        <text x={D_X + 24} y={DN_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--ember)">
          IF IT STOPS LISTENING
        </text>
        <text x={D_X + 24} y={DN_Y + 70} fontSize={17.5} fontWeight={760} fill="var(--foreground)">
          Service unavailable
        </text>
        <text x={D_X + 24} y={DN_Y + 100} fontSize={12.5} fill="var(--muted-foreground)">
          No process on the port means
        </text>
        <text x={D_X + 24} y={DN_Y + 120} fontSize={12.5} fill="var(--muted-foreground)">
          the request simply fails.
        </text>
        <text x={D_X + 24} y={DN_Y + 148} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--ember)">
          no response
        </text>
      </g>

      {/* ------------------------------- response ----------------------------- */}
      <g opacity={op(RES)}>
        <Flow d={pRes} on={on(RES) || on(APP) || on(CLIENT)} color="var(--cyan)" />
        <Token path={pRes} dur="2.6s" begin="1.6s" color="var(--cyan)" />
        <g {...interactive(RES, "Response — returned to the client that made the request")}>
          {card(RES, 300, 690, 196, 78, "var(--cyan)", 20)}
          <text x={322} y={722} fontSize={16.5} fontWeight={740} fill="var(--foreground)">
            Response
          </text>
          <text x={322} y={748} fontSize={12.5} fill="var(--muted-foreground)">
            back to the same client
          </text>
        </g>
      </g>

      {/* ----------------------------- form factors --------------------------- */}
      <g opacity={op(FORM)}>
        <text x={SV_X} y={FF_Y - 16} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)" aria-hidden="true">
          THE SAME SERVER ROLE CAN RUN ON…
        </text>
        {forms.map((f, i) => (
          <g key={f.label} {...interactive(FORM, `${f.label} — one way of providing the machine for the same server role`)}>
            {card(FORM, SV_X + i * 200, FF_Y, 188, FF_H, "var(--cyan)", 20)}
            <text x={SV_X + 20 + i * 200} y={FF_Y + 32} fontSize={15.5} fontWeight={720} fill="var(--foreground)">
              {f.label}
            </text>
            <text x={SV_X + 20 + i * 200} y={FF_Y + 56} fontSize={12.5} fill="var(--muted-foreground)">
              {f.sub}
            </text>
          </g>
        ))}
        <text x={CL_X} y={FF_Y + 46} fontSize={13} fill="var(--muted-foreground)" aria-hidden="true">
          A server is defined by
        </text>
        <text x={CL_X} y={FF_Y + 68} fontSize={13} fill="var(--muted-foreground)" aria-hidden="true">
          what it does, not its size.
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
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">CLIENTS</p>

      <button type="button" onClick={() => onToggle(CLIENT)} aria-expanded={activeKey === CLIENT} className={`${btn} border-cyan/40 shadow-soft`}>
        <span className="block text-[17px] font-extrabold">Browser · mobile app · another service</span>
        <span className="mt-1.5 block space-y-1">
          {clients.map((c) => (
            <span key={c.id} className="flex items-center justify-between rounded-xl border border-cyan/25 bg-cyan/5 px-2.5 py-2">
              <span className="text-[13px] font-semibold">{c.name}</span>
              <span className="font-mono text-[11.5px] text-muted-foreground">{c.sub}</span>
            </span>
          ))}
        </span>
        <span className="mt-2 block text-[12.5px] text-muted-foreground">Each sends a request and waits for the answer.</span>
      </button>

      <button type="button" onClick={() => onToggle(NET)} aria-expanded={activeKey === NET} className={`${btn} border-cyan/35`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">NETWORK</span>
        <span className="mt-1 block text-[15.5px] font-bold">Addressed to host:443</span>
        <span className="block text-[12.5px] text-muted-foreground">Many clients reach one address and one open port.</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">INSIDE THE SERVER</p>

      <button type="button" onClick={() => onToggle(PORT)} aria-expanded={activeKey === PORT} className={`${btn} border-cyan/45 bg-cyan/5 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-cyan">:443 OPEN</span>
        <span className="mt-1 block text-[16.5px] font-extrabold">Listening service</span>
        <span className="block text-[12.5px] text-muted-foreground">The process that waits and accepts the connection — this is what makes it a server.</span>
      </button>

      <button type="button" onClick={() => onToggle(QUEUE)} aria-expanded={activeKey === QUEUE} className={`${btn} border-primary/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">CONCURRENCY</span>
        <span className="mt-1 block text-[15.5px] font-bold">Queue · workers</span>
        <span className="block text-[12.5px] text-muted-foreground">Several requests in flight at once — 3 processing, 1 waiting.</span>
      </button>

      <button type="button" onClick={() => onToggle(APP)} aria-expanded={activeKey === APP} className={`${btn} border-violet/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">PROCESSING</span>
        <span className="mt-1 block text-[15.5px] font-bold">Application logic</span>
        <span className="block text-[12.5px] text-muted-foreground">Validates the request, applies the rules, builds the response.</span>
      </button>

      <button type="button" onClick={() => onToggle(DATA)} aria-expanded={activeKey === DATA} className={`${btn} border-violet/35`}>
        <span className="block text-[15.5px] font-bold">Data store</span>
        <span className="block text-[12.5px] text-muted-foreground">Reads and writes the state the answer is built from.</span>
      </button>

      <button type="button" onClick={() => onToggle(RES)} aria-expanded={activeKey === RES} className={`${btn} border-cyan/40 bg-cyan/5`}>
        <span className="block text-[15.5px] font-bold">Response</span>
        <span className="block text-[12.5px] text-muted-foreground">Returned over the same connection to the client that asked.</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">MACHINE VS SERVICE</p>

      <button type="button" onClick={() => onToggle(HW)} aria-expanded={activeKey === HW} className={`${btn} border-primary/35`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">SERVER HARDWARE</span>
        <span className="mt-1.5 block space-y-1">
          {resources.map((r) => (
            <span key={r.label} className="flex items-center justify-between rounded-xl border border-primary/25 bg-primary/5 px-2.5 py-2">
              <span className="text-[13px] font-semibold">{r.label}</span>
              <span className="text-[11.5px] text-muted-foreground">{r.sub}</span>
            </span>
          ))}
        </span>
        <span className="mt-2 block text-[12.5px] text-muted-foreground">Capacity for the software to run on — the hardware serves nobody by itself.</span>
      </button>

      <button type="button" onClick={() => onToggle(FORM)} aria-expanded={activeKey === FORM} className={`${btn} border-cyan/30`}>
        <span className="block text-[15.5px] font-bold">The same role can run on…</span>
        <span className="mt-1.5 block space-y-1">
          {forms.map((f) => (
            <span key={f.label} className="flex items-center justify-between rounded-xl border border-cyan/25 bg-cyan/5 px-2.5 py-2">
              <span className="text-[13px] font-semibold">{f.label}</span>
              <span className="text-[11.5px] text-muted-foreground">{f.sub}</span>
            </span>
          ))}
        </span>
        <span className="mt-2 block text-[12.5px] text-muted-foreground">A server is defined by what it does, not by how large the machine looks.</span>
      </button>

      <button type="button" onClick={() => onToggle(DOWN)} aria-expanded={activeKey === DOWN} className={`${btn} border-ember/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-ember">IF IT STOPS LISTENING</span>
        <span className="mt-1 block text-[15.5px] font-bold">Service unavailable</span>
        <span className="block text-[12.5px] text-muted-foreground">No process on the port means the request simply fails.</span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function ServerDiagram() {
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
              Inside the machine that answers
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Request / response", color: "var(--cyan)" },
              { label: "Processing", color: "var(--primary)" },
              { label: "Data call", color: "var(--violet)" },
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
        The listening service, not the box, is what makes this a server: it accepts a connection,
        works through a short queue of requests, reads or writes data, and answers the client that asked.
      </figcaption>
      <StageHint text="Hover a client, the port, the queue, the hardware layer or the data store to isolate its path; click any component for a short explanation." />
    </figure>
  );
}
