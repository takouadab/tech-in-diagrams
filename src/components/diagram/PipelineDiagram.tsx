import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* -------------------------------- model --------------------------------- */

interface Station {
  id: string;
  index: string;
  label: string;
  sub: string;
  meta: string;
  detail: string;
  /** does the immutable artifact exist at this station? */
  carriesArtifact: boolean;
}

const stations: Station[] = [
  {
    id: "commit",
    index: "01",
    label: "Commit",
    sub: "Change pushed",
    meta: "git push · trigger",
    detail:
      "A developer pushes a change to the shared branch. The pipeline starts automatically — nobody has to remember to run it, which is what makes integration continuous.",
    carriesArtifact: false,
  },
  {
    id: "build",
    index: "02",
    label: "Build",
    sub: "Compile & package",
    meta: "one artifact produced",
    detail:
      "The source is compiled and packaged exactly once. Everything downstream promotes that same immutable artifact, so what you tested is byte-for-byte what you release.",
    carriesArtifact: true,
  },
  {
    id: "test",
    index: "03",
    label: "Test",
    sub: "Automated checks",
    meta: "unit · integration",
    detail:
      "Unit, integration and security checks run against the artifact. This is the gate that protects everything after it: if a check fails, the pipeline stops here and nothing is promoted.",
    carriesArtifact: true,
  },
  {
    id: "stage",
    index: "04",
    label: "Staging",
    sub: "Production-like",
    meta: "rehearsal environment",
    detail:
      "The artifact is deployed to a rehearsal environment that mirrors production — same configuration shape, same dependencies — for final verification before real users are involved.",
    carriesArtifact: true,
  },
  {
    id: "prod",
    index: "05",
    label: "Production",
    sub: "Released to users",
    meta: "gradual rollout",
    detail:
      "The very same artifact is promoted to production, usually gradually: a small slice of traffic first, then wider, so a problem is caught while its blast radius is still small.",
    carriesArtifact: true,
  },
];

interface Gate {
  id: string;
  after: number;
  label: string;
  detail: string;
}

const gates: Gate[] = [
  {
    id: "gate-build",
    after: 1,
    label: "Build passes",
    detail:
      "The package must build cleanly before anything is tested. A broken build never becomes an artifact, so it can never be promoted.",
  },
  {
    id: "gate-test",
    after: 2,
    label: "Checks pass",
    detail:
      "The quality gate. All automated checks must pass before the artifact may reach staging — a failure stops the pipeline and sends feedback straight back to the developer.",
  },
  {
    id: "gate-stage",
    after: 3,
    label: "Verified",
    detail:
      "Verification in the rehearsal environment is the last gate. Only after it passes is the identical artifact promoted to production.",
  },
];

const FAIL_KEY = "fail";
const ARTIFACT_KEY = "artifact";

/* ------------------------------- geometry ------------------------------- */

const W = 1600;
const H = 672;

const DEV_X = 44;
const DEV_Y = 296;
const DEV_W = 250;
const DEV_H = 148;

const ST_W = 212;
const ST_H = 168;
const ST_GAP = 38;
const ST_X = 372;
const ST_Y = 286;

const stX = (i: number) => ST_X + i * (ST_W + ST_GAP);
const stMidX = (i: number) => stX(i) + ST_W / 2;
const TRACK_Y = ST_Y + ST_H / 2;

