import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* -------------------------------- model --------------------------------- */

const CODE = "code";
const BUILD = "build";
const IMAGE = "image";
const REGISTRY = "registry";
const RUNTIME = "runtime";
const KERNEL = "kernel";
const HOST = "host";
const CONTAINERS = "containers";
const ORCH = "orch";
const VM = "vm";

const related: Record<string, string[]> = {
  [CODE]: [BUILD, IMAGE],
  [BUILD]: [CODE, IMAGE],
  [IMAGE]: [CODE, BUILD, REGISTRY, RUNTIME, CONTAINERS],
  [REGISTRY]: [IMAGE, RUNTIME],
  [RUNTIME]: [REGISTRY, IMAGE, CONTAINERS, KERNEL],
  [KERNEL]: [CONTAINERS, HOST, RUNTIME, VM],
  [HOST]: [KERNEL, RUNTIME],
  [CONTAINERS]: [RUNTIME, KERNEL, ORCH, IMAGE],
  [ORCH]: [CONTAINERS],
  [VM]: [KERNEL],
};

interface Step {
  id: string;
  label: string;
  sub: string;
}

const steps: Step[] = [
  { id: CODE, label: "App + dependencies", sub: "Dockerfile · declared once" },
  { id: BUILD, label: "Build", sub: "docker build ." },
  { id: IMAGE, label: "Container image", sub: "Immutable layers · sha256" },
  { id: REGISTRY, label: "Registry", sub: "push / pull · versioned tags" },
];

const containers = [
  { id: "k1", label: "Container 1", sub: "PID 1 · api" },
  { id: "k2", label: "Container 2", sub: "PID 1 · api" },
  { id: "k3", label: "Container 3", sub: "PID 1 · worker" },
];

/* ------------------------------- geometry ------------------------------- */

const W = 1600;
const H = 836;

// left lifecycle column
const LZ_X = 44;
const LZ_Y = 96;
const LZ_W = 560;
const LZ_H = 600;

const CARD_X = 76;
const CARD_W = 496;
const CARD_H = 104;
const cardY = (i: number) => 160 + i * 140;
const CARD_CX = CARD_X + CARD_W / 2;

// contrast inset
const VM_X = 44;
const VM_Y = 716;
const VM_W = 560;
const VM_H = 96;

// right runtime column
const RZ_X = 660;
const RZ_Y = 96;
const RZ_W = 896;
const RZ_H = 600;

const BAR_X = 692;
const BAR_W = 832;

const ORCH_Y = 170;
const ORCH_H = 90;

const CT_Y = 316;
const CT_H = 124;
const CT_W = 264;
const ctX = (i: number) => BAR_X + i * (CT_W + 20);

const RT_Y = 476;
const RT_H = 62;

const KR_Y = 560;
const KR_H = 66;

