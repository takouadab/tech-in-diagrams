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

/* ---------------------------- characteristics ---------------------------- */

interface Characteristic {
  id: string;
  label: string;
  note: string;
}

const characteristics: Characteristic[] = [
  {
    id: "ondemand",
    label: "On-demand self-service",
    note: "You provision what you need yourself, in minutes, without anyone on the provider side approving it.",
  },
  {
    id: "access",
    label: "Broad network access",
    note: "Services are reached over the network, from many kinds of device and from anywhere with connectivity.",
  },
  {
    id: "pooling",
    label: "Resource pooling",
    note: "One pool of physical capacity is shared between many customers and assigned dynamically.",
  },
  {
    id: "elasticity",
    label: "Rapid elasticity",
    note: "Capacity grows and shrinks quickly to follow real demand instead of a yearly forecast.",
  },
  {
    id: "measured",
    label: "Measured service",
    note: "Usage is metered, so the bill follows what you actually consumed.",
  },
];

/** which characteristics a node illustrates */
const nodeTraits: Record<string, string[]> = {
  user: ["ondemand"],
  team: ["ondemand"],
  net: ["access"],
  compute: ["elasticity", "ondemand"],
  storage: ["pooling", "measured"],
  db: ["measured"],
  managed: ["ondemand", "measured"],
  infra: ["pooling"],
};

/* ---------------------------- desktop composition ------------------------ */

const W = 1600;
const H = 880;

const desktopNodes: MapNode[] = [
  {
    id: "user",
    label: "User",
    sub: "Portal · CLI · API call",
    kind: "actor",
    variant: "actor",
    x: 64,
    y: 240,
    w: 242,
    h: 118,
    detail:
      "The cloud customer. A person requests resources through a portal, a command line or an API instead of ordering hardware.",
  },
  {
    id: "team",
    label: "Team",
    sub: "Developers · operations",
    kind: "actor",
    variant: "actor",
    x: 64,
    y: 420,
    w: 242,
    h: 118,
    detail:
      "Whole teams consume the same account: developers deploy, operators watch cost and capacity, finance reads the metered bill.",
  },
  {
    id: "net",
    label: "Internet",
    sub: "Secure request path",
    kind: "network",
    variant: "rail",
    x: 376,
    y: 300,
    w: 190,
    h: 200,
    detail:
      "Every request travels over a network, encrypted in transit. That network access is exactly what makes the same service usable from an office, a laptop or another cloud service.",
  },
  {
    id: "compute",
    label: "Compute",
    sub: "VMs · containers · functions",
    kind: "service",
    x: 640,
    y: 210,
    w: 410,
    h: 150,
    detail:
      "Processing capacity you rent. You choose size and quantity; the provider supplies and maintains the servers underneath.",
  },
  {
    id: "storage",
    label: "Storage",
    sub: "Object · file · block",
    kind: "service",
    x: 1110,
    y: 210,
    w: 410,
    h: 150,
    detail:
      "Durable places to keep data: object storage for files and backups, block storage for disks, file shares for traditional workloads.",
  },
  {
    id: "db",
    label: "Databases",
    sub: "Managed engines",
    kind: "data",
    x: 640,
    y: 400,
    w: 410,
    h: 150,
    detail:
      "Database engines run, backed up and patched by the provider. You still design schemas and queries — you no longer maintain the host.",
  },
  {
    id: "managed",
    label: "Managed services",
    sub: "Identity · messaging · AI",
    kind: "service",
    x: 1110,
    y: 400,
    w: 410,
    h: 150,
    detail:
      "Higher-level building blocks consumed as APIs: identity, queues, analytics, AI endpoints. The more managed the service, the less you operate.",
  },
  {
    id: "infra",
    label: "Physical infrastructure",
    sub: "Data centres the provider owns",
    kind: "platform",
    variant: "strip",
    tiles: ["Racks", "Network", "Power", "Cooling"],
    x: 640,
    y: 610,
    w: 880,
    h: 150,
    detail:
      "The hardware never disappears. Real servers, switches and power feeds run every service above, and their capacity is pooled across many customers.",
  },
];