const ARTIFACT_Y = 168;
const FAIL_Y = 566;
const FAIL_X = 470;
const FAIL_W = 372;

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
  const hoverIndex = stations.findIndex((s) => s.id === hover);
  const dimmed = (id: string) => hover !== null && hover !== id && hoverIndex >= 0;
  const stationOpacity = (i: number) => {
    if (hoverIndex < 0) return 1;
    return i === hoverIndex ? 1 : 0.52;
  };
  const edgeOn = (i: number) => hoverIndex >= 0 && (i === hoverIndex - 1 || i === hoverIndex);

  const artifactPath = `M ${stMidX(1)} ${ARTIFACT_Y} H ${stMidX(4)}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="A delivery pipeline: a developer commit enters a track of five stations — Commit, Build, Test, Staging and Production — with quality gates between them, one immutable artifact promoted from Build onwards, and a failed-test branch that stops the pipeline before staging."
      className="w-full"
      style={{ minHeight: 580, maxHeight: 720 }}
    >
      <defs>
        <linearGradient id={`${uid}-track`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.9" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="var(--primary)" floodOpacity="0.13" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text
          x={DEV_X}
          y={54}
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.2em"
          fill="var(--muted-foreground)"
        >
          FIG. 04 — CONTINUOUS DELIVERY PIPELINE
        </text>
        <text
          x={W - 44}
          y={54}
          textAnchor="end"
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.16em"
          fill="var(--muted-foreground)"
        >
          COMMIT → PRODUCTION
        </text>
        <line
          x1={DEV_X}
          y1={74}
          x2={W - 44}
          y2={74}
          stroke="var(--border)"
          strokeWidth={1}
        />
      </g>

      {/* immutable artifact lane */}
      <g
        role="button"
        tabIndex={0}
        aria-label="The immutable artifact promoted through every environment"
        style={{ cursor: "pointer", animation: "fade-rise .8s cubic-bezier(.22,1,.36,1) 200ms both" }}
        opacity={hover !== null && hover !== ARTIFACT_KEY && hoverIndex < 0 ? 0.55 : 1}
        onMouseEnter={() => setHover(ARTIFACT_KEY)}
        onMouseLeave={() => setHover(null)}
        onFocus={() => setHover(ARTIFACT_KEY)}
        onBlur={() => setHover(null)}
        onClick={() => onToggle(ARTIFACT_KEY)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(ARTIFACT_KEY);
          }
        }}
      >
        <rect
          x={stX(1) - 26}
          y={ARTIFACT_Y - 62}
          width={stX(4) + ST_W + 18 - (stX(1) - 26)}
          height={128}
          rx={30}
          fill="color-mix(in oklab, var(--cyan) 5%, transparent)"
          stroke={
            hover === ARTIFACT_KEY || activeKey === ARTIFACT_KEY
              ? "color-mix(in oklab, var(--cyan) 55%, transparent)"
              : "color-mix(in oklab, var(--cyan) 26%, transparent)"
          }
          strokeDasharray="8 8"
          style={{ transition: "stroke .3s ease" }}
        />
        <text
          x={stX(1) - 4}
          y={ARTIFACT_Y - 34}
          fontSize={12}
          fontFamily="var(--font-mono)"
          letterSpacing="0.18em"
          fill="var(--cyan-ink, var(--muted-foreground))"
        >
          BUILD ONCE — PROMOTE THE SAME ARTIFACT
        </text>

        <path d={artifactPath} stroke="var(--border-strong)" strokeWidth={2} fill="none" strokeLinecap="round" />
        <path
          d={artifactPath}
          stroke="var(--cyan)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeDasharray="14 900"
          className="motion-safe:animate-[dash-travel_6s_linear_infinite]"
        />

        {/* travelling artifact token */}
        <g className="motion-safe:opacity-100">
          <g>
            <rect x={-34} y={-19} width={68} height={38} rx={12} fill="var(--surface)" stroke="var(--cyan)" strokeWidth={1.6} />
            <rect x={-19} y={-8} width={38} height={4} rx={2} fill="var(--cyan)" opacity={0.85} />
            <rect x={-19} y={0} width={24} height={4} rx={2} fill="var(--primary)" opacity={0.6} />
            <rect x={-19} y={8} width={30} height={4} rx={2} fill="var(--border-strong)" />
            <animateMotion dur="6s" repeatCount="indefinite" path={artifactPath} rotate="0" />
          </g>
        </g>

        {/* drop lines from artifact lane into the stations that hold it */}
        {stations.map((s, i) =>
          s.carriesArtifact ? (
            <line
              key={s.id}
              x1={stMidX(i)}
              y1={ARTIFACT_Y + 26}
              x2={stMidX(i)}
              y2={ST_Y - 14}
              stroke="color-mix(in oklab, var(--cyan) 32%, transparent)"
              strokeWidth={1.5}
              strokeDasharray="4 7"
            />
          ) : null,
        )}
      </g>

      {/* developer */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Developer making a code change"
        style={{ cursor: "pointer", animation: "fade-rise .7s cubic-bezier(.22,1,.36,1) both" }}
        opacity={dimmed("dev") ? 0.52 : 1}
        onMouseEnter={() => setHover("dev")}
        onMouseLeave={() => setHover(null)}
        onFocus={() => setHover("dev")}
        onBlur={() => setHover(null)}
        onClick={() => onToggle("dev")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle("dev");
          }
        }}
      >
        <rect
          x={DEV_X}
          y={DEV_Y}
          width={DEV_W}
          height={DEV_H}
          rx={26}
          fill="var(--surface-tint)"
          stroke={hover === "dev" ? "color-mix(in oklab, var(--primary) 50%, transparent)" : "var(--border)"}
          strokeWidth={hover === "dev" ? 1.7 : 1}
          style={{ transition: "stroke .3s ease" }}
        />
        <text
          x={DEV_X + 26}
          y={DEV_Y + 40}
          fontSize={11}
          fontFamily="var(--font-mono)"
          letterSpacing="0.2em"
          fill="var(--muted-foreground)"
        >
          SOURCE
        </text>
        <text x={DEV_X + 26} y={DEV_Y + 74} fontSize={20} fontWeight={780} fill="var(--foreground)">
          Developer
        </text>
        <text x={DEV_X + 26} y={DEV_Y + 100} fontSize={14.5} fill="var(--muted-foreground)">
          Code change
        </text>
        <g opacity={0.85}>
          <rect x={DEV_X + 26} y={DEV_Y + 114} width={54} height={4} rx={2} fill="var(--primary)" />
          <rect x={DEV_X + 88} y={DEV_Y + 114} width={30} height={4} rx={2} fill="var(--border-strong)" />
          <rect x={DEV_X + 126} y={DEV_Y + 114} width={42} height={4} rx={2} fill="var(--cyan)" opacity={0.7} />
        </g>
      </g>

      {/* entry connector */}
      <g aria-hidden="true">
        <path
          d={`M ${DEV_X + DEV_W} ${TRACK_Y} H ${stX(0) - 12}`}
          stroke="var(--border-strong)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={`M ${stX(0) - 22} ${TRACK_Y - 8} L ${stX(0) - 10} ${TRACK_Y} L ${stX(0) - 22} ${TRACK_Y + 8}`}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* track segments + gates */}
      {stations.slice(0, -1).map((_, i) => {
        const x1 = stX(i) + ST_W;
        const x2 = stX(i + 1);
        const gate = gates.find((g) => g.after === i + 1);
        const on = edgeOn(i);
        return (
          <g key={`seg-${i}`}>
            <line
              x1={x1 + 6}
              y1={TRACK_Y}
              x2={x2 - 6}
              y2={TRACK_Y}
              stroke={on ? `url(#${uid}-track)` : "var(--border-strong)"}
              strokeWidth={on ? 4 : 2.5}
              strokeLinecap="round"
              style={{ transition: "stroke-width .25s ease" }}
            />
            <line
              x1={x1 + 6}
              y1={TRACK_Y}
              x2={x2 - 6}
              y2={TRACK_Y}
              stroke="var(--primary)"
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray="10 200"
              className="motion-safe:animate-[dash-travel_3.4s_linear_infinite]"
              opacity={0.85}
            />
            {gate && (
              <g
                role="button"
                tabIndex={0}
                aria-label={`Quality gate: ${gate.label}`}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHover(gate.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(gate.id)}
                onBlur={() => setHover(null)}
                onClick={() => onToggle(gate.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onToggle(gate.id);
                  }
                }}
              >
                <circle
                  cx={(x1 + x2) / 2}
                  cy={TRACK_Y}
                  r={17}
                  fill="var(--surface)"
                  stroke={
                    hover === gate.id || activeKey === gate.id
                      ? "var(--primary)"
                      : "color-mix(in oklab, var(--primary) 40%, transparent)"
                  }
                  strokeWidth={hover === gate.id || activeKey === gate.id ? 2.4 : 1.6}
                  style={{ transition: "stroke .25s ease" }}
                />
                <path
                  d={`M ${(x1 + x2) / 2 - 6} ${TRACK_Y} l 4.4 4.6 l 7.6 -8.6`}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </g>
        );
      })}

      {/* stations */}
      {stations.map((s, i) => {
        const on = hover === s.id || activeKey === s.id;
        const x = stX(i);
        return (
          <g
            key={s.id}
            role="button"
            tabIndex={0}
            aria-label={`${s.label} stage`}
            opacity={stationOpacity(i)}
            style={{
              cursor: "pointer",
              transition: "opacity .3s ease",
              animation: `fade-rise .75s cubic-bezier(.22,1,.36,1) ${120 + i * 90}ms both`,
            }}
            onMouseEnter={() => setHover(s.id)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(s.id)}
            onBlur={() => setHover(null)}
            onClick={() => onToggle(s.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(s.id);
              }
            }}
          >
            {s.id === "stage" && (
              <rect
                x={x - 18}
                y={ST_Y - 26}
                width={ST_W + 36}
                height={ST_H + 52}
                rx={30}
                fill="color-mix(in oklab, var(--violet) 5%, transparent)"
                stroke="color-mix(in oklab, var(--violet) 30%, transparent)"
                strokeDasharray="7 7"
              />
            )}
            <rect
              x={x}
              y={ST_Y}
              width={ST_W}
              height={ST_H}
              rx={24}
              fill={on ? "color-mix(in oklab, var(--primary) 7%, var(--surface))" : "var(--surface)"}
              stroke={on ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border)"}
              strokeWidth={on ? 1.8 : 1}
              filter={on ? `url(#${uid}-lift)` : undefined}
              style={{ transition: "fill .3s ease, stroke .3s ease" }}
            />
            <rect
              x={x + 20}
              y={ST_Y + 20}
              width={ST_W - 40}
              height={3}
              rx={2}
              fill={
                s.id === "prod"
                  ? "var(--cyan)"
                  : s.id === "stage"
                    ? "var(--violet)"
                    : "var(--primary)"
              }
              opacity={0.75}
            />
            <text
              x={x + 20}
              y={ST_Y + 52}
              fontSize={11}
              fontFamily="var(--font-mono)"
              letterSpacing="0.2em"
              fill="var(--muted-foreground)"
            >
              {s.index}
            </text>
            <text x={x + 20} y={ST_Y + 88} fontSize={21} fontWeight={780} fill="var(--foreground)">
              {s.label}
            </text>
            <text x={x + 20} y={ST_Y + 114} fontSize={14.5} fill="var(--muted-foreground)">
              {s.sub}
            </text>
            <text
              x={x + 20}
              y={ST_Y + 144}
              fontSize={11.5}
              fontFamily="var(--font-mono)"
              letterSpacing="0.06em"
              fill="var(--muted-foreground)"
              opacity={0.85}
            >
              {s.meta}
            </text>

            {s.id === "stage" && (
              <text
                x={x + ST_W / 2}
                y={ST_Y + ST_H + 42}
                textAnchor="middle"
                fontSize={12.5}
                fontFamily="var(--font-mono)"
                letterSpacing="0.12em"
                fill="var(--muted-foreground)"
              >
                REHEARSAL ENVIRONMENT
              </text>
            )}

            {s.id === "prod" && (
              <g aria-hidden="true">
                {[10, 50, 100].map((pct, k) => (
                  <g key={pct}>
                    <rect
                      x={x + 20}
                      y={ST_Y + ST_H + 30 + k * 22}
                      width={(ST_W - 76) * (pct / 100)}
                      height={8}
                      rx={4}
                      fill="var(--cyan)"
                      opacity={0.28 + k * 0.24}
                    />
                    <text
                      x={x + ST_W - 20}
                      y={ST_Y + ST_H + 38 + k * 22}
                      textAnchor="end"
                      fontSize={11}
                      fontFamily="var(--font-mono)"
                      fill="var(--muted-foreground)"
                    >
                      {pct}%
                    </text>
                  </g>
                ))}
                <text
                  x={x + 20}
                  y={ST_Y + ST_H + 108}
                  fontSize={12}
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.1em"
                  fill="var(--muted-foreground)"
                >
                  GRADUAL ROLLOUT
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* failed test branch */}
      <g
        role="button"
        tabIndex={0}
        aria-label="Failed checks stop the pipeline before staging"
        style={{ cursor: "pointer", animation: "fade-rise .8s cubic-bezier(.22,1,.36,1) 420ms both" }}
        opacity={hoverIndex >= 0 && hover !== "test" ? 0.52 : 1}
        onMouseEnter={() => setHover(FAIL_KEY)}
        onMouseLeave={() => setHover(null)}
        onFocus={() => setHover(FAIL_KEY)}
        onBlur={() => setHover(null)}
        onClick={() => onToggle(FAIL_KEY)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle(FAIL_KEY);
          }
        }}
      >
        <path
          d={`M ${stMidX(2)} ${ST_Y + ST_H} V ${FAIL_Y - 46} Q ${stMidX(2)} ${FAIL_Y - 26} ${stMidX(2) - 20} ${FAIL_Y - 26} H ${FAIL_X + FAIL_W}`}
          fill="none"
          stroke="color-mix(in oklab, var(--ember) 70%, transparent)"
          strokeWidth={2.5}
          strokeDasharray="9 8"
          strokeLinecap="round"
        />
        <rect
          x={FAIL_X}
          y={FAIL_Y - 76}
          width={FAIL_W}
          height={100}
          rx={24}
          fill="color-mix(in oklab, var(--ember) 7%, var(--surface))"
          stroke={
            hover === FAIL_KEY || activeKey === FAIL_KEY
              ? "color-mix(in oklab, var(--ember) 60%, transparent)"
              : "color-mix(in oklab, var(--ember) 32%, transparent)"
          }
          strokeWidth={hover === FAIL_KEY || activeKey === FAIL_KEY ? 1.8 : 1.2}
          style={{ transition: "stroke .3s ease" }}
        />
        <circle cx={FAIL_X + 38} cy={FAIL_Y - 26} r={16} fill="none" stroke="var(--ember)" strokeWidth={2} />
        <path
          d={`M ${FAIL_X + 32} ${FAIL_Y - 32} l 12 12 M ${FAIL_X + 44} ${FAIL_Y - 32} l -12 12`}
          stroke="var(--ember)"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
        <text x={FAIL_X + 68} y={FAIL_Y - 32} fontSize={18} fontWeight={760} fill="var(--foreground)">
          Checks fail — pipeline stops
        </text>
        <text x={FAIL_X + 68} y={FAIL_Y - 8} fontSize={14} fill="var(--muted-foreground)">
          Nothing reaches staging or production; feedback goes back to the developer.
        </text>
        <path
          d={`M ${FAIL_X + 46} ${FAIL_Y + 24} Q ${DEV_X + DEV_W / 2} ${FAIL_Y + 96} ${DEV_X + DEV_W / 2} ${DEV_Y + DEV_H + 14}`}
          fill="none"
          stroke="color-mix(in oklab, var(--ember) 45%, transparent)"
          strokeWidth={2}
          strokeDasharray="6 9"
        />
        <path
          d={`M ${DEV_X + DEV_W / 2 - 8} ${DEV_Y + DEV_H + 24} L ${DEV_X + DEV_W / 2} ${DEV_Y + DEV_H + 12} L ${DEV_X + DEV_W / 2 + 8} ${DEV_Y + DEV_H + 24}`}
          fill="none"
          stroke="color-mix(in oklab, var(--ember) 70%, transparent)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x={DEV_X + DEV_W / 2 + 26}
          y={FAIL_Y + 78}
          fontSize={12}
          fontFamily="var(--font-mono)"
          letterSpacing="0.12em"
          fill="var(--muted-foreground)"
        >
          FAST FEEDBACK
        </text>
      </g>
    </svg>
  );
}

