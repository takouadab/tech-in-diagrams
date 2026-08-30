import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* -------------------------------- model --------------------------------- */

const HW = "hardware";
const HYP = "hypervisor";
const VMS = "vms";
const GUEST = "guest";
const APP = "app";
const VRES = "vres";
const CONTRAST = "contrast";

const related: Record<string, string[]> = {
  [HW]: [HYP, VRES],
  [HYP]: [HW, VMS, VRES, GUEST],
  [VMS]: [HYP, GUEST, APP, VRES],
  [GUEST]: [VMS, APP, HYP, CONTRAST],
  [APP]: [GUEST, VMS],
  [VRES]: [HW, HYP, VMS],
  [CONTRAST]: [GUEST],
};

const vms = [
  { id: "vm-a", label: "VM 1", sub: "Linux · 2 vCPU · 8 GB", os: "Guest OS — Ubuntu 22.04", app: "Web application" },
  { id: "vm-b", label: "VM 2", sub: "Linux · 4 vCPU · 16 GB", os: "Guest OS — Debian 12", app: "Database server" },
  { id: "vm-c", label: "VM 3", sub: "Windows · 2 vCPU · 8 GB", os: "Guest OS — Windows Server", app: "Line-of-business app" },
];

const vres = ["vCPU", "vRAM", "vDisk", "vNIC"];

const hardware = [
  { label: "CPU", sub: "32 cores" },
  { label: "RAM", sub: "256 GB" },
  { label: "Storage", sub: "NVMe array" },
  { label: "Network", sub: "2 × 25 GbE" },
];

/* ------------------------------- geometry ------------------------------- */

const W = 1600;
const H = 830;

const Z_X = 44;
const Z_Y = 96;
const Z_W = 1236;
const Z_H = 694;

const IN_X = 80;
const IN_W = 1162;

const TOWER_W = 370;
const TOWER_Y = 150;
const TOWER_H = 280;
const towerX = (i: number) => IN_X + i * (TOWER_W + 26);

const APP_Y = 216;
const APP_H = 60;
const GOS_Y = 286;
const GOS_H = 60;
const VR_Y = 356;
const VR_H = 58;

const HYP_Y = 478;
const HYP_H = 90;

const HW_Y = 608;
const HW_H = 132;

