import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint } from "./parts";
import { useNarrow } from "./parts";

/* ------------------------------- model ---------------------------------- */

type Owner = "you" | "provider";

interface Layer {
  id: string;
  label: string;
  sub: string;
  detail: string;
}

/** top of the stack first — closest to the user, furthest from the hardware */
const layers: Layer[] = [
  {
    id: "data",
    label: "Data & configuration",
    sub: "Content · identities · settings",
    detail:
      "Your records, your users and how the service is configured. This layer never transfers: whichever model you pick, you decide what data exists and who may reach it.",
  },
  {
    id: "app",
    label: "Application",
    sub: "The software people use",
    detail:
      "The program itself. On-premises and on IaaS or PaaS you build and deploy it; with SaaS the provider builds, updates and operates it for you.",
  },
  {
    id: "runtime",
    label: "Runtime & middleware",
    sub: "Language runtime · web server",
    detail:
      "The layer that actually executes your code: language runtimes, application servers, queues and libraries that need patching and version management.",
  },
  {
    id: "os",
    label: "Operating system",
    sub: "Patching · hardening",
    detail:
      "The guest operating system inside each machine. Someone has to patch it, harden it and keep its agents healthy — on IaaS that someone is still you.",
  },
  {
    id: "virt",
    label: "Virtualisation",
    sub: "Hypervisor · pooling",
    detail:
      "The hypervisor that carves physical hosts into virtual machines and pools their capacity. From IaaS upwards this is entirely the provider's job.",
  },
  {
    id: "infra",
    label: "Physical infrastructure",
    sub: "Racks · network · power · cooling",
    detail:
      "Buildings, servers, switches, power and cooling. Owning this means capacity planning, hardware refresh cycles and a data centre to run.",
  },
];

interface Model {
  id: string;
  label: string;
  sub: string;
  /** index of the first layer (from the top) the provider operates; 6 = none */
  providerFrom: number;
  detail: string;
}

const models: Model[] = [
  {
    id: "onprem",
    label: "On-premises",
    sub: "You run everything",
    providerFrom: 6,
    detail:
      "Hardware, virtualisation, operating system, runtime and application are all yours to operate. Maximum control, maximum operational work.",
  },
  {
    id: "iaas",
    label: "IaaS",
    sub: "Rent compute, storage, network",
    providerFrom: 4,
    detail:
      "The provider runs the data centre and virtualisation. You still manage the operating system, runtime and application.",
  },
  {
    id: "paas",
    label: "PaaS",
    sub: "Deploy code, not servers",
    providerFrom: 2,
    detail:
      "The provider also runs the OS and runtime. You supply the application and its configuration.",
  },
  {
    id: "saas",
    label: "SaaS",
    sub: "Use finished software",
    providerFrom: 1,
    detail: "The provider runs the whole application. You manage users, data and settings.",
  },
];

const ownerOf = (m: Model, layerIndex: number): Owner =>
  layerIndex >= m.providerFrom ? "provider" : "you";

const OWNER_LABEL: Record<Owner, string> = { you: "You manage", provider: "Provider manages" };
const OWNER_TONE: Record<Owner, string> = { you: "--ember", provider: "--primary" };

/* ------------------------------ geometry -------------------------------- */

const W = 1600;
const LABEL_X = 48;
const LABEL_W = 300;
const COL_X = 384;
const COL_W = 280;
const COL_GAP = 22;
const RAIL_Y = 34;
const HEAD_Y = 128;
const HEAD_H = 104;
const GRID_Y = 274;
const ROW_H = 88;
const ROW_GAP = 12;
const GRID_H = layers.length * ROW_H + (layers.length - 1) * ROW_GAP;
const FOOT_Y = GRID_Y + GRID_H + 46;
const FOOT_H = 92;
const H = FOOT_Y + FOOT_H + 44;

const colX = (i: number) => COL_X + i * (COL_W + COL_GAP);
const rowY = (i: number) => GRID_Y + i * (ROW_H + ROW_GAP);

/* ------------------------------ desktop --------------------------------- */