const HOST_Y = 648;
const HOST_H = 56;

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
  const lit = (id: string) => {
    if (hover === null) return true;
    if (hover === id) return true;
    return (related[hover] ?? []).includes(id);
  };
  const op = (id: string) => (lit(id) ? 1 : 0.52);
  const on = (id: string) => hover === id || activeKey === id;

  const interactive = (id: string, label: string) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-label": label,
    style: { cursor: "pointer", transition: "opacity .3s ease" },
    onMouseEnter: () => setHover(id),
    onMouseLeave: () => setHover(null),
    onFocus: () => setHover(id),
    onBlur: () => setHover(null),
    onClick: () => onToggle(id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(id);
      }
    },
  });

  const pullPath = `M ${CARD_X + CARD_W} ${cardY(3) + CARD_H / 2} C ${CARD_X + CARD_W + 90} ${cardY(3) + CARD_H / 2}, ${BAR_X - 90} ${RT_Y + RT_H / 2}, ${BAR_X - 6} ${RT_Y + RT_H / 2}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Two-part diagram. On the left, an image lifecycle: application code and dependencies are built into an immutable container image, which is pushed to a registry. On the right, the runtime architecture: one host machine, one shared operating system kernel, a container runtime, and three isolated container processes above it, with an orchestrator scheduling and restarting replicas. An inset contrasts containers with virtual machines, which each carry a full guest operating system."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 780 }}
    >
      <defs>
        <linearGradient id={`${uid}-flow`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${uid}-vflow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${uid}-kernel`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--cyan) 26%, transparent)" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--primary) 22%, transparent)" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={LZ_X} y={52} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 06 — ONE IMAGE, MANY ISOLATED PROCESSES
        </text>
        <text
          x={W - 44}
          y={52}
          textAnchor="end"
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.16em"
          fill="var(--muted-foreground)"
        >
          IMAGE LIFECYCLE → RUNTIME ARCHITECTURE
        </text>
        <line x1={LZ_X} y1={72} x2={W - 44} y2={72} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* ---------------------------- left zone ---------------------------- */}
      <g aria-hidden="true">
        <rect
          x={LZ_X}
          y={LZ_Y}
          width={LZ_W}
          height={LZ_H}
          rx={34}
          fill="color-mix(in oklab, var(--cyan) 3.5%, transparent)"
          stroke="color-mix(in oklab, var(--cyan) 24%, transparent)"
        />
        <text x={LZ_X + 32} y={LZ_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          01 — IMAGE LIFECYCLE
        </text>
      </g>

      {/* lifecycle connectors */}
      {[0, 1, 2].map((i) => {
        const y1 = cardY(i) + CARD_H;
        const y2 = cardY(i + 1);
        const d = `M ${CARD_CX} ${y1} L ${CARD_CX} ${y2}`;
        const active = on(steps[i]!.id) || on(steps[i + 1]!.id);
        return (
          <g key={`lc-${i}`} opacity={Math.min(op(steps[i]!.id), op(steps[i + 1]!.id))} style={{ transition: "opacity .3s ease" }}>
            <path
              d={d}
              fill="none"
              stroke={active ? `url(#${uid}-vflow)` : "var(--border-strong)"}
              strokeWidth={active ? 3.2 : 2}
              strokeLinecap="round"
            />
            <rect x={CARD_CX - 7} y={y1} width={14} height={14} rx={4} fill="var(--primary)">
              <animateMotion dur="2.8s" begin={`${i * 0.45}s`} repeatCount="indefinite" path={d} />
            </rect>
          </g>
        );
      })}

      {/* lifecycle cards */}
      {steps.map((s, i) => (
        <g
          key={s.id}
          opacity={op(s.id)}
          {...interactive(s.id, `${s.label} — ${s.sub}`)}
          style={{
            cursor: "pointer",
            transition: "opacity .3s ease",
            animation: `fade-rise .7s cubic-bezier(.22,1,.36,1) ${i * 80}ms both`,
          }}
        >
          <rect
            x={CARD_X}
            y={cardY(i)}
            width={CARD_W}
            height={CARD_H}
            rx={24}
            fill={on(s.id) ? "color-mix(in oklab, var(--primary) 7%, var(--surface))" : "var(--surface)"}
            stroke={on(s.id) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border)"}
            strokeWidth={on(s.id) ? 1.8 : 1}
            filter={on(s.id) ? `url(#${uid}-lift)` : undefined}
            style={{ transition: "fill .3s ease, stroke .3s ease" }}
          />
          {/* artifact motif for the image card */}
          {s.id === IMAGE ? (
            <g aria-hidden="true">
              {[0, 1, 2].map((k) => (
                <rect
                  key={k}
                  x={CARD_X + 26}
                  y={cardY(i) + 30 + k * 15}
                  width={44}
                  height={11}
                  rx={3}
                  fill={`color-mix(in oklab, var(--primary) ${34 - k * 8}%, transparent)`}
                />
              ))}
            </g>
          ) : (
            <rect
              x={CARD_X + 26}
              y={cardY(i) + CARD_H / 2 - 16}
              width={32}
              height={32}
              rx={10}
              fill="none"
              stroke="var(--primary)"
              strokeWidth={1.8}
            />
          )}
          <text x={CARD_X + 96} y={cardY(i) + 46} fontSize={19} fontWeight={760} fill="var(--foreground)">
            {s.label}
          </text>
          <text x={CARD_X + 96} y={cardY(i) + 72} fontSize={13} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            {s.sub}
          </text>
        </g>
      ))}

      {/* registry → runtime pull */}
      <g opacity={Math.min(op(REGISTRY), op(RUNTIME))} style={{ transition: "opacity .3s ease" }}>
        <path
          d={pullPath}
          fill="none"
          stroke={on(REGISTRY) || on(RUNTIME) ? `url(#${uid}-flow)` : "var(--border-strong)"}
          strokeWidth={on(REGISTRY) || on(RUNTIME) ? 3.2 : 2}
          strokeLinecap="round"
        />
        <rect x={-7} y={-7} width={14} height={14} rx={4} fill="var(--cyan)">
          <animateMotion dur="3.4s" repeatCount="indefinite" path={pullPath} />
        </rect>
        <text
          x={(CARD_X + CARD_W + BAR_X) / 2}
          y={cardY(3) - 6}
          textAnchor="middle"
          fontSize={12.5}
          fontFamily="var(--font-mono)"
          fill="var(--muted-foreground)"
        >
          pull image
        </text>
      </g>

      {/* ---------------------------- right zone ---------------------------- */}
      <g aria-hidden="true">
        <rect
          x={RZ_X}
          y={RZ_Y}
          width={RZ_W}
          height={RZ_H}
          rx={34}
          fill="color-mix(in oklab, var(--primary) 3.5%, transparent)"
          stroke="color-mix(in oklab, var(--primary) 22%, transparent)"
        />
        <text x={RZ_X + 32} y={RZ_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          02 — RUNTIME ARCHITECTURE · ONE HOST
        </text>
        <text
          x={RZ_X + RZ_W - 32}
          y={RZ_Y + 42}
          textAnchor="end"
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.12em"
          fill="var(--muted-foreground)"
        >
          {containers.length} REPLICAS · 1 KERNEL
        </text>
      </g>

      {/* orchestrator */}
      <g opacity={op(ORCH)} {...interactive(ORCH, "Orchestrator — schedules, restarts and scales replicas")}>
        <rect
          x={BAR_X}
          y={ORCH_Y}
          width={BAR_W}
          height={ORCH_H}
          rx={22}
          fill={on(ORCH) ? "color-mix(in oklab, var(--violet) 9%, var(--surface))" : "var(--surface)"}
          stroke={on(ORCH) ? "color-mix(in oklab, var(--violet) 60%, transparent)" : "color-mix(in oklab, var(--violet) 32%, transparent)"}
          strokeWidth={on(ORCH) ? 1.8 : 1}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={BAR_X + 30} y={ORCH_Y + 40} fontSize={19} fontWeight={760} fill="var(--foreground)">
          Orchestrator
        </text>
        <text x={BAR_X + 30} y={ORCH_Y + 66} fontSize={13} fill="var(--muted-foreground)">
          Schedules replicas, restarts failures, scales up and down
        </text>
        <text
          x={BAR_X + BAR_W - 30}
          y={ORCH_Y + 54}
          textAnchor="end"
          fontSize={12}
          fontFamily="var(--font-mono)"
          fill="color-mix(in oklab, var(--violet) 80%, var(--foreground))"
        >
          desired: 3 / running: 3
        </text>
      </g>

      {/* orchestrator control paths */}
      {containers.map((c, i) => {
        const x = ctX(i) + CT_W / 2;
        const d = `M ${x} ${ORCH_Y + ORCH_H} L ${x} ${CT_Y}`;
        return (
          <g key={`oc-${c.id}`} opacity={Math.min(op(ORCH), op(CONTAINERS))} aria-hidden="true">
            <path
              d={d}
              fill="none"
              stroke="color-mix(in oklab, var(--violet) 55%, transparent)"
              strokeWidth={hover === ORCH ? 2.4 : 1.4}
              strokeDasharray="5 8"
              className="motion-safe:animate-[dash-travel_5s_linear_infinite]"
            />
          </g>
        );
      })}

      {/* containers */}
      {containers.map((c, i) => (
        <g
          key={c.id}
          opacity={op(CONTAINERS)}
          {...interactive(CONTAINERS, `${c.label} — isolated process, ${c.sub}`)}
          style={{
            cursor: "pointer",
            transition: "opacity .3s ease",
            animation: `fade-rise .7s cubic-bezier(.22,1,.36,1) ${160 + i * 80}ms both`,
          }}
        >
          <rect
            x={ctX(i)}
            y={CT_Y}
            width={CT_W}
            height={CT_H}
            rx={22}
            fill={on(CONTAINERS) ? "color-mix(in oklab, var(--primary) 8%, var(--surface))" : "var(--surface)"}
            stroke={on(CONTAINERS) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border)"}
            strokeWidth={on(CONTAINERS) ? 1.8 : 1}
            filter={on(CONTAINERS) ? `url(#${uid}-lift)` : undefined}
            style={{ transition: "fill .3s ease, stroke .3s ease" }}
          />
          {[0, 1, 2].map((k) => (
            <rect
              key={k}
              x={ctX(i) + 26}
              y={CT_Y + 34 + k * 12}
              width={30}
              height={8}
              rx={2.5}
              fill={`color-mix(in oklab, var(--primary) ${30 - k * 7}%, transparent)`}
              aria-hidden="true"
            />
          ))}
          <text x={ctX(i) + 74} y={CT_Y + 48} fontSize={18} fontWeight={740} fill="var(--foreground)">
            {c.label}
          </text>
          <text x={ctX(i) + 74} y={CT_Y + 70} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            {c.sub}
          </text>
          <text x={ctX(i) + 26} y={CT_Y + 100} fontSize={12.5} fill="var(--muted-foreground)">
            Same image · isolated namespace
          </text>
        </g>
      ))}

      {/* container → runtime tethers */}
      {containers.map((c, i) => {
        const x = ctX(i) + CT_W / 2;
        return (
          <line
            key={`t-${c.id}`}
            x1={x}
            y1={CT_Y + CT_H}
            x2={x}
            y2={RT_Y}
            stroke="var(--border-strong)"
            strokeWidth={2}
            opacity={Math.min(op(CONTAINERS), op(RUNTIME))}
            aria-hidden="true"
          />
        );
      })}

      {/* container runtime */}
      <g opacity={op(RUNTIME)} {...interactive(RUNTIME, "Container runtime — pulls images and starts containers as isolated processes")}>
        <rect
          x={BAR_X}
          y={RT_Y}
          width={BAR_W}
          height={RT_H}
          rx={18}
          fill={on(RUNTIME) ? "color-mix(in oklab, var(--primary) 8%, var(--surface))" : "var(--surface)"}
          stroke={on(RUNTIME) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border)"}
          strokeWidth={on(RUNTIME) ? 1.8 : 1}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={BAR_X + 30} y={RT_Y + 38} fontSize={17} fontWeight={740} fill="var(--foreground)">
          Container runtime
        </text>
        <text
          x={BAR_X + BAR_W - 30}
          y={RT_Y + 38}
          textAnchor="end"
          fontSize={12.5}
          fontFamily="var(--font-mono)"
          fill="var(--muted-foreground)"
        >
          pulls the image · starts processes
        </text>
      </g>

      {/* shared kernel — the emphasised band */}
      <g opacity={op(KERNEL)} {...interactive(KERNEL, "Shared operating system kernel — every container is a process on this one kernel")}>
        <rect
          x={BAR_X}
          y={KR_Y}
          width={BAR_W}
          height={KR_H}
          rx={18}
          fill={`url(#${uid}-kernel)`}
          stroke={on(KERNEL) ? "color-mix(in oklab, var(--cyan) 75%, transparent)" : "color-mix(in oklab, var(--cyan) 45%, transparent)"}
          strokeWidth={on(KERNEL) ? 2.4 : 1.6}
          style={{ transition: "stroke .3s ease" }}
        />
        <text x={BAR_X + 30} y={KR_Y + 30} fontSize={18} fontWeight={800} fill="var(--foreground)">
          Shared OS kernel
        </text>
        <text x={BAR_X + 30} y={KR_Y + 52} fontSize={13} fill="var(--muted-foreground)">
          One kernel serves every container — no guest OS per container
        </text>
        <text
          x={BAR_X + BAR_W - 30}
          y={KR_Y + 42}
          textAnchor="end"
          fontSize={12}
          fontFamily="var(--font-mono)"
          letterSpacing="0.14em"
          fill="var(--muted-foreground)"
        >
          × 1 FOR ALL
        </text>
      </g>

      {/* host */}
      <g opacity={op(HOST)} {...interactive(HOST, "Host machine — the physical or virtual server everything runs on")}>
        <rect
          x={BAR_X}
          y={HOST_Y}
          width={BAR_W}
          height={HOST_H}
          rx={16}
          fill="color-mix(in oklab, var(--foreground) 4%, transparent)"
          stroke={on(HOST) ? "color-mix(in oklab, var(--primary) 45%, transparent)" : "var(--border)"}
          style={{ transition: "stroke .3s ease" }}
        />
        <text x={BAR_X + 30} y={HOST_Y + 34} fontSize={15} fontWeight={700} fill="var(--muted-foreground)">
          Host machine — physical or virtual server
        </text>
        <g aria-hidden="true">
          {Array.from({ length: 14 }).map((_, k) => (
            <rect
              key={k}
              x={BAR_X + BAR_W - 40 - k * 16}
              y={HOST_Y + 20}
              width={6}
              height={16}
              rx={2}
              fill="color-mix(in oklab, var(--foreground) 14%, transparent)"
            />
          ))}
        </g>
      </g>

      {/* --------------------------- VM contrast --------------------------- */}
      <g opacity={op(VM)} {...interactive(VM, "Contrast with virtual machines — each virtual machine runs a full guest operating system")}>
        <rect
          x={VM_X}
          y={VM_Y}
          width={VM_W}
          height={VM_H}
          rx={22}
          fill="var(--surface)"
          stroke={on(VM) ? "color-mix(in oklab, var(--ember) 55%, transparent)" : "var(--border)"}
          strokeDasharray="7 7"
          style={{ transition: "stroke .3s ease" }}
        />
        <text x={VM_X + 26} y={VM_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          CONTRAST — VIRTUAL MACHINES
        </text>
        {[0, 1, 2].map((k) => (
          <g key={k} aria-hidden="true">
            <rect
              x={VM_X + 26 + k * 96}
              y={VM_Y + 44}
              width={84}
              height={34}
              rx={9}
              fill="color-mix(in oklab, var(--ember) 8%, transparent)"
              stroke="color-mix(in oklab, var(--ember) 35%, transparent)"
            />
            <text x={VM_X + 68 + k * 96} y={VM_Y + 65} textAnchor="middle" fontSize={11.5} fill="var(--muted-foreground)">
              Guest OS
            </text>
          </g>
        ))}
        <text x={VM_X + 326} y={VM_Y + 60} fontSize={13} fontWeight={640} fill="var(--foreground)">
          A full OS per VM.
        </text>
        <text x={VM_X + 326} y={VM_Y + 80} fontSize={12.5} fill="var(--muted-foreground)">
          Containers share one kernel instead.
        </text>
      </g>
    </svg>
  );
}

/* -------------------------------- mobile --------------------------------- */

function Card({
  id,
  eyebrow,
  title,
  sub,
  activeKey,
  onToggle,
  tone = "default",
}: {
  id: string;
  eyebrow?: string;
  title: string;
  sub: string;
  activeKey: string | null;
  onToggle: (key: string) => void;
  tone?: "default" | "kernel" | "violet" | "ember";
}) {
  const cls =
    tone === "kernel"
      ? "border-cyan/50 bg-surface-tint"
      : tone === "violet"
        ? "border-violet/40 bg-surface-tint"
        : tone === "ember"
          ? "border-dashed border-ember/40 bg-surface"
          : "border-border bg-surface";
  return (
    <button
      type="button"
      onClick={() => onToggle(id)}
      aria-expanded={activeKey === id}
      className={`w-full rounded-3xl border ${cls} px-4 py-4 text-left shadow-soft`}
    >
      {eyebrow && (
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
      )}
      <span className="mt-1 block text-[18px] font-extrabold">{title}</span>
      <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">{sub}</span>
    </button>
  );
}

function Connector({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 pl-6" aria-hidden="true">
      <span className="h-6 w-px bg-border-strong" />
      <span className="text-[11.5px] text-muted-foreground">{text}</span>
    </div>
  );
}

function MobileStack({
  activeKey,
  onToggle,
}: {
  activeKey: string | null;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="space-y-3 px-4 py-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">01 — IMAGE LIFECYCLE</p>
      <Card id={CODE} title="App + dependencies" sub="Dockerfile declares exactly what the app needs." activeKey={activeKey} onToggle={onToggle} />
      <Connector text="build" />
      <Card id={BUILD} title="Build" sub="docker build — the definition becomes an artifact." activeKey={activeKey} onToggle={onToggle} />
      <Connector text="produces" />
      <Card id={IMAGE} eyebrow="ARTIFACT" title="Container image" sub="Immutable layers, one digest. The same image runs everywhere." activeKey={activeKey} onToggle={onToggle} />
      <Connector text="push" />
      <Card id={REGISTRY} title="Registry" sub="Stores versioned images to pull from." activeKey={activeKey} onToggle={onToggle} />
      <Connector text="pull image" />

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
        02 — RUNTIME ARCHITECTURE
      </p>
      <Card id={ORCH} tone="violet" eyebrow="CONTROL" title="Orchestrator" sub="Schedules replicas, restarts failures, scales up and down. Desired 3 / running 3." activeKey={activeKey} onToggle={onToggle} />
      <div className="grid gap-2">
        {containers.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onToggle(CONTAINERS)}
            aria-expanded={activeKey === CONTAINERS}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3.5 text-left"
          >
            <span className="block text-[15.5px] font-bold">{c.label}</span>
            <span className="block font-mono text-[12px] text-muted-foreground">
              {c.sub} · same image, isolated namespace
            </span>
          </button>
        ))}
      </div>
      <Card id={RUNTIME} title="Container runtime" sub="Pulls the image and starts each container as an isolated process." activeKey={activeKey} onToggle={onToggle} />
      <Card id={KERNEL} tone="kernel" eyebrow="SHARED BY ALL CONTAINERS" title="Shared OS kernel" sub="One kernel serves every container — no guest OS per container." activeKey={activeKey} onToggle={onToggle} />
      <Card id={HOST} title="Host machine" sub="One physical or virtual server underneath everything." activeKey={activeKey} onToggle={onToggle} />
      <Card id={VM} tone="ember" eyebrow="CONTRAST" title="Virtual machines" sub="Each VM carries a full guest OS. Containers share one kernel instead — that is why they start in milliseconds." activeKey={activeKey} onToggle={onToggle} />
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

