import { useId, useState } from "react";
import {
  ExplainPanel,
  Legend,
  MapDefs,
  MapEdges,
  MapNodeShape,
  StageBackdrop,
  StageHint,
  Zone,
  useNarrow,
  type MapEdge,
  type MapNode,
} from "./parts";

/* ------------------------------------------------------------------ */
/* desktop composition — art-directed, asymmetric, nested environments */
/* ------------------------------------------------------------------ */

const W = 1600;
const H = 780;

const desktopNodes: MapNode[] = [
  {
    id: "user",
    label: "User",
    sub: "Browser · mobile · script",
    kind: "actor",
    variant: "actor",
    x: 40,
    y: 330,
    w: 254,
    h: 112,
    detail:
      "An external actor starts everything: a click, a tap or an API call. Every layer to the right exists to answer that single request.",
  },
  {
    id: "app",
    label: "Application",
    sub: "Interface & product logic",
    kind: "service",
    x: 354,
    y: 272,
    w: 232,
    h: 104,
    detail:
      "Renders the experience and holds the product logic. It does very little heavy lifting itself — it forwards real work to backend services.",
  },
  {
    id: "api",
    label: "API",
    sub: "Contract · auth · limits",
    kind: "network",
    x: 354,
    y: 406,
    w: 232,
    h: 104,
    detail:
      "A stable, authenticated doorway into the platform. It hides how the backend is built from whoever is calling it.",
  },
  {
    id: "cloud",
    label: "Cloud services",
    sub: "Provisioned on demand, billed by usage",
    kind: "service",
    variant: "surface",
    tiles: ["Compute", "Queues", "Cache"],
    x: 700,
    y: 168,
    w: 560,
    h: 196,
    detail:
      "Provider-operated capacity: compute, queues and caches created in minutes instead of bought as hardware. This is the principal working layer of the platform.",
  },
  {
    id: "db",
    label: "Database",
    sub: "Source of truth",
    kind: "data",
    x: 700,
    y: 400,
    w: 382,
    h: 122,
    detail:
      "Where the system's state lives. Services above read and write it; nothing else in the platform is authoritative.",
  },
  {
    id: "mon",
    label: "Monitoring",
    sub: "Metrics · logs · traces",
    kind: "observe",
    variant: "rail",
    x: 1300,
    y: 168,
    w: 220,
    h: 354,
    detail:
      "An observability rail alongside the whole platform. It shows whether the flow actually works, and where it slows down.",
  },
  {
    id: "infra",
    label: "Infrastructure",
    sub: "The layer underneath",
    kind: "platform",
    variant: "strip",
    tiles: ["Racks", "Network", "Power"],
    x: 700,
    y: 566,
    w: 820,
    h: 116,
    detail:
      "Real servers in real data centres. The provider owns, secures and replaces this hardware, and shares its capacity between many customers.",
  },
];

const desktopEdges: MapEdge[] = [
  { id: "u-app", from: "user", to: "app", d: "M 294 386 C 326 386 326 324 354 324", animated: true },
  { id: "u-api", from: "user", to: "api", d: "M 294 386 C 326 386 326 458 354 458", animated: true },
  { id: "app-api", from: "app", to: "api", d: "M 470 376 L 470 406" },
  { id: "api-cloud", from: "api", to: "cloud", d: "M 586 452 C 646 452 648 266 700 266", animated: true },
  { id: "api-db", from: "api", to: "db", d: "M 586 464 C 634 464 660 461 700 461", animated: true },
  { id: "cloud-db", from: "cloud", to: "db", d: "M 900 364 C 900 384 891 382 891 400", dashed: true, animated: true, quiet: true },
  { id: "cloud-mon", from: "cloud", to: "mon", d: "M 1260 266 L 1300 266", dashed: true, animated: true, quiet: true },
  { id: "db-mon", from: "db", to: "mon", d: "M 1082 461 C 1180 461 1210 432 1300 432", dashed: true },
  { id: "cloud-infra", from: "cloud", to: "infra", d: "M 772 364 C 772 470 760 500 760 566", dashed: true },
  { id: "db-infra", from: "db", to: "infra", d: "M 980 522 L 980 566", dashed: true },
];

/* ------------------------------------------------------------------ */
/* mobile composition — rebuilt vertically, never a scaled-down copy    */
/* ------------------------------------------------------------------ */

const MW = 400;
const MH = 1080;

const mobileNodes: MapNode[] = [
  { ...desktopNodes[0]!, variant: "card", x: 24, y: 24, w: 352, h: 104 },
  { ...desktopNodes[1]!, x: 24, y: 214, w: 352, h: 104 },
  { ...desktopNodes[2]!, x: 24, y: 350, w: 352, h: 104 },
  {
    ...desktopNodes[3]!,
    sub: "Compute · queues · cache",
    variant: "surface",
    tiles: ["Compute", "Queues", "Cache"],
    x: 24,
    y: 546,
    w: 352,
    h: 168,
  },
  { ...desktopNodes[4]!, x: 24, y: 742, w: 352, h: 104 },
  { ...desktopNodes[5]!, variant: "card", x: 24, y: 874, w: 352, h: 104 },
  { ...desktopNodes[6]!, variant: "strip", tiles: ["Racks", "Power"], x: 24, y: 1006, w: 352, h: 96 },
];