/* -------------------------------- mobile --------------------------------- */

function MobileStack({
  activeKey,
  onToggle,
}: {
  activeKey: string | null;
  onToggle: (key: string) => void;
}) {
  return (
    <div className="space-y-3 px-4 py-5">
      <p className="rounded-2xl border border-cyan/30 bg-surface-tint px-4 py-3 text-[13px] font-semibold text-muted-foreground">
        <span className="text-foreground">Build once, promote the same artifact.</span> From step 02
        onwards every environment receives the identical package.
      </p>

      {stations.map((s, i) => (
        <div key={s.id}>
          <button
            type="button"
            onClick={() => onToggle(s.id)}
            aria-expanded={activeKey === s.id}
            className="flex w-full items-start gap-3 rounded-3xl border border-border bg-surface px-4 py-4 text-left shadow-soft"
            style={{ animation: `fade-rise .6s cubic-bezier(.22,1,.36,1) ${i * 70}ms both` }}
          >
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
              {s.index}
            </span>
            <span className="flex-1">
              <span className="block text-[18px] font-extrabold">{s.label}</span>
              <span className="block text-[13px] text-muted-foreground">{s.sub}</span>
              <span className="mt-1 block font-mono text-[11px] tracking-[0.06em] text-muted-foreground/80">
                {s.meta}
              </span>
            </span>
            {s.carriesArtifact && (
              <span className="rounded-full border border-cyan/40 px-2.5 py-1 text-[10.5px] font-semibold text-muted-foreground">
                same artifact
              </span>
            )}
          </button>

          {i < stations.length - 1 && (
            <div className="flex items-center gap-2 py-2 pl-6">
              <span className="h-6 w-px bg-border-strong" aria-hidden="true" />
              {gates.find((g) => g.after === i + 1) ? (
                <button
                  type="button"
                  onClick={() => onToggle(gates.find((g) => g.after === i + 1)!.id)}
                  className="rounded-full border border-primary/40 bg-surface px-3 py-1 text-[11.5px] font-semibold text-muted-foreground"
                >
                  ✓ {gates.find((g) => g.after === i + 1)!.label}
                </button>
              ) : (
                <span className="text-[11.5px] text-muted-foreground">promote</span>
              )}
            </div>
          )}

          {s.id === "test" && (
            <button
              type="button"
              onClick={() => onToggle(FAIL_KEY)}
              className="mt-3 flex w-full items-start gap-3 rounded-3xl border px-4 py-3.5 text-left"
              style={{
                borderColor: "color-mix(in oklab, var(--ember) 35%, transparent)",
                background: "color-mix(in oklab, var(--ember) 6%, transparent)",
              }}
            >
              <span className="text-[15px] font-bold text-foreground">✕</span>
              <span>
                <span className="block text-[14.5px] font-bold">Checks fail — pipeline stops</span>
                <span className="block text-[12.5px] text-muted-foreground">
                  Nothing reaches staging or production.
                </span>
              </span>
            </button>
          )}
        </div>
      ))}

      <p className="rounded-2xl border border-border bg-surface-tint px-4 py-3.5 text-[13.5px] leading-relaxed text-muted-foreground">
        Production usually receives the release gradually — 10%, then 50%, then everyone — so a
        problem is caught while it is still small.
      </p>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  const s = stations.find((x) => x.id === key);
  if (s) return { eyebrow: `Stage ${s.index}`, title: s.label, body: s.detail };
  const g = gates.find((x) => x.id === key);
  if (g) return { eyebrow: "Quality gate", title: g.label, body: g.detail };
  if (key === FAIL_KEY)
    return {
      eyebrow: "Failure path",
      title: "Checks fail — pipeline stops",
      body: "A failing check ends the run at the test stage. The artifact is never promoted to staging or production, and the developer gets feedback within minutes rather than after a release.",
    };
  if (key === ARTIFACT_KEY)
    return {
      eyebrow: "Core principle",
      title: "Build once, promote the same artifact",
      body: "The package produced at build time is immutable. Staging and production receive that identical artifact, so verification in the rehearsal environment actually says something about the release.",
    };
  if (key === "dev")
    return {
      eyebrow: "Source",
      title: "Developer",
      body: "A code change pushed to the shared branch is the only trigger the pipeline needs — automation takes it from there.",
    };
  return null;
}

export function PipelineDiagram() {
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
              <span className="size-2 rounded-full bg-primary/70" />
              <span className="size-2 rounded-full bg-cyan/70" />
              <span className="size-2 rounded-full bg-violet/50" />
            </span>
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              CI/CD · delivery pipeline
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Pipeline flow", color: "var(--primary)" },
              { label: "Same artifact", color: "var(--cyan)" },
              { label: "Failure stops here", color: "var(--ember)" },
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
        One commit, one build, one artifact — promoted through gates into a rehearsal environment and
        then gradually into production. A failed check stops the run before either.
      </figcaption>
      <StageHint text="Hover a stage to follow the path; click a stage, a gate or the artifact lane for a short explanation." />
    </figure>
  );
}
