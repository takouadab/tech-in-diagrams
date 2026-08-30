import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const USERS = "users";
const REGION = "region";
const ENTRY = "entry";
const AZA = "az-a";
const AZB = "az-b";
const AZC = "az-c";
const REPL = "replication";
const RAIL = "rail";
const REGION2 = "region-2";

const related: Record<string, string[]> = {
  [USERS]: [ENTRY, REGION],
  [REGION]: [ENTRY, AZA, AZB, AZC, REPL, USERS],
  [ENTRY]: [USERS, AZA, AZB, AZC, REGION],
  [AZA]: [ENTRY, REPL, AZB, REGION],
  [AZB]: [ENTRY, REPL, AZA, REGION],
  [AZC]: [ENTRY, RAIL, REGION],
  [REPL]: [AZA, AZB, REGION],
  [RAIL]: [AZA, AZB, AZC, REGION2],
  [REGION2]: [REGION, RAIL],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1600;
const H = 872;

/* users, outside the region */
const U_X = 40;
const U_Y = 330;
const U_W = 220;
const U_H = 156;

/* region frame */
const R_X = 300;
const R_Y = 120;
const R_W = 900;
const R_H = 700;

/* regional entry */
const E_X = 340;
const E_Y = 208;
const E_W = 818;
const E_H = 98;

/* availability zones */
const AZ_W = 236;
const zones = [
  { key: AZA, x: 340, y: 360, h: 330, name: "Availability Zone A", state: "healthy" as const },
  { key: AZB, x: 638, y: 340, h: 350, name: "Availability Zone B", state: "healthy" as const },
  { key: AZC, x: 924, y: 372, h: 306, name: "Availability Zone C", state: "failed" as const },
];

/* right rail */
const K_X = 1250;
const K_W = 310;
const RAIL_Y = 150;
const RAIL_H = 430;
const R2_Y = 620;
const R2_H = 210;

/* paths */
const pUsers = `M ${U_X + U_W} 405 C 300 405, 300 258, ${E_X} 258`;
const pA = `M 749 ${E_Y + E_H} C 749 336, 458 332, 458 360`;
const pB = `M 749 ${E_Y + E_H} L 749 340`;
const pC = `M 749 ${E_Y + E_H} C 749 336, 1042 342, 1042 372`;
const pRepl = `M 576 545 L 638 545`;

/* --------------------------------- copy ---------------------------------- */

const railRows = [
  {
    label: "Single zone",
    note: "One facility fails, the service is gone.",
    tone: "var(--ember)",
    tag: "VULNERABLE",
  },
  {
    label: "Multiple zones",
    note: "Survives the loss of one zone inside the region.",
    tone: "var(--cyan)",
    tag: "RESILIENT",
  },
  {
    label: "Multiple regions",
    note: "Survives a whole region, at real cost and complexity.",
    tone: "var(--violet)",
    tag: "ADVANCED",
  },
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case USERS:
      return {
        eyebrow: "Outside",
        title: "People, somewhere on the map",
        body: "Requests arrive from wherever your users are. Which region you deploy into decides how far each request must travel, and which country's rules the data sits under.",
      };
    case REGION:
      return {
        eyebrow: "Region",
        title: "One geography, several independent locations",
        body: "A region is a named geographic area — a metropolitan area, not a building. Inside it sit several availability zones, close enough for fast links between them but far enough apart to fail separately.",
      };
    case ENTRY:
      return {
        eyebrow: "Inside the region",
        title: "Traffic spread across zones",
        body: "The application is deployed in more than one zone, and incoming work is shared between the zones that are currently healthy. When a zone stops answering, its share simply goes to the others.",
      };
    case AZA:
      return {
        eyebrow: "Availability zone",
        title: "An independent facility",
        body: "A zone is one or more data centres with their own power, cooling and network feeds. It is not a rack and not a server — it is a separate location that can fail on its own without taking the others with it.",
      };
    case AZB:
      return {
        eyebrow: "Availability zone",
        title: "A separate failure domain",
        body: "Running the same application in a second zone means no single building, generator or flood is enough to take the service down. Each zone holds its own copy of the running application.",
      };
    case AZC:
      return {
        eyebrow: "Failure",
        title: "This zone is unavailable",
        body: "A power event takes Zone C offline. Traffic stops being sent there and the remaining zones absorb it. Nothing else about the region changes — this is exactly the failure that a multi-zone deployment is designed to absorb.",
      };
    case REPL:
      return {
        eyebrow: "Data",
        title: "Copies kept in step between zones",
        body: "Data and stateful services are replicated across zones over the region's fast internal links, so a surviving zone already holds a current copy. Without replication, spreading the application alone would not save you.",
      };
    case RAIL:
      return {
        eyebrow: "Trade-off",
        title: "How far do you want to be protected?",
        body: "One zone is the cheapest and the most fragile. Multiple zones inside a region is the usual answer, and it survives the loss of a facility. Multiple regions protects against losing an entire geography, but you pay for it in cost, latency and operational complexity.",
      };
    case REGION2:
      return {
        eyebrow: "Another region",
        title: "Regional outages are a different problem",
        body: "A multi-zone deployment does nothing if the whole region is lost. Recovering from that means a second region hundreds of kilometres away — a separate, higher-level design decision, not a checkbox on this one.",
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
      aria-label="One cloud region drawn as a large boundary containing three separate availability zones, each an independent facility running a copy of the application with its own data replica. Traffic entering the region is spread across the healthy zones; Zone C is marked unavailable and receives no traffic, while Zones A and B keep serving and keep their data in step through a replication link. A resilience rail on the right compares a single zone, multiple zones and multiple regions, and a faint second region below it shows that recovering from a whole-region outage is a separate design choice."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 820 }}
    >
      <defs>
        <linearGradient id={`${uid}-region`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`${uid}-far`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={U_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 14 — ONE REGION, THREE INDEPENDENT ZONES
        </text>
        <text x={W - 44} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          ZONE FAILURE ≠ REGION FAILURE
        </text>
        <line x1={U_X} y1={52} x2={W - 44} y2={52} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* ------------------------------- users -------------------------------- */}
      <g opacity={op(USERS)}>
        <g {...interactive(USERS, "Users outside the region — region choice affects latency and data residency")}>
          {card(USERS, U_X, U_Y, U_W, U_H, "var(--cyan)")}
          <text x={U_X + 26} y={U_Y + 38} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
            OUTSIDE
          </text>
          <text x={U_X + 26} y={U_Y + 72} fontSize={19} fontWeight={780} fill="var(--foreground)">
            Users
          </text>
          <text x={U_X + 26} y={U_Y + 102} fontSize={13} fill="var(--muted-foreground)">
            Distance to the region
          </text>
          <text x={U_X + 26} y={U_Y + 124} fontSize={13} fill="var(--muted-foreground)">
            sets the latency floor.
          </text>
        </g>
      </g>

      <Flow d={pUsers} on={on(USERS) || on(ENTRY)} color="var(--cyan)" />
      <Token path={pUsers} dur="3.4s" begin="0s" color="var(--cyan)" />

      {/* ------------------------------ region -------------------------------- */}
      <g opacity={op(REGION)}>
        <g {...interactive(REGION, "Region boundary — one geography containing several independent zones")}>
          <rect
            x={R_X}
            y={R_Y}
            width={R_W}
            height={R_H}
            rx={36}
            fill={`url(#${uid}-region)`}
            stroke={on(REGION) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "color-mix(in oklab, var(--primary) 30%, transparent)"}
            strokeWidth={on(REGION) ? 2.6 : 1.8}
            style={{ transition: "stroke .3s ease" }}
          />
          <text x={R_X + 34} y={R_Y + 44} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--primary)">
            REGION
          </text>
          <text x={R_X + 34} y={R_Y + 76} fontSize={20} fontWeight={800} fill="var(--foreground)">
            One geography · fast links between zones
          </text>
        </g>
      </g>

      {/* ------------------------------- entry -------------------------------- */}
      <g opacity={op(ENTRY)}>
        <g {...interactive(ENTRY, "Application deployed across zones — traffic is shared between healthy zones")}>
          {card(ENTRY, E_X, E_Y, E_W, E_H, "var(--cyan)", 20)}
          <text x={E_X + 28} y={E_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
            DEPLOYED ACROSS ZONES
          </text>
          <text x={E_X + 28} y={E_Y + 70} fontSize={19} fontWeight={780} fill="var(--foreground)">
            Work is shared between the zones that are healthy
          </text>
          <text x={E_X + E_W - 28} y={E_Y + 62} textAnchor="end" fontSize={13} fill="var(--muted-foreground)">
            2 of 3 zones serving
          </text>
        </g>
      </g>

      <Flow d={pA} on={on(ENTRY) || on(AZA)} color="var(--cyan)" />
      <Flow d={pB} on={on(ENTRY) || on(AZB)} color="var(--cyan)" />
      <Token path={pA} dur="2.6s" begin="0.2s" color="var(--cyan)" />
      <Token path={pB} dur="2.4s" begin="0.9s" color="var(--cyan)" />

      {/* failed path */}
      <g opacity={op(AZC)}>
        <path
          d={pC}
          fill="none"
          stroke="color-mix(in oklab, var(--ember) 55%, transparent)"
          strokeWidth={2.2}
          strokeDasharray="7 8"
          strokeLinecap="round"
        />
        <g aria-hidden="true">
          <circle cx={1005} cy={340} r={15} fill="var(--surface)" stroke="var(--ember)" strokeWidth={1.8} />
          <path d="M 999 334 L 1011 346 M 1011 334 L 999 346" stroke="var(--ember)" strokeWidth={2.2} strokeLinecap="round" />
        </g>
      </g>

      {/* ------------------------------- zones -------------------------------- */}
      {zones.map((z) => {
        const failed = z.state === "failed";
        const accent = failed ? "var(--ember)" : "var(--primary)";
        return (
          <g key={z.key} opacity={op(z.key)}>
            <g
              {...interactive(
                z.key,
                failed
                  ? `${z.name} — unavailable, receiving no traffic`
                  : `${z.name} — an independent facility serving traffic`,
              )}
            >
              <rect
                x={z.x}
                y={z.y}
                width={AZ_W}
                height={z.h}
                rx={26}
                fill={
                  failed
                    ? "color-mix(in oklab, var(--ember) 5%, var(--surface))"
                    : on(z.key)
                      ? "color-mix(in oklab, var(--primary) 6%, var(--surface))"
                      : "var(--surface)"
                }
                stroke={
                  failed
                    ? "color-mix(in oklab, var(--ember) 55%, transparent)"
                    : on(z.key)
                      ? "color-mix(in oklab, var(--primary) 55%, transparent)"
                      : "var(--border-strong)"
                }
                strokeWidth={on(z.key) || failed ? 2 : 1.3}
                strokeDasharray={failed ? "10 7" : undefined}
                style={{ transition: "fill .3s ease, stroke .3s ease" }}
              />

              <text x={z.x + 24} y={z.y + 38} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill={accent}>
                {failed ? "UNAVAILABLE" : "HEALTHY"}
              </text>
              <text x={z.x + 24} y={z.y + 72} fontSize={19} fontWeight={800} fill="var(--foreground)">
                {z.name}
              </text>
              <text x={z.x + 24} y={z.y + 100} fontSize={13} fill="var(--muted-foreground)">
                Own power, cooling
              </text>
              <text x={z.x + 24} y={z.y + 122} fontSize={13} fill="var(--muted-foreground)">
                and network feeds.
              </text>

              {/* resource chips */}
              <g aria-hidden="true">
                <rect
                  x={z.x + 22}
                  y={z.y + 146}
                  width={AZ_W - 44}
                  height={64}
                  rx={16}
                  fill={failed ? "transparent" : `color-mix(in oklab, ${accent} 5%, transparent)`}
                  stroke={`color-mix(in oklab, ${accent} 26%, transparent)`}
                  strokeDasharray={failed ? "6 6" : undefined}
                />
                <text x={z.x + 40} y={z.y + 174} fontSize={14.5} fontWeight={700} fill={failed ? "var(--muted-foreground)" : "var(--foreground)"}>
                  Application copy
                </text>
                <text x={z.x + 40} y={z.y + 196} fontSize={12.5} fill="var(--muted-foreground)">
                  {failed ? "Not serving" : "Serving requests"}
                </text>

                <rect
                  x={z.x + 22}
                  y={z.y + 222}
                  width={AZ_W - 44}
                  height={64}
                  rx={16}
                  fill={failed ? "transparent" : "color-mix(in oklab, var(--violet) 5%, transparent)"}
                  stroke={
                    failed
                      ? "color-mix(in oklab, var(--ember) 22%, transparent)"
                      : "color-mix(in oklab, var(--violet) 26%, transparent)"
                  }
                  strokeDasharray={failed ? "6 6" : undefined}
                />
                <text x={z.x + 40} y={z.y + 250} fontSize={14.5} fontWeight={700} fill={failed ? "var(--muted-foreground)" : "var(--foreground)"}>
                  Data replica
                </text>
                <text x={z.x + 40} y={z.y + 272} fontSize={12.5} fill="var(--muted-foreground)">
                  {failed ? "Offline copy" : "Kept in step"}
                </text>
              </g>
            </g>
          </g>
        );
      })}

      {/* ----------------------------- replication ---------------------------- */}
      <g opacity={op(REPL)}>
        <g {...interactive(REPL, "Replication between healthy zones keeps data in step")}>
          <rect x={572} y={498} width={70} height={94} fill="transparent" />
          <Flow d={pRepl} on={on(REPL)} color="var(--violet)" dashed />
          <text x={607} y={528} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.1em" fill="var(--violet)">
            SYNC
          </text>
        </g>
      </g>

      <g aria-hidden="true" opacity={op(REGION)}>
        <text x={R_X + 34} y={R_Y + R_H - 40} fontSize={13} fill="var(--muted-foreground)">
          A zone is a location, not a rack or a server. Losing one zone costs capacity — it does not
        </text>
        <text x={R_X + 34} y={R_Y + R_H - 18} fontSize={13} fill="var(--muted-foreground)">
          cost the service, because the same application already runs in the others.
        </text>
      </g>

      {/* ------------------------------- rail --------------------------------- */}
      <g opacity={op(RAIL)}>
        <g {...interactive(RAIL, "Resilience comparison — single zone, multiple zones, multiple regions")}>
          {card(RAIL, K_X, RAIL_Y, K_W, RAIL_H, "var(--primary)")}
          <text x={K_X + 26} y={RAIL_Y + 40} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
            RESILIENCE
          </text>
          <text x={K_X + 26} y={RAIL_Y + 74} fontSize={18.5} fontWeight={780} fill="var(--foreground)">
            How far are you covered?
          </text>
          {railRows.map((r, i) => {
            const y = RAIL_Y + 98 + i * 108;
            return (
              <g key={r.label} aria-hidden="true">
                <rect
                  x={K_X + 22}
                  y={y}
                  width={K_W - 44}
                  height={92}
                  rx={16}
                  fill={`color-mix(in oklab, ${r.tone} 5%, transparent)`}
                  stroke={`color-mix(in oklab, ${r.tone} 26%, transparent)`}
                />
                <text x={K_X + 42} y={y + 30} fontSize={15} fontWeight={760} fill="var(--foreground)">
                  {r.label}
                </text>
                <text x={K_X + K_W - 42} y={y + 29} textAnchor="end" fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.1em" fill={r.tone}>
                  {r.tag}
                </text>
                <foreignObject x={K_X + 40} y={y + 40} width={K_W - 80} height={46}>
                  <div
                    // eslint-disable-next-line react/no-unknown-property
                    style={{ fontSize: "12.5px", lineHeight: 1.4, color: "var(--muted-foreground)" }}
                  >
                    {r.note}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </g>

      {/* --------------------------- second region ---------------------------- */}
      <g opacity={op(REGION2)}>
        <g {...interactive(REGION2, "A second, distant region — cross-region disaster recovery is a separate design choice")}>
          <rect
            x={K_X}
            y={R2_Y}
            width={K_W}
            height={R2_H}
            rx={26}
            fill={`url(#${uid}-far)`}
            stroke={on(REGION2) ? "color-mix(in oklab, var(--violet) 50%, transparent)" : "color-mix(in oklab, var(--violet) 24%, transparent)"}
            strokeWidth={on(REGION2) ? 2.2 : 1.4}
            strokeDasharray="12 8"
            style={{ transition: "stroke .3s ease" }}
          />
          <text x={K_X + 26} y={R2_Y + 40} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--violet)">
            ANOTHER REGION
          </text>
          <text x={K_X + 26} y={R2_Y + 74} fontSize={18.5} fontWeight={780} fill="var(--foreground)">
            Hundreds of km away
          </text>
          <foreignObject x={K_X + 26} y={R2_Y + 90} width={K_W - 52} height={104}>
            <div
              // eslint-disable-next-line react/no-unknown-property
              style={{ fontSize: "13px", lineHeight: 1.5, color: "var(--muted-foreground)" }}
            >
              Multi-zone survives a facility. Only a second region survives losing this whole
              geography — a separate, higher-level design choice.
            </div>
          </foreignObject>
        </g>
      </g>

      <g aria-hidden="true" opacity={op(REGION2)}>
        <path
          d={`M ${R_X + R_W} 700 C 1225 700, 1225 ${R2_Y + 60}, ${K_X} ${R2_Y + 60}`}
          fill="none"
          stroke="color-mix(in oklab, var(--violet) 28%, transparent)"
          strokeWidth={1.6}
          strokeDasharray="8 10"
        />
      </g>
    </svg>
  );
}

/* -------------------------------- mobile --------------------------------- */

function MobileStack({ activeKey, onToggle }: { activeKey: string | null; onToggle: (key: string) => void }) {
  const btn = "w-full rounded-3xl border bg-surface px-4 py-4 text-left";

  return (
    <div className="space-y-3 px-4 py-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">OUTSIDE</p>

      <button type="button" onClick={() => onToggle(USERS)} aria-expanded={activeKey === USERS} className={`${btn} border-cyan/40 shadow-soft`}>
        <span className="block text-[17px] font-extrabold">Users</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Which region you choose sets latency, and where the data legally lives.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">REGION · ONE GEOGRAPHY</p>

      <button type="button" onClick={() => onToggle(REGION)} aria-expanded={activeKey === REGION} className={`${btn} border-primary/40 bg-primary/5`}>
        <span className="block text-[15.5px] font-bold">A region is an area, not a building</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Several independent zones, close enough for fast links between them.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(ENTRY)} aria-expanded={activeKey === ENTRY} className={`${btn} border-cyan/30`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">DEPLOYED ACROSS ZONES</span>
        <span className="mt-1 block text-[15.5px] font-bold">2 of 3 zones serving</span>
        <span className="block text-[12.5px] text-muted-foreground">Work is shared between the zones that are healthy.</span>
      </button>

      {[
        { key: AZA, name: "Availability Zone A", state: "Healthy" },
        { key: AZB, name: "Availability Zone B", state: "Healthy" },
      ].map((z) => (
        <button key={z.key} type="button" onClick={() => onToggle(z.key)} aria-expanded={activeKey === z.key} className={`${btn} border-primary/30`}>
          <span className="font-mono text-[10.5px] tracking-[0.16em] text-primary">{z.state.toUpperCase()}</span>
          <span className="mt-1 block text-[16px] font-extrabold">{z.name}</span>
          <span className="block text-[12.5px] text-muted-foreground">
            Its own power, cooling and network. Runs an application copy and a data replica.
          </span>
        </button>
      ))}

      <button type="button" onClick={() => onToggle(REPL)} aria-expanded={activeKey === REPL} className={`${btn} border-violet/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-violet">SYNC</span>
        <span className="mt-1 block text-[15.5px] font-bold">Replication between zones</span>
        <span className="block text-[12.5px] text-muted-foreground">
          A surviving zone already holds a current copy of the data.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(AZC)} aria-expanded={activeKey === AZC} className={`${btn} border-dashed border-ember/50 bg-ember/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-ember">UNAVAILABLE</span>
        <span className="mt-1 block text-[16px] font-extrabold">Availability Zone C</span>
        <span className="block text-[12.5px] text-muted-foreground">
          This facility is offline and receives no traffic. A and B keep serving.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">HOW FAR ARE YOU COVERED?</p>

      <button type="button" onClick={() => onToggle(RAIL)} aria-expanded={activeKey === RAIL} className={`${btn} border-primary/30`}>
        <span className="block space-y-1.5">
          {railRows.map((r) => (
            <span key={r.label} className="block rounded-lg border border-border bg-surface px-2.5 py-2 text-[13px]">
              <span className="font-semibold">{r.label}</span> — {r.note}
            </span>
          ))}
        </span>
      </button>

      <button type="button" onClick={() => onToggle(REGION2)} aria-expanded={activeKey === REGION2} className={`${btn} border-dashed border-violet/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-violet">ANOTHER REGION</span>
        <span className="mt-1 block text-[15.5px] font-bold">Hundreds of km away</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Multi-zone will not save you from losing the whole region — that needs a second one.
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function RegionsZonesDiagram() {
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
              One region, three independent zones
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Serving traffic", color: "var(--cyan)" },
              { label: "Replication", color: "var(--violet)" },
              { label: "Unavailable zone", color: "var(--ember)" },
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
        Zones are separate facilities inside one region: losing one costs capacity, not the service.
        Losing the whole region is a different problem, solved by a second region.
      </figcaption>
      <StageHint text="Hover the region, a zone, the replication link or the resilience rail to isolate the relevant elements; click any component for a short explanation." />
    </figure>
  );
}