function tone(owner: Owner) {
  return `var(${OWNER_TONE[owner]})`;
}

function DesktopStage({
  uid,
  hoverLayer,
  hoverModel,
  activeKey,
  setHoverLayer,
  setHoverModel,
  onToggle,
}: {
  uid: string;
  hoverLayer: string | null;
  hoverModel: string | null;
  activeKey: string | null;
  setHoverLayer: (v: string | null) => void;
  setHoverModel: (v: string | null) => void;
  onToggle: (key: string) => void;
}) {
  const focused = (key: string) => activeKey === key;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="A six-layer technology stack compared across On-premises, IaaS, PaaS and SaaS, showing how responsibility for each layer moves from the customer to the provider."
      className="w-full"
      style={{ minHeight: 660, maxHeight: 900 }}
    >
      <defs>
        <linearGradient id={`${uid}-shift`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.75" />
          <stop offset="52%" stopColor="var(--cyan)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.95" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="var(--primary)" floodOpacity="0.14" />
        </filter>
      </defs>

      {/* responsibility shift rail */}
      <g aria-hidden="true">
        <text
          x={LABEL_X}
          y={RAIL_Y + 26}
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.2em"
          fill="var(--muted-foreground)"
        >
          RESPONSIBILITY SHIFTS →
        </text>
        <line
          x1={COL_X}
          y1={RAIL_Y + 22}
          x2={colX(3) + COL_W - 26}
          y2={RAIL_Y + 22}
          stroke={`url(#${uid}-shift)`}
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d={`M ${colX(3) + COL_W - 30} ${RAIL_Y + 14} L ${colX(3) + COL_W - 14} ${RAIL_Y + 22} L ${colX(3) + COL_W - 30} ${RAIL_Y + 30}`}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line
          x1={COL_X}
          y1={RAIL_Y + 22}
          x2={colX(3) + COL_W - 26}
          y2={RAIL_Y + 22}
          stroke="var(--primary)"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="10 1160"
          className="motion-safe:animate-[dash-travel_5s_linear_infinite]"
          opacity={0.9}
        />
        <text
          x={colX(3) + COL_W}
          y={RAIL_Y + 26}
          textAnchor="end"
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.16em"
          fill="var(--muted-foreground)"
          dy={-26}
        >
          FIG. 03 — SHARED RESPONSIBILITY
        </text>
      </g>

      {/* stack label column */}
      <g>
        <text
          x={LABEL_X}
          y={HEAD_Y + 40}
          fontSize={13}
          fontFamily="var(--font-mono)"
          letterSpacing="0.2em"
          fill="var(--muted-foreground)"
        >
          THE STACK
        </text>
        <text x={LABEL_X} y={HEAD_Y + 74} fontSize={17} fill="var(--muted-foreground)">
          Top of stack — closest to people
        </text>
        {layers.map((l, i) => {
          const on = hoverLayer === l.id || focused(`layer:${l.id}`);
          return (
            <g
              key={l.id}
              role="button"
              tabIndex={0}
              aria-label={`${l.label} layer`}
              className="outline-none"
              style={{
                cursor: "pointer",
                animation: `fade-rise .7s cubic-bezier(.22,1,.36,1) ${i * 60}ms both`,
              }}
              onMouseEnter={() => setHoverLayer(l.id)}
              onMouseLeave={() => setHoverLayer(null)}
              onFocus={() => setHoverLayer(l.id)}
              onBlur={() => setHoverLayer(null)}
              onClick={() => onToggle(`layer:${l.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(`layer:${l.id}`);
                }
              }}
            >
              <rect
                x={LABEL_X}
                y={rowY(i)}
                width={LABEL_W}
                height={ROW_H}
                rx={20}
                fill={
                  on
                    ? "color-mix(in oklab, var(--primary) 9%, var(--surface))"
                    : "var(--surface-tint)"
                }
                stroke={on ? "color-mix(in oklab, var(--primary) 50%, transparent)" : "var(--border)"}
                strokeWidth={on ? 1.7 : 1}
                style={{ transition: "fill .3s ease, stroke .3s ease" }}
              />
              <rect
                x={LABEL_X + 14}
                y={rowY(i) + 20}
                width={4}
                height={ROW_H - 40}
                rx={2}
                fill={on ? "var(--primary)" : "var(--border-strong)"}
              />
              <text
                x={LABEL_X + 34}
                y={rowY(i) + 38}
                fontSize={18}
                fontWeight={700}
                fill="var(--foreground)"
              >
                {l.label}
              </text>
              <text x={LABEL_X + 34} y={rowY(i) + 62} fontSize={14} fill="var(--muted-foreground)">
                {l.sub}
              </text>
            </g>
          );
        })}
        <text
          x={LABEL_X}
          y={GRID_Y + GRID_H + 30}
          fontSize={15}
          fill="var(--muted-foreground)"
        >
          Bottom of stack — the hardware
        </text>
      </g>

      {/* model columns */}
      {models.map((m, ci) => {
        const x = colX(ci);
        const colOn = hoverModel === m.id || focused(`model:${m.id}`);
        const dim = (hoverModel && hoverModel !== m.id) || false;
        const provTop = m.providerFrom < layers.length ? rowY(m.providerFrom) - 10 : null;
        const youBottom = m.providerFrom > 0 ? rowY(m.providerFrom - 1) + ROW_H + 10 : null;

        return (
          <g
            key={m.id}
            opacity={dim ? 0.55 : 1}
            style={{
              transition: "opacity .3s ease",
              animation: `fade-rise .8s cubic-bezier(.22,1,.36,1) ${120 + ci * 90}ms both`,
            }}
          >
            {/* ownership zones */}
            {youBottom !== null && (
              <rect
                x={x - 12}
                y={GRID_Y - 12}
                width={COL_W + 24}
                height={youBottom - GRID_Y + 12}
                rx={26}
                fill="color-mix(in oklab, var(--ember) 8%, transparent)"
                stroke="color-mix(in oklab, var(--ember) 28%, transparent)"
                strokeDasharray="6 6"
              />
            )}
            {provTop !== null && (
              <rect
                x={x - 12}
                y={provTop}
                width={COL_W + 24}
                height={GRID_Y + GRID_H + 12 - provTop}
                rx={26}
                fill="color-mix(in oklab, var(--primary) 8%, transparent)"
                stroke="color-mix(in oklab, var(--primary) 30%, transparent)"
              />
            )}

            {/* header */}
            <g
              role="button"
              tabIndex={0}
              aria-label={`${m.label} service model`}
              className="outline-none"
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoverModel(m.id)}
              onMouseLeave={() => setHoverModel(null)}
              onFocus={() => setHoverModel(m.id)}
              onBlur={() => setHoverModel(null)}
              onClick={() => onToggle(`model:${m.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(`model:${m.id}`);
                }
              }}
            >
              <rect
                x={x}
                y={HEAD_Y}
                width={COL_W}
                height={HEAD_H}
                rx={24}
                fill={
                  colOn
                    ? "color-mix(in oklab, var(--primary) 12%, var(--surface))"
                    : "var(--surface)"
                }
                stroke={
                  colOn ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border-strong)"
                }
                strokeWidth={colOn ? 1.8 : 1}
                filter={colOn ? `url(#${uid}-lift)` : undefined}
                style={{ transition: "fill .3s ease, stroke .3s ease" }}
              />
              <text
                x={x + 24}
                y={HEAD_Y + 30}
                fontSize={11}
                fontFamily="var(--font-mono)"
                letterSpacing="0.18em"
                fill="var(--muted-foreground)"
              >
                {String(ci + 1).padStart(2, "0")}
              </text>
              <text x={x + 24} y={HEAD_Y + 60} fontSize={24} fontWeight={780} fill="var(--foreground)">
                {m.label}
              </text>
              <text x={x + 24} y={HEAD_Y + 85} fontSize={14} fill="var(--muted-foreground)">
                {m.sub}
              </text>
            </g>

            {/* cells */}
            {layers.map((l, li) => {
              const owner = ownerOf(m, li);
              const key = `cell:${m.id}:${l.id}`;
              const on =
                hoverLayer === l.id || hoverModel === m.id || focused(key) || focused(`layer:${l.id}`);
              const c = tone(owner);
              return (
                <g
                  key={l.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${l.label} in ${m.label}: ${OWNER_LABEL[owner]}`}
                  className="outline-none"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => {
                    setHoverLayer(l.id);
                    setHoverModel(m.id);
                  }}
                  onMouseLeave={() => {
                    setHoverLayer(null);
                    setHoverModel(null);
                  }}
                  onFocus={() => {
                    setHoverLayer(l.id);
                    setHoverModel(m.id);
                  }}
                  onBlur={() => {
                    setHoverLayer(null);
                    setHoverModel(null);
                  }}
                  onClick={() => onToggle(key)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle(key);
                    }
                  }}
                >
                  <rect
                    x={x}
                    y={rowY(li)}
                    width={COL_W}
                    height={ROW_H}
                    rx={20}
                    fill={`color-mix(in oklab, ${c} ${on ? 16 : 9}%, var(--surface))`}
                    stroke={`color-mix(in oklab, ${c} ${on ? 62 : 30}%, transparent)`}
                    strokeWidth={on ? 1.8 : 1.2}
                    style={{ transition: "fill .28s ease, stroke .28s ease" }}
                  />
                  <rect
                    x={x + 18}
                    y={rowY(li) + 26}
                    width={36}
                    height={36}
                    rx={12}
                    fill={`color-mix(in oklab, ${c} ${on ? 88 : 55}%, transparent)`}
                  />
                  {owner === "provider" ? (
                    <path
                      d={`M ${x + 27} ${rowY(li) + 44} l 6 7 l 12 -14`}
                      fill="none"
                      stroke="var(--surface)"
                      strokeWidth={2.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <circle cx={x + 36} cy={rowY(li) + 44} r={5.5} fill="var(--surface)" />
                  )}
                  <text
                    x={x + 68}
                    y={rowY(li) + 40}
                    fontSize={16}
                    fontWeight={700}
                    fill="var(--foreground)"
                  >
                    {OWNER_LABEL[owner]}
                  </text>
                  <text x={x + 68} y={rowY(li) + 62} fontSize={13.5} fill="var(--muted-foreground)">
                    {l.label}
                  </text>
                </g>
              );
            })}

            {/* zone boundary accent */}
            {provTop !== null && (
              <g aria-hidden="true">
                <line
                  x1={x + 24}
                  y1={provTop}
                  x2={x + COL_W - 24}
                  y2={provTop}
                  stroke="color-mix(in oklab, var(--primary) 55%, transparent)"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <circle cx={x + COL_W - 24} cy={provTop} r={3.5} fill="var(--primary)" />
              </g>
            )}

          </g>
        );
      })}

      {/* footer note */}
      <g aria-hidden="true">
        <rect
          x={LABEL_X}
          y={FOOT_Y}
          width={colX(3) + COL_W - LABEL_X}
          height={FOOT_H}
          rx={26}
          fill="color-mix(in oklab, var(--ember) 7%, var(--surface))"
          stroke="color-mix(in oklab, var(--ember) 30%, transparent)"
        />
        <rect
          x={LABEL_X + 26}
          y={FOOT_Y + 30}
          width={6}
          height={FOOT_H - 60}
          rx={3}
          fill="var(--ember)"
        />
        <text x={LABEL_X + 48} y={FOOT_Y + 40} fontSize={18} fontWeight={720} fill="var(--foreground)">
          You keep: data, identities, configuration
        </text>
        <text x={LABEL_X + 48} y={FOOT_Y + 66} fontSize={15} fill="var(--muted-foreground)">
          In every model the customer stays responsible for their data and who can access it.
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------- mobile --------------------------------- */

function MobileStack({
  activeKey,
  onToggle,
}: {
  activeKey: string | null;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="space-y-4 px-4 py-5">
      {models.map((m, ci) => {
        const providerCount = layers.length - m.providerFrom;
        return (
          <section
            key={m.id}
            className="overflow-hidden rounded-3xl border border-border bg-surface shadow-soft"
            style={{ animation: `fade-rise .6s cubic-bezier(.22,1,.36,1) ${ci * 80}ms both` }}
          >
            <button
              type="button"
              onClick={() => onToggle(`model:${m.id}`)}
              aria-expanded={activeKey === `model:${m.id}`}
              className="flex w-full items-start gap-3 border-b border-border/70 bg-surface-tint px-4 py-3.5 text-left"
            >
              <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
                {String(ci + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">
                <span className="block text-[18px] font-extrabold">{m.label}</span>
                <span className="block text-[13px] text-muted-foreground">{m.sub}</span>
              </span>
              <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                {providerCount}/{layers.length} managed
              </span>
            </button>
            <ul className="divide-y divide-border/60">
              {layers.map((l, li) => {
                const owner = ownerOf(m, li);
                const c = tone(owner);
                return (
                  <li key={l.id}>
                    <button
                      type="button"
                      onClick={() => onToggle(`cell:${m.id}:${l.id}`)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className="size-3.5 shrink-0 rounded-md"
                        style={{ background: `color-mix(in oklab, ${c} 80%, transparent)` }}
                        aria-hidden="true"
                      />
                      <span className="flex-1 text-[14.5px] font-semibold">{l.label}</span>
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: `color-mix(in oklab, ${c} 85%, var(--foreground))` }}
                      >
                        {OWNER_LABEL[owner]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="rounded-2xl border border-border bg-surface-tint px-4 py-3.5 text-[13.5px] leading-relaxed text-muted-foreground">
        <span className="font-semibold text-foreground">You keep: data, identities, configuration.</span>{" "}
        In every model the customer stays responsible for their data and who can access it.
      </p>
    </div>
  );
}

/* ------------------------------ component ------------------------------- */

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  const [kind, a, b] = key.split(":");
  if (kind === "layer") {
    const l = layers.find((x) => x.id === a);
    return l ? { eyebrow: "Stack layer", title: l.label, body: l.detail } : null;
  }
  if (kind === "model") {
    const m = models.find((x) => x.id === a);
    return m ? { eyebrow: "Service model", title: m.label, body: m.detail } : null;
  }
  if (kind === "cell") {
    const m = models.find((x) => x.id === a);
    const li = layers.findIndex((x) => x.id === b);
    const l = layers[li];
    if (!m || !l) return null;
    const owner = ownerOf(m, li);
    return {
      eyebrow: `${m.label} · ${OWNER_LABEL[owner]}`,
      title: l.label,
      body:
        owner === "provider"
          ? `With ${m.label} the provider operates this layer for you. ${l.detail}`
          : `With ${m.label} this layer stays your responsibility. ${l.detail}`,
    };
  }
  return null;
}

export function ServiceModelsDiagram() {
  const uid = useId().replace(/:/g, "");
  const narrow = useNarrow(940);
  const [hoverLayer, setHoverLayer] = useState<string | null>(null);
  const [hoverModel, setHoverModel] = useState<string | null>(null);
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
              Service models · responsibility stack
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {(["you", "provider"] as Owner[]).map((o) => (
              <li key={o} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-[5px]"
                  style={{ background: `color-mix(in oklab, ${tone(o)} 82%, transparent)` }}
                  aria-hidden="true"
                />
                <span className="text-[11.5px] font-semibold text-muted-foreground">
                  {OWNER_LABEL[o]}
                </span>
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
                hoverLayer={hoverLayer}
                hoverModel={hoverModel}
                activeKey={activeKey}
                setHoverLayer={setHoverLayer}
                setHoverModel={setHoverModel}
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
        Moving right, more of the stack is operated by the provider — but data, identities and
        configuration always stay with the customer.
      </figcaption>
      <StageHint text="Hover a layer or a service model to highlight who operates it; click for a short explanation." />
    </figure>
  );
}
