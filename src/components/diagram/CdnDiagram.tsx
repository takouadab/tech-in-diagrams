import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const USER = "user";
const EDGE = "edge";
const CACHE = "cache";
const HIT = "hit";
const MISS = "miss";
const FILL = "fill";
const ORIGIN = "origin";
const STORE = "store";
const EDGES = "edges";
const DIRECT = "direct";
const PURGE = "purge";

const related: Record<string, string[]> = {
  [USER]: [EDGE, HIT, CACHE, DIRECT],
  [EDGE]: [USER, HIT, CACHE, MISS, FILL, ORIGIN],
  [CACHE]: [EDGE, HIT, FILL, PURGE],
  [HIT]: [USER, EDGE, CACHE],
  [MISS]: [EDGE, ORIGIN, STORE, FILL, CACHE],
  [FILL]: [ORIGIN, EDGE, CACHE, MISS],
  [ORIGIN]: [MISS, FILL, STORE, EDGES, DIRECT, PURGE],
  [STORE]: [ORIGIN, MISS, FILL],
  [EDGES]: [ORIGIN, EDGE],
  [DIRECT]: [USER, ORIGIN],
  [PURGE]: [ORIGIN, CACHE, EDGE],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1600;
const H = 940;

/* user */
const U_X = 48;
const U_Y = 300;
const U_W = 210;
const U_H = 170;

/* focal edge */
const E_X = 372;
const E_Y = 196;
const E_W = 452;
const E_H = 520;

const T_X = 396;
const T_Y = 330;
const T_W = 404;
const T_H = 368;
const ROW_Y = [372, 468, 564] as const;
const ROW_H = 84;

/* origin */
const O_X = 1120;
const O_Y = 196;
const O_W = 436;
const O_H = 620;
const OC_X = 1152;
const OC_W = 372;
const OAPP_Y = 262;
const OST_Y = 436;
const OCARD_H = 150;
const PRG_Y = 610;
const PRG_H = 96;

/* satellite edges */
const sats = [
  { x: 856, y: 120, w: 208, h: 96, name: "Edge · Frankfurt", sub: "Same copies, other region" },
  { x: 856, y: 724, w: 208, h: 92, name: "Edge · São Paulo", sub: "Serves its own visitors" },
  { x: 1210, y: 66, w: 200, h: 92, name: "Edge · Singapore", sub: "Fills from the same origin" },
] as const;

/* paths */
const pReq = `M ${U_X + U_W} 356 L ${E_X} 356`;
const pRes = `M ${E_X} 420 L ${U_X + U_W} 420`;
const pMiss = `M ${E_X + E_W} 300 C 960 300, 1040 300, ${O_X} 300`;
const pFill = `M ${O_X} 380 C 1040 380, 960 380, ${E_X + E_W} 380`;
const pDirect = `M ${U_X + U_W / 2} ${U_Y + U_H} L ${U_X + U_W / 2} 866 L 1338 866 L 1338 ${O_Y + O_H}`;
const pSat = [
  `M 960 216 C 1040 240, 1060 274, ${O_X} 300`,
  `M 960 724 C 1040 702, 1060 668, ${O_X} 640`,
  `M 1310 158 L 1310 ${O_Y}`,
] as const;

/* --------------------------------- copy ---------------------------------- */

const cacheItems = [
  { name: "/hero.jpg", size: "240 KB", ttl: "TTL 24h", state: "FRESH" },
  { name: "/app.css", size: "18 KB", ttl: "TTL 1h", state: "FRESH" },
  { name: "/price.json", size: "4 KB", ttl: "TTL 60s", state: "EXPIRED" },
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case USER:
      return {
        eyebrow: "Visitor",
        title: "The request starts here",
        body: "A browser asks for a page and its assets. Routing sends that request to the closest edge location rather than to the origin, so the distance the request travels — and the latency the visitor feels — is much shorter.",
      };
    case EDGE:
      return {
        eyebrow: "Edge location",
        title: "A copy close to the visitor",
        body: "The edge is a cache that sits near the user. It answers directly whenever it already holds a fresh copy of the object, and only talks to the origin when it does not. Every answer it gives is one request the origin never has to serve.",
      };
    case CACHE:
      return {
        eyebrow: "Cache",
        title: "What the edge is holding",
        body: "Each stored object carries a TTL — how long the copy may be reused. While it is fresh the edge serves it immediately. Once it expires, the next request revalidates or refetches from the origin and the tray is refreshed.",
      };
    case HIT:
      return {
        eyebrow: "Cache HIT",
        title: "Answered at the edge",
        body: "The object is already cached and still fresh, so it goes straight back to the visitor. Short hop, no origin round trip — this is the path most requests take once content is warm.",
      };
    case MISS:
      return {
        eyebrow: "Cache MISS",
        title: "The edge asks the origin",
        body: "Nothing cached, or the copy expired. The edge fetches the object from the origin once, stores it, then answers the visitor. The first visitor pays the long trip; everyone after them does not.",
      };
    case FILL:
      return {
        eyebrow: "Cache fill",
        title: "The object is stored on the way through",
        body: "The origin response passes through the edge, which keeps a copy with its TTL before handing it to the visitor. That single fill turns every later request in that region into a hit.",
      };
    case ORIGIN:
      return {
        eyebrow: "Origin",
        title: "Still the source of truth",
        body: "The application and its data live here. A CDN does not replace them — it distributes copies of what they produce. Anything personalised or newly written is still computed at the origin.",
      };
    case STORE:
      return {
        eyebrow: "Origin",
        title: "Where the originals live",
        body: "Images, video, scripts and stylesheets are stored once at the origin. Edges hold temporary copies; if they all disappeared, the originals would still be here.",
      };
    case EDGES:
      return {
        eyebrow: "Network",
        title: "Many locations, one origin",
        body: "The same content is cached in each region, so visitors everywhere get a nearby copy. The origin sees a handful of fills per region instead of traffic from every visitor.",
      };
    case DIRECT:
      return {
        eyebrow: "Comparison",
        title: "The trip you avoid",
        body: "Without a CDN every request — including repeat requests for the same unchanged image — crosses the whole distance to the origin. That is more latency for the visitor and more bandwidth and load for the origin.",
      };
    case PURGE:
      return {
        eyebrow: "Invalidation",
        title: "Publishing before the TTL is up",
        body: "A purge tells the edges to drop a cached object so the next request refetches it. It is the escape hatch for content that changed sooner than its TTL expected.",
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
      aria-label="A content delivery scene. A visitor on the left sends a request a short distance to the nearest edge location, which holds a cache tray of objects with their time-to-live. On a cache hit the edge answers directly. On a miss the edge fetches the object from the origin application and asset store on the right, stores it, then answers the visitor. Other edge locations around the origin serve their own regions, and a long faint path along the bottom shows the full origin round trip a CDN avoids."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 860 }}
    >
      <defs>
        <linearGradient id={`${uid}-edge`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`${uid}-origin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.11" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.07" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={U_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 12 — A COPY CLOSE TO THE VISITOR
        </text>
        <text x={W - 44} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          HIT ⟷ MISS
        </text>
        <line x1={U_X} y1={52} x2={W - 44} y2={52} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* ------------------------------ long path ----------------------------- */}
      <g opacity={op(DIRECT)}>
        <Flow d={pDirect} on={on(DIRECT)} op={1} color="var(--muted-foreground)" dashed />
        <g {...interactive(DIRECT, "Without a CDN, every request travels to the origin")}>
          <rect x={520} y={874} width={560} height={40} rx={14} fill="var(--surface)" stroke="var(--border)" />
          <text x={800} y={899} textAnchor="middle" fontSize={13} fill="var(--muted-foreground)">
            Without a CDN: every request makes the full trip to the origin
          </text>
        </g>
      </g>

      {/* -------------------------------- visitor ----------------------------- */}
      <g {...interactive(USER, "Visitor — the request starts here")} opacity={op(USER)}>
        {card(USER, U_X, U_Y, U_W, U_H, "var(--cyan)", 24)}
        <g aria-hidden="true" transform={`translate(${U_X + 26} ${U_Y + 26})`}>
          <rect width={44} height={34} rx={7} fill="none" stroke="var(--cyan)" strokeWidth={1.8} />
          <line x1={0} y1={12} x2={44} y2={12} stroke="var(--cyan)" strokeWidth={1.5} />
          <circle cx={8} cy={6} r={2} fill="var(--cyan)" />
        </g>
        <text x={U_X + 26} y={U_Y + 100} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Visitor
        </text>
        <text x={U_X + 26} y={U_Y + 126} fontSize={13} fill="var(--muted-foreground)">
          Browser asks for
        </text>
        <text x={U_X + 26} y={U_Y + 146} fontSize={13} fontFamily="var(--font-mono)" fill="var(--cyan)">
          /hero.jpg
        </text>
      </g>

      {/* ------------------------------ hit paths ----------------------------- */}
      <g opacity={op(HIT)}>
        <Flow d={pReq} on={on(HIT) || on(USER) || on(EDGE)} op={1} color="var(--cyan)" />
        <Flow d={pRes} on={on(HIT) || on(USER) || on(EDGE)} op={1} color="var(--cyan)" />
        <Token path={pReq} dur="1.5s" begin="0s" color="var(--cyan)" />
        <Token path={pRes} dur="1.5s" begin="0.75s" color="var(--cyan)" />
        <g {...interactive(HIT, "Cache hit — answered directly by the edge")}>
          <rect x={U_X + U_W + 4} y={230} width={106} height={34} rx={12}
            fill={on(HIT) ? "color-mix(in oklab, var(--cyan) 14%, var(--surface))" : "color-mix(in oklab, var(--cyan) 7%, var(--surface))"}
            stroke="color-mix(in oklab, var(--cyan) 45%, transparent)" />
          <text x={U_X + U_W + 57} y={252} textAnchor="middle" fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.1em" fill="var(--cyan)">
            HIT · FAST
          </text>
        </g>
        <text x={U_X + U_W + 57} y={296} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)" aria-hidden="true">
          short hop
        </text>
      </g>

      {/* ------------------------------ focal edge ---------------------------- */}
      <g opacity={op(EDGE)} aria-hidden="true">
        <rect x={E_X} y={E_Y} width={E_W} height={E_H} rx={32} fill={`url(#${uid}-edge)`} stroke="color-mix(in oklab, var(--cyan) 26%, transparent)" />
      </g>

      <g {...interactive(EDGE, "Nearest edge location")} opacity={op(EDGE)}>
        <rect
          x={E_X + 16}
          y={E_Y + 16}
          width={E_W - 32}
          height={96}
          rx={22}
          fill={on(EDGE) ? "color-mix(in oklab, var(--cyan) 9%, var(--surface))" : "var(--surface)"}
          stroke={on(EDGE) ? "color-mix(in oklab, var(--cyan) 55%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(EDGE) ? 2 : 1.2}
          filter={`url(#${uid}-lift)`}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={E_X + 40} y={E_Y + 46} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          EDGE LOCATION · NEAREST
        </text>
        <text x={E_X + 40} y={E_Y + 80} fontSize={21} fontWeight={780} fill="var(--foreground)">
          Edge cache
        </text>
        <text x={E_X + E_W - 40} y={E_Y + 80} textAnchor="end" fontSize={13} fill="var(--muted-foreground)">
          Close to the visitor
        </text>
      </g>

      {/* cache tray */}
      <g {...interactive(CACHE, "Cache tray — cached objects and their time to live")} opacity={op(CACHE)}>
        <rect
          x={T_X}
          y={T_Y}
          width={T_W}
          height={T_H}
          rx={22}
          fill={on(CACHE) ? "color-mix(in oklab, var(--cyan) 8%, var(--surface))" : "var(--surface)"}
          stroke={on(CACHE) ? "color-mix(in oklab, var(--cyan) 50%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(CACHE) ? 2 : 1.2}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={T_X + 22} y={T_Y + 28} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          CACHE TRAY
        </text>
        {cacheItems.map((item, i) => {
          const y = ROW_Y[i]!;
          const expired = item.state === "EXPIRED";
          const accent = expired ? "var(--violet)" : "var(--cyan)";
          return (
            <g key={item.name} aria-hidden="true">
              <rect
                x={T_X + 20}
                y={y}
                width={T_W - 40}
                height={ROW_H}
                rx={16}
                fill={`color-mix(in oklab, ${accent} 6%, transparent)`}
                stroke={`color-mix(in oklab, ${accent} 30%, transparent)`}
              />
              <text x={T_X + 40} y={y + 34} fontSize={16} fontWeight={700} fontFamily="var(--font-mono)" fill="var(--foreground)">
                {item.name}
              </text>
              <text x={T_X + 40} y={y + 62} fontSize={13} fill="var(--muted-foreground)">
                {item.size} · {item.ttl}
              </text>
              <rect
                x={T_X + T_W - 130}
                y={y + 26}
                width={90}
                height={32}
                rx={11}
                fill={`color-mix(in oklab, ${accent} 12%, var(--surface))`}
                stroke={`color-mix(in oklab, ${accent} 45%, transparent)`}
              />
              <text
                x={T_X + T_W - 85}
                y={y + 47}
                textAnchor="middle"
                fontSize={11.5}
                fontFamily="var(--font-mono)"
                letterSpacing="0.1em"
                fill={accent}
              >
                {item.state}
              </text>
            </g>
          );
        })}
        <text x={T_X + 22} y={T_Y + T_H - 22} fontSize={13} fill="var(--muted-foreground)">
          Reused until the TTL expires, then refreshed
        </text>
      </g>

      {/* ------------------------------ miss paths ---------------------------- */}
      <g opacity={op(MISS)}>
        <Flow d={pMiss} on={on(MISS) || on(ORIGIN) || on(EDGE)} op={1} color="var(--primary)" />
        <Token path={pMiss} dur="2.4s" begin="0s" color="var(--primary)" />
        <g {...interactive(MISS, "Cache miss — the edge fetches from the origin")}>
          <rect x={890} y={236} width={196} height={38} rx={13}
            fill={on(MISS) ? "color-mix(in oklab, var(--primary) 12%, var(--surface))" : "var(--surface)"}
            stroke="color-mix(in oklab, var(--primary) 42%, transparent)" />
          <text x={988} y={261} textAnchor="middle" fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.08em" fill="var(--primary)">
            MISS · ASK ORIGIN
          </text>
        </g>
      </g>

      <g opacity={op(FILL)}>
        <Flow d={pFill} on={on(FILL) || on(MISS) || on(CACHE)} op={1} color="var(--violet)" dashed />
        <Token path={pFill} dur="2.4s" begin="1.2s" color="var(--violet)" />
        <g {...interactive(FILL, "Cache fill — the object is stored at the edge on the way back")}>
          <rect x={874} y={404} width={228} height={38} rx={13}
            fill={on(FILL) ? "color-mix(in oklab, var(--violet) 12%, var(--surface))" : "var(--surface)"}
            stroke="color-mix(in oklab, var(--violet) 40%, transparent)" />
          <text x={988} y={429} textAnchor="middle" fontSize={12.5} fill="var(--violet)">
            Object cached, then served
          </text>
        </g>
      </g>

      {/* ---------------------------- satellite edges ------------------------- */}
      <g opacity={op(EDGES)}>
        {pSat.map((d) => (
          <Flow key={d} d={d} on={on(EDGES)} op={1} color="var(--cyan)" dashed />
        ))}
        {sats.map((s) => (
          <g key={s.name} {...interactive(EDGES, `${s.name} — another edge location serving the same origin`)}>
            {card(EDGES, s.x, s.y, s.w, s.h, "var(--cyan)", 20)}
            <text x={s.x + 22} y={s.y + 38} fontSize={15.5} fontWeight={700} fill="var(--foreground)">
              {s.name}
            </text>
            <text x={s.x + 22} y={s.y + 64} fontSize={12.5} fill="var(--muted-foreground)">
              {s.sub}
            </text>
          </g>
        ))}
      </g>

      {/* -------------------------------- origin ------------------------------ */}
      <g opacity={op(ORIGIN)} aria-hidden="true">
        <rect x={O_X} y={O_Y} width={O_W} height={O_H} rx={32} fill={`url(#${uid}-origin)`} stroke="color-mix(in oklab, var(--primary) 22%, transparent)" />
        <text x={O_X + 32} y={O_Y + 40} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          ORIGIN — SOURCE OF TRUTH
        </text>
      </g>

      <g {...interactive(ORIGIN, "Origin application — the source of truth")} opacity={op(ORIGIN)}>
        {card(ORIGIN, OC_X, OAPP_Y, OC_W, OCARD_H, "var(--primary)", 22)}
        <text x={OC_X + 26} y={OAPP_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          APPLICATION
        </text>
        <text x={OC_X + 26} y={OAPP_Y + 70} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Origin application
        </text>
        <text x={OC_X + 26} y={OAPP_Y + 100} fontSize={13} fill="var(--muted-foreground)">
          Builds pages, handles logic and
        </text>
        <text x={OC_X + 26} y={OAPP_Y + 122} fontSize={13} fill="var(--muted-foreground)">
          anything personal to one user
        </text>
      </g>

      <g {...interactive(STORE, "Asset store — where the original files live")} opacity={op(STORE)}>
        {card(STORE, OC_X, OST_Y, OC_W, OCARD_H, "var(--violet)", 22)}
        <g aria-hidden="true" transform={`translate(${OC_X + 26} ${OST_Y + 30})`}>
          <ellipse cx={17} cy={9} rx={17} ry={6} fill="none" stroke="var(--violet)" strokeWidth={1.6} />
          <path d="M0 9v30c0 3.5 7.6 6 17 6s17-2.5 17-6V9" fill="none" stroke="var(--violet)" strokeWidth={1.6} />
          <path d="M0 24c0 3.5 7.6 6 17 6s17-2.5 17-6" fill="none" stroke="var(--violet)" strokeWidth={1.6} />
        </g>
        <text x={OC_X + 84} y={OST_Y + 52} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Asset store
        </text>
        <text x={OC_X + 84} y={OST_Y + 78} fontSize={13} fill="var(--muted-foreground)">
          Images, video, scripts, styles
        </text>
        <text x={OC_X + 26} y={OST_Y + 122} fontSize={13} fill="var(--muted-foreground)">
          The originals — edges only hold copies
        </text>
      </g>

      <g {...interactive(PURGE, "Purge — drop a cached object before its TTL expires")} opacity={op(PURGE)}>
        {card(PURGE, OC_X, PRG_Y, OC_W, PRG_H, "var(--cyan)", 20)}
        <text x={OC_X + 26} y={PRG_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          PURGE
        </text>
        <text x={OC_X + 26} y={PRG_Y + 62} fontSize={16.5} fontWeight={740} fill="var(--foreground)">
          Publish before the TTL ends
        </text>
        <text x={OC_X + 26} y={PRG_Y + 84} fontSize={13} fill="var(--muted-foreground)">
          Tells edges to drop the old copy
        </text>
      </g>

      <g aria-hidden="true" opacity={op(ORIGIN)}>
        <text x={OC_X} y={O_Y + O_H - 52} fontSize={13} fill="var(--muted-foreground)">
          The CDN distributes copies of what the origin
        </text>
        <text x={OC_X} y={O_Y + O_H - 30} fontSize={13} fill="var(--muted-foreground)">
          produces — it does not replace the app or database.
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
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">REQUEST</p>

      <button type="button" onClick={() => onToggle(USER)} aria-expanded={activeKey === USER} className={`${btn} border-cyan/40 shadow-soft`}>
        <span className="block text-[17px] font-extrabold">Visitor</span>
        <span className="block text-[12.5px] text-muted-foreground">Browser asks for /hero.jpg — routed to the nearest edge.</span>
      </button>

      <button type="button" onClick={() => onToggle(EDGE)} aria-expanded={activeKey === EDGE} className={`${btn} border-cyan/40 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">EDGE LOCATION · NEAREST</span>
        <span className="mt-1 block text-[17px] font-extrabold">Edge cache</span>
        <span className="block text-[12.5px] text-muted-foreground">A copy of the content, close to the visitor.</span>
      </button>

      <button type="button" onClick={() => onToggle(CACHE)} aria-expanded={activeKey === CACHE} className={`${btn} border-border`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">CACHE TRAY</span>
        <span className="mt-1.5 block space-y-1.5">
          {cacheItems.map((i) => (
            <span
              key={i.name}
              className={`flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 ${
                i.state === "EXPIRED" ? "border-violet/30 bg-violet/5" : "border-cyan/30 bg-cyan/5"
              }`}
            >
              <span className="font-mono text-[13px] font-semibold">{i.name}</span>
              <span className="text-[11.5px] text-muted-foreground">
                {i.ttl} · {i.state}
              </span>
            </span>
          ))}
        </span>
        <span className="mt-2 block text-[12.5px] text-muted-foreground">Reused until the TTL expires, then refreshed.</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">TWO OUTCOMES</p>

      <button type="button" onClick={() => onToggle(HIT)} aria-expanded={activeKey === HIT} className={`${btn} border-cyan/45 bg-cyan/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-cyan">HIT</span>
        <span className="mt-1 block text-[15.5px] font-bold">Served straight from the edge</span>
        <span className="block text-[12.5px] text-muted-foreground">Short hop, no origin round trip.</span>
      </button>

      <button type="button" onClick={() => onToggle(MISS)} aria-expanded={activeKey === MISS} className={`${btn} border-primary/40 bg-primary/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-primary">MISS</span>
        <span className="mt-1 block text-[15.5px] font-bold">The edge asks the origin</span>
        <span className="block text-[12.5px] text-muted-foreground">Nothing cached, or the copy expired.</span>
      </button>

      <button type="button" onClick={() => onToggle(ORIGIN)} aria-expanded={activeKey === ORIGIN} className={`${btn} border-primary/35`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">ORIGIN — SOURCE OF TRUTH</span>
        <span className="mt-1 block text-[15.5px] font-bold">Origin application</span>
        <span className="block text-[12.5px] text-muted-foreground">Builds pages and anything personal to one user.</span>
      </button>

      <button type="button" onClick={() => onToggle(STORE)} aria-expanded={activeKey === STORE} className={`${btn} border-violet/35`}>
        <span className="block text-[15.5px] font-bold">Asset store</span>
        <span className="block text-[12.5px] text-muted-foreground">The originals: images, video, scripts, styles.</span>
      </button>

      <button type="button" onClick={() => onToggle(FILL)} aria-expanded={activeKey === FILL} className={`${btn} border-dashed border-violet/40`}>
        <span className="block text-[15.5px] font-bold">Cache fill, then response</span>
        <span className="block text-[12.5px] text-muted-foreground">The edge stores the object with its TTL, then serves the visitor.</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">ACROSS THE NETWORK</p>

      <button type="button" onClick={() => onToggle(EDGES)} aria-expanded={activeKey === EDGES} className={`${btn} border-cyan/30`}>
        <span className="block text-[15.5px] font-bold">Many edges, one origin</span>
        <span className="mt-1.5 block space-y-1">
          {sats.map((s) => (
            <span key={s.name} className="block rounded-lg border border-cyan/25 bg-cyan/5 px-2.5 py-1.5 text-[13px] font-semibold">
              {s.name}
            </span>
          ))}
        </span>
      </button>

      <button type="button" onClick={() => onToggle(DIRECT)} aria-expanded={activeKey === DIRECT} className={`${btn} border-border border-dashed`}>
        <span className="block text-[15.5px] font-bold">Without a CDN</span>
        <span className="block text-[12.5px] text-muted-foreground">Every request makes the full trip to the origin.</span>
      </button>

      <button type="button" onClick={() => onToggle(PURGE)} aria-expanded={activeKey === PURGE} className={`${btn} border-cyan/30`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">PURGE</span>
        <span className="mt-1 block text-[15.5px] font-bold">Publish before the TTL ends</span>
        <span className="block text-[12.5px] text-muted-foreground">Tells edges to drop the old copy.</span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function CdnDiagram() {
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
              A copy close to the visitor
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Hit path", color: "var(--cyan)" },
              { label: "Miss path", color: "var(--primary)" },
              { label: "Cache fill", color: "var(--violet)" },
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
        A hit is answered by the nearby edge in a single short hop. A miss costs one trip to the
        origin, which fills the edge cache so the next visitor in that region does not pay for it.
      </figcaption>
      <StageHint text="Hover the visitor, an edge, the cache or the origin to isolate its path; click any component for a short explanation." />
    </figure>
  );
}