const desktopEdges: MapEdge[] = [
  { id: "c1", from: "user", to: "net", d: "M 306 299 C 342 299 344 350 376 350", animated: true },
  { id: "c2", from: "team", to: "net", d: "M 306 479 C 342 479 344 430 376 430", animated: true },
  { id: "c3", from: "net", to: "compute", d: "M 566 372 C 606 372 604 285 640 285", animated: true },
  { id: "c4", from: "net", to: "db", d: "M 566 428 C 606 428 604 475 640 475", animated: true },
  {
    id: "c5",
    from: "net",
    to: "storage",
    d: "M 566 356 C 598 300 600 196 648 194 L 1296 194 C 1310 194 1315 199 1315 210",
    animated: true,
  },
  {
    id: "c6",
    from: "net",
    to: "managed",
    d: "M 566 444 C 598 520 606 574 656 576 L 1298 576 C 1310 576 1315 570 1315 560",
    animated: true,
  },
  { id: "c7", from: "compute", to: "infra", d: "M 1050 300 C 1080 300 1080 340 1080 610", dashed: true, quiet: true, animated: true },
  {
    id: "c8",
    from: "storage",
    to: "infra",
    d: "M 1520 300 C 1544 300 1544 420 1544 588 C 1544 602 1534 610 1518 610",
    dashed: true,
  },
  { id: "c9", from: "db", to: "infra", d: "M 845 550 L 845 610", dashed: true },
  { id: "c10", from: "managed", to: "infra", d: "M 1315 550 L 1315 610", dashed: true },
];

/* ---------------------------- mobile composition ------------------------- */

const MW = 400;
const MH = 1300;

const mobileNodes: MapNode[] = [
  { ...desktopNodes[0]!, variant: "card", x: 24, y: 24, w: 352, h: 100 },
  { ...desktopNodes[1]!, variant: "card", x: 24, y: 140, w: 352, h: 100 },
  { ...desktopNodes[2]!, variant: "card", sub: "Secure path", x: 24, y: 256, w: 352, h: 100 },
  { ...desktopNodes[3]!, variant: "rail", sub: "VMs · containers", x: 26, y: 452, w: 169, h: 150 },
  { ...desktopNodes[4]!, variant: "rail", sub: "Object · block", x: 205, y: 452, w: 169, h: 150 },
  { ...desktopNodes[5]!, variant: "rail", sub: "Managed engines", x: 26, y: 624, w: 169, h: 150 },
  {
    ...desktopNodes[6]!,
    label: "Managed",
    sub: "Identity · AI",
    variant: "rail",
    x: 205,
    y: 624,
    w: 169,
    h: 150,
  },
  {
    ...desktopNodes[7]!,
    label: "Physical layer",
    sub: "Data centres",
    variant: "strip",
    tiles: ["Racks", "Power"],
    x: 26,
    y: 796,
    w: 348,
    h: 104,
  },
];

const mobileEdges: MapEdge[] = [
  { id: "m1", from: "user", to: "net", d: "M 64 124 C 20 124 20 240 60 258", animated: true },
  { id: "m2", from: "team", to: "net", d: "M 200 240 L 200 256", animated: true },
  { id: "m3", from: "net", to: "compute", d: "M 180 356 C 150 400 116 410 111 452", animated: true },
  { id: "m4", from: "net", to: "storage", d: "M 220 356 C 250 400 284 410 289 452", animated: true },
  { id: "m5", from: "compute", to: "db", d: "M 111 602 L 111 624", animated: true },
  { id: "m6", from: "storage", to: "managed", d: "M 289 602 L 289 624", animated: true },
  { id: "m7", from: "db", to: "infra", d: "M 111 774 L 111 796", dashed: true },
  { id: "m8", from: "managed", to: "infra", d: "M 289 774 L 289 796", dashed: true },
];

