import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const SYS = "system";
const METRICS = "metrics";
const LOGS = "logs";
const TRACES = "traces";
const DASH = "dashboards";
const ALERT = "alert";
const INVEST = "investigation";
const CAUSE = "cause";
const RAIL = "rail";
const INSTR = "instrumentation";

const related: Record<string, string[]> = {
  [SYS]: [METRICS, LOGS, TRACES, INSTR],
  [METRICS]: [SYS, DASH, ALERT, INVEST],
  [LOGS]: [SYS, INVEST, CAUSE],
  [TRACES]: [SYS, INVEST, CAUSE],
  [DASH]: [METRICS, ALERT, RAIL],
  [ALERT]: [DASH, METRICS, INVEST, RAIL],
  [INVEST]: [ALERT, METRICS, LOGS, TRACES, CAUSE, RAIL],
  [CAUSE]: [INVEST, LOGS, TRACES],
  [RAIL]: [DASH, ALERT, INVEST],
  [INSTR]: [SYS, METRICS, LOGS, TRACES],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1760;
const H = 878;

/* left monitoring column */
const L_X = 40;
const L_W = 320;
const DA_Y = 140;
const DA_H = 272;
const AL_Y = 452;
const AL_H = 196;

/* centre system frame */
const S_X = 400;
const S_Y = 120;
const S_W = 490;
const S_H = 330;

const NODE_W = 200;
const NODE_H = 74;
const N1 = { x: 430, y: 176 };
const N2 = { x: 660, y: 176 };
const N3 = { x: 660, y: 296 };
const N4 = { x: 430, y: 296 };

/* telemetry rail */
const T_Y = 490;
const T_H = 150;
const T_W = 150;
const TM_X = 400;
const TL_X = 570;
const TT_X = 740;

/* instrumentation note */
const IN_Y = 680;
const IN_H = 112;

/* investigation surface */
const V_X = 930;
const V_Y = 120;
const V_W = 490;
const V_H = 700;

const CARD_X = 960;
const CARD_W = 430;
const SP_Y = 180;
const SP_H = 150;
const LG_Y = 352;
const LG_H = 150;
const TR_Y = 524;
const TR_H = 140;
const RC_Y = 692;
const RC_H = 106;

/* comparison rail */
const R_X = 1450;
const R_W = 270;
const R_Y = 150;

/* --------------------------------- paths --------------------------------- */

const pTrace = `M ${N1.x + NODE_W / 2} ${N1.y + NODE_H / 2} H ${N2.x + NODE_W - 30} Q ${N2.x + NODE_W} ${N2.y + NODE_H / 2} ${N2.x + NODE_W} ${N2.y + NODE_H / 2 + 30} V ${N3.y + NODE_H / 2 - 30} Q ${N3.x + NODE_W} ${N3.y + NODE_H / 2} ${N3.x + NODE_W - 30} ${N3.y + NODE_H / 2} H ${N4.x + NODE_W / 2}`;

const pToMetrics = `M ${TM_X + T_W / 2} ${S_Y + S_H} L ${TM_X + T_W / 2} ${T_Y}`;
const pToLogs = `M ${TL_X + T_W / 2} ${S_Y + S_H} L ${TL_X + T_W / 2} ${T_Y}`;
const pToTraces = `M ${TT_X + T_W / 2} ${S_Y + S_H} L ${TT_X + T_W / 2} ${T_Y}`;

const pMetricsDash = `M ${TM_X} ${T_Y + 30} C 382 ${T_Y + 30}, 376 ${DA_Y + DA_H - 20}, ${L_X + L_W} ${DA_Y + DA_H - 44}`;
const pMetricsAlert = `M ${TM_X} ${T_Y + 74} C 386 ${T_Y + 74}, 382 ${AL_Y + 96}, ${L_X + L_W} ${AL_Y + 96}`;
const pHandoff = `M ${L_X + L_W / 2} ${AL_Y + AL_H} C ${L_X + L_W / 2} 846, 640 862, ${V_X} ${V_Y + 520}`;

const pLogsInvest = `M ${TL_X + T_W} ${T_Y + 60} C 900 ${T_Y + 60}, 900 ${LG_Y + 60}, ${V_X} ${LG_Y + 60}`;
const pTracesInvest = `M ${TT_X + T_W} ${T_Y + 110} C 906 ${T_Y + 110}, 906 ${TR_Y + 60}, ${V_X} ${TR_Y + 60}`;

const pCorrelate = `M 946 ${SP_Y + 78} L 946 ${TR_Y + 60}`;
const pCause = `M ${CARD_X + CARD_W / 2} ${TR_Y + TR_H} L ${CARD_X + CARD_W / 2} ${RC_Y}`;

/* --------------------------------- copy ---------------------------------- */

const services = [
  { id: "gw", label: "Gateway", note: "receives the request", at: N1 },
  { id: "ck", label: "Checkout", note: "orchestrates the order", at: N2 },
  { id: "pay", label: "Payments", note: "calls a third party", at: N3 },
  { id: "db", label: "Orders DB", note: "writes the record", at: N4 },
] as const;

const dashboards = [
  { label: "CPU", value: "62%", state: "normal", tone: "var(--cyan)" },
  { label: "Error rate", value: "4.1%", state: "over threshold", tone: "var(--ember)" },
  { label: "Latency SLO", value: "p95 1.9s", state: "breaching", tone: "var(--ember)" },
] as const;

const logLines = [
  { text: "checkout · timeout waiting on payments", tone: "var(--ember)" },
  { text: "payments · retry 3 of 3, upstream slow", tone: "var(--ember)" },
  { text: "gateway · request id 9f2c completed 2.4s", tone: "var(--muted-foreground)" },
] as const;

const spans = [
  { label: "gateway", x: 0, w: 340, tone: "var(--primary)" },
  { label: "checkout", x: 30, w: 296, tone: "var(--primary)" },
  { label: "payments", x: 96, w: 220, tone: "var(--ember)" },
  { label: "orders db", x: 300, w: 22, tone: "var(--cyan)" },
] as const;

const railRows = [
  {
    q: "Known question",
    a: "Monitoring",
    note: "Is the error rate above 2%? Predefined signal, dashboard, alert.",
    tone: "var(--primary)",
  },
  {
    q: "Unknown question",
    a: "Observability",
    note: "Why is checkout slow only for card payments over £200? Asked after the fact.",
    tone: "var(--violet)",
  },
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case SYS:
      return {
        eyebrow: "The system",
        title: "Several services handling one request",
        body: "A single checkout request crosses a gateway, the checkout service, payments and the orders database. No one service can explain the whole request on its own — which is exactly why telemetry has to carry context across all of them.",
      };
    case METRICS:
      return {
        eyebrow: "Telemetry · metrics",
        title: "Numbers over time, cheap to keep",
        body: "Counters and timings aggregated into series: request rate, error rate, latency percentiles. Metrics are how you notice that something changed, but they are aggregates — they rarely say which requests, or why.",
      };
    case LOGS:
      return {
        eyebrow: "Telemetry · logs",
        title: "Individual events, with detail",
        body: "Timestamped records of what a service actually did. Logs carry the specifics a metric flattens away — which upstream call timed out, which parameters were involved — provided the code was instrumented to say so.",
      };
    case TRACES:
      return {
        eyebrow: "Telemetry · traces",
        title: "One request, followed across services",
        body: "A trace stitches the spans of a single request together, so you can see the order of calls and where the time went. This is the signal that turns four separate services into one explainable story.",
      };
    case DASH:
      return {
        eyebrow: "Monitoring",
        title: "Dashboards answer questions you already asked",
        body: "Each panel exists because somebody decided in advance that this signal matters. That makes dashboards fast and reliable for known failure modes — and blind to anything nobody thought to chart.",
      };
    case ALERT:
      return {
        eyebrow: "Monitoring",
        title: "A threshold fires on a symptom",
        body: "Error rate crossed the line, so an alert is raised. The alert states that something is wrong and roughly where, which is genuinely useful. It does not state why, because the cause was never encoded in the rule.",
      };
    case INVEST:
      return {
        eyebrow: "Observability",
        title: "Correlating signals into an explanation",
        body: "The investigation starts from the symptom and moves through the same telemetry: the spike narrows the window, the logs name the failing call, and the trace shows where the time was spent. New questions can be asked without shipping new code.",
      };
    case CAUSE:
      return {
        eyebrow: "Root cause",
        title: "A slow upstream, found by following the request",
        body: "Payments is retrying a slow third-party call, holding checkout open until it times out. Nobody had a dashboard for that particular failure — it was reconstructed from rich telemetry that shared a request id.",
      };
    case RAIL:
      return {
        eyebrow: "The distinction",
        title: "Not opposites — different jobs on the same data",
        body: "Monitoring tells you that something is wrong, from questions defined in advance. Observability is the property that lets you answer new questions afterwards. Healthy teams need both, and both are fed by the same metrics, logs and traces.",
      };
    case INSTR:
      return {
        eyebrow: "Instrumentation",
        title: "Observability is a property of your system",
        body: "It comes from code that emits useful context — request ids, user-visible operations, meaningful attributes — and from propagating that context between services. Buying another dashboard product does not add it.",
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
      aria-label="Monitoring and observability drawn as two jobs done on the same telemetry. In the centre a distributed checkout system of four services emits metrics, logs and traces. On the left, monitoring dashboards track known signals and a threshold alert fires on a rising error rate. On the right, an investigation surface correlates the metric spike, the matching log lines and one request trace into a root cause: payments retrying a slow third-party call. A comparison rail on the far right pairs known questions with monitoring and unknown questions with observability."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 860 }}
    >
      <defs>
        <linearGradient id={`${uid}-sys`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={`${uid}-inv`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--violet)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={L_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 16 — THAT SOMETHING IS WRONG, AND WHY
        </text>
        <text x={W - 40} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          ONE STREAM OF TELEMETRY, TWO JOBS
        </text>
        <line x1={L_X} y1={52} x2={W - 40} y2={52} stroke="var(--border)" strokeWidth={1} />
        <text x={L_X} y={94} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--primary)">
          MONITORING · KNOWN SIGNALS
        </text>
        <text x={S_X} y={94} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          THE RUNNING SYSTEM
        </text>
        <text x={V_X} y={94} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--violet)">
          OBSERVABILITY · INVESTIGATION
        </text>
      </g>

      {/* ------------------------------- system ------------------------------- */}
      <g opacity={op(SYS)}>
        <g {...interactive(SYS, "The running system — four services handling one checkout request")}>
          <rect
            x={S_X}
            y={S_Y}
            width={S_W}
            height={S_H}
            rx={26}
            fill={`url(#${uid}-sys)`}
            stroke={on(SYS) ? "color-mix(in oklab, var(--primary) 52%, transparent)" : "var(--border-strong)"}
            strokeWidth={on(SYS) ? 2 : 1.3}
            style={{ transition: "stroke .3s ease" }}
          />
          <text x={S_X + 26} y={S_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--primary)">
            DISTRIBUTED APPLICATION
          </text>
          <text x={S_X + S_W - 26} y={S_Y + 34} textAnchor="end" fontSize={12.5} fill="var(--muted-foreground)">
            one request · id 9f2c
          </text>
        </g>

        <Flow d={pTrace} on={on(SYS) || on(TRACES)} color="var(--cyan)" />
        <Token path={pTrace} dur="4.4s" begin="0s" color="var(--cyan)" />

        {services.map((s) => (
          <g key={s.id} aria-hidden="true">
            <rect
              x={s.at.x}
              y={s.at.y}
              width={NODE_W}
              height={NODE_H}
              rx={18}
              fill="var(--surface)"
              stroke={s.id === "pay" ? "color-mix(in oklab, var(--ember) 48%, transparent)" : "var(--border-strong)"}
              strokeWidth={s.id === "pay" ? 1.8 : 1.2}
            />
            <text x={s.at.x + 20} y={s.at.y + 32} fontSize={15.5} fontWeight={760} fill="var(--foreground)">
              {s.label}
            </text>
            <text x={s.at.x + 20} y={s.at.y + 55} fontSize={12.5} fill="var(--muted-foreground)">
              {s.note}
            </text>
          </g>
        ))}
      </g>

      {/* telemetry links */}
      <Flow d={pToMetrics} on={on(METRICS) || on(SYS)} color="var(--primary)" />
      <Flow d={pToLogs} on={on(LOGS) || on(SYS)} color="var(--primary)" />
      <Flow d={pToTraces} on={on(TRACES) || on(SYS)} color="var(--cyan)" />

      {/* ----------------------------- telemetry ------------------------------ */}
      <g opacity={op(METRICS)}>
        <g {...interactive(METRICS, "Metrics — numeric series recorded over time")}>
          {card(METRICS, TM_X, T_Y, T_W, T_H, "var(--primary)", 20)}
          <text x={TM_X + 18} y={T_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
            METRICS
          </text>
          <text x={TM_X + 18} y={T_Y + 60} fontSize={14} fontWeight={720} fill="var(--foreground)">
            Numbers
          </text>
          <text x={TM_X + 18} y={T_Y + 82} fontSize={12.5} fill="var(--muted-foreground)">
            over time
          </text>
          <path
            d={`M ${TM_X + 18} ${T_Y + 124} L ${TM_X + 44} ${T_Y + 118} L ${TM_X + 68} ${T_Y + 126} L ${TM_X + 92} ${T_Y + 104} L ${TM_X + 114} ${T_Y + 112} L ${TM_X + 132} ${T_Y + 108}`}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </g>
      </g>

      <g opacity={op(LOGS)}>
        <g {...interactive(LOGS, "Logs — individual timestamped events with detail")}>
          {card(LOGS, TL_X, T_Y, T_W, T_H, "var(--cyan)", 20)}
          <text x={TL_X + 18} y={T_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            LOGS
          </text>
          <text x={TL_X + 18} y={T_Y + 60} fontSize={14} fontWeight={720} fill="var(--foreground)">
            Events
          </text>
          <text x={TL_X + 18} y={T_Y + 82} fontSize={12.5} fill="var(--muted-foreground)">
            with detail
          </text>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={TL_X + 18}
              y={T_Y + 102 + i * 12}
              width={114 - i * 22}
              height={5}
              rx={2.5}
              fill="color-mix(in oklab, var(--cyan) 45%, transparent)"
            />
          ))}
        </g>
      </g>

      <g opacity={op(TRACES)}>
        <g {...interactive(TRACES, "Traces — one request followed across every service")}>
          {card(TRACES, TT_X, T_Y, T_W, T_H, "var(--violet)", 20)}
          <text x={TT_X + 18} y={T_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
            TRACES
          </text>
          <text x={TT_X + 18} y={T_Y + 60} fontSize={14} fontWeight={720} fill="var(--foreground)">
            One request
          </text>
          <text x={TT_X + 18} y={T_Y + 82} fontSize={12.5} fill="var(--muted-foreground)">
            end to end
          </text>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={TT_X + 18 + i * 14}
              y={T_Y + 102 + i * 12}
              width={100 - i * 18}
              height={6}
              rx={3}
              fill="color-mix(in oklab, var(--violet) 45%, transparent)"
            />
          ))}
        </g>
      </g>

      {/* --------------------------- instrumentation -------------------------- */}
      <g opacity={op(INSTR)}>
        <g {...interactive(INSTR, "Instrumentation — observability depends on the context your code emits")}>
          <rect
            x={S_X}
            y={IN_Y}
            width={S_W}
            height={IN_H}
            rx={22}
            fill="var(--surface)"
            stroke={on(INSTR) ? "color-mix(in oklab, var(--cyan) 55%, transparent)" : "var(--border-strong)"}
            strokeWidth={on(INSTR) ? 2 : 1.2}
            strokeDasharray="9 7"
            style={{ transition: "stroke .3s ease" }}
          />
          <text x={S_X + 24} y={IN_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--cyan)">
            INSTRUMENTATION
          </text>
          <text x={S_X + 24} y={IN_Y + 62} fontSize={15.5} fontWeight={760} fill="var(--foreground)">
            Context comes from the code, not the tool
          </text>
          <text x={S_X + 24} y={IN_Y + 88} fontSize={12.5} fill="var(--muted-foreground)">
            Request ids, meaningful attributes and propagation between services.
          </text>
        </g>
      </g>

      {/* --------------------------- monitoring side -------------------------- */}
      <Flow d={pMetricsDash} on={on(DASH) || on(METRICS)} color="var(--primary)" />
      <Flow d={pMetricsAlert} on={on(ALERT) || on(METRICS)} color="var(--ember)" />
      <Token path={pMetricsAlert} dur="3.2s" begin="0.4s" color="var(--ember)" />

      <g opacity={op(DASH)}>
        <g {...interactive(DASH, "Dashboards — predefined panels for signals already known to matter")}>
          {card(DASH, L_X, DA_Y, L_W, DA_H, "var(--primary)")}
          <text x={L_X + 24} y={DA_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--primary)">
            KNOWN QUESTIONS
          </text>
          <text x={L_X + 24} y={DA_Y + 66} fontSize={19} fontWeight={800} fill="var(--foreground)">
            Dashboards
          </text>
          {dashboards.map((d, i) => {
            const y = DA_Y + 88 + i * 58;
            return (
              <g key={d.label} aria-hidden="true">
                <rect
                  x={L_X + 22}
                  y={y}
                  width={L_W - 44}
                  height={48}
                  rx={14}
                  fill={`color-mix(in oklab, ${d.tone} 5%, transparent)`}
                  stroke={`color-mix(in oklab, ${d.tone} 28%, transparent)`}
                />
                <text x={L_X + 40} y={y + 21} fontSize={13.5} fontWeight={720} fill="var(--foreground)">
                  {d.label}
                </text>
                <text x={L_X + L_W - 40} y={y + 21} textAnchor="end" fontSize={13} fontFamily="var(--font-mono)" fill={d.tone}>
                  {d.value}
                </text>
                <text x={L_X + 40} y={y + 39} fontSize={12.5} fill="var(--muted-foreground)">
                  {d.state}
                </text>
              </g>
            );
          })}
        </g>
      </g>

      <g opacity={op(ALERT)}>
        <g {...interactive(ALERT, "Alert — a threshold fires on the symptom, not the cause")}>
          <rect
            x={L_X}
            y={AL_Y}
            width={L_W}
            height={AL_H}
            rx={22}
            fill="color-mix(in oklab, var(--ember) 5%, var(--surface))"
            stroke={on(ALERT) ? "color-mix(in oklab, var(--ember) 62%, transparent)" : "color-mix(in oklab, var(--ember) 40%, transparent)"}
            strokeWidth={on(ALERT) ? 2.2 : 1.4}
            style={{ transition: "stroke .3s ease" }}
          />
          <text x={L_X + 24} y={AL_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--ember)">
            THRESHOLD BREACHED
          </text>
          <text x={L_X + 24} y={AL_Y + 66} fontSize={19} fontWeight={800} fill="var(--foreground)">
            Alert: checkout errors
          </text>
          <text x={L_X + 24} y={AL_Y + 94} fontSize={13} fill="var(--muted-foreground)">
            Error rate above 2% for five minutes.
          </text>
          <rect
            x={L_X + 22}
            y={AL_Y + 112}
            width={L_W - 44}
            height={62}
            rx={14}
            fill="var(--surface)"
            stroke="var(--border)"
          />
          <text x={L_X + 40} y={AL_Y + 136} fontSize={13} fontWeight={700} fill="var(--foreground)">
            Tells you that it is wrong
          </text>
          <text x={L_X + 40} y={AL_Y + 158} fontSize={12.5} fill="var(--muted-foreground)">
            The rule never encoded why.
          </text>
        </g>
      </g>

      {/* handoff */}
      <g opacity={Math.min(op(ALERT), op(INVEST))}>
        <Flow d={pHandoff} on={on(ALERT) || on(INVEST)} color="var(--violet)" dashed />
        <text x={700} y={848} textAnchor="middle" fontSize={11.5} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
          SYMPTOM → INVESTIGATION
        </text>
      </g>

      {/* ------------------------- investigation surface ---------------------- */}
      <Flow d={pLogsInvest} on={on(LOGS) || on(INVEST)} color="var(--cyan)" />
      <Flow d={pTracesInvest} on={on(TRACES) || on(INVEST)} color="var(--violet)" />

      <g opacity={op(INVEST)}>
        <g {...interactive(INVEST, "Investigation — correlating metrics, logs and traces to answer a new question")}>
          <rect
            x={V_X}
            y={V_Y}
            width={V_W}
            height={V_H}
            rx={26}
            fill={`url(#${uid}-inv)`}
            stroke={on(INVEST) ? "color-mix(in oklab, var(--violet) 52%, transparent)" : "var(--border-strong)"}
            strokeWidth={on(INVEST) ? 2 : 1.3}
            style={{ transition: "stroke .3s ease" }}
          />
          <text x={V_X + 30} y={V_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--violet)">
            ASKING A QUESTION NOBODY CHARTED
          </text>
          <text x={V_X + 30} y={V_Y + 66} fontSize={19} fontWeight={800} fill="var(--foreground)">
            Why are these checkouts failing?
          </text>
        </g>

        {/* correlation spine */}
        <g aria-hidden="true">
          <path d={pCorrelate} fill="none" stroke="color-mix(in oklab, var(--violet) 45%, transparent)" strokeWidth={2} strokeDasharray="6 7" />
          {[SP_Y + 78, LG_Y + 60, TR_Y + 60].map((y) => (
            <circle key={y} cx={946} cy={y} r={4.5} fill="var(--violet)" />
          ))}
        </g>

        {/* metric spike */}
        <g {...interactive(METRICS, "The metric spike that narrows the time window")}>
          {card(METRICS, CARD_X, SP_Y, CARD_W, SP_H, "var(--ember)", 18)}
          <text x={CARD_X + 22} y={SP_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--ember)">
            METRIC · LATENCY p95
          </text>
          <text x={CARD_X + 22} y={SP_Y + 56} fontSize={15.5} fontWeight={760} fill="var(--foreground)">
            A spike at 14:32 narrows the window
          </text>
          <path
            d={`M ${CARD_X + 24} ${SP_Y + 122} L ${CARD_X + 84} ${SP_Y + 118} L ${CARD_X + 144} ${SP_Y + 124} L ${CARD_X + 210} ${SP_Y + 114} L ${CARD_X + 252} ${SP_Y + 78} L ${CARD_X + 286} ${SP_Y + 86} L ${CARD_X + 340} ${SP_Y + 82} L ${CARD_X + 404} ${SP_Y + 88}`}
            fill="none"
            stroke="var(--ember)"
            strokeWidth={2.4}
            strokeLinecap="round"
          />
          <circle cx={CARD_X + 252} cy={SP_Y + 78} r={5.5} fill="var(--surface)" stroke="var(--ember)" strokeWidth={2.4} />
          <text x={CARD_X + 22} y={SP_Y + 140} fontSize={12.5} fill="var(--muted-foreground)">
            Same window used for the logs and the trace below.
          </text>
        </g>

        <Flow d={`M ${CARD_X + CARD_W / 2} ${SP_Y + SP_H} L ${CARD_X + CARD_W / 2} ${LG_Y}`} on={on(INVEST)} color="var(--violet)" />

        {/* logs */}
        <g {...interactive(LOGS, "The log lines inside that window")}>
          {card(LOGS, CARD_X, LG_Y, CARD_W, LG_H, "var(--cyan)", 18)}
          <text x={CARD_X + 22} y={LG_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            LOGS · SAME WINDOW, SAME REQUEST ID
          </text>
          {logLines.map((l, i) => (
            <g key={l.text} aria-hidden="true">
              <rect
                x={CARD_X + 20}
                y={LG_Y + 44 + i * 34}
                width={CARD_W - 40}
                height={28}
                rx={9}
                fill="var(--surface)"
                stroke="var(--border)"
              />
              <text x={CARD_X + 34} y={LG_Y + 63 + i * 34} fontSize={12.5} fontFamily="var(--font-mono)" fill={l.tone}>
                {l.text}
              </text>
            </g>
          ))}
        </g>

        <Flow d={`M ${CARD_X + CARD_W / 2} ${LG_Y + LG_H} L ${CARD_X + CARD_W / 2} ${TR_Y}`} on={on(INVEST)} color="var(--violet)" />

        {/* trace waterfall */}
        <g {...interactive(TRACES, "The trace waterfall showing where the time went")}>
          {card(TRACES, CARD_X, TR_Y, CARD_W, TR_H, "var(--violet)", 18)}
          <text x={CARD_X + 22} y={TR_Y + 28} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
            TRACE · REQUEST 9F2C
          </text>
          {spans.map((s, i) => (
            <g key={s.label} aria-hidden="true">
              <text x={CARD_X + 22} y={TR_Y + 54 + i * 22} fontSize={12} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                {s.label}
              </text>
              <rect
                x={CARD_X + 108 + s.x * 0.86}
                y={TR_Y + 44 + i * 22}
                width={s.w * 0.86}
                height={12}
                rx={6}
                fill={`color-mix(in oklab, ${s.tone} 55%, transparent)`}
              />
            </g>
          ))}
        </g>

        <Flow d={pCause} on={on(CAUSE) || on(INVEST)} color="var(--ember)" />

        {/* root cause */}
        <g {...interactive(CAUSE, "Root cause — payments retrying a slow third-party call")}>
          <rect
            x={CARD_X}
            y={RC_Y}
            width={CARD_W}
            height={RC_H}
            rx={18}
            fill="color-mix(in oklab, var(--ember) 6%, var(--surface))"
            stroke={on(CAUSE) ? "color-mix(in oklab, var(--ember) 62%, transparent)" : "color-mix(in oklab, var(--ember) 40%, transparent)"}
            strokeWidth={on(CAUSE) ? 2.2 : 1.4}
            style={{ transition: "stroke .3s ease" }}
          />
          <text x={CARD_X + 22} y={RC_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--ember)">
            ROOT CAUSE
          </text>
          <text x={CARD_X + 22} y={RC_Y + 60} fontSize={15.5} fontWeight={780} fill="var(--foreground)">
            Payments retries a slow third party
          </text>
          <text x={CARD_X + 22} y={RC_Y + 86} fontSize={12.5} fill="var(--muted-foreground)">
            Checkout waits, then times out. No dashboard predicted this one.
          </text>
        </g>
      </g>

      {/* ---------------------------- comparison rail -------------------------- */}
      <g opacity={op(RAIL)}>
        <g {...interactive(RAIL, "Comparison rail — known questions go to monitoring, unknown questions need observability")}>
          {card(RAIL, R_X, R_Y, R_W, 336, "var(--primary)")}
          <text x={R_X + 22} y={R_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
            WHICH JOB IS IT?
          </text>
          {railRows.map((r, i) => {
            const y = R_Y + 54 + i * 136;
            return (
              <g key={r.q} aria-hidden="true">
                <rect
                  x={R_X + 20}
                  y={y}
                  width={R_W - 40}
                  height={122}
                  rx={16}
                  fill={`color-mix(in oklab, ${r.tone} 5%, transparent)`}
                  stroke={`color-mix(in oklab, ${r.tone} 28%, transparent)`}
                />
                <text x={R_X + 38} y={y + 28} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.12em" fill={r.tone}>
                  {r.q.toUpperCase()}
                </text>
                <text x={R_X + 38} y={y + 54} fontSize={16} fontWeight={780} fill="var(--foreground)">
                  {r.a}
                </text>
                <foreignObject x={R_X + 36} y={y + 62} width={R_W - 72} height={56}>
                  <div
                    // eslint-disable-next-line react/no-unknown-property
                    style={{ fontSize: "12.5px", lineHeight: 1.42, color: "var(--muted-foreground)" }}
                  >
                    {r.note}
                  </div>
                </foreignObject>
              </g>
            );
          })}
          <text x={R_X + 22} y={R_Y + 358} fontSize={12.5} fill="var(--muted-foreground)">
            Same telemetry.
          </text>
          <text x={R_X + 22} y={R_Y + 380} fontSize={12.5} fill="var(--muted-foreground)">
            Different question.
          </text>
        </g>
      </g>
    </svg>
  );
}