const copy: Record<string, { eyebrow: string; title: string; body: string }> = {
  [CODE]: {
    eyebrow: "Definition",
    title: "App + dependencies",
    body: "A Dockerfile declares exactly what the application needs: the base layer, the libraries, the configuration and the command that starts it. Nothing is assumed about the machine it will land on.",
  },
  [BUILD]: {
    eyebrow: "Build",
    title: "From definition to artifact",
    body: "The build reads that definition once and produces a stack of read-only layers. Building is where variation is allowed to happen; after this point the result is fixed.",
  },
  [IMAGE]: {
    eyebrow: "Artifact",
    title: "Container image",
    body: "An immutable, content-addressed package identified by a digest. This is the teaching point of the whole diagram: one image is built once and behaves identically on a laptop, in test and in production.",
  },
  [REGISTRY]: {
    eyebrow: "Distribution",
    title: "Registry",
    body: "A central store that images are pushed to and pulled from, with versioned tags. Every environment pulls the same digest rather than rebuilding its own copy.",
  },
  [RUNTIME]: {
    eyebrow: "Runtime",
    title: "Container runtime",
    body: "The runtime pulls the image and starts it as an ordinary process on the host, wrapped in namespaces and resource limits. There is no boot sequence, which is why start-up is measured in milliseconds.",
  },
  [KERNEL]: {
    eyebrow: "Shared foundation",
    title: "One kernel, many containers",
    body: "Every container on this host makes system calls to the same kernel. Isolation comes from namespaces and cgroups, not from virtualised hardware — so no container carries an operating system of its own.",
  },
  [HOST]: {
    eyebrow: "Foundation",
    title: "Host machine",
    body: "The physical or virtual server providing CPU, memory, storage and network. Containers are simply processes scheduled on it, so a single host can run many of them densely.",
  },
  [CONTAINERS]: {
    eyebrow: "Isolated processes",
    title: "Containers",
    body: "Each container runs from the same image in its own namespace with its own filesystem view, process tree and limits. They cannot see each other, yet they all sit directly on the shared kernel below.",
  },
  [ORCH]: {
    eyebrow: "Control plane",
    title: "Orchestrator",
    body: "It holds the desired state — how many replicas should exist and where. It places containers on hosts, restarts them when they fail, and adds or removes replicas as demand changes.",
  },
  [VM]: {
    eyebrow: "Contrast",
    title: "Not a small virtual machine",
    body: "A virtual machine virtualises hardware and boots a full guest operating system for each instance. A container isolates a process on an operating system that already exists — far lighter, far faster to start.",
  },
};

export function ContainersDiagram() {
  const uid = useId().replace(/:/g, "");
  const narrow = useNarrow(940);
  const [hover, setHover] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const toggle = (key: string) => setActiveKey((k) => (k === key ? null : key));
  const panel = activeKey ? (copy[activeKey] ?? null) : null;

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
              DevOps · containers
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Image lifecycle", color: "var(--cyan)" },
              { label: "Runtime", color: "var(--primary)" },
              { label: "Orchestration", color: "var(--violet)" },
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
            side="right"
          />
        )}
      </div>
      <figcaption className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        One image is built once and promoted through a registry; on the host it runs as several
        isolated processes above a single shared OS kernel — not as small virtual machines.
      </figcaption>
      <StageHint text="Hover a component to isolate its relationships; click any layer for a short explanation." />
    </figure>
  );
}
