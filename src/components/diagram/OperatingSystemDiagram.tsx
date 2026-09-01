import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const USER = "user";
const APP1 = "app1";
const APP2 = "app2";
const APP3 = "app3";
const SYS = "sys";
const SCHED = "sched";
const MEM = "mem";
const PERM = "perm";
const FS = "fs";
const DEV = "dev";
const HW_CPU = "hw-cpu";
const HW_RAM = "hw-ram";
const HW_STORE = "hw-store";
const HW_DEV = "hw-dev";
const FLOW = "flow";
const CRASH = "crash";

const apps = [APP1, APP2, APP3];
const core = [SCHED, MEM, PERM, FS, DEV];

const related: Record<string, string[]> = {
  [USER]: apps,
  [APP1]: [USER, SYS, SCHED, MEM, HW_CPU, CRASH],
  [APP2]: [USER, SYS, PERM, FS, MEM, DEV, HW_STORE, HW_RAM, FLOW],
  [APP3]: [USER, SYS, SCHED, DEV, HW_CPU, CRASH],
  [SYS]: [...apps, ...core],
  [SCHED]: [...apps, SYS, HW_CPU],
  [MEM]: [...apps, SYS, HW_RAM, CRASH, FLOW],
  [PERM]: [APP2, SYS, FS, HW_STORE, FLOW],
  [FS]: [APP2, SYS, PERM, HW_STORE, HW_RAM, FLOW],
  [DEV]: [...apps, SYS, HW_DEV, FLOW],
  [HW_CPU]: [SCHED],
  [HW_RAM]: [MEM, HW_STORE, FLOW],
  [HW_STORE]: [FS, PERM, HW_RAM, FLOW],
  [HW_DEV]: [DEV],
  [FLOW]: [APP2, SYS, PERM, FS, HW_STORE, HW_RAM, MEM, DEV, HW_DEV],
  [CRASH]: [APP1, APP3, MEM, SCHED],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1660;
const H = 1250;

/* top band */
const TOP_Y = 120;
const TOP_H = 180;

const USER_X = 40;
const USER_W = 250;

const APP_W = 300;
const APP_X = [330, 660, 990];

const CRASH_X = 1320;
const CRASH_W = 300;

/* system call band */
const SYS_X = 330;
const SYS_Y = 352;
const SYS_W = 960;
const SYS_H = 56;

/* OS core */
const OS_X = 40;
const OS_Y = 452;
const OS_W = 1580;
const OS_H = 350;

const CORE_Y = 534;
const CORE_H = 230;
const CORE_W = 290;
const CORE_X = [80, 390, 700, 1010, 1320];

/* hardware */
const HW_Y = 862;
const HW_H = 190;
const CHIP_Y = 912;
const CHIP_H = 120;
const CHIP_W = 360;
const CHIP_X = [80, 470, 860, 1250];

/* bottom rail */
const RAIL_Y = 1080;
const RAIL_H = 140;

const appCards = [
  { key: APP1, title: "Browser", sub: "Process 1041", tint: "var(--cyan)" },
  { key: APP2, title: "Text editor", sub: "Process 1188", tint: "var(--primary)" },
  { key: APP3, title: "Background service", sub: "Process 0342", tint: "var(--violet)" },
] as const;

const coreCards = [
  {
    key: SCHED,
    eyebrow: "CPU SCHEDULING",
    title: "Who runs next",
    tint: "var(--primary)",
    lines: ["Gives each process short turns", "on the processor, in order."],
  },
  {
    key: MEM,
    eyebrow: "MEMORY MANAGEMENT",
    title: "Protected space",
    tint: "var(--cyan)",
    lines: ["Maps memory per process so one", "cannot read another's space."],
  },
  {
    key: PERM,
    eyebrow: "PERMISSIONS",
    title: "May you?",
    tint: "var(--ember)",
    lines: ["Checks the user and process", "before granting access."],
  },
  {
    key: FS,
    eyebrow: "FILESYSTEM",
    title: "Open · read · write",
    tint: "var(--violet)",
    lines: ["Turns file names into blocks", "on a storage device."],
  },
  {
    key: DEV,
    eyebrow: "DEVICES · DRIVERS",
    title: "Speaks to hardware",
    tint: "var(--cyan)",
    lines: ["Keyboard, display, disk, network —", "apps go through drivers."],
  },
] as const;

const chips = [
  { key: HW_CPU, label: "CPU", sub: "Executes instructions" },
  { key: HW_RAM, label: "RAM", sub: "Physical memory" },
  { key: HW_STORE, label: "Storage", sub: "Disk / SSD" },
  { key: HW_DEV, label: "Keyboard · display · network", sub: "Input and output devices" },
] as const;

const flowSteps = [
  "App asks to open a file",
  "OS checks permission",
  "Filesystem reads storage",
  "Data lands in the app's memory",
  "Display driver draws it",
] as const;

const slices = ["Browser", "Editor", "Service"] as const;

/* paths */
const pUser = `M ${USER_X + USER_W} 210 L ${APP_X[0]} 210`;
const appToSys = APP_X.map((x) => `M ${x + APP_W / 2} ${TOP_Y + TOP_H} L ${x + APP_W / 2} ${SYS_Y}`);
const pSysCore = `M 810 ${SYS_Y + SYS_H} L 810 ${OS_Y}`;

const pSchedCpu = `M ${CORE_X[0] + CORE_W / 2} ${CORE_Y + CORE_H} C ${CORE_X[0] + CORE_W / 2} 830, ${CHIP_X[0] + CHIP_W / 2} 830, ${CHIP_X[0] + CHIP_W / 2} ${CHIP_Y}`;
const pMemRam = `M ${CORE_X[1] + CORE_W / 2} ${CORE_Y + CORE_H} C ${CORE_X[1] + CORE_W / 2} 838, ${CHIP_X[1] + CHIP_W / 2} 838, ${CHIP_X[1] + CHIP_W / 2} ${CHIP_Y}`;
const pFsStore = `M ${CORE_X[3] + CORE_W / 2} ${CORE_Y + CORE_H} C ${CORE_X[3] + CORE_W / 2} 844, ${CHIP_X[2] + CHIP_W / 2} 844, ${CHIP_X[2] + CHIP_W / 2} ${CHIP_Y}`;
const pDevHw = `M ${CORE_X[4] + CORE_W / 2} ${CORE_Y + CORE_H} C ${CORE_X[4] + CORE_W / 2} 848, ${CHIP_X[3] + CHIP_W / 2} 848, ${CHIP_X[3] + CHIP_W / 2} ${CHIP_Y}`;
const pPermFs = `M ${CORE_X[2] + CORE_W} 650 L ${CORE_X[3]} 650`;
const pStoreRam = `M ${CHIP_X[2]} 990 L ${CHIP_X[1] + CHIP_W} 990`;
const pRenderUp = `M ${CORE_X[4] + CORE_W / 2} ${CORE_Y} C ${CORE_X[4] + CORE_W / 2} 430, 1080 320, ${APP_X[1] + APP_W} 250`;
const pAppReq = appToSys[1];
const pSysPerm = `M 810 ${SYS_Y + SYS_H} C 810 480, ${CORE_X[2] + CORE_W / 2} 480, ${CORE_X[2] + CORE_W / 2} ${CORE_Y}`;

/* --------------------------------- copy ---------------------------------- */

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case USER:
      return {
        eyebrow: "User",
        title: "You work through applications",
        body: "People rarely address the operating system directly. You click, type and open things inside applications; those applications then ask the operating system for whatever they need from the machine.",
      };
    case APP1:
    case APP2:
    case APP3:
      return {
        eyebrow: "Application · process",
        title: "A running program with its own space",
        body: "Each running program is a process. It has its own memory, its own turn on the processor and its own identity for permission checks. It cannot reach hardware itself — everything it needs comes back as an answer from the operating system.",
      };
    case SYS:
      return {
        eyebrow: "System calls",
        title: "The controlled doorway",
        body: "Open a file, allocate memory, send data on the network: each is a request through a defined interface into the operating system. Going through one doorway is what lets the system check, order and account for everything applications ask for.",
      };
    case SCHED:
      return {
        eyebrow: "CPU scheduling",
        title: "Taking turns, quickly",
        body: "A processor core runs one thing at a time. The operating system hands each process a short turn and then switches to the next. The turns are short enough that a browser, an editor and a background service all appear to run together.",
      };
    case MEM:
      return {
        eyebrow: "Memory management",
        title: "Each process gets its own map",
        body: "The operating system allocates memory to processes and maps what each one sees onto physical RAM. A process works inside its own region and is not free to read another process's memory, which keeps programs from disturbing each other.",
      };
    case PERM:
      return {
        eyebrow: "Permissions",
        title: "Who is allowed to do this",
        body: "Files, devices and system settings belong to users and are governed by rules. Before a request is carried out, the operating system checks the account and process behind it. A denial here is the reason an app sometimes simply cannot open a file.",
      };
    case FS:
      return {
        eyebrow: "Filesystem",
        title: "Names, folders and blocks",
        body: "Applications ask for a file by name. The operating system keeps the structure that turns that name into locations on a storage device, coordinates reads and writes, and keeps concurrent access from corrupting the result.",
      };
    case DEV:
      return {
        eyebrow: "Devices and drivers",
        title: "One translator per device",
        body: "Keyboards, screens, disks and network cards all differ. A driver translates the operating system's generic request into what a specific device understands, so applications can stay unaware of which hardware is actually installed.",
      };
    case HW_CPU:
      return {
        eyebrow: "Hardware · CPU",
        title: "The resource being shared",
        body: "The processor executes whatever instructions it is given. Deciding whose instructions those are at any moment is the scheduler's job, not the hardware's.",
      };
    case HW_RAM:
      return {
        eyebrow: "Hardware · RAM",
        title: "Physical memory behind the map",
        body: "Physical memory is one shared resource. The operating system divides it up and records which region belongs to which process, so the separation applications experience is real rather than a convention.",
      };
    case HW_STORE:
      return {
        eyebrow: "Hardware · storage",
        title: "Where files actually live",
        body: "A disk or SSD stores blocks, not files. Folders, names and permissions are structure the operating system maintains on top of those blocks through the filesystem.",
      };
    case HW_DEV:
      return {
        eyebrow: "Hardware · devices",
        title: "Input and output",
        body: "Key presses, pixels and network packets all move through devices. Every one of them is reached through a driver, which is why an application never has to know the model of the screen it draws on.",
      };
    case FLOW:
      return {
        eyebrow: "Opening a file",
        title: "One request, end to end",
        body: "The editor asks the operating system to open a file. Permissions are checked, the filesystem locates it on storage, the contents are placed in the editor's own memory, and the display driver puts the text on screen. The application did none of that itself.",
      };
    case CRASH:
      return {
        eyebrow: "Isolation",
        title: "One app can fail on its own",
        body: "Because each process has separate memory and its own turn on the processor, a program that crashes can usually be stopped and cleaned up while the rest of the system keeps running. Isolation is strong, not absolute — a fault in the core of the operating system or in a driver can still affect everything.",
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
  faint,
}: {
  path: string;
  dur: string;
  begin: string;
  color: string;
  faint?: boolean;
}) {
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
      aria-label="An operating system mediating between people and hardware. At the top a user works inside three applications — a browser, a text editor and a background service — each a separate process. Their requests pass through a single system call boundary into the operating system core, which holds five control surfaces: CPU scheduling, memory management, permissions, the filesystem and device drivers. Below the core sit the hardware resources: processor, physical memory, storage and input and output devices. An animated request follows one file being opened, from the editor through the permission check and filesystem to storage, into the process's memory and out to the display. A note at the top right explains that one application can fail while the operating system and other processes keep running."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 900 }}
    >
      <defs>
        <linearGradient id={`${uid}-os`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id={`${uid}-sys`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.16" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.08" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={USER_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 01 — THE COORDINATOR BETWEEN APPS AND HARDWARE
        </text>
        <text x={W - 44} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          ONE FILE, OPENED
        </text>
        <line x1={USER_X} y1={52} x2={W - 44} y2={52} stroke="var(--border)" strokeWidth={1} />
        <text x={USER_X} y={92} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          USER AND APPLICATIONS
        </text>
      </g>

      {/* user */}
      <g {...interactive(USER, "User — people work through applications, not the operating system directly")} opacity={op(USER)}>
        {card(USER, USER_X, TOP_Y, USER_W, TOP_H, "var(--cyan)", 24)}
        <text x={USER_X + 24} y={TOP_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          USER
        </text>
        <g aria-hidden="true" transform={`translate(${USER_X + 24} ${TOP_Y + 54})`}>
          <circle cx={18} cy={16} r={13} fill="none" stroke="var(--cyan)" strokeWidth={1.8} />
          <path d="M0 52c0-11 8-19 18-19s18 8 18 19" fill="none" stroke="var(--cyan)" strokeWidth={1.8} />
        </g>
        <text x={USER_X + 24} y={TOP_Y + 140} fontSize={13} fill="var(--muted-foreground)">
          You click and type
        </text>
        <text x={USER_X + 24} y={TOP_Y + 162} fontSize={13} fill="var(--muted-foreground)">
          inside applications.
        </text>
      </g>

      <g opacity={op(USER)} aria-hidden="true">
        <Flow d={pUser} on={on(USER)} color="var(--cyan)" />
      </g>

      {/* applications */}
      {appCards.map((a, i) => (
        <g key={a.key} {...interactive(a.key, `${a.title} — a running process asking the operating system for what it needs`)} opacity={op(a.key)}>
          {card(a.key, APP_X[i], TOP_Y, APP_W, TOP_H, a.tint, 22)}
          <g aria-hidden="true">
            <line x1={APP_X[i]} y1={TOP_Y + 44} x2={APP_X[i] + APP_W} y2={TOP_Y + 44} stroke="var(--border)" strokeWidth={1} />
            {[0, 1, 2].map((d) => (
              <circle key={d} cx={APP_X[i] + 24 + d * 18} cy={TOP_Y + 24} r={5} fill={`color-mix(in oklab, ${a.tint} ${40 + d * 12}%, transparent)`} />
            ))}
          </g>
          <text x={APP_X[i] + 24} y={TOP_Y + 82} fontSize={19} fontWeight={780} fill="var(--foreground)">
            {a.title}
          </text>
          <text x={APP_X[i] + 24} y={TOP_Y + 108} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            {a.sub}
          </text>
          <text x={APP_X[i] + 24} y={TOP_Y + 142} fontSize={12.5} fill="var(--muted-foreground)">
            Own memory, own turn
          </text>
          <text x={APP_X[i] + 24} y={TOP_Y + 162} fontSize={12.5} fill="var(--muted-foreground)">
            on the processor.
          </text>
        </g>
      ))}

      {/* crash / isolation note */}
      <g {...interactive(CRASH, "Isolation — one application can fail while the operating system keeps running")} opacity={op(CRASH)}>
        {card(CRASH, CRASH_X, TOP_Y, CRASH_W, TOP_H, "var(--ember)", 22)}
        <text x={CRASH_X + 24} y={TOP_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--ember)">
          ISOLATION
        </text>
        <text x={CRASH_X + 24} y={TOP_Y + 70} fontSize={17} fontWeight={760} fill="var(--foreground)">
          One app crashes
        </text>
        <text x={CRASH_X + 24} y={TOP_Y + 96} fontSize={17} fontWeight={760} fill="var(--foreground)">
          — the rest continue
        </text>
        <text x={CRASH_X + 24} y={TOP_Y + 128} fontSize={12.5} fill="var(--muted-foreground)">
          Separate memory and turns let
        </text>
        <text x={CRASH_X + 24} y={TOP_Y + 148} fontSize={12.5} fill="var(--muted-foreground)">
          the OS stop one process alone.
        </text>
        <text x={CRASH_X + 24} y={TOP_Y + 170} fontSize={12} fontFamily="var(--font-mono)" fill="var(--ember)">
          strong, not absolute
        </text>
      </g>

      {/* app → system call */}
      {appToSys.map((d, i) => (
        <g key={d} opacity={op(apps[i])} aria-hidden="true">
          <Flow d={d} on={on(apps[i]) || on(SYS)} color="var(--cyan)" />
        </g>
      ))}

      {/* system call band */}
      <g {...interactive(SYS, "System calls — the single controlled doorway into the operating system")} opacity={op(SYS)}>
        <rect
          x={SYS_X}
          y={SYS_Y}
          width={SYS_W}
          height={SYS_H}
          rx={18}
          fill={on(SYS) ? `url(#${uid}-sys)` : "var(--surface)"}
          stroke={on(SYS) ? "color-mix(in oklab, var(--cyan) 55%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(SYS) ? 2 : 1.2}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={SYS_X + 24} y={SYS_Y + 35} fontSize={13.5} fontWeight={720} fill="var(--foreground)">
          System calls
        </text>
        <text x={SYS_X + 160} y={SYS_Y + 35} fontSize={12.5} fill="var(--muted-foreground)">
          the only doorway — open · read · write · allocate · send
        </text>
        <text x={SYS_X + SYS_W - 24} y={SYS_Y + 35} textAnchor="end" fontSize={12} fontFamily="var(--font-mono)" fill="var(--cyan)">
          request in / answer out
        </text>
      </g>

      <g opacity={op(SYS)} aria-hidden="true">
        <Flow d={pSysCore} on={on(SYS)} color="var(--cyan)" />
      </g>

      {/* OS core */}
      <g aria-hidden="true">
        <rect
          x={OS_X}
          y={OS_Y}
          width={OS_W}
          height={OS_H}
          rx={34}
          fill={`url(#${uid}-os)`}
          stroke="color-mix(in oklab, var(--primary) 24%, transparent)"
        />
        <text x={OS_X + 32} y={OS_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          OPERATING SYSTEM CORE — KERNEL AND CORE SERVICES
        </text>
        <text x={OS_X + OS_W - 32} y={OS_Y + 42} textAnchor="end" fontSize={12.5} fill="var(--muted-foreground)">
          Manages the machine on everyone's behalf
        </text>
      </g>

      {/* permissions → filesystem */}
      <g opacity={op(PERM)} aria-hidden="true">
        <Flow d={pPermFs} on={on(PERM) || on(FS)} color="var(--ember)" dashed />
      </g>

      {/* core surfaces */}
      {coreCards.map((c, i) => (
        <g key={c.key} {...interactive(c.key, `${c.eyebrow.toLowerCase()} — ${c.title}`)} opacity={op(c.key)}>
          <rect
            x={CORE_X[i]}
            y={CORE_Y}
            width={CORE_W}
            height={CORE_H}
            rx={22}
            fill={on(c.key) ? `color-mix(in oklab, ${c.tint} 9%, var(--surface))` : "var(--surface)"}
            stroke={on(c.key) ? `color-mix(in oklab, ${c.tint} 55%, transparent)` : "var(--border-strong)"}
            strokeWidth={on(c.key) ? 2 : 1.2}
            filter={`url(#${uid}-lift)`}
            style={{ transition: "fill .3s ease, stroke .3s ease" }}
          />
          <text x={CORE_X[i] + 22} y={CORE_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--muted-foreground)">
            {c.eyebrow}
          </text>
          <text x={CORE_X[i] + 22} y={CORE_Y + 66} fontSize={17.5} fontWeight={770} fill="var(--foreground)">
            {c.title}
          </text>

          {/* motif */}
          {c.key === SCHED && (
            <g aria-hidden="true">
              {slices.map((s, j) => (
                <g key={s}>
                  <rect
                    x={CORE_X[i] + 22}
                    y={CORE_Y + 84 + j * 34}
                    width={CORE_W - 44}
                    height={28}
                    rx={9}
                    fill="color-mix(in oklab, var(--primary) 10%, var(--surface))"
                    stroke="color-mix(in oklab, var(--primary) 34%, transparent)"
                  >
                    <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" begin={`${j * 0.8}s`} repeatCount="indefinite" />
                  </rect>
                  <text x={CORE_X[i] + 36} y={CORE_Y + 103 + j * 34} fontSize={12.5} fill="var(--foreground)">
                    {s}
                  </text>
                  <text x={CORE_X[i] + CORE_W - 36} y={CORE_Y + 103 + j * 34} textAnchor="end" fontSize={12} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                    time slice
                  </text>
                </g>
              ))}
            </g>
          )}

          {c.key === MEM && (
            <g aria-hidden="true">
              {[
                { label: "Browser", tint: "var(--cyan)" },
                { label: "Editor", tint: "var(--primary)" },
                { label: "Service", tint: "var(--violet)" },
              ].map((m, j) => (
                <g key={m.label}>
                  <rect
                    x={CORE_X[i] + 22}
                    y={CORE_Y + 84 + j * 34}
                    width={CORE_W - 44}
                    height={28}
                    rx={9}
                    fill={`color-mix(in oklab, ${m.tint} 10%, var(--surface))`}
                    stroke={`color-mix(in oklab, ${m.tint} 36%, transparent)`}
                  />
                  <text x={CORE_X[i] + 36} y={CORE_Y + 103 + j * 34} fontSize={12.5} fill="var(--foreground)">
                    {m.label}
                  </text>
                  <text x={CORE_X[i] + CORE_W - 36} y={CORE_Y + 103 + j * 34} textAnchor="end" fontSize={12} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                    own region
                  </text>
                </g>
              ))}
            </g>
          )}

          {c.key === PERM && (
            <g aria-hidden="true">
              <rect
                x={CORE_X[i] + 22}
                y={CORE_Y + 84}
                width={CORE_W - 44}
                height={62}
                rx={12}
                fill="color-mix(in oklab, var(--ember) 8%, var(--surface))"
                stroke="color-mix(in oklab, var(--ember) 34%, transparent)"
              />
              <text x={CORE_X[i] + 36} y={CORE_Y + 110} fontSize={12.5} fill="var(--foreground)">
                user · process · resource
              </text>
              <text x={CORE_X[i] + 36} y={CORE_Y + 134} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--ember)">
                allow / deny
              </text>
            </g>
          )}

          {c.key === FS && (
            <g aria-hidden="true">
              {["/home/notes.txt", "name → blocks", "read · write · lock"].map((t, j) => (
                <g key={t}>
                  <rect
                    x={CORE_X[i] + 22}
                    y={CORE_Y + 84 + j * 34}
                    width={CORE_W - 44}
                    height={28}
                    rx={9}
                    fill="color-mix(in oklab, var(--violet) 9%, var(--surface))"
                    stroke="color-mix(in oklab, var(--violet) 32%, transparent)"
                  />
                  <text x={CORE_X[i] + 36} y={CORE_Y + 103 + j * 34} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--foreground)">
                    {t}
                  </text>
                </g>
              ))}
            </g>
          )}

          {c.key === DEV && (
            <g aria-hidden="true">
              {["Keyboard driver", "Display driver", "Disk · network driver"].map((t, j) => (
                <g key={t}>
                  <rect
                    x={CORE_X[i] + 22}
                    y={CORE_Y + 84 + j * 34}
                    width={CORE_W - 44}
                    height={28}
                    rx={9}
                    fill="color-mix(in oklab, var(--cyan) 9%, var(--surface))"
                    stroke="color-mix(in oklab, var(--cyan) 32%, transparent)"
                  />
                  <text x={CORE_X[i] + 36} y={CORE_Y + 103 + j * 34} fontSize={12.5} fill="var(--foreground)">
                    {t}
                  </text>
                </g>
              ))}
            </g>
          )}

          <text x={CORE_X[i] + 22} y={CORE_Y + 200} fontSize={12} fill="var(--muted-foreground)">
            {c.lines[0]}
          </text>
          <text x={CORE_X[i] + 22} y={CORE_Y + 220} fontSize={12} fill="var(--muted-foreground)">
            {c.lines[1]}
          </text>
        </g>
      ))}

      {/* core → hardware */}
      <g opacity={op(SCHED)} aria-hidden="true">
        <Flow d={pSchedCpu} on={on(SCHED) || on(HW_CPU)} color="var(--primary)" />
        <Token path={pSchedCpu} dur="2s" begin="0s" color="var(--primary)" faint />
      </g>
      <g opacity={op(MEM)} aria-hidden="true">
        <Flow d={pMemRam} on={on(MEM) || on(HW_RAM)} color="var(--cyan)" />
      </g>
      <g opacity={op(FS)} aria-hidden="true">
        <Flow d={pFsStore} on={on(FS) || on(HW_STORE)} color="var(--violet)" />
        <Token path={pFsStore} dur="1.8s" begin="1.4s" color="var(--violet)" />
      </g>
      <g opacity={op(DEV)} aria-hidden="true">
        <Flow d={pDevHw} on={on(DEV) || on(HW_DEV)} color="var(--cyan)" />
      </g>

      {/* hardware band */}
      <g aria-hidden="true">
        <rect
          x={OS_X}
          y={HW_Y}
          width={OS_W}
          height={HW_H}
          rx={30}
          fill="color-mix(in oklab, var(--foreground) 4%, transparent)"
          stroke="var(--border)"
        />
        <text x={OS_X + 32} y={HW_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          HARDWARE RESOURCES — SHARED BY EVERY PROCESS
        </text>
      </g>

      {chips.map((c, i) => (
        <g key={c.key} {...interactive(c.key, `${c.label} — ${c.sub}`)} opacity={op(c.key)}>
          {card(c.key, CHIP_X[i], CHIP_Y, CHIP_W, CHIP_H, "var(--primary)", 20)}
          <text x={CHIP_X[i] + 24} y={CHIP_Y + 46} fontSize={17} fontWeight={760} fill="var(--foreground)">
            {c.label}
          </text>
          <text x={CHIP_X[i] + 24} y={CHIP_Y + 78} fontSize={12.5} fill="var(--muted-foreground)">
            {c.sub}
          </text>
          <text x={CHIP_X[i] + 24} y={CHIP_Y + 102} fontSize={12} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            reached only through the OS
          </text>
        </g>
      ))}

      {/* storage → RAM */}
      <g opacity={op(FLOW)}>
        <Flow d={pStoreRam} on={on(FLOW) || on(HW_STORE) || on(HW_RAM)} color="var(--violet)" />
        <Token path={pStoreRam} dur="1.2s" begin="1.9s" color="var(--violet)" />
      </g>

      {/* open-file animated request */}
      <g opacity={op(FLOW)} aria-hidden="true">
        <Token path={pAppReq} dur="0.8s" begin="0s" color="var(--primary)" />
        <Flow d={pSysPerm} on={on(FLOW) || on(PERM)} color="var(--primary)" />
        <Token path={pSysPerm} dur="1s" begin="0.7s" color="var(--primary)" />
        <Flow d={pRenderUp} on={on(FLOW) || on(DEV)} color="var(--cyan)" dashed />
        <Token path={pRenderUp} dur="1.6s" begin="2.6s" color="var(--cyan)" />
      </g>

      {/* bottom rail — the open-file walkthrough */}
      <g {...interactive(FLOW, "Opening a file — one request followed from the application to storage and back to the screen")} opacity={op(FLOW)}>
        {card(FLOW, OS_X, RAIL_Y, OS_W, RAIL_H, "var(--primary)", 26)}
        <text x={OS_X + 28} y={RAIL_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          OPENING A FILE — ONE REQUEST, END TO END
        </text>
        {flowSteps.map((s, i) => (
          <g key={s} aria-hidden="true">
            <rect
              x={OS_X + 28 + i * 310}
              y={RAIL_Y + 52}
              width={290}
              height={62}
              rx={16}
              fill="color-mix(in oklab, var(--primary) 7%, transparent)"
              stroke="color-mix(in oklab, var(--primary) 30%, transparent)"
            />
            <text x={OS_X + 48 + i * 310} y={RAIL_Y + 78} fontSize={12} fontFamily="var(--font-mono)" fill="var(--primary)">
              {`0${i + 1}`}
            </text>
            <text x={OS_X + 48 + i * 310} y={RAIL_Y + 100} fontSize={13} fill="var(--foreground)">
              {s}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/* -------------------------------- mobile --------------------------------- */

function MobileStack({ activeKey, onToggle }: { activeKey: string | null; onToggle: (key: string) => void }) {
  const btn = "w-full rounded-3xl border bg-surface px-4 py-4 text-left";

  return (
    <div className="space-y-3 px-4 py-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">USER AND APPLICATIONS</p>

      <button type="button" onClick={() => onToggle(USER)} aria-expanded={activeKey === USER} className={`${btn} border-cyan/40 bg-cyan/5 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">USER</span>
        <span className="mt-1 block text-[16px] font-extrabold">You work through applications</span>
        <span className="block text-[12.5px] text-muted-foreground">Almost nothing goes straight to the operating system.</span>
      </button>

      {appCards.map((a) => (
        <button key={a.key} type="button" onClick={() => onToggle(a.key)} aria-expanded={activeKey === a.key} className={`${btn} border-primary/35`}>
          <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">{a.sub}</span>
          <span className="mt-1 block text-[15.5px] font-bold">{a.title}</span>
          <span className="block text-[12.5px] text-muted-foreground">A process with its own memory and its own turn on the processor.</span>
        </button>
      ))}

      <button type="button" onClick={() => onToggle(SYS)} aria-expanded={activeKey === SYS} className={`${btn} border-cyan/45 bg-cyan/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">SYSTEM CALLS</span>
        <span className="mt-1 block text-[15.5px] font-bold">The only doorway</span>
        <span className="block text-[12.5px] text-muted-foreground">open · read · write · allocate · send</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">OPERATING SYSTEM CORE</p>

      {coreCards.map((c) => (
        <button key={c.key} type="button" onClick={() => onToggle(c.key)} aria-expanded={activeKey === c.key} className={`${btn} border-border shadow-soft`}>
          <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">{c.eyebrow}</span>
          <span className="mt-1 block text-[15.5px] font-bold">{c.title}</span>
          <span className="block text-[12.5px] text-muted-foreground">{`${c.lines[0]} ${c.lines[1]}`}</span>
        </button>
      ))}

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">HARDWARE RESOURCES</p>

      {chips.map((c) => (
        <button key={c.key} type="button" onClick={() => onToggle(c.key)} aria-expanded={activeKey === c.key} className={`${btn} border-border`}>
          <span className="block text-[15px] font-bold">{c.label}</span>
          <span className="block text-[12.5px] text-muted-foreground">{c.sub} — reached only through the OS.</span>
        </button>
      ))}

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">OPENING A FILE</p>

      <button type="button" onClick={() => onToggle(FLOW)} aria-expanded={activeKey === FLOW} className={`${btn} border-primary/45`}>
        <span className="block text-[15.5px] font-bold">One request, end to end</span>
        <span className="mt-1.5 block space-y-1">
          {flowSteps.map((s, i) => (
            <span key={s} className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-2.5 py-2">
              <span className="font-mono text-[11px] text-primary">{`0${i + 1}`}</span>
              <span className="text-[13px] font-semibold">{s}</span>
            </span>
          ))}
        </span>
      </button>

      <button type="button" onClick={() => onToggle(CRASH)} aria-expanded={activeKey === CRASH} className={`${btn} border-ember/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-ember">ISOLATION</span>
        <span className="mt-1 block text-[15.5px] font-bold">One app crashes — the rest continue</span>
        <span className="block text-[12.5px] text-muted-foreground">Separate memory and turns let the OS stop one process alone. Strong, not absolute.</span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function OperatingSystemDiagram() {
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
              Apps · operating system · hardware
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Requests and answers", color: "var(--cyan)" },
              { label: "Scheduling and memory", color: "var(--primary)" },
              { label: "Files and storage", color: "var(--violet)" },
              { label: "Permission check", color: "var(--ember)" },
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
        Applications never touch hardware directly. Every request passes through the operating system, which
        decides who runs next, which memory belongs to whom, whether the access is allowed, where the file
        lives and which driver speaks to the device.
      </figcaption>
      <StageHint text="Hover an application, a control surface, a hardware resource or the open-file walkthrough to isolate its path; click any part for a short explanation." />
    </figure>
  );
}