const mobileEdges: MapEdge[] = [
  { id: "m1", from: "user", to: "app", d: "M 200 128 L 200 214", animated: true },
  { id: "m2", from: "app", to: "api", d: "M 200 318 L 200 350", animated: true },
  { id: "m3", from: "api", to: "cloud", d: "M 200 454 L 200 546", animated: true },
  { id: "m4", from: "cloud", to: "db", d: "M 200 714 L 200 742", animated: true },
  { id: "m5", from: "db", to: "mon", d: "M 200 846 L 200 874", dashed: true },
  { id: "m6", from: "mon", to: "infra", d: "M 200 978 L 200 1006", dashed: true },
];

export function HeroSystemMap() {
  const uid = useId().replace(/:/g, "");
  const narrow = useNarrow(940);
  const [hover, setHover] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);

  const nodes = narrow ? mobileNodes : desktopNodes;
  const edges = narrow ? mobileEdges : desktopEdges;
  const focus = hover ?? active;
  const related = new Set<string>();
  if (focus) {
    related.add(focus);
    edges.forEach((e) => {
      if (e.from === focus) related.add(e.to);
      if (e.to === focus) related.add(e.from);
    });
  }
  const activeNode = nodes.find((n) => n.id === active);
  const vw = narrow ? MW : W;
  const vh = narrow ? MH : H;

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
              System map · request path
            </span>
          </div>
          <Legend
            items={[
              { label: "People", kind: "actor" },
              { label: "Network", kind: "network" },
              { label: "Services", kind: "service" },
              { label: "Data", kind: "data" },
              { label: "Observability", kind: "observe" },
            ]}
          />
        </div>

        <div className="relative px-2 pb-3 pt-2 sm:px-4 sm:pb-5 sm:pt-4">
          <svg
            viewBox={`0 0 ${vw} ${vh}`}
            role="img"
            aria-label="A request travelling from a user through an application and API into a cloud platform with services, a database, monitoring and physical infrastructure."
            className="w-full"
            style={{ minHeight: narrow ? undefined : 620, maxHeight: narrow ? undefined : 720 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setActive(null);
            }}
          >
            <MapDefs uid={uid} />

            {!narrow && (
              <>
                <Zone
                  uid={uid}
                  x={318}
                  y={196}
                  w={304}
                  h={342}
                  label="Entry layer"
                  sub="What the user touches"
                  tone="--cyan"
                  index="01"
                  dimmed={!!focus && !related.has("app") && !related.has("api")}
                />
                <Zone
                  uid={uid}
                  x={656}
                  y={84}
                  w={904}
                  h={624}
                  label="Cloud platform"
                  sub="Provider-operated environment"
                  tone="--primary"
                  index="02"
                  dimmed={false}
                />
                {/* micro details */}
                <g opacity={0.55} aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <path
                      key={i}
                      d={`M ${700 + i * 168} 726 v 10`}
                      stroke="var(--grid)"
                      strokeWidth={1.4}
                      strokeLinecap="round"
                    />
                  ))}
                  <text
                    x={40}
                    y={196}
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    letterSpacing="0.18em"
                    fill="var(--muted-foreground)"
                  >
                    EXTERNAL
                  </text>
                  <path d="M 40 210 H 294" stroke="var(--grid)" strokeWidth={1.3} />
                  <text
                    x={1560}
                    y={742}
                    textAnchor="end"
                    fontSize={11}
                    fontFamily="var(--font-mono)"
                    letterSpacing="0.16em"
                    fill="var(--muted-foreground)"
                  >
                    FIG. 01 — REQUEST FLOW
                  </text>
                </g>
              </>
            )}

            <MapEdges edges={edges} uid={uid} focus={focus} />

            {nodes.map((n, i) => (
              <MapNodeShape
                key={n.id}
                n={n}
                uid={uid}
                index={i}
                focused={focus === n.id}
                active={active === n.id}
                dimmed={!!focus && !related.has(n.id)}
                onEnter={() => setHover(n.id)}
                onLeave={() => setHover(null)}
                onToggle={() => setActive((a) => (a === n.id ? null : n.id))}
              />
            ))}
          </svg>
        </div>

        {activeNode && (
          <ExplainPanel
            eyebrow={activeNode.sub ?? "Detail"}
            title={activeNode.label}
            body={activeNode.detail}
            onClose={() => setActive(null)}
            side="left"
          />
        )}
      </div>
      <figcaption className="sr-only">
        Interactive system map of a request travelling into a cloud platform.
      </figcaption>
      <StageHint text="Hover to trace a route, click any element for a short explanation." />
    </figure>
  );
}
