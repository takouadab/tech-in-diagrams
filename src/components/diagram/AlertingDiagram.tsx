import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const SYS = "sys";
const AVAIL = "avail";
const ERR = "err";
const LAT = "lat";
const SAT = "sat";
const RULE = "rule";
const WINDOW = "window";
const STATE = "state";
const NOTIFY = "notify";
const SEVERITY = "severity";
const INCIDENT = "incident";
const FIX = "fix";
const RESOLVED = "resolved";
const FATIGUE = "fatigue";

const related: Record<string, string[]> = {
  [SYS]: [AVAIL, ERR, LAT, SAT],
  [AVAIL]: [SYS, RULE],
  [ERR]: [SYS, RULE, WINDOW, STATE, FATIGUE],
  [LAT]: [SYS, RULE],
  [SAT]: [SYS, RULE],
  [RULE]: [ERR, WINDOW, STATE, AVAIL, LAT, SAT],
  [WINDOW]: [RULE, ERR, STATE, FATIGUE],
  [STATE]: [RULE, WINDOW, NOTIFY, RESOLVED],
  [NOTIFY]: [STATE, SEVERITY, INCIDENT],
  [SEVERITY]: [NOTIFY, INCIDENT],
  [INCIDENT]: [NOTIFY, FIX, SEVERITY],
  [FIX]: [INCIDENT, SYS, ERR, RESOLVED],
  [RESOLVED]: [FIX, STATE, ERR],
  [FATIGUE]: [WINDOW, ERR, NOTIFY],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1760;
const H = 900;

/* left: system + signals */
const L_X = 40;
const L_W = 420;
const SYS_Y = 110;
const SYS_H = 170;

const SF_Y = 310;
const SF_H = 530;
const CARD_X = L_X + 24;
const CARD_W = L_W - 48;
const CARD_H = 96;
const SIG_Y = [372, 492, 612, 732];

/* centre: rule engine */
const E_X = 520;
const E_W = 430;
const E_Y = 110;
const E_H = 550;

const R_X = 550;
const R_Y = 170;
const R_W = 370;
const R_H = 190;

const ST_Y = 448;
const ST_H = 200;

const FIX_Y = 700;
const FIX_H = 170;

/* right: notification + incident + recovery */
const N_X = 1000;
const N_W = 420;
const N_Y = 110;
const N_H = 190;

const IN_Y = 340;
const IN_H = 270;

const RS_Y = 650;
const RS_H = 220;

/* far-right rail */
const S_X = 1466;
const S_W = 254;
const SEV_Y = 110;
const SEV_H = 250;
const FA_Y = 400;
const FA_H = 260;
const LOOP_Y = 700;
const LOOP_H = 170;

/* --------------------------------- paths --------------------------------- */

const sErrRule = `M ${CARD_X + CARD_W} ${SIG_Y[1]! + CARD_H / 2} C 490 ${SIG_Y[1]! + CARD_H / 2}, 500 300, ${R_X} 276`;
const sAvailRule = `M ${CARD_X + CARD_W} ${SIG_Y[0]! + CARD_H / 2} C 480 420, 500 300, ${R_X} 250`;
const sLatRule = `M ${CARD_X + CARD_W} ${SIG_Y[2]! + CARD_H / 2} C 480 660, 500 330, ${R_X} 302`;
const sSatRule = `M ${CARD_X + CARD_W} ${SIG_Y[3]! + CARD_H / 2} C 480 780, 500 360, ${R_X} 328`;
const sRuleState = `M 735 ${R_Y + R_H} V ${ST_Y}`;
const sStateNotify = `M ${R_X + R_W} ${ST_Y + 60} C 970 ${ST_Y + 60}, 980 300, ${N_X} ${N_Y + N_H - 40}`;
const sNotifyIncident = `M ${N_X + 120} ${N_Y + N_H} V ${IN_Y}`;
const sIncidentFix = `M ${N_X} ${IN_Y + IN_H - 60} C 960 ${IN_Y + IN_H - 60}, 950 ${FIX_Y + 40}, ${E_X + E_W} ${FIX_Y + 60}`;
const sFixSignals = `M ${E_X + 40} ${FIX_Y + FIX_H} C 470 895, 250 895, 250 ${SF_H + SF_Y}`;
const sFixResolved = `M ${E_X + E_W - 60} ${FIX_Y} C 940 ${FIX_Y - 10}, 990 ${RS_Y + 150}, ${N_X} ${RS_Y + 140}`;
const sResolvedState = `M ${N_X} ${RS_Y + 40} C 950 ${RS_Y + 40}, 960 ${ST_Y + ST_H - 20}, ${R_X + R_W} ${ST_Y + ST_H - 30}`;

/* -------------------------------- content -------------------------------- */

type Signal = {
  key: string;
  eyebrow: string;
  label: string;
  value: string;
  tone: string;
  points: number[];
  threshold?: number;
  note: string;
};

const signals: Signal[] = [
  {
    key: AVAIL,
    eyebrow: "AVAILABILITY",
    label: "Requests succeeding",
    value: "99.98%",
    tone: "var(--cyan)",
    points: [0.8, 0.82, 0.79, 0.83, 0.81, 0.84, 0.8, 0.82, 0.81, 0.83, 0.8, 0.82],
    note: "Steady",
  },
  {
    key: ERR,
    eyebrow: "ERROR RATE",
    label: "5xx responses",
    value: "7.4%",
    tone: "var(--ember)",
    points: [0.16, 0.2, 0.15, 0.42, 0.18, 0.17, 0.22, 0.58, 0.74, 0.79, 0.82, 0.3],
    threshold: 0.5,
    note: "Above threshold",
  },
  {
    key: LAT,
    eyebrow: "LATENCY p95",
    label: "Time to respond",
    value: "612 ms",
    tone: "var(--primary)",
    points: [0.3, 0.32, 0.31, 0.34, 0.33, 0.36, 0.42, 0.55, 0.6, 0.58, 0.5, 0.36],
    note: "Rising with errors",
  },
  {
    key: SAT,
    eyebrow: "SATURATION",
    label: "CPU headroom used",
    value: "61%",
    tone: "var(--violet)",
    points: [0.4, 0.42, 0.44, 0.41, 0.45, 0.43, 0.46, 0.48, 0.5, 0.52, 0.49, 0.47],
    note: "Healthy",
  },
];

function spark(points: number[], x: number, y: number, w: number, h: number) {
  const step = w / (points.length - 1);
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(x + i * step).toFixed(1)} ${(y + h - p * h).toFixed(1)}`)
    .join(" ");
}

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case SYS:
      return {
        eyebrow: "The system",
        title: "A production service, emitting signals all the time",
        body: "Monitoring starts with something real that is running and serving users. The service continuously reports a handful of numbers about its own health. Nobody is watching them by hand — they are recorded so that rules can watch them for you, day and night.",
      };
    case AVAIL:
      return {
        eyebrow: "Signal",
        title: "Availability — are requests succeeding?",
        body: "The plainest question a user cares about: is the service answering? Availability is a signal, not an alert. On its own it is just a number moving over time; it only becomes an alert when a rule decides a particular value, for a particular length of time, is worth someone's attention.",
      };
    case ERR:
      return {
        eyebrow: "Signal",
        title: "Error rate — the signal that broke here",
        body: "Notice the two small spikes before the incident. Both crossed the threshold for a moment and neither meant anything: a retry, a slow dependency. The third rise stayed high. That difference — a moment versus a sustained condition — is exactly what the evaluation window exists to tell apart.",
      };
    case LAT:
      return {
        eyebrow: "Signal",
        title: "Latency — how slow it feels",
        body: "p95 latency says that ninety-five percent of requests were at least this fast. It usually moves with errors during an incident, which is useful confirmation, but each signal is watched by its own rule with its own threshold.",
      };
    case SAT:
      return {
        eyebrow: "Signal",
        title: "Saturation — how much headroom is left",
        body: "How full the resources are: CPU, memory, connections, queue depth. Saturation is a leading signal — it often rises before users notice anything — so it tends to be a warning rather than something that pages a person at three in the morning.",
      };
    case RULE:
      return {
        eyebrow: "Alert rule",
        title: "A condition, not a number",
        body: "The rule engine evaluates one written condition against the incoming signal: error rate above five percent, sustained for five minutes. The signal is the measurement; the rule is the judgement about which measurements matter. Change the rule and the same signal produces completely different alerts.",
      };
    case WINDOW:
      return {
        eyebrow: "Threshold and window",
        title: "Why the window matters more than the threshold",
        body: "A threshold alone fires on every spike, including the harmless ones. The evaluation window requires the condition to hold continuously before the alert changes state. Both earlier spikes were discarded because they recovered inside the window; the real fault held and fired.",
      };
    case STATE:
      return {
        eyebrow: "Alert state",
        title: "OK → FIRING → RESOLVED",
        body: "An alert is a small state machine, not an event stream. It sits in OK while the condition is false, moves to FIRING when the condition has held for the whole window, and returns to RESOLVED on its own when the signal comes back. That is what makes an alert something you can track and close.",
      };
    case NOTIFY:
      return {
        eyebrow: "Notification",
        title: "The alert is not the message",
        body: "Firing is a state change inside the system. The notification is the delivery of that state to a person or a channel: a page, a chat message, a ticket. Keeping them separate matters — the same firing alert can be routed differently at 3pm and 3am without touching the rule.",
      };
    case SEVERITY:
      return {
        eyebrow: "Severity and routing",
        title: "Warning informs, critical interrupts",
        body: "Warnings land in a team channel to be looked at during the day. Critical alerts page the on-call engineer immediately, because users are affected right now. Deciding severity honestly is what keeps paging meaningful — if everything is critical, nothing is.",
      };
    case INCIDENT:
      return {
        eyebrow: "Actionable alert",
        title: "What failed, how bad, where to look",
        body: "A good notification answers three questions before the engineer opens anything: which service is affected, how severe the impact is, and the first place to look. An alert that only says 'error rate high' makes the reader do the work the alert was supposed to do for them.",
      };
    case FIX:
      return {
        eyebrow: "Human response",
        title: "Mitigate first, understand afterwards",
        body: "The on-call engineer takes the shortest safe action that restores service — here, rolling back the deployment that introduced the errors. Root cause and prevention come later, in a calmer review. The alert existed to get a human to this moment quickly.",
      };
    case RESOLVED:
      return {
        eyebrow: "Recovery",
        title: "The signal comes back, and the alert closes itself",
        body: "Once errors drop below the threshold and stay there, the rule evaluates false again and the alert moves to RESOLVED without anyone clicking anything. The loop is closed: signal, rule, alert, notification, response, recovery — and the system is back to watching quietly.",
      };
    case FATIGUE:
      return {
        eyebrow: "Anti-pattern",
        title: "Noisy alerts train people to ignore alerts",
        body: "Twenty low-value notifications a day do not make a team safer; they make the important one easier to miss. The fix is not a bigger screen — it is fewer, better rules: alert on user-visible symptoms, require a sustained window, and delete any alert nobody has ever acted on.",
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
      aria-label="Monitoring and alerting drawn as an incident-response loop. On the left, a production service emits four live signals: availability, error rate, latency and saturation, with the error rate rising above a dashed threshold line. In the centre, an alert rule evaluates error rate above five percent sustained for five minutes, and an alert state machine moves from OK to FIRING. On the right, a notification is routed by severity to the on-call engineer, carrying an actionable incident card that names the failing service, the impact and where to look. Below, the engineer rolls back the bad deployment, the error rate falls back under the threshold and the alert returns to resolved. A side note explains that noisy alerts cause alert fatigue."
      className="w-full"
      style={{ minHeight: 640, maxHeight: 920 }}
    >
      <defs>
        <linearGradient id={`${uid}-engine`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.09" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={`${uid}-signals`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={L_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 20 — SIGNAL, RULE, ALERT, RESPONSE
        </text>
        <text x={W - 40} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          AN ALERT IS A DECISION, NOT A NUMBER
        </text>
        <line x1={L_X} y1={52} x2={W - 40} y2={52} stroke="var(--border)" strokeWidth={1} />
        <text x={L_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--primary)">
          RUNNING SYSTEM · LIVE SIGNALS
        </text>
        <text x={E_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--cyan)">
          ALERT RULE ENGINE
        </text>
        <text x={N_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--violet)">
          NOTIFICATION · ON-CALL
        </text>
      </g>

      {/* ------------------------------ flows -------------------------------- */}
      <g>
        <Flow d={sAvailRule} on={on(AVAIL) || on(RULE)} color="var(--cyan)" />
        <Flow d={sLatRule} on={on(LAT) || on(RULE)} color="var(--primary)" />
        <Flow d={sSatRule} on={on(SAT) || on(RULE)} color="var(--violet)" />
        <Flow d={sErrRule} on={on(ERR) || on(RULE) || on(WINDOW)} color="var(--ember)" />
        <Flow d={sRuleState} on={on(RULE) || on(STATE) || on(WINDOW)} color="var(--ember)" />
        <Flow d={sStateNotify} on={on(STATE) || on(NOTIFY)} color="var(--ember)" />
        <Flow d={sNotifyIncident} on={on(NOTIFY) || on(INCIDENT)} color="var(--violet)" />
        <Flow d={sIncidentFix} on={on(INCIDENT) || on(FIX)} color="var(--violet)" />
        <Flow d={sFixSignals} on={on(FIX) || on(ERR) || on(SYS)} color="var(--cyan)" dashed />
        <Flow d={sFixResolved} on={on(FIX) || on(RESOLVED)} color="var(--cyan)" />
        <Flow d={sResolvedState} on={on(RESOLVED) || on(STATE)} color="var(--cyan)" dashed />

        <g className="motion-safe:block motion-reduce:hidden" aria-hidden="true">
          <Token path={sErrRule} dur="1s" begin="0s" color="var(--ember)" />
          <Token path={sRuleState} dur="0.7s" begin="1.3s" color="var(--ember)" />
          <Token path={sStateNotify} dur="1s" begin="2.2s" color="var(--ember)" />
          <Token path={sNotifyIncident} dur="0.6s" begin="3.4s" color="var(--violet)" />
          <Token path={sIncidentFix} dur="1.1s" begin="4.2s" color="var(--violet)" />
          <Token path={sFixSignals} dur="1.4s" begin="5.5s" color="var(--cyan)" />
          <Token path={sFixResolved} dur="1.1s" begin="7.1s" color="var(--cyan)" />
        </g>
      </g>

      {/* ------------------------------ system -------------------------------- */}
      <g opacity={op(SYS)}>
        <g {...interactive(SYS, "Production service — a running system emitting operational signals continuously")}>
          {card(SYS, L_X, SYS_Y, L_W, SYS_H, "var(--primary)")}
          <text x={L_X + 24} y={SYS_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
            PRODUCTION · checkout-api
          </text>
          <text x={L_X + 24} y={SYS_Y + 66} fontSize={19} fontWeight={800} fill="var(--foreground)">
            Running, and reporting
          </text>
          <text x={L_X + 24} y={SYS_Y + 94} fontSize={13} fill="var(--muted-foreground)">
            Three instances serving real users, emitting
          </text>
          <text x={L_X + 24} y={SYS_Y + 114} fontSize={13} fill="var(--muted-foreground)">
            the same few numbers every few seconds.
          </text>
          <g className="motion-safe:block motion-reduce:hidden" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={L_X + 30 + i * 22} cy={SYS_Y + 142} r={5} fill="var(--cyan)" opacity={0.35}>
                <animate attributeName="opacity" values="0.25;1;0.25" dur="1.8s" begin={`${i * 0.35}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>
          <text x={L_X + 110} y={SYS_Y + 147} fontSize={12} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            emitting…
          </text>
        </g>
      </g>

      {/* ------------------------------ signals ------------------------------- */}
      <g aria-hidden="true">
        <rect x={L_X} y={SF_Y} width={L_W} height={SF_H} rx={26} fill={`url(#${uid}-signals)`} stroke="var(--border)" strokeDasharray="3 7" />
        <text x={L_X + 24} y={SF_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
          LIVE SIGNALS · WHAT IS MEASURED
        </text>
      </g>

      {signals.map((s, i) => {
        const y = SIG_Y[i]!;
        return (
          <g key={s.key} opacity={op(s.key)}>
            <g {...interactive(s.key, `${s.label} signal — a measurement, not yet an alert`)}>
              {card(s.key, CARD_X, y, CARD_W, CARD_H, s.tone, 18)}
              <text x={CARD_X + 18} y={y + 26} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill={s.tone}>
                {s.eyebrow}
              </text>
              <text x={CARD_X + 18} y={y + 50} fontSize={14.5} fontWeight={700} fill="var(--foreground)">
                {s.label}
              </text>
              <text x={CARD_X + CARD_W - 18} y={y + 30} textAnchor="end" fontSize={15} fontWeight={800} fontFamily="var(--font-mono)" fill={s.tone}>
                {s.value}
              </text>
              <text x={CARD_X + CARD_W - 18} y={y + 84} textAnchor="end" fontSize={11.5} fill="var(--muted-foreground)">
                {s.note}
              </text>
              {s.threshold !== undefined && (
                <line
                  x1={CARD_X + 18}
                  x2={CARD_X + 190}
                  y1={y + 88 - s.threshold * 30}
                  y2={y + 88 - s.threshold * 30}
                  stroke="var(--ember)"
                  strokeWidth={1.2}
                  strokeDasharray="4 5"
                  opacity={0.8}
                />
              )}
              <path d={spark(s.points, CARD_X + 18, y + 58, 172, 30)} fill="none" stroke={s.tone} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          </g>
        );
      })}

      {/* ------------------------------ engine -------------------------------- */}
      <g aria-hidden="true">
        <rect x={E_X} y={E_Y} width={E_W} height={E_H} rx={28} fill={`url(#${uid}-engine)`} stroke="var(--border)" />
        <text x={E_X + 30} y={E_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
          RULE ENGINE · EVALUATES CONTINUOUSLY
        </text>
      </g>

      <g opacity={op(RULE)}>
        <g {...interactive(RULE, "Alert rule — the condition that decides which measurements matter")}>
          {card(RULE, R_X, R_Y, R_W, R_H, "var(--cyan)")}
          <text x={R_X + 22} y={R_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            ALERT RULE
          </text>
          <text x={R_X + 22} y={R_Y + 62} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            A condition, not a number
          </text>
          <rect x={R_X + 20} y={R_Y + 80} width={R_W - 40} height={44} rx={12} fill="color-mix(in oklab, var(--cyan) 8%, transparent)" stroke="color-mix(in oklab, var(--cyan) 26%, transparent)" />
          <text x={R_X + 36} y={R_Y + 108} fontSize={13} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            error_rate &gt; 5% for 5m
          </text>
          <text x={R_X + 22} y={R_Y + 150} fontSize={13} fill="var(--muted-foreground)">
            The signal reports. The rule decides
          </text>
          <text x={R_X + 22} y={R_Y + 172} fontSize={13} fill="var(--muted-foreground)">
            whether that reading deserves a person.
          </text>
        </g>
      </g>

      <g opacity={op(WINDOW)}>
        <g {...interactive(WINDOW, "Threshold and evaluation window — the condition must persist before firing")}>
          <rect
            x={R_X + 20}
            y={R_Y + R_H + 14}
            width={R_W - 40}
            height={58}
            rx={16}
            fill={on(WINDOW) ? "color-mix(in oklab, var(--ember) 7%, var(--surface))" : "var(--surface)"}
            stroke={on(WINDOW) ? "color-mix(in oklab, var(--ember) 55%, transparent)" : "var(--border-strong)"}
            strokeWidth={on(WINDOW) ? 2 : 1.2}
            strokeDasharray="5 6"
            style={{ transition: "fill .3s ease, stroke .3s ease" }}
          />
          <text x={R_X + 38} y={R_Y + R_H + 38} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--ember)">
            THRESHOLD + WINDOW
          </text>
          <text x={R_X + 38} y={R_Y + R_H + 60} fontSize={13} fill="var(--muted-foreground)">
            Two brief spikes discarded · third held 5m
          </text>
        </g>
      </g>

      <g opacity={op(STATE)}>
        <g {...interactive(STATE, "Alert state machine — OK, firing, resolved")}>
          {card(STATE, R_X, ST_Y, R_W, ST_H, "var(--ember)")}
          <text x={R_X + 22} y={ST_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--ember)">
            ALERT STATE
          </text>
          {[
            { t: "OK", tone: "var(--muted-foreground)", x: R_X + 22, active: false },
            { t: "FIRING", tone: "var(--ember)", x: R_X + 118, active: true },
            { t: "RESOLVED", tone: "var(--cyan)", x: R_X + 236, active: false },
          ].map((c) => (
            <g key={c.t}>
              <rect
                x={c.x}
                y={ST_Y + 50}
                width={c.t === "OK" ? 76 : c.t === "FIRING" ? 100 : 112}
                height={42}
                rx={12}
                fill={c.active ? "color-mix(in oklab, var(--ember) 14%, transparent)" : "transparent"}
                stroke={`color-mix(in oklab, ${c.tone} ${c.active ? "60%" : "28%"}, transparent)`}
                strokeWidth={c.active ? 2 : 1.2}
              />
              <text x={c.x + 16} y={ST_Y + 77} fontSize={13} fontWeight={800} fontFamily="var(--font-mono)" fill={c.tone}>
                {c.t}
              </text>
            </g>
          ))}
          <text x={R_X + 22} y={ST_Y + 132} fontSize={13} fill="var(--muted-foreground)">
            An alert is a small state machine: it opens
          </text>
          <text x={R_X + 22} y={ST_Y + 154} fontSize={13} fill="var(--muted-foreground)">
            when the condition holds and closes itself
          </text>
          <text x={R_X + 22} y={ST_Y + 176} fontSize={13} fill="var(--muted-foreground)">
            when the signal recovers.
          </text>
        </g>
      </g>

      {/* --------------------------- human response --------------------------- */}
      <g opacity={op(FIX)}>
        <g {...interactive(FIX, "Human response — the engineer mitigates and service recovers")}>
          {card(FIX, E_X, FIX_Y, E_W, FIX_H, "var(--violet)")}
          <text x={E_X + 30} y={FIX_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
            HUMAN RESPONSE
          </text>
          <text x={E_X + 30} y={FIX_Y + 64} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            Mitigate, then understand
          </text>
          <text x={E_X + 30} y={FIX_Y + 94} fontSize={13} fill="var(--muted-foreground)">
            Roll back the deployment that introduced the
          </text>
          <text x={E_X + 30} y={FIX_Y + 116} fontSize={13} fill="var(--muted-foreground)">
            errors. Restore service first — the review of
          </text>
          <text x={E_X + 30} y={FIX_Y + 138} fontSize={13} fill="var(--muted-foreground)">
            why it happened comes afterwards.
          </text>
        </g>
      </g>

      {/* ---------------------------- notification ---------------------------- */}
      <g opacity={op(NOTIFY)}>
        <g {...interactive(NOTIFY, "Notification — the firing alert delivered to a person or channel")}>
          {card(NOTIFY, N_X, N_Y, N_W, N_H, "var(--ember)")}
          <text x={N_X + 24} y={N_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--ember)">
            NOTIFICATION · DELIVERED
          </text>
          <text x={N_X + 24} y={N_Y + 66} fontSize={19} fontWeight={800} fill="var(--foreground)">
            Paged the on-call engineer
          </text>
          <text x={N_X + 24} y={N_Y + 96} fontSize={13} fill="var(--muted-foreground)">
            Firing is a state inside the system. The
          </text>
          <text x={N_X + 24} y={N_Y + 118} fontSize={13} fill="var(--muted-foreground)">
            notification is how it reaches a human.
          </text>
          <rect x={N_X + 22} y={N_Y + 132} width={200} height={38} rx={11} fill="color-mix(in oklab, var(--ember) 9%, transparent)" stroke="color-mix(in oklab, var(--ember) 28%, transparent)" />
          <text x={N_X + 38} y={N_Y + 157} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            CRITICAL → phone
          </text>
          <rect x={N_X + 236} y={N_Y + 132} width={162} height={38} rx={11} fill="var(--surface)" stroke="var(--border-strong)" />
          <text x={N_X + 252} y={N_Y + 157} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            WARN → chat
          </text>
        </g>
      </g>

      <g opacity={op(INCIDENT)}>
        <g {...interactive(INCIDENT, "Actionable incident card — what failed, how bad it is and where to look")}>
          {card(INCIDENT, N_X, IN_Y, N_W, IN_H, "var(--violet)")}
          <text x={N_X + 24} y={IN_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
            ACTIONABLE ALERT
          </text>
          <text x={N_X + 24} y={IN_Y + 66} fontSize={19} fontWeight={800} fill="var(--foreground)">
            checkout-api · errors 7.4%
          </text>
          {[
            { k: "WHAT", v: "Checkout requests failing for 5 minutes" },
            { k: "IMPACT", v: "≈ 1 in 13 purchases affected" },
            { k: "NEXT", v: "Compare with the 14:02 deployment" },
          ].map((r, i) => (
            <g key={r.k}>
              <text x={N_X + 24} y={IN_Y + 108 + i * 46} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
                {r.k}
              </text>
              <text x={N_X + 24} y={IN_Y + 130 + i * 46} fontSize={13.5} fill="var(--muted-foreground)">
                {r.v}
              </text>
            </g>
          ))}
          <text x={N_X + 24} y={IN_Y + 248} fontSize={12.5} fill="var(--muted-foreground)">
            Everything needed to start, in one message.
          </text>
        </g>
      </g>

      <g opacity={op(RESOLVED)}>
        <g {...interactive(RESOLVED, "Recovery — the signal returns to normal and the alert resolves")}>
          {card(RESOLVED, N_X, RS_Y, N_W, RS_H, "var(--cyan)")}
          <text x={N_X + 24} y={RS_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            RECOVERY · LOOP CLOSED
          </text>
          <rect x={N_X + 22} y={RS_Y + 50} width={130} height={40} rx={12} fill="color-mix(in oklab, var(--cyan) 12%, transparent)" stroke="color-mix(in oklab, var(--cyan) 40%, transparent)" strokeWidth={1.6} />
          <text x={N_X + 40} y={RS_Y + 76} fontSize={13} fontWeight={800} fontFamily="var(--font-mono)" fill="var(--cyan)">
            RESOLVED
          </text>
          <text x={N_X + 170} y={RS_Y + 76} fontSize={13} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            error_rate 0.4%
          </text>
          <text x={N_X + 24} y={RS_Y + 122} fontSize={13} fill="var(--muted-foreground)">
            Errors fell back under the threshold and
          </text>
          <text x={N_X + 24} y={RS_Y + 144} fontSize={13} fill="var(--muted-foreground)">
            stayed there, so the rule evaluates false
          </text>
          <text x={N_X + 24} y={RS_Y + 166} fontSize={13} fill="var(--muted-foreground)">
            again and the alert closes itself — no one
          </text>
          <text x={N_X + 24} y={RS_Y + 188} fontSize={13} fill="var(--muted-foreground)">
            has to remember to tidy up.
          </text>
        </g>
      </g>

      {/* ------------------------------- rail --------------------------------- */}
      <g opacity={op(SEVERITY)}>
        <g {...interactive(SEVERITY, "Severity and routing — warnings inform, critical alerts interrupt")}>
          {card(SEVERITY, S_X, SEV_Y, S_W, SEV_H, "var(--primary)")}
          <text x={S_X + 20} y={SEV_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
            SEVERITY · ROUTING
          </text>
          <text x={S_X + 20} y={SEV_Y + 62} fontSize={17.5} fontWeight={800} fill="var(--foreground)">
            Who gets woken
          </text>
          {[
            { t: "CRITICAL · pages on-call", tone: "var(--ember)" },
            { t: "WARNING · team channel", tone: "var(--primary)" },
            { t: "INFO · dashboard only", tone: "var(--muted-foreground)" },
          ].map((r, i) => (
            <g key={r.t}>
              <rect x={S_X + 18} y={SEV_Y + 82 + i * 46} width={S_W - 36} height={36} rx={11} fill="var(--surface)" stroke="var(--border)" />
              <text x={S_X + 32} y={SEV_Y + 105 + i * 46} fontSize={12} fontFamily="var(--font-mono)" fill={r.tone}>
                {r.t}
              </text>
            </g>
          ))}
          <text x={S_X + 20} y={SEV_Y + 236} fontSize={12.5} fill="var(--muted-foreground)">
            Impact decides the channel.
          </text>
        </g>
      </g>

      <g opacity={op(FATIGUE)}>
        <g {...interactive(FATIGUE, "Alert fatigue — too many low-value alerts make important ones invisible")}>
          <rect
            x={S_X}
            y={FA_Y}
            width={S_W}
            height={FA_H}
            rx={22}
            fill={on(FATIGUE) ? "color-mix(in oklab, var(--ember) 7%, var(--surface))" : "var(--surface)"}
            stroke={on(FATIGUE) ? "color-mix(in oklab, var(--ember) 55%, transparent)" : "var(--border-strong)"}
            strokeWidth={on(FATIGUE) ? 2 : 1.2}
            strokeDasharray="5 6"
            style={{ transition: "fill .3s ease, stroke .3s ease" }}
          />
          <text x={S_X + 20} y={FA_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--ember)">
            ANTI-PATTERN
          </text>
          <text x={S_X + 20} y={FA_Y + 62} fontSize={17.5} fontWeight={800} fill="var(--foreground)">
            Alert fatigue
          </text>
          <g className="motion-safe:block motion-reduce:hidden" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={S_X + 20 + i * 26} y={FA_Y + 82} width={18} height={18} rx={6} fill="color-mix(in oklab, var(--ember) 30%, transparent)">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1.4s" begin={`${i * 0.18}s`} repeatCount="indefinite" />
              </rect>
            ))}
          </g>
          <text x={S_X + 20} y={FA_Y + 138} fontSize={12.5} fill="var(--muted-foreground)">
            Twenty pages a day and the
          </text>
          <text x={S_X + 20} y={FA_Y + 160} fontSize={12.5} fill="var(--muted-foreground)">
            one that mattered is missed.
          </text>
          <text x={S_X + 20} y={FA_Y + 194} fontSize={12.5} fill="var(--muted-foreground)">
            Alert on symptoms, require a
          </text>
          <text x={S_X + 20} y={FA_Y + 216} fontSize={12.5} fill="var(--muted-foreground)">
            window, delete rules nobody
          </text>
          <text x={S_X + 20} y={FA_Y + 238} fontSize={12.5} fill="var(--muted-foreground)">
            has ever acted on.
          </text>
        </g>
      </g>

      <g aria-hidden="true">
        <rect x={S_X} y={LOOP_Y} width={S_W} height={LOOP_H} rx={22} fill="var(--surface)" stroke="var(--border)" />
        <text x={S_X + 20} y={LOOP_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--muted-foreground)">
          THE LOOP
        </text>
        {["Signal → rule", "Rule → alert state", "Alert → notification", "Human → recovery"].map((t, i) => (
          <text key={t} x={S_X + 20} y={LOOP_Y + 62 + i * 28} fontSize={12.5} fill="var(--muted-foreground)">
            {t}
          </text>
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
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">SYSTEM &amp; SIGNALS</p>

      <button type="button" onClick={() => onToggle(SYS)} aria-expanded={activeKey === SYS} className={`${btn} border-primary/40 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-primary">PRODUCTION · checkout-api</span>
        <span className="mt-1 block text-[17px] font-extrabold">Running, and reporting</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Three instances serving users, emitting the same few numbers every few seconds.
        </span>
      </button>

      {signals.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => onToggle(s.key)}
          aria-expanded={activeKey === s.key}
          className={`${btn} ${s.key === ERR ? "border-ember/45 bg-ember/5" : "border-border"}`}
        >
          <span className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-[10.5px] tracking-[0.16em] text-muted-foreground">{s.eyebrow}</span>
            <span className="font-mono text-[14px] font-bold" style={{ color: s.tone }}>
              {s.value}
            </span>
          </span>
          <span className="mt-1 block text-[15.5px] font-bold">{s.label}</span>
          <span className="block text-[12.5px] text-muted-foreground">{s.note}</span>
        </button>
      ))}

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">RULE · THRESHOLD · WINDOW</p>

      <button type="button" onClick={() => onToggle(RULE)} aria-expanded={activeKey === RULE} className={`${btn} border-cyan/40 bg-cyan/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-cyan">ALERT RULE</span>
        <span className="mt-1 block text-[16px] font-bold">A condition, not a number</span>
        <span className="mt-2 block rounded-xl border border-border bg-surface p-3 font-mono text-[12px] text-muted-foreground">
          error_rate &gt; 5% for 5m
        </span>
      </button>

      <button type="button" onClick={() => onToggle(WINDOW)} aria-expanded={activeKey === WINDOW} className={`${btn} border-dashed border-ember/40`}>
        <span className="block text-[15.5px] font-bold">Threshold + evaluation window</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Two brief spikes were discarded. The third held for the full five minutes.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">ALERT STATE</p>

      <button type="button" onClick={() => onToggle(STATE)} aria-expanded={activeKey === STATE} className={`${btn} border-ember/45 bg-ember/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-ember">OK → FIRING → RESOLVED</span>
        <span className="mt-1 block text-[16px] font-bold">FIRING</span>
        <span className="block text-[12.5px] text-muted-foreground">
          An alert is a small state machine that opens when the condition holds and closes when it recovers.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">NOTIFICATION · ON-CALL</p>

      <button type="button" onClick={() => onToggle(NOTIFY)} aria-expanded={activeKey === NOTIFY} className={`${btn} border-ember/40`}>
        <span className="block text-[15.5px] font-bold">Paged the on-call engineer</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Firing is a state inside the system; the notification is how it reaches a human.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(SEVERITY)} aria-expanded={activeKey === SEVERITY} className={`${btn} border-primary/30`}>
        <span className="block text-[15.5px] font-bold">Severity decides the channel</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Critical pages a person, warning goes to the team channel, info stays on a dashboard.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(INCIDENT)} aria-expanded={activeKey === INCIDENT} className={`${btn} border-violet/40 bg-violet/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-violet">ACTIONABLE ALERT</span>
        <span className="mt-1 block text-[16px] font-bold">checkout-api · errors 7.4%</span>
        <span className="block text-[12.5px] text-muted-foreground">
          What failed, how bad it is, and where to look next — in one message.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">RESPONSE &amp; RECOVERY</p>

      <button type="button" onClick={() => onToggle(FIX)} aria-expanded={activeKey === FIX} className={`${btn} border-violet/30`}>
        <span className="block text-[15.5px] font-bold">Mitigate, then understand</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Roll back the deployment that introduced the errors; the review comes afterwards.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(RESOLVED)} aria-expanded={activeKey === RESOLVED} className={`${btn} border-cyan/45 bg-cyan/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-cyan">RESOLVED</span>
        <span className="mt-1 block text-[16px] font-bold">error_rate 0.4%</span>
        <span className="block text-[12.5px] text-muted-foreground">
          The signal came back under the threshold, so the alert closed itself.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">NOISE</p>

      <button type="button" onClick={() => onToggle(FATIGUE)} aria-expanded={activeKey === FATIGUE} className={`${btn} border-dashed border-ember/40`}>
        <span className="block text-[15.5px] font-bold">Alert fatigue</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Twenty low-value pages a day and the one that mattered is missed. Fewer, better rules.
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function AlertingDiagram() {
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
              Signal · rule · alert · response
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Signal", color: "var(--primary)" },
              { label: "Firing", color: "var(--ember)" },
              { label: "Recovered", color: "var(--cyan)" },
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
        Monitoring watches known signals; alerting turns one sustained, meaningful condition into an action for
        a person — and closes itself when the signal recovers.
      </figcaption>
      <StageHint text="Hover the system, any signal, the rule, the threshold and window, the alert state, the notification, severity routing, the incident card, the response, recovery or the fatigue note to isolate related elements; click any component for a short explanation." />
    </figure>
  );
}