/* ------------------------------ pills ------------------------------------ */

function CharacteristicRail({
  narrow,
  highlight,
  activeId,
  onHover,
  onToggle,
}: {
  narrow: boolean;
  highlight: Set<string>;
  activeId: string | null;
  onHover: (id: string | null) => void;
  onToggle: (id: string) => void;
}) {
  const startX = narrow ? 24 : 40;
  const totalW = narrow ? MW - 48 : W - 80;
  const gap = narrow ? 10 : 16;
  const pw = narrow ? totalW : (totalW - gap * 4) / 5;
  const ph = narrow ? 54 : 62;

  return (
    <g>
      {!narrow && (
        <text
          x={startX}
          y={-14}
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.2em"
          fill="var(--muted-foreground)"
        >
          FIVE ESSENTIAL CHARACTERISTICS
        </text>
      )}
      {characteristics.map((c, i) => {
        const x = narrow ? startX : startX + i * (pw + gap);
        const y = narrow ? i * (ph + gap) : 0;
        const on = highlight.has(c.id) || activeId === c.id;
        return (
          <g
            key={c.id}
            role="button"
            tabIndex={0}
            aria-label={c.label}
            onMouseEnter={() => onHover(c.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(c.id)}
            onBlur={() => onHover(null)}
            onClick={() => onToggle(c.id)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                onToggle(c.id);
              }
            }}
            className="outline-none"
            style={{
              cursor: "pointer",
              animation: `fade-rise .7s cubic-bezier(.22,1,.36,1) ${i * 70}ms both`,
            }}
          >
            <rect
              x={x}
              y={y}
              width={pw}
              height={ph}
              rx={ph / 2}
              fill={
                on
                  ? "color-mix(in oklab, var(--primary) 11%, var(--surface))"
                  : "color-mix(in oklab, var(--surface-tint) 80%, var(--surface))"
              }
              stroke={
                on
                  ? "color-mix(in oklab, var(--primary) 55%, transparent)"
                  : "var(--border-strong)"
              }
              strokeWidth={on ? 1.7 : 1}
              style={{ transition: "fill .3s ease, stroke .3s ease" }}
            />
            <circle
              cx={x + 26}
              cy={y + ph / 2}
              r={5}
              fill={on ? "var(--primary)" : "color-mix(in oklab, var(--primary) 30%, transparent)"}
            />
            <text
              x={x + 44}
              y={y + ph / 2 - 6}
              fontSize={10.5}
              fontFamily="var(--font-mono)"
              letterSpacing="0.16em"
              fill="var(--muted-foreground)"
            >
              {String(i + 1).padStart(2, "0")}
            </text>
            <text
              x={x + 44}
              y={y + ph / 2 + 13}
              fontSize={14}
              fontWeight={680}
              fill="var(--foreground)"
            >
              {c.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------ component -------------------------------- */

export function CloudComputingDiagram() {
  const uid = useId().replace(/:/g, "");
  const narrow = useNarrow(940);
  const [hover, setHover] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [hoverPill, setHoverPill] = useState<string | null>(null);
  const [activePill, setActivePill] = useState<string | null>(null);

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
  const traitHighlight = new Set<string>(focus ? (nodeTraits[focus] ?? []) : []);
  if (hoverPill) traitHighlight.add(hoverPill);

  const activeNode = nodes.find((n) => n.id === active);
  const activeChar = characteristics.find((c) => c.id === activePill);

  const railH = narrow ? 5 * 64 : 62;
  const railTop = narrow ? 34 : 46;
  const vw = narrow ? MW : W;
  const vh = (narrow ? MH : H) + railH + railTop;
  const bodyY = railTop + railH + (narrow ? 20 : 26);

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
              Cloud computing · reference map
            </span>
          </div>
          <Legend
            items={[
              { label: "People & teams", kind: "actor" },
              { label: "Network", kind: "network" },
              { label: "Cloud services", kind: "service" },
              { label: "Data", kind: "data" },
              { label: "Physical layer", kind: "platform" },
            ]}
          />
        </div>

        <div className="relative px-2 pb-3 pt-2 sm:px-4 sm:pb-6 sm:pt-4">
          <svg
            viewBox={`0 0 ${vw} ${vh}`}
            role="img"
            aria-label="A customer and team reach a cloud provider over the internet and consume compute, storage, databases and managed services, all running on the provider's physical infrastructure."
            className="w-full"
            style={{ minHeight: narrow ? undefined : 660, maxHeight: narrow ? undefined : 780 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActive(null);
                setActivePill(null);
              }
            }}
          >
            <MapDefs uid={uid} />

            <g transform={`translate(0 ${railTop})`}>
              <CharacteristicRail
                narrow={narrow}
                highlight={traitHighlight}
                activeId={activePill}
                onHover={setHoverPill}
                onToggle={(id) => {
                  setActivePill((p) => (p === id ? null : id));
                  setActive(null);
                }}
              />
            </g>

            <g transform={`translate(0 ${bodyY})`}>
              {!narrow ? (
                <>
                  <Zone
                    uid={uid}
                    x={40}
                    y={150}
                    w={290}
                    h={470}
                    label="Customer"
                    sub="Buys capacity, not hardware"
                    tone="--violet"
                    index="01"
                    dimmed={!!focus && !related.has("user") && !related.has("team")}
                  />
                  <Zone
                    uid={uid}
                    x={356}
                    y={150}
                    w={230}
                    h={470}
                    label="Transit"
                    sub="Network path"
                    tone="--cyan"
                    index="02"
                    dimmed={!!focus && !related.has("net")}
                  />
                  <Zone
                    uid={uid}
                    x={600}
                    y={120}
                    w={960}
                    h={690}
                    label="Cloud provider"
                    sub="Operates everything inside this boundary"
                    tone="--primary"
                    index="03"
                  />
                  <g aria-hidden="true" opacity={0.6}>
                    <text
                      x={620}
                      y={596}
                      fontSize={10.5}
                      fontFamily="var(--font-mono)"
                      letterSpacing="0.18em"
                      fill="var(--muted-foreground)"
                    >
                      RUNS ON
                    </text>
                    <text
                      x={1544}
                      y={790}
                      textAnchor="end"
                      fontSize={11}
                      fontFamily="var(--font-mono)"
                      letterSpacing="0.16em"
                      fill="var(--muted-foreground)"
                    >
                      FIG. 02 — SERVICE MODEL
                    </text>
                    <circle cx={1528} cy={152} r={3.4} fill="var(--chart-4)" />
                    <circle cx={1512} cy={152} r={3.4} fill="var(--cyan)" opacity={0.7} />
                    <circle cx={1496} cy={152} r={3.4} fill="var(--grid)" />
                  </g>
                </>
              ) : (
                <Zone
                  uid={uid}
                  x={12}
                  y={392}
                  w={376}
                  h={532}
                  label="Cloud provider"
                  sub="Services and the hardware below"
                  tone="--primary"
                  index="03"
                />
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
                  onToggle={() => {
                    setActive((a) => (a === n.id ? null : n.id));
                    setActivePill(null);
                  }}
                />
              ))}
            </g>
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
        {!activeNode && activeChar && (
          <ExplainPanel
            eyebrow="Essential characteristic"
            title={activeChar.label}
            body={activeChar.note}
            onClose={() => setActivePill(null)}
            side="right"
          />
        )}
      </div>
      <figcaption className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        A customer reaches provider-operated infrastructure over a network and consumes it as
        configurable services. Dashed lines show the physical layer every service depends on.
      </figcaption>
      <StageHint text="Hover a route to see which characteristic it demonstrates; click for a short explanation." />
    </figure>
  );
}