/* -------------------------------- mobile --------------------------------- */

function MobileStack({ activeKey, onToggle }: { activeKey: string | null; onToggle: (key: string) => void }) {
  const btn = "w-full rounded-3xl border bg-surface px-4 py-4 text-left";

  return (
    <div className="space-y-3 px-4 py-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">THE RUNNING SYSTEM</p>

      <button type="button" onClick={() => onToggle(SYS)} aria-expanded={activeKey === SYS} className={`${btn} border-primary/40 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-primary">DISTRIBUTED APPLICATION</span>
        <span className="mt-1 block text-[17px] font-extrabold">Gateway → Checkout → Payments → Orders DB</span>
        <span className="block text-[12.5px] text-muted-foreground">
          One checkout request crosses four services. No single service can explain it.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">TELEMETRY</p>

      <button type="button" onClick={() => onToggle(METRICS)} aria-expanded={activeKey === METRICS} className={`${btn} border-primary/30`}>
        <span className="block text-[15.5px] font-bold">Metrics</span>
        <span className="block text-[12.5px] text-muted-foreground">Numbers over time: request rate, error rate, latency percentiles.</span>
      </button>

      <button type="button" onClick={() => onToggle(LOGS)} aria-expanded={activeKey === LOGS} className={`${btn} border-cyan/30`}>
        <span className="block text-[15.5px] font-bold">Logs</span>
        <span className="block text-[12.5px] text-muted-foreground">Individual events, with the detail a metric flattens away.</span>
      </button>

      <button type="button" onClick={() => onToggle(TRACES)} aria-expanded={activeKey === TRACES} className={`${btn} border-violet/30`}>
        <span className="block text-[15.5px] font-bold">Traces</span>
        <span className="block text-[12.5px] text-muted-foreground">One request followed across every service it touched.</span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">MONITORING · KNOWN SIGNALS</p>

      <button type="button" onClick={() => onToggle(DASH)} aria-expanded={activeKey === DASH} className={`${btn} border-primary/40`}>
        <span className="block text-[15.5px] font-bold">Dashboards</span>
        <span className="mt-1 block space-y-1.5">
          {dashboards.map((d) => (
            <span key={d.label} className="block rounded-lg border border-border bg-surface px-2.5 py-2 text-[12.5px]">
              <span className="font-semibold">{d.label}</span> — {d.value} · {d.state}
            </span>
          ))}
        </span>
      </button>

      <button type="button" onClick={() => onToggle(ALERT)} aria-expanded={activeKey === ALERT} className={`${btn} border-ember/50 bg-ember/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-ember">THRESHOLD BREACHED</span>
        <span className="mt-1 block text-[15.5px] font-bold">Alert: checkout errors above 2%</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Monitoring tells you that something is wrong. The rule never encoded why.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">OBSERVABILITY · INVESTIGATION</p>

      <button type="button" onClick={() => onToggle(INVEST)} aria-expanded={activeKey === INVEST} className={`${btn} border-violet/40 bg-violet/5`}>
        <span className="block text-[15.5px] font-bold">Why are these checkouts failing?</span>
        <span className="mt-1 block space-y-1.5">
          <span className="block rounded-lg border border-border bg-surface px-2.5 py-2 text-[12.5px]">
            Metric spike at 14:32 narrows the window
          </span>
          {logLines.slice(0, 2).map((l) => (
            <span key={l.text} className="block rounded-lg border border-border bg-surface px-2.5 py-2 font-mono text-[12px]">
              {l.text}
            </span>
          ))}
          <span className="block rounded-lg border border-border bg-surface px-2.5 py-2 text-[12.5px]">
            Trace 9f2c — most of the time sits in payments
          </span>
        </span>
      </button>

      <button type="button" onClick={() => onToggle(CAUSE)} aria-expanded={activeKey === CAUSE} className={`${btn} border-ember/50 bg-ember/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-ember">ROOT CAUSE</span>
        <span className="mt-1 block text-[15.5px] font-bold">Payments retries a slow third party</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Checkout waits, then times out. Nobody had charted this failure in advance.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(INSTR)} aria-expanded={activeKey === INSTR} className={`${btn} border-dashed border-cyan/40`}>
        <span className="block text-[15.5px] font-bold">Instrumentation</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Context comes from the code — request ids and attributes — not from buying another dashboard.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">WHICH JOB IS IT?</p>

      <button type="button" onClick={() => onToggle(RAIL)} aria-expanded={activeKey === RAIL} className={`${btn} border-primary/30`}>
        <span className="block space-y-1.5">
          {railRows.map((r) => (
            <span key={r.q} className="block rounded-lg border border-border bg-surface px-2.5 py-2 text-[13px]">
              <span className="font-semibold">
                {r.q} → {r.a}
              </span>
              <span className="block text-[12.5px] text-muted-foreground">{r.note}</span>
            </span>
          ))}
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function ObservabilityDiagram() {
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
              One incident, from symptom to root cause
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Request trace", color: "var(--cyan)" },
              { label: "Investigation", color: "var(--violet)" },
              { label: "Anomaly", color: "var(--ember)" },
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
        Monitoring watches the signals someone chose in advance and tells you that something is wrong;
        observability is having enough telemetry and context to work out why when nobody predicted it.
      </figcaption>
      <StageHint text="Hover the system, any telemetry type, the dashboards, the alert, the investigation or the comparison rail to isolate related signals; click any component for a short explanation." />
    </figure>
  );
}