// contrast column
const C_X = 1316;
const C_Y = 96;
const C_W = 240;
const C_H = 694;

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

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="A layered cutaway of one physical host. At the bottom, physical hardware provides CPU, memory, storage and networking. Above it a hypervisor partitions that capacity. Above the hypervisor stand three isolated virtual machines, each with its own virtual CPU, memory, disk and network interface, its own full guest operating system, and the application running inside it. A side note contrasts this with containers, which share one kernel instead of booting a guest operating system each."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 780 }}
    >
      <defs>
        <linearGradient id={`${uid}-alloc`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${uid}-hyp`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--cyan) 26%, transparent)" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--primary) 22%, transparent)" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={Z_X} y={52} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 07 — ONE HOST, MANY ISOLATED MACHINES
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
          HARDWARE → HYPERVISOR → VIRTUAL MACHINES
        </text>
        <line x1={Z_X} y1={72} x2={W - 44} y2={72} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* host cutaway zone */}
      <g aria-hidden="true">
        <rect
          x={Z_X}
          y={Z_Y}
          width={Z_W}
          height={Z_H}
          rx={34}
          fill="color-mix(in oklab, var(--primary) 3.5%, transparent)"
          stroke="color-mix(in oklab, var(--primary) 22%, transparent)"
        />
        <text x={Z_X + 32} y={Z_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          ONE PHYSICAL HOST — CUTAWAY
        </text>
        <text
          x={Z_X + Z_W - 32}
          y={Z_Y + 42}
          textAnchor="end"
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.12em"
          fill="var(--muted-foreground)"
        >
          {vms.length} ISOLATED VMS · {vms.length} GUEST OPERATING SYSTEMS
        </text>
      </g>

      {/* hardware → hypervisor capacity flows */}
      {[0, 1, 2, 3].map((i) => {
        const x = IN_X + 140 + i * 300;
        const d = `M ${x} ${HW_Y} L ${x} ${HYP_Y + HYP_H}`;
        return (
          <g key={`cap-${i}`} opacity={Math.min(op(HW), op(HYP))} aria-hidden="true">
            <path d={d} fill="none" stroke="var(--border-strong)" strokeWidth={2} strokeLinecap="round" />
            <circle r={5} fill="var(--cyan)">
              <animateMotion dur="3s" begin={`${i * 0.3}s`} repeatCount="indefinite" path={d} />
            </circle>
          </g>
        );
      })}

      {/* hypervisor → VM allocation flows */}
      {vms.map((v, i) => {
        const x = towerX(i) + TOWER_W / 2;
        const d = `M ${x} ${HYP_Y} L ${x} ${TOWER_Y + TOWER_H}`;
        const active = on(HYP) || on(VMS) || on(VRES);
        return (
          <g key={`al-${v.id}`} opacity={Math.min(op(HYP), op(VMS))} style={{ transition: "opacity .3s ease" }} aria-hidden="true">
            <path
              d={d}
              fill="none"
              stroke={active ? `url(#${uid}-alloc)` : "var(--border-strong)"}
              strokeWidth={active ? 3.2 : 2}
              strokeLinecap="round"
            />
            <rect x={-7} y={-7} width={14} height={14} rx={4} fill="var(--primary)">
              <animateMotion dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" path={d} keyPoints="1;0" keyTimes="0;1" />
            </rect>
            <text
              x={x + 16}
              y={HYP_Y - 18}
              fontSize={12}
              fontFamily="var(--font-mono)"
              fill="var(--muted-foreground)"
            >
              allocates
            </text>
          </g>
        );
      })}

      {/* VM towers */}
      {vms.map((v, i) => (
        <g
          key={v.id}
          opacity={op(VMS)}
          style={{ animation: `fade-rise .7s cubic-bezier(.22,1,.36,1) ${i * 90}ms both` }}
        >
          <g {...interactive(VMS, `${v.label} — isolated virtual machine, ${v.sub}`)}>
            <rect
              x={towerX(i)}
              y={TOWER_Y}
              width={TOWER_W}
              height={TOWER_H}
              rx={26}
              fill={on(VMS) ? "color-mix(in oklab, var(--primary) 6%, var(--surface))" : "var(--surface)"}
              stroke={on(VMS) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border)"}
              strokeWidth={on(VMS) ? 1.8 : 1}
              filter={on(VMS) ? `url(#${uid}-lift)` : undefined}
              style={{ transition: "fill .3s ease, stroke .3s ease" }}
            />
            <text x={towerX(i) + 26} y={TOWER_Y + 40} fontSize={19} fontWeight={780} fill="var(--foreground)">
              {v.label}
            </text>
            <text
              x={towerX(i) + TOWER_W - 26}
              y={TOWER_Y + 40}
              textAnchor="end"
              fontSize={12}
              fontFamily="var(--font-mono)"
              fill="var(--muted-foreground)"
            >
              {v.sub}
            </text>
          </g>

          {/* application layer */}
          <g opacity={op(APP)} {...interactive(APP, `Application inside ${v.label} — ${v.app}`)}>
            <rect
              x={towerX(i) + 22}
              y={APP_Y}
              width={TOWER_W - 44}
              height={APP_H}
              rx={16}
              fill={on(APP) ? "color-mix(in oklab, var(--violet) 10%, var(--surface))" : "color-mix(in oklab, var(--violet) 5%, transparent)"}
              stroke={on(APP) ? "color-mix(in oklab, var(--violet) 60%, transparent)" : "color-mix(in oklab, var(--violet) 30%, transparent)"}
              style={{ transition: "fill .3s ease, stroke .3s ease" }}
            />
            <text x={towerX(i) + 42} y={APP_Y + 26} fontSize={15.5} fontWeight={720} fill="var(--foreground)">
              Application
            </text>
            <text x={towerX(i) + 42} y={APP_Y + 46} fontSize={12.5} fill="var(--muted-foreground)">
              {v.app}
            </text>
          </g>

          {/* guest OS layer */}
          <g opacity={op(GUEST)} {...interactive(GUEST, `Guest operating system inside ${v.label} — ${v.os}`)}>
            <rect
              x={towerX(i) + 22}
              y={GOS_Y}
              width={TOWER_W - 44}
              height={GOS_H}
              rx={16}
              fill={on(GUEST) ? "color-mix(in oklab, var(--cyan) 12%, var(--surface))" : "color-mix(in oklab, var(--cyan) 6%, transparent)"}
              stroke={on(GUEST) ? "color-mix(in oklab, var(--cyan) 70%, transparent)" : "color-mix(in oklab, var(--cyan) 38%, transparent)"}
              strokeWidth={on(GUEST) ? 2 : 1}
              style={{ transition: "fill .3s ease, stroke .3s ease" }}
            />
            <text x={towerX(i) + 42} y={GOS_Y + 26} fontSize={15.5} fontWeight={760} fill="var(--foreground)">
              Guest OS
            </text>
            <text x={towerX(i) + 42} y={GOS_Y + 46} fontSize={12.5} fill="var(--muted-foreground)">
              {v.os.replace("Guest OS — ", "")} · boots on its own
            </text>
          </g>

          {/* virtual resources */}
          <g opacity={op(VRES)} {...interactive(VRES, `Virtual hardware presented to ${v.label}: virtual CPU, memory, disk and network interface`)}>
            <rect
              x={towerX(i) + 22}
              y={VR_Y}
              width={TOWER_W - 44}
              height={VR_H}
              rx={16}
              fill={on(VRES) ? "color-mix(in oklab, var(--primary) 8%, var(--surface))" : "var(--surface-tint)"}
              stroke={on(VRES) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border)"}
              style={{ transition: "fill .3s ease, stroke .3s ease" }}
            />
            {vres.map((r, k) => (
              <g key={r} aria-hidden="true">
                <rect
                  x={towerX(i) + 34 + k * 78}
                  y={VR_Y + 16}
                  width={70}
                  height={26}
                  rx={9}
                  fill="color-mix(in oklab, var(--primary) 9%, transparent)"
                  stroke="color-mix(in oklab, var(--primary) 26%, transparent)"
                />
                <text
                  x={towerX(i) + 69 + k * 78}
                  y={VR_Y + 33}
                  textAnchor="middle"
                  fontSize={12}
                  fontFamily="var(--font-mono)"
                  fill="var(--muted-foreground)"
                >
                  {r}
                </text>
              </g>
            ))}
          </g>

          {/* isolation seam */}
          {i < vms.length - 1 && (
            <line
              x1={towerX(i) + TOWER_W + 13}
              y1={TOWER_Y + 8}
              x2={towerX(i) + TOWER_W + 13}
              y2={TOWER_Y + TOWER_H - 8}
              stroke="color-mix(in oklab, var(--foreground) 16%, transparent)"
              strokeWidth={1.5}
              strokeDasharray="4 8"
              aria-hidden="true"
            />
          )}
        </g>
      ))}




      {/* hypervisor */}
      <g opacity={op(HYP)} {...interactive(HYP, "Hypervisor — partitions the physical hardware into isolated virtual machines and schedules them")}>
        <rect
          x={IN_X}
          y={HYP_Y}
          width={IN_W}
          height={HYP_H}
          rx={20}
          fill={`url(#${uid}-hyp)`}
          stroke={on(HYP) ? "color-mix(in oklab, var(--cyan) 78%, transparent)" : "color-mix(in oklab, var(--cyan) 45%, transparent)"}
          strokeWidth={on(HYP) ? 2.4 : 1.6}
          style={{ transition: "stroke .3s ease" }}
        />
        <text x={IN_X + 30} y={HYP_Y + 38} fontSize={19} fontWeight={800} fill="var(--foreground)">
          Hypervisor
        </text>
        <text x={IN_X + 30} y={HYP_Y + 64} fontSize={13} fill="var(--muted-foreground)">
          Partitions CPU, memory, storage and network into virtual hardware — and keeps each machine apart
        </text>
        <text
          x={IN_X + IN_W - 30}
          y={HYP_Y + 52}
          textAnchor="end"
          fontSize={12}
          fontFamily="var(--font-mono)"
          letterSpacing="0.14em"
          fill="var(--muted-foreground)"
        >
          SCHEDULES ALL VMS
        </text>
      </g>

      {/* physical hardware */}
      <g opacity={op(HW)} {...interactive(HW, "Physical hardware — the real CPU, memory, storage and network capacity of one server")}>
        <rect
          x={IN_X}
          y={HW_Y}
          width={IN_W}
          height={HW_H}
          rx={20}
          fill="color-mix(in oklab, var(--foreground) 4%, transparent)"
          stroke={on(HW) ? "color-mix(in oklab, var(--primary) 50%, transparent)" : "var(--border)"}
          strokeWidth={on(HW) ? 1.8 : 1}
          style={{ transition: "stroke .3s ease" }}
        />
        <text x={IN_X + 30} y={HW_Y + 34} fontSize={16.5} fontWeight={740} fill="var(--foreground)">
          Physical hardware — one server
        </text>
        {hardware.map((h, k) => (
          <g key={h.label} aria-hidden="true">
            <rect
              x={IN_X + 30 + k * 284}
              y={HW_Y + 52}
              width={262}
              height={58}
              rx={14}
              fill="var(--surface)"
              stroke="var(--border)"
            />
            <text x={IN_X + 52 + k * 284} y={HW_Y + 78} fontSize={15} fontWeight={720} fill="var(--foreground)">
              {h.label}
            </text>
            <text x={IN_X + 52 + k * 284} y={HW_Y + 98} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              {h.sub}
            </text>
          </g>
        ))}
      </g>

      {/* ------------------------- contrast column ------------------------- */}
      <g opacity={op(CONTRAST)} {...interactive(CONTRAST, "Contrast with containers — containers share the host kernel while virtual machines each boot a guest operating system")}>
        <rect
          x={C_X}
          y={C_Y}
          width={C_W}
          height={C_H}
          rx={28}
          fill="var(--surface)"
          stroke={on(CONTRAST) ? "color-mix(in oklab, var(--ember) 55%, transparent)" : "var(--border)"}
          strokeDasharray="7 7"
          style={{ transition: "stroke .3s ease" }}
        />
        <text x={C_X + 24} y={C_Y + 40} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          CONTRAST
        </text>
        <text x={C_X + 24} y={C_Y + 74} fontSize={16} fontWeight={760} fill="var(--foreground)">
          Containers
        </text>

        {/* mini container stack */}
        <g aria-hidden="true">
          {[0, 1, 2].map((k) => (
            <rect
              key={k}
              x={C_X + 24 + k * 66}
              y={C_Y + 96}
              width={56}
              height={34}
              rx={9}
              fill="color-mix(in oklab, var(--primary) 8%, transparent)"
              stroke="color-mix(in oklab, var(--primary) 30%, transparent)"
            />
          ))}
          <rect
            x={C_X + 24}
            y={C_Y + 140}
            width={C_W - 48}
            height={34}
            rx={9}
            fill="color-mix(in oklab, var(--cyan) 14%, transparent)"
            stroke="color-mix(in oklab, var(--cyan) 45%, transparent)"
          />
          <text x={C_X + C_W / 2} y={C_Y + 162} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--foreground)">
            One shared kernel
          </text>
        </g>

        <text x={C_X + 24} y={C_Y + 218} fontSize={16} fontWeight={760} fill="var(--foreground)">
          Virtual machines
        </text>

        {/* mini VM stack */}
        <g aria-hidden="true">
          {[0, 1, 2].map((k) => (
            <g key={k}>
              <rect
                x={C_X + 24 + k * 66}
                y={C_Y + 240}
                width={56}
                height={54}
                rx={9}
                fill="color-mix(in oklab, var(--ember) 7%, transparent)"
                stroke="color-mix(in oklab, var(--ember) 35%, transparent)"
              />
              <text x={C_X + 52 + k * 66} y={C_Y + 262} textAnchor="middle" fontSize={10.5} fill="var(--muted-foreground)">
                App
              </text>
              <text x={C_X + 52 + k * 66} y={C_Y + 282} textAnchor="middle" fontSize={10.5} fill="var(--muted-foreground)">
                Guest OS
              </text>
            </g>
          ))}
          <rect
            x={C_X + 24}
            y={C_Y + 304}
            width={C_W - 48}
            height={34}
            rx={9}
            fill="color-mix(in oklab, var(--cyan) 10%, transparent)"
            stroke="color-mix(in oklab, var(--cyan) 40%, transparent)"
          />
          <text x={C_X + C_W / 2} y={C_Y + 326} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--foreground)">
            Hypervisor
          </text>
        </g>

        <text x={C_X + 24} y={C_Y + 386} fontSize={13} fill="var(--muted-foreground)">
          <tspan x={C_X + 24} dy="0">Containers share a kernel;</tspan>
          <tspan x={C_X + 24} dy="20">VMs each boot a full</tspan>
          <tspan x={C_X + 24} dy="20">guest operating system.</tspan>
        </text>
        <line x1={C_X + 24} y1={C_Y + 452} x2={C_X + C_W - 24} y2={C_Y + 452} stroke="var(--border)" />
        <text x={C_X + 24} y={C_Y + 486} fontSize={12.5} fill="var(--muted-foreground)">
          <tspan x={C_X + 24} dy="0">A VM virtualises hardware,</tspan>
          <tspan x={C_X + 24} dy="19">so it can run a different</tspan>
          <tspan x={C_X + 24} dy="19">operating system from the</tspan>
          <tspan x={C_X + 24} dy="19">host — at the cost of a full</tspan>
          <tspan x={C_X + 24} dy="19">boot and more memory.</tspan>
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
  tone?: "default" | "cyan" | "violet" | "ember";
}) {
  const cls =
    tone === "cyan"
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
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
        VIRTUAL MACHINES — ONE PER TOWER
      </p>
      <div className="space-y-3">
        {vms.map((v) => (
          <div key={v.id} className="rounded-3xl border border-border bg-surface p-3 shadow-soft">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[16px] font-extrabold">{v.label}</span>
              <span className="font-mono text-[11.5px] text-muted-foreground">{v.sub}</span>
            </div>
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={() => onToggle(APP)}
                aria-expanded={activeKey === APP}
                className="w-full rounded-2xl border border-violet/30 bg-surface-tint px-3 py-2.5 text-left"
              >
                <span className="block text-[14px] font-bold">Application</span>
                <span className="block text-[12.5px] text-muted-foreground">{v.app}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggle(GUEST)}
                aria-expanded={activeKey === GUEST}
                className="w-full rounded-2xl border border-cyan/40 bg-surface-tint px-3 py-2.5 text-left"
              >
                <span className="block text-[14px] font-bold">Guest OS</span>
                <span className="block text-[12.5px] text-muted-foreground">
                  {v.os.replace("Guest OS — ", "")} · boots on its own
                </span>
              </button>
              <button
                type="button"
                onClick={() => onToggle(VRES)}
                aria-expanded={activeKey === VRES}
                className="w-full rounded-2xl border border-border bg-surface px-3 py-2.5 text-left"
              >
                <span className="block text-[14px] font-bold">Virtual hardware</span>
                <span className="block font-mono text-[12px] text-muted-foreground">
                  {vres.join(" · ")}
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Connector text="allocated by" />
      <Card
        id={HYP}
        tone="cyan"
        eyebrow="PARTITIONS THE HOST"
        title="Hypervisor"
        sub="Divides CPU, memory, storage and network into virtual hardware, schedules every VM and keeps them isolated."
        activeKey={activeKey}
        onToggle={onToggle}
      />
      <Connector text="runs on" />
      <Card
        id={HW}
        eyebrow="FOUNDATION"
        title="Physical hardware"
        sub={hardware.map((h) => `${h.label} ${h.sub}`).join(" · ")}
        activeKey={activeKey}
        onToggle={onToggle}
      />
      <Card
        id={CONTRAST}
        tone="ember"
        eyebrow="CONTRAST"
        title="Containers"
        sub="Containers share the host kernel; VMs each boot a full guest operating system."
        activeKey={activeKey}
        onToggle={onToggle}
      />
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

const copy: Record<string, { eyebrow: string; title: string; body: string }> = {
  [HW]: {
    eyebrow: "Foundation",
    title: "Physical hardware",
    body: "One real server with far more CPU, memory, storage and network capacity than a single workload needs. Left undivided, most of that capacity would sit idle.",
  },
  [HYP]: {
    eyebrow: "Virtualisation layer",
    title: "Hypervisor",
    body: "Software that carves the physical machine into slices and hands each one out as virtual hardware. It schedules which VM uses the real CPU at any moment and enforces the boundary between them.",
  },
  [VMS]: {
    eyebrow: "Isolated machines",
    title: "Virtual machines",
    body: "Each VM behaves like its own computer: its own boot process, its own network identity, its own disk. Nothing inside one VM can see or reach into another, even though they share the same hardware.",
  },
  [GUEST]: {
    eyebrow: "Full operating system",
    title: "Guest OS",
    body: "Every VM boots a complete operating system of its own — Linux or Windows — which you patch, secure and manage. This is the clearest difference from containers, which isolate processes on a kernel that already exists.",
  },
  [APP]: {
    eyebrow: "Workload",
    title: "Application",
    body: "Your software runs unchanged inside the guest OS, unaware that the hardware beneath it is virtual. That transparency is what makes virtualisation so easy to adopt.",
  },
  [VRES]: {
    eyebrow: "Partitioned capacity",
    title: "Virtual CPU, memory, disk and NIC",
    body: "The hypervisor presents each VM with virtual devices backed by slices of the real ones. A vDisk is a file on the host's storage; a vNIC is a software port on a virtual switch.",
  },
  [CONTRAST]: {
    eyebrow: "Contrast",
    title: "Not the same as a container",
    body: "A container isolates a process on the host's existing kernel and starts in milliseconds. A virtual machine virtualises hardware and boots a full OS — heavier, but able to run a different operating system entirely.",
  },
};

export function VirtualMachineDiagram() {
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
              Cloud · virtualisation
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Virtual machine", color: "var(--primary)" },
              { label: "Guest OS", color: "var(--cyan)" },
              { label: "Application", color: "var(--violet)" },
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
        One host, many isolated machines: the hypervisor partitions real hardware into virtual CPU,
        memory, disk and network, and every virtual machine boots a full guest OS of its own.
      </figcaption>
      <StageHint text="Hover a layer to isolate its relationships; click any layer for a short explanation." />
    </figure>
  );
}
