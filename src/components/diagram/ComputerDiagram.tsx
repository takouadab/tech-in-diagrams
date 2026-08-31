import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const INPUT = "input";
const PROG = "prog";
const RAM = "ram";
const CPU = "cpu";
const BUS = "bus";
const STORE = "store";
const OUT = "out";
const CMP = "cmp";
const POWER = "power";

const related: Record<string, string[]> = {
  [INPUT]: [RAM, BUS],
  [PROG]: [RAM, CPU],
  [RAM]: [INPUT, CPU, STORE, BUS, PROG, CMP, POWER],
  [CPU]: [RAM, PROG, OUT, BUS],
  [BUS]: [RAM, CPU, STORE, INPUT, OUT],
  [STORE]: [RAM, BUS, CMP, POWER],
  [OUT]: [CPU],
  [CMP]: [RAM, STORE],
  [POWER]: [RAM, STORE],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1660;
const H = 990;

/* left column */
const L_X = 40;
const L_W = 240;
const IN_Y = 200;
const IN_H = 190;
const PR_Y = 440;
const PR_H = 170;

/* chassis */
const CH_X = 320;
const CH_Y = 120;
const CH_W = 860;
const CH_H = 600;

const RAM_X = 356;
const RAM_Y = 210;
const RAM_W = 270;
const RAM_H = 210;

const CPU_X = 700;
const CPU_Y = 190;
const CPU_W = 290;
const CPU_H = 250;

const BUS_X = 356;
const BUS_Y = 556;
const BUS_W = 788;
const BUS_H = 112;

/* right column */
const R_X = 1240;
const R_W = 340;
const OUT_Y = 180;
const OUT_H = 200;
const ST_Y = 430;
const ST_H = 230;

/* bottom rail */
const RAIL_Y = 800;
const RAIL_H = 150;
const CMP_X = 320;
const CMP_W = 560;
const PW_X = 920;
const PW_W = 440;

const cycle = [
  { label: "Fetch", note: "next instruction" },
  { label: "Decode", note: "what it means" },
  { label: "Execute", note: "do it" },
] as const;

const ramCells = [
  "Photo being opened",
  "App instructions",
  "Scratch results",
] as const;

/* paths */
const pIn = `M ${L_X + L_W} 292 C 314 292, 320 300, ${RAM_X} 300`;
const pProg = `M ${L_X + L_W} 512 C 330 512, 380 470, 452 ${RAM_Y + RAM_H}`;
const pRamCpu = `M ${RAM_X + RAM_W} 296 L ${CPU_X} 296`;
const pCpuRam = `M ${CPU_X} 372 L ${RAM_X + RAM_W} 372`;
const pCpuOut = `M ${CPU_X + CPU_W} 258 C 1090 258, 1140 248, ${R_X} 258`;
const pStoreRam = `M ${R_X} 528 C 1200 528, 1188 600, ${BUS_X + BUS_W} 600`;
const pRamStore = `M ${BUS_X + BUS_W} 626 C 1190 626, 1204 566, ${R_X} 566`;
const pRamBus = `M 470 ${RAM_Y + RAM_H} L 470 ${BUS_Y}`;
const pCpuBus = `M 845 ${CPU_Y + CPU_H} L 845 ${BUS_Y}`;
const busLanes = [
  `M ${BUS_X + 40} ${BUS_Y + 74} L ${BUS_X + BUS_W - 40} ${BUS_Y + 74}`,
  `M ${BUS_X + BUS_W - 40} ${BUS_Y + 94} L ${BUS_X + 40} ${BUS_Y + 94}`,
];

/* --------------------------------- copy ---------------------------------- */

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case INPUT:
      return {
        eyebrow: "Input",
        title: "Information enters the machine",
        body: "A key press, a tap, a click on a photo, a file arriving — every one of them turns a real-world action into data the machine can hold. Until something arrives as input, the computer has nothing to work on.",
      };
    case PROG:
      return {
        eyebrow: "Instructions",
        title: "A program tells the hardware what to do",
        body: "Hardware does not decide anything on its own. A program is a stored list of instructions; loading it into memory is what turns the same machine into a photo viewer one moment and a text editor the next.",
      };
    case RAM:
      return {
        eyebrow: "Memory (RAM)",
        title: "The working desk",
        body: "RAM holds whatever is being used right now: the photo you opened, the instructions of the app that opened it, and the half-finished results in between. It is working space, not a place to keep things — it holds data only while the machine has power.",
      };
    case CPU:
      return {
        eyebrow: "Processor",
        title: "Fetch, decode, execute — over and over",
        body: "The CPU takes one instruction from memory, works out what it means, carries it out, and moves to the next. That small loop, repeated an enormous number of times, is what we experience as a photo opening or a message appearing.",
      };
    case BUS:
      return {
        eyebrow: "Interconnect",
        title: "How the parts reach each other",
        body: "The motherboard and its buses are the shared roads between components. Data travels along them as electrical signals standing for ones and zeros, so the CPU, memory, storage and devices can hand work to each other.",
      };
    case STORE:
      return {
        eyebrow: "Storage",
        title: "Where things stay",
        body: "An SSD or hard disk keeps files, applications and settings whether the machine is on or off. Opening something copies it from storage into memory; saving writes the current version back so it survives the next shutdown.",
      };
    case OUT:
      return {
        eyebrow: "Output",
        title: "The result leaves the machine",
        body: "Processed data becomes something a person or another device can use: pixels on a screen, sound, a printed page, a saved file. Input, processing and output are the same cycle in a phone, a laptop or a rack machine.",
      };
    case CMP:
      return {
        eyebrow: "Memory vs storage",
        title: "Two different jobs, often confused",
        body: "Memory is the desk you work on; storage is the drawer you keep things in. Memory is where active data lives while the machine runs; storage is where data persists. They are measured in the same units, which is exactly why they get mixed up.",
      };
    case POWER:
      return {
        eyebrow: "Power off",
        title: "One clears, one keeps",
        body: "Cut the power and whatever was in memory is gone — that is why unsaved work disappears. Anything written to storage is still there when the machine starts again, which is what saving actually means.",
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
    <g opacity={faint ? 0.38 : 1}>
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
      aria-label="A cutaway of a computer. On the left, input from a keyboard and an opened photo, with a program of instructions below it. In the centre a system board contains memory holding the active data and instructions, and a processor repeating a fetch, decode and execute cycle, joined by an interconnect bus carrying signals between components. On the right, storage keeps files when the power is off and exchanges data with memory, while the screen shows the finished output. A bottom rail compares memory with storage and notes that when power is cut, memory clears while storage keeps its files."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 880 }}
    >
      <defs>
        <linearGradient id={`${uid}-board`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.11" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id={`${uid}-bus`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.06" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={L_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 01 — INPUT, PROCESS, STORE, OUTPUT
        </text>
        <text x={W - 44} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          ONE ACTION, END TO END
        </text>
        <line x1={L_X} y1={52} x2={W - 44} y2={52} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* -------------------------------- input ------------------------------- */}
      <g opacity={op(INPUT)}>
        <text x={L_X} y={168} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)" aria-hidden="true">
          INPUT
        </text>
        <g {...interactive(INPUT, "Input — a key press or opening a photo brings data into the machine")}>
          {card(INPUT, L_X, IN_Y, L_W, IN_H, "var(--cyan)", 24)}
          <text x={L_X + 24} y={IN_Y + 48} fontSize={19} fontWeight={780} fill="var(--foreground)">
            You open a photo
          </text>
          <g aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <rect
                key={i}
                x={L_X + 24 + (i % 4) * 30}
                y={IN_Y + 70 + Math.floor(i / 4) * 30}
                width={24}
                height={24}
                rx={7}
                fill="color-mix(in oklab, var(--cyan) 12%, var(--surface))"
                stroke="color-mix(in oklab, var(--cyan) 38%, transparent)"
              />
            ))}
          </g>
          <text x={L_X + 24} y={IN_Y + 158} fontSize={12.5} fill="var(--muted-foreground)">
            Keyboard, touch, a click
          </text>
          <text x={L_X + 24} y={IN_Y + 178} fontSize={12.5} fill="var(--muted-foreground)">
            all arrive as data
          </text>
        </g>
      </g>

      {/* ---------------------------- instructions ---------------------------- */}
      <g {...interactive(PROG, "Instructions — the program that guides the hardware")} opacity={op(PROG)}>
        {card(PROG, L_X, PR_Y, L_W, PR_H, "var(--violet)", 24)}
        <text x={L_X + 24} y={PR_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          INSTRUCTIONS
        </text>
        <text x={L_X + 24} y={PR_Y + 70} fontSize={18} fontWeight={760} fill="var(--foreground)">
          The program
        </text>
        <text x={L_X + 24} y={PR_Y + 100} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--violet)">
          load · read · draw
        </text>
        <text x={L_X + 24} y={PR_Y + 130} fontSize={12.5} fill="var(--muted-foreground)">
          Software decides what
        </text>
        <text x={L_X + 24} y={PR_Y + 150} fontSize={12.5} fill="var(--muted-foreground)">
          the hardware does next
        </text>
      </g>

      {/* ------------------------------- chassis ------------------------------ */}
      <g aria-hidden="true">
        <rect
          x={CH_X}
          y={CH_Y}
          width={CH_W}
          height={CH_H}
          rx={34}
          fill={`url(#${uid}-board)`}
          stroke="color-mix(in oklab, var(--primary) 22%, transparent)"
        />
        <text x={CH_X + 32} y={CH_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          THE MACHINE — CUTAWAY
        </text>
        <text x={CH_X + CH_W - 32} y={CH_Y + 42} textAnchor="end" fontSize={12.5} fill="var(--muted-foreground)">
          Coordinated parts, different roles
        </text>
      </g>

      {/* input → memory */}
      <g opacity={op(INPUT)}>
        <Flow d={pIn} on={on(INPUT) || on(RAM)} color="var(--cyan)" />
        <Token path={pIn} dur="1.5s" begin="0s" color="var(--cyan)" />
      </g>

      {/* program → memory */}
      <g opacity={op(PROG)}>
        <Flow d={pProg} on={on(PROG) || on(RAM)} color="var(--violet)" dashed />
        <Token path={pProg} dur="1.8s" begin="0.3s" color="var(--violet)" faint />
      </g>

      {/* -------------------------------- RAM --------------------------------- */}
      <g {...interactive(RAM, "Memory — holds the data and instructions currently in use")} opacity={op(RAM)}>
        <rect
          x={RAM_X}
          y={RAM_Y}
          width={RAM_W}
          height={RAM_H}
          rx={22}
          fill={on(RAM) ? "color-mix(in oklab, var(--cyan) 9%, var(--surface))" : "var(--surface)"}
          stroke={on(RAM) ? "color-mix(in oklab, var(--cyan) 55%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(RAM) ? 2 : 1.2}
          filter={`url(#${uid}-lift)`}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={RAM_X + 24} y={RAM_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          WORKING MEMORY
        </text>
        <text x={RAM_X + 24} y={RAM_Y + 70} fontSize={19} fontWeight={780} fill="var(--foreground)">
          RAM
        </text>
        <text x={RAM_X + 84} y={RAM_Y + 70} fontSize={13} fill="var(--muted-foreground)">
          — in use right now
        </text>
        {ramCells.map((c, i) => (
          <g key={c} aria-hidden="true">
            <rect
              x={RAM_X + 24}
              y={RAM_Y + 88 + i * 34}
              width={RAM_W - 48}
              height={28}
              rx={9}
              fill="color-mix(in oklab, var(--cyan) 10%, var(--surface))"
              stroke="color-mix(in oklab, var(--cyan) 34%, transparent)"
            />
            <text x={RAM_X + 38} y={RAM_Y + 107 + i * 34} fontSize={12.5} fill="var(--foreground)">
              {c}
            </text>
          </g>
        ))}
        <text x={RAM_X + 24} y={RAM_Y + 198} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--cyan)">
          cleared on power off
        </text>
      </g>

      {/* RAM ↔ CPU */}
      <g opacity={op(CPU)}>
        <Flow d={pRamCpu} on={on(CPU) || on(RAM)} color="var(--primary)" />
        <Token path={pRamCpu} dur="1s" begin="0.6s" color="var(--primary)" />
        <Flow d={pCpuRam} on={on(CPU) || on(RAM)} color="var(--primary)" dashed />
        <text x={(RAM_X + RAM_W + CPU_X) / 2} y={282} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)" aria-hidden="true">
          read
        </text>
        <text x={(RAM_X + RAM_W + CPU_X) / 2} y={396} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)" aria-hidden="true">
          write
        </text>
      </g>

      {/* -------------------------------- CPU --------------------------------- */}
      <g {...interactive(CPU, "Processor — repeats fetch, decode and execute on instructions")} opacity={op(CPU)}>
        <rect
          x={CPU_X}
          y={CPU_Y}
          width={CPU_W}
          height={CPU_H}
          rx={24}
          fill={on(CPU) ? "color-mix(in oklab, var(--primary) 9%, var(--surface))" : "var(--surface)"}
          stroke={on(CPU) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(CPU) ? 2 : 1.2}
          filter={`url(#${uid}-lift)`}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={CPU_X + 26} y={CPU_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          PROCESSOR
        </text>
        <text x={CPU_X + 26} y={CPU_Y + 74} fontSize={20} fontWeight={800} fill="var(--foreground)">
          CPU
        </text>
        <text x={CPU_X + 92} y={CPU_Y + 74} fontSize={13} fill="var(--muted-foreground)">
          executes instructions
        </text>
        {cycle.map((c, i) => (
          <g key={c.label} aria-hidden="true">
            <rect
              x={CPU_X + 26}
              y={CPU_Y + 94 + i * 46}
              width={CPU_W - 52}
              height={38}
              rx={12}
              fill="color-mix(in oklab, var(--primary) 8%, var(--surface))"
              stroke="color-mix(in oklab, var(--primary) 36%, transparent)"
            >
              <animate
                attributeName="opacity"
                values="0.45;1;0.45"
                dur="2.4s"
                begin={`${i * 0.8}s`}
                repeatCount="indefinite"
              />
            </rect>
            <text x={CPU_X + 44} y={CPU_Y + 119 + i * 46} fontSize={14.5} fontWeight={720} fill="var(--foreground)">
              {c.label}
            </text>
            <text x={CPU_X + CPU_W - 44} y={CPU_Y + 119 + i * 46} textAnchor="end" fontSize={12} fill="var(--muted-foreground)">
              {c.note}
            </text>
          </g>
        ))}
      </g>

      {/* ----------------------------- interconnect --------------------------- */}
      <g {...interactive(BUS, "Interconnect — the buses carrying signals between components")} opacity={op(BUS)}>
        <rect
          x={BUS_X}
          y={BUS_Y}
          width={BUS_W}
          height={BUS_H}
          rx={24}
          fill={on(BUS) ? `url(#${uid}-bus)` : "var(--surface)"}
          stroke={on(BUS) ? "color-mix(in oklab, var(--cyan) 50%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(BUS) ? 2 : 1.2}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <text x={BUS_X + 26} y={BUS_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          MOTHERBOARD · BUS — HOW THE PARTS EXCHANGE DATA
        </text>
        <text x={BUS_X + BUS_W - 26} y={BUS_Y + 34} textAnchor="end" fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--cyan)">
          0100 1101
        </text>
        {busLanes.map((d, i) => (
          <g key={d}>
            <path d={d} fill="none" stroke="color-mix(in oklab, var(--cyan) 30%, transparent)" strokeWidth={1.6} strokeLinecap="round" />
            <Token path={d} dur="2.2s" begin={`${i * 0.7}s`} color="var(--cyan)" faint />
            <Token path={d} dur="2.2s" begin={`${1.1 + i * 0.7}s`} color="var(--cyan)" faint />
          </g>
        ))}
      </g>

      {/* --------------------------- storage ↔ memory ------------------------- */}
      <g opacity={op(STORE)}>
        <Flow d={pStoreRam} on={on(STORE) || on(RAM)} color="var(--violet)" />
        <Flow d={pRamStore} on={on(STORE) || on(RAM)} color="var(--violet)" dashed />
        <Token path={pStoreRam} dur="2.4s" begin="0.2s" color="var(--violet)" />
      </g>

      {/* memory and processor onto the shared bus */}
      <g opacity={op(BUS)} aria-hidden="true">
        <Flow d={pRamBus} on={on(BUS) || on(RAM)} color="var(--cyan)" />
        <Flow d={pCpuBus} on={on(BUS) || on(CPU)} color="var(--cyan)" />
      </g>

      <g {...interactive(STORE, "Storage — keeps files and programs when the power is off")} opacity={op(STORE)}>
        {card(STORE, R_X, ST_Y, R_W, ST_H, "var(--violet)", 24)}
        <text x={R_X + 26} y={ST_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          PERSISTENT STORAGE
        </text>
        <g aria-hidden="true" transform={`translate(${R_X + 26} ${ST_Y + 52})`}>
          <ellipse cx={17} cy={9} rx={17} ry={6} fill="none" stroke="var(--violet)" strokeWidth={1.6} />
          <path d="M0 9v30c0 3.5 7.6 6 17 6s17-2.5 17-6V9" fill="none" stroke="var(--violet)" strokeWidth={1.6} />
          <path d="M0 24c0 3.5 7.6 6 17 6s17-2.5 17-6" fill="none" stroke="var(--violet)" strokeWidth={1.6} />
        </g>
        <text x={R_X + 84} y={ST_Y + 80} fontSize={19} fontWeight={780} fill="var(--foreground)">
          Storage
        </text>
        <text x={R_X + 26} y={ST_Y + 128} fontSize={13} fill="var(--muted-foreground)">
          Files, apps and settings stay
        </text>
        <text x={R_X + 26} y={ST_Y + 150} fontSize={13} fill="var(--muted-foreground)">
          here whether the machine is
        </text>
        <text x={R_X + 26} y={ST_Y + 172} fontSize={13} fill="var(--muted-foreground)">
          on or off.
        </text>
        <text x={R_X + 26} y={ST_Y + 204} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--violet)">
          open = copy into RAM
        </text>
      </g>

      {/* -------------------------------- output ------------------------------ */}
      <g opacity={op(OUT)}>
        <Flow d={pCpuOut} on={on(OUT) || on(CPU)} color="var(--cyan)" />
        <Token path={pCpuOut} dur="1.6s" begin="1.1s" color="var(--cyan)" />
      </g>

      <g {...interactive(OUT, "Output — the finished result appears on screen")} opacity={op(OUT)}>
        {card(OUT, R_X, OUT_Y, R_W, OUT_H, "var(--cyan)", 24)}
        <text x={R_X + 26} y={OUT_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          OUTPUT
        </text>
        <text x={R_X + 26} y={OUT_Y + 72} fontSize={19} fontWeight={780} fill="var(--foreground)">
          The photo appears
        </text>
        <g aria-hidden="true">
          <rect
            x={R_X + 26}
            y={OUT_Y + 90}
            width={R_W - 52}
            height={62}
            rx={12}
            fill="color-mix(in oklab, var(--cyan) 10%, var(--surface))"
            stroke="color-mix(in oklab, var(--cyan) 36%, transparent)"
          />
          <circle cx={R_X + 62} cy={OUT_Y + 118} r={9} fill="color-mix(in oklab, var(--cyan) 40%, transparent)" />
          <path
            d={`M ${R_X + 44} ${OUT_Y + 142} L ${R_X + 94} ${OUT_Y + 108} L ${R_X + 140} ${OUT_Y + 142} Z`}
            fill="color-mix(in oklab, var(--primary) 28%, transparent)"
          />
        </g>
        <text x={R_X + 26} y={OUT_Y + 178} fontSize={12.5} fill="var(--muted-foreground)">
          Pixels, sound, a saved file
        </text>
      </g>

      {/* ----------------------------- bottom rail ---------------------------- */}
      <g {...interactive(CMP, "Memory versus storage — temporary working space versus persistent files")} opacity={op(CMP)}>
        {card(CMP, CMP_X, RAIL_Y, CMP_W, RAIL_H, "var(--primary)", 24)}
        <text x={CMP_X + 26} y={RAIL_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          RAM VS STORAGE
        </text>
        <g aria-hidden="true">
          <rect
            x={CMP_X + 24}
            y={RAIL_Y + 52}
            width={244}
            height={76}
            rx={16}
            fill="color-mix(in oklab, var(--cyan) 8%, transparent)"
            stroke="color-mix(in oklab, var(--cyan) 32%, transparent)"
          />
          <text x={CMP_X + 44} y={RAIL_Y + 80} fontSize={15.5} fontWeight={720} fill="var(--foreground)">
            RAM
          </text>
          <text x={CMP_X + 44} y={RAIL_Y + 106} fontSize={12.5} fill="var(--muted-foreground)">
            Working space · temporary
          </text>
          <rect
            x={CMP_X + 292}
            y={RAIL_Y + 52}
            width={244}
            height={76}
            rx={16}
            fill="color-mix(in oklab, var(--violet) 8%, transparent)"
            stroke="color-mix(in oklab, var(--violet) 32%, transparent)"
          />
          <text x={CMP_X + 312} y={RAIL_Y + 80} fontSize={15.5} fontWeight={720} fill="var(--foreground)">
            Storage
          </text>
          <text x={CMP_X + 312} y={RAIL_Y + 106} fontSize={12.5} fill="var(--muted-foreground)">
            Kept space · persistent
          </text>
        </g>
      </g>

      <g {...interactive(POWER, "Power off — memory clears while storage keeps its files")} opacity={op(POWER)}>
        {card(POWER, PW_X, RAIL_Y, PW_W, RAIL_H, "var(--ember)", 24)}
        <text x={PW_X + 26} y={RAIL_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--ember)">
          POWER OFF
        </text>
        <text x={PW_X + 26} y={RAIL_Y + 72} fontSize={17.5} fontWeight={760} fill="var(--foreground)">
          RAM clears · storage keeps files
        </text>
        <text x={PW_X + 26} y={RAIL_Y + 104} fontSize={12.5} fill="var(--muted-foreground)">
          Unsaved work lived only in memory.
        </text>
        <text x={PW_X + 26} y={RAIL_Y + 126} fontSize={12.5} fill="var(--muted-foreground)">
          Saving is what writes it to storage.
        </text>
      </g>

      <text x={L_X} y={RAIL_Y + 66} fontSize={13} fill="var(--muted-foreground)" aria-hidden="true">
        Each part has one job.
      </text>
      <text x={L_X} y={RAIL_Y + 88} fontSize={13} fill="var(--muted-foreground)" aria-hidden="true">
        A computer is those parts
      </text>
      <text x={L_X} y={RAIL_Y + 110} fontSize={13} fill="var(--muted-foreground)" aria-hidden="true">
        working together.
      </text>
    </svg>
  );
}

/* -------------------------------- mobile --------------------------------- */

function MobileStack({ activeKey, onToggle }: { activeKey: string | null; onToggle: (key: string) => void }) {
  const btn = "w-full rounded-3xl border bg-surface px-4 py-4 text-left";

  return (
    <div className="space-y-3 px-4 py-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">ONE ACTION, END TO END</p>

      <button type="button" onClick={() => onToggle(INPUT)} aria-expanded={activeKey === INPUT} className={`${btn} border-cyan/45 bg-cyan/5 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">INPUT</span>
        <span className="mt-1 block text-[16.5px] font-extrabold">You open a photo</span>
        <span className="block text-[12.5px] text-muted-foreground">A key press, tap or click arrives as data the machine can hold.</span>
      </button>

      <button type="button" onClick={() => onToggle(RAM)} aria-expanded={activeKey === RAM} className={`${btn} border-cyan/40 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">WORKING MEMORY</span>
        <span className="mt-1 block text-[16.5px] font-extrabold">RAM — in use right now</span>
        <span className="mt-1.5 block space-y-1">
          {ramCells.map((c) => (
            <span key={c} className="block rounded-xl border border-cyan/25 bg-cyan/5 px-2.5 py-2 text-[13px] font-semibold">
              {c}
            </span>
          ))}
        </span>
        <span className="mt-2 block text-[12.5px] text-muted-foreground">Holds active data and instructions only while the machine has power.</span>
      </button>

      <button type="button" onClick={() => onToggle(CPU)} aria-expanded={activeKey === CPU} className={`${btn} border-primary/45`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">PROCESSOR</span>
        <span className="mt-1 block text-[16.5px] font-extrabold">CPU</span>
        <span className="mt-1.5 block space-y-1">
          {cycle.map((c) => (
            <span key={c.label} className="flex items-center justify-between rounded-xl border border-primary/25 bg-primary/5 px-2.5 py-2">
              <span className="text-[13px] font-semibold">{c.label}</span>
              <span className="text-[11.5px] text-muted-foreground">{c.note}</span>
            </span>
          ))}
        </span>
      </button>

      <button type="button" onClick={() => onToggle(PROG)} aria-expanded={activeKey === PROG} className={`${btn} border-violet/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">INSTRUCTIONS</span>
        <span className="mt-1 block text-[15.5px] font-bold">The program</span>
        <span className="block text-[12.5px] text-muted-foreground">Software decides what the hardware does next.</span>
      </button>

      <button type="button" onClick={() => onToggle(BUS)} aria-expanded={activeKey === BUS} className={`${btn} border-cyan/30`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">MOTHERBOARD · BUS</span>
        <span className="mt-1 block text-[15.5px] font-bold">How the parts exchange data</span>
        <span className="block text-[12.5px] text-muted-foreground">Signals standing for ones and zeros travel between components.</span>
      </button>

      <button type="button" onClick={() => onToggle(STORE)} aria-expanded={activeKey === STORE} className={`${btn} border-violet/45`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">PERSISTENT STORAGE</span>
        <span className="mt-1 block text-[16.5px] font-extrabold">Storage</span>
        <span className="block text-[12.5px] text-muted-foreground">Opening a file copies it into RAM; saving writes it back here.</span>
      </button>

      <button type="button" onClick={() => onToggle(OUT)} aria-expanded={activeKey === OUT} className={`${btn} border-cyan/40 bg-cyan/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">OUTPUT</span>
        <span className="mt-1 block text-[15.5px] font-bold">The photo appears</span>
        <span className="block text-[12.5px] text-muted-foreground">Pixels on screen, sound, or a saved file.</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">THE PART PEOPLE MIX UP</p>

      <button type="button" onClick={() => onToggle(CMP)} aria-expanded={activeKey === CMP} className={`${btn} border-primary/35`}>
        <span className="block text-[15.5px] font-bold">RAM vs storage</span>
        <span className="mt-1.5 block space-y-1">
          <span className="flex items-center justify-between rounded-xl border border-cyan/25 bg-cyan/5 px-2.5 py-2">
            <span className="text-[13px] font-semibold">RAM</span>
            <span className="text-[11.5px] text-muted-foreground">Working space · temporary</span>
          </span>
          <span className="flex items-center justify-between rounded-xl border border-violet/25 bg-violet/5 px-2.5 py-2">
            <span className="text-[13px] font-semibold">Storage</span>
            <span className="text-[11.5px] text-muted-foreground">Kept space · persistent</span>
          </span>
        </span>
      </button>

      <button type="button" onClick={() => onToggle(POWER)} aria-expanded={activeKey === POWER} className={`${btn} border-ember/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-ember">POWER OFF</span>
        <span className="mt-1 block text-[15.5px] font-bold">RAM clears · storage keeps files</span>
        <span className="block text-[12.5px] text-muted-foreground">Unsaved work lived only in memory; saving writes it to storage.</span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function ComputerDiagram() {
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
              Input · process · store · output
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Data in / out", color: "var(--cyan)" },
              { label: "Processing", color: "var(--primary)" },
              { label: "Instructions / files", color: "var(--violet)" },
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
        One action followed all the way through: input arrives, memory holds what is active, the processor
        works through instructions, storage keeps what must survive the power going off, and the result
        leaves as output.
      </figcaption>
      <StageHint text="Hover input, memory, the processor, the bus or storage to isolate its path; click any component for a short explanation." />
    </figure>
  );
}
