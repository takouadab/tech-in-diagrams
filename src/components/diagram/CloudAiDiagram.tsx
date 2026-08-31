import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const APP = "app";
const POLICY = "policy";
const CONTEXT = "context";
const SERVICE = "service";
const ENDPOINT = "endpoint";
const COMPUTE = "compute";
const RESPONSE = "response";
const OPS = "ops";
const TRAIN = "training";
const VALUE = "value";

const related: Record<string, string[]> = {
  [APP]: [POLICY, CONTEXT, RESPONSE],
  [POLICY]: [APP, CONTEXT, ENDPOINT, RESPONSE],
  [CONTEXT]: [POLICY, ENDPOINT, APP],
  [SERVICE]: [ENDPOINT, COMPUTE, OPS, RESPONSE],
  [ENDPOINT]: [POLICY, CONTEXT, COMPUTE, SERVICE, OPS],
  [COMPUTE]: [ENDPOINT, RESPONSE, SERVICE, OPS],
  [RESPONSE]: [COMPUTE, APP, POLICY, SERVICE],
  [OPS]: [SERVICE, ENDPOINT, COMPUTE],
  [TRAIN]: [ENDPOINT],
  [VALUE]: [SERVICE, OPS],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1760;
const H = 862;

/* application column */
const A_X = 40;
const A_Y = 200;
const A_W = 300;
const A_H = 200;

/* orchestration column */
const O_X = 390;
const O_W = 340;
const P_Y = 150;
const P_H = 170;
const C_Y = 380;
const C_H = 190;

/* managed AI service frame */
const F_X = 800;
const F_Y = 110;
const F_W = 620;
const F_H = 620;

const E_X = 830;
const E_Y = 190;
const E_W = 560;
const E_H = 120;

const M_X = 830;
const M_Y = 350;
const M_W = 270;
const M_H = 160;

const R_X = 1130;
const R_Y = 350;
const R_W = 260;
const R_H = 160;

const OPS_Y = 560;
const OPS_H = 120;
const OPS_W = 180;

/* right rails */
const T_X = 1460;
const T_W = 260;
const T_Y = 140;
const T_H = 300;
const V_Y = 480;
const V_H = 250;

/* --------------------------------- paths --------------------------------- */

const sAppPolicy = `M ${A_X + A_W} 300 C 366 300, 366 235, ${O_X} 235`;
const sPolicyCtx = `M 560 ${P_Y + P_H} V ${C_Y}`;
const sPolicyEndpoint = `M ${O_X + O_W} 210 C 780 210, 784 250, ${E_X} 250`;
const sCtxEndpoint = `M ${O_X + O_W} 475 C 780 475, 782 262, ${E_X} 262`;
const sEndCompute = `M 1110 ${E_Y + E_H} C 1110 332, 965 332, 965 ${M_Y}`;
const sComputeResp = `M ${M_X + M_W} 430 H ${R_X}`;
const sResponse = `M 1260 ${R_Y + R_H} V 770 Q 1260 790 1240 790 H 210 Q 190 790 190 770 V ${A_Y + A_H}`;
const sTrain = `M ${T_X} 290 C 1424 290, 1414 250, ${E_X + E_W} 250`;

/* --------------------------------- copy ---------------------------------- */

const opsChips = [
  { key: "latency", label: "LATENCY", value: "p95 1.4s", note: "queue + generation", tone: "var(--cyan)" },
  { key: "cost", label: "TOKENS / COST", value: "1.8k in · 420 out", note: "billed per request", tone: "var(--primary)" },
  { key: "scale", label: "SCALING", value: "elastic capacity", note: "provider-operated", tone: "var(--violet)" },
] as const;

const valueRows = [
  "Model access without buying accelerators",
  "Capacity scales with demand, not procurement",
  "Deployment, versioning and quotas are managed",
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case APP:
      return {
        eyebrow: "Your application",
        title: "The app orchestrates; it does not think",
        body: "A user action becomes a request your application composes: which prompt, which data, which user is allowed to ask. Everything about permissions, data handling and the interface stays your responsibility, exactly as with any other API you call.",
      };
    case POLICY:
      return {
        eyebrow: "Guardrails",
        title: "A policy step on the way in and out",
        body: "Requests pass a check before they reach the model — authentication, quotas, and rules about what may be sent. Responses pass a check on the way back. It is a small, ordinary control point, not a substitute for judgement about how the output is used.",
      };
    case CONTEXT:
      return {
        eyebrow: "Optional context",
        title: "Relevant data supplied at request time",
        body: "Useful answers usually need your own content, fetched from a search index or database and attached to the prompt for this one call. The model reads it as input; it does not permanently learn from it. Remove the document and the next answer no longer knows it.",
      };
    case SERVICE:
      return {
        eyebrow: "Managed AI service",
        title: "A model you consume, not a cluster you run",
        body: "The provider operates the accelerators, the runtime, the model versions and the capacity. You get an authenticated endpoint and a bill. That abstraction is the whole point of AI in the cloud — the hardware exists, but you never touch it.",
      };
    case ENDPOINT:
      return {
        eyebrow: "Model endpoint",
        title: "An authenticated API in front of a model",
        body: "The endpoint handles routing, model version selection, throttling and quotas. Your application calls it the same way it calls any other service: a request in, a response out, with credentials and limits attached.",
      };
    case COMPUTE:
      return {
        eyebrow: "Inference",
        title: "Running the trained model on your input",
        body: "Inference is the model producing an output for input it has not seen before. It runs on shared, specialised compute the provider operates. Each call is independent: the same prompt tomorrow runs the same way, on the same trained weights.",
      };
    case RESPONSE:
      return {
        eyebrow: "Output",
        title: "Generated text or data returns to your app",
        body: "The response comes back through the same policy step and into your application, which decides how to present it, whether to store it and whether a human should confirm it. Model output is a suggestion, not a guarantee.",
      };
    case OPS:
      return {
        eyebrow: "Operations",
        title: "Latency, cost and capacity are visible concerns",
        body: "Generation takes real time and is usually billed per token, so the request path has a measurable cost and a measurable delay. Capacity scales elastically, but scaling and spend are things your team watches, just as with any managed service.",
      };
    case TRAIN:
      return {
        eyebrow: "Separate workflow",
        title: "Training and fine-tuning are not this path",
        body: "Nearly every application request is inference against an already trained model. Training or fine-tuning is a distinct, deliberate job with its own data, cost and schedule; its result is a new model version the endpoint can then serve. It does not happen on each prompt.",
      };
    case VALUE:
      return {
        eyebrow: "Why the cloud",
        title: "Capability as a service",
        body: "Cloud AI means consuming AI capabilities the way you consume storage or databases: managed model access, elastic compute, deployment and integration. What remains yours is orchestration, data, permissions and the user experience around the answer.",
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
      aria-label="A cloud AI request drawn end to end. On the left an application composes a request for a user. In the middle a guardrail and policy step checks the request, and an optional context retrieval step attaches relevant company data. On the right a large managed AI service contains an authenticated model endpoint, provider-operated inference compute and response generation, with latency, token cost and scaling indicators along the bottom. The generated response returns through the policy step to the application. A separate dashed rail on the far right shows training and fine-tuning as a distinct workflow that produces new model versions rather than happening on each request."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 860 }}
    >
      <defs>
        <linearGradient id={`${uid}-svc`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.09" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={A_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 17 — ONE REQUEST TO A CLOUD AI SERVICE
        </text>
        <text x={W - 40} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          INFERENCE IS THE EVERYDAY PATH
        </text>
        <line x1={A_X} y1={52} x2={W - 40} y2={52} stroke="var(--border)" strokeWidth={1} />
        <text x={A_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          YOUR APPLICATION
        </text>
        <text x={O_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--cyan)">
          ORCHESTRATION
        </text>
        <text x={T_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--violet)">
          SEPARATE WORKFLOW
        </text>
      </g>

      {/* ------------------------------ flows -------------------------------- */}
      <g>
        <Flow d={sAppPolicy} on={on(APP) || on(POLICY)} color="var(--primary)" />
        <Flow d={sPolicyCtx} on={on(POLICY) || on(CONTEXT)} color="var(--cyan)" />
        <Flow d={sPolicyEndpoint} on={on(POLICY) || on(ENDPOINT)} color="var(--primary)" />
        <Flow d={sCtxEndpoint} on={on(CONTEXT) || on(ENDPOINT)} color="var(--cyan)" />
        <Flow d={sEndCompute} on={on(ENDPOINT) || on(COMPUTE)} color="var(--primary)" />
        <Flow d={sComputeResp} on={on(COMPUTE) || on(RESPONSE)} color="var(--violet)" />
        <Flow d={sResponse} on={on(RESPONSE) || on(APP)} color="var(--violet)" />
        <Flow d={sTrain} on={on(TRAIN)} color="var(--violet)" dashed />

        <g className="motion-safe:block motion-reduce:hidden" aria-hidden="true">
          <Token path={sAppPolicy} dur="1s" begin="0s" color="var(--primary)" />
          <Token path={sPolicyEndpoint} dur="1s" begin="1s" color="var(--primary)" />
          <Token path={sCtxEndpoint} dur="1.1s" begin="0.9s" color="var(--cyan)" />
          <Token path={sEndCompute} dur="0.9s" begin="2.1s" color="var(--primary)" />
          <Token path={sComputeResp} dur="0.5s" begin="3.1s" color="var(--violet)" />
          <Token path={sResponse} dur="2.2s" begin="3.7s" color="var(--violet)" />
        </g>
      </g>

      {/* --------------------------- application ----------------------------- */}
      <g opacity={op(APP)}>
        <g {...interactive(APP, "Your application — composes the request and owns the user experience")}>
          {card(APP, A_X, A_Y, A_W, A_H, "var(--primary)")}
          <text x={A_X + 24} y={A_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
            USER · APPLICATION
          </text>
          <text x={A_X + 24} y={A_Y + 66} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            Your app
          </text>
          <text x={A_X + 24} y={A_Y + 92} fontSize={13} fill="var(--muted-foreground)">
            Composes the request, owns
          </text>
          <text x={A_X + 24} y={A_Y + 112} fontSize={13} fill="var(--muted-foreground)">
            permissions and the interface.
          </text>
          <rect x={A_X + 22} y={A_Y + 130} width={A_W - 44} height={48} rx={14} fill="color-mix(in oklab, var(--primary) 6%, transparent)" stroke="color-mix(in oklab, var(--primary) 26%, transparent)" />
          <text x={A_X + 38} y={A_Y + 160} fontSize={13} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            prompt · user input
          </text>
        </g>
      </g>

      {/* ---------------------------- guardrail ------------------------------ */}
      <g opacity={op(POLICY)}>
        <g {...interactive(POLICY, "Guardrail and policy step on the request and the response")}>
          {card(POLICY, O_X, P_Y, O_W, P_H, "var(--cyan)")}
          <text x={O_X + 24} y={P_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            GUARDRAIL · POLICY
          </text>
          <text x={O_X + 24} y={P_Y + 66} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            Checked in, checked out
          </text>
          <text x={O_X + 24} y={P_Y + 94} fontSize={13} fill="var(--muted-foreground)">
            Authentication, quotas and rules
          </text>
          <text x={O_X + 24} y={P_Y + 114} fontSize={13} fill="var(--muted-foreground)">
            on what may be sent and returned.
          </text>
          <text x={O_X + 24} y={P_Y + 146} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--cyan)">
            request ✓ · response ✓
          </text>
        </g>
      </g>

      {/* ----------------------------- context ------------------------------- */}
      <g opacity={op(CONTEXT)}>
        <g {...interactive(CONTEXT, "Optional context retrieval — your own data attached to this request")}>
          {card(CONTEXT, O_X, C_Y, O_W, C_H, "var(--cyan)")}
          <text x={O_X + 24} y={C_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            OPTIONAL CONTEXT
          </text>
          <text x={O_X + 24} y={C_Y + 66} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            Your data, this request only
          </text>
          <rect x={O_X + 22} y={C_Y + 84} width={O_W - 44} height={40} rx={12} fill="var(--surface)" stroke="var(--border)" />
          <text x={O_X + 38} y={C_Y + 110} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            search / database lookup
          </text>
          <text x={O_X + 24} y={C_Y + 148} fontSize={13} fill="var(--muted-foreground)">
            Attached as input. The model does
          </text>
          <text x={O_X + 24} y={C_Y + 168} fontSize={13} fill="var(--muted-foreground)">
            not permanently learn from it.
          </text>
        </g>
      </g>

      {/* -------------------------- managed service --------------------------- */}
      <g opacity={op(SERVICE)}>
        <rect x={F_X} y={F_Y} width={F_W} height={F_H} rx={30} fill={`url(#${uid}-svc)`} stroke={on(SERVICE) ? "color-mix(in oklab, var(--primary) 52%, transparent)" : "var(--border-strong)"} strokeWidth={on(SERVICE) ? 2.2 : 1.4} style={{ transition: "stroke .3s ease" }} />
        <g {...interactive(SERVICE, "Managed AI service operated by the cloud provider")}>
          <rect x={F_X} y={F_Y} width={F_W} height={62} rx={30} fill="transparent" />
          <text x={F_X + 30} y={F_Y + 40} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--primary)">
            MANAGED AI SERVICE · PROVIDER OPERATED
          </text>
        </g>

        {/* endpoint */}
        <g opacity={op(ENDPOINT)}>
          <g {...interactive(ENDPOINT, "Model endpoint — an authenticated API in front of the model")}>
            {card(ENDPOINT, E_X, E_Y, E_W, E_H, "var(--primary)", 20)}
            <text x={E_X + 24} y={E_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
              MODEL ENDPOINT
            </text>
            <text x={E_X + 24} y={E_Y + 66} fontSize={19} fontWeight={800} fill="var(--foreground)">
              Authenticated model API
            </text>
            <text x={E_X + 24} y={E_Y + 94} fontSize={13} fill="var(--muted-foreground)">
              Routing, model version, throttling and quotas.
            </text>
            <text x={E_X + E_W - 24} y={E_Y + 66} textAnchor="end" fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              model v3 · serving
            </text>
          </g>
        </g>

        {/* inference compute */}
        <g opacity={op(COMPUTE)}>
          <g {...interactive(COMPUTE, "Inference compute — the trained model runs on provider-operated accelerators")}>
            {card(COMPUTE, M_X, M_Y, M_W, M_H, "var(--violet)", 20)}
            <text x={M_X + 22} y={M_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
              INFERENCE
            </text>
            <text x={M_X + 22} y={M_Y + 64} fontSize={18} fontWeight={800} fill="var(--foreground)">
              Trained model runs
            </text>
            <g aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <rect key={i} x={M_X + 22 + i * 40} y={M_Y + 84} width={30} height={30} rx={9} fill="color-mix(in oklab, var(--violet) 12%, transparent)" stroke="color-mix(in oklab, var(--violet) 34%, transparent)" />
              ))}
            </g>
            <text x={M_X + 22} y={M_Y + 138} fontSize={12.5} fill="var(--muted-foreground)">
              Shared accelerators, abstracted.
            </text>
          </g>
        </g>

        {/* response generation */}
        <g opacity={op(RESPONSE)}>
          <g {...interactive(RESPONSE, "Generated response returned to the application")}>
            {card(RESPONSE, R_X, R_Y, R_W, R_H, "var(--cyan)", 20)}
            <text x={R_X + 22} y={R_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
              OUTPUT
            </text>
            <text x={R_X + 22} y={R_Y + 64} fontSize={18} fontWeight={800} fill="var(--foreground)">
              Generated response
            </text>
            <rect x={R_X + 20} y={R_Y + 82} width={R_W - 40} height={34} rx={11} fill="var(--surface)" stroke="var(--border)" />
            <text x={R_X + 34} y={R_Y + 104} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              text / structured data
            </text>
            <text x={R_X + 22} y={R_Y + 140} fontSize={12.5} fill="var(--muted-foreground)">
              A suggestion, not a guarantee.
            </text>
          </g>
        </g>

        {/* operational indicators */}
        <g opacity={op(OPS)}>
          <g {...interactive(OPS, "Operational indicators — latency, token cost and scaling")}>
            <rect x={F_X + 18} y={OPS_Y - 26} width={F_W - 36} height={OPS_H + 34} rx={22} fill="transparent" />
            <text x={M_X} y={OPS_Y - 8} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--muted-foreground)">
              OPERATIONAL CONCERNS
            </text>
            {opsChips.map((c, i) => {
              const x = M_X + i * (OPS_W + 10);
              return (
                <g key={c.key} aria-hidden="true">
                  <rect x={x} y={OPS_Y} width={OPS_W} height={OPS_H} rx={18} fill="var(--surface)" stroke={on(OPS) ? `color-mix(in oklab, ${c.tone} 45%, transparent)` : "var(--border)"} style={{ transition: "stroke .3s ease" }} />
                  <text x={x + 18} y={OPS_Y + 28} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.12em" fill={c.tone}>
                    {c.label}
                  </text>
                  <text x={x + 18} y={OPS_Y + 58} fontSize={14.5} fontWeight={760} fill="var(--foreground)">
                    {c.value}
                  </text>
                  <text x={x + 18} y={OPS_Y + 84} fontSize={12} fill="var(--muted-foreground)">
                    {c.note}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </g>

      {/* -------------------------- training rail ----------------------------- */}
      <g opacity={op(TRAIN)}>
        <g {...interactive(TRAIN, "Training and fine-tuning — a separate workflow, not the request path")}>
          <rect x={T_X} y={T_Y} width={T_W} height={T_H} rx={24} fill={on(TRAIN) ? "color-mix(in oklab, var(--violet) 7%, var(--surface))" : "var(--surface)"} stroke={on(TRAIN) ? "color-mix(in oklab, var(--violet) 55%, transparent)" : "var(--border-strong)"} strokeDasharray="7 7" strokeWidth={on(TRAIN) ? 2 : 1.3} style={{ transition: "fill .3s ease, stroke .3s ease" }} />
          <text x={T_X + 22} y={T_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
            TRAINING · FINE-TUNING
          </text>
          <text x={T_X + 22} y={T_Y + 66} fontSize={17.5} fontWeight={800} fill="var(--foreground)">
            A different job
          </text>
          {["Curated training data", "Deliberate, scheduled run", "Produces a new model version"].map((t, i) => (
            <g key={t} aria-hidden="true">
              <rect x={T_X + 20} y={T_Y + 88 + i * 54} width={T_W - 40} height={44} rx={13} fill="color-mix(in oklab, var(--violet) 5%, transparent)" stroke="color-mix(in oklab, var(--violet) 24%, transparent)" />
              <text x={T_X + 36} y={T_Y + 116 + i * 54} fontSize={12.5} fill="var(--muted-foreground)">
                {t}
              </text>
            </g>
          ))}
          <text x={T_X + 22} y={T_Y + 274} fontSize={12.5} fill="var(--muted-foreground)">
            Not run on every prompt.
          </text>
        </g>
      </g>

      {/* --------------------------- cloud value ------------------------------ */}
      <g opacity={op(VALUE)}>
        <g {...interactive(VALUE, "What the cloud provides and what stays yours")}>
          {card(VALUE, T_X, V_Y, T_W, V_H, "var(--primary)")}
          <text x={T_X + 22} y={V_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
            WHAT THE CLOUD GIVES YOU
          </text>
          {valueRows.map((t, i) => (
            <foreignObject key={t} x={T_X + 20} y={V_Y + 48 + i * 54} width={T_W - 40} height={50} aria-hidden="true">
              <div style={{ fontSize: "12.5px", lineHeight: 1.4, color: "var(--muted-foreground)" }}>{t}</div>
            </foreignObject>
          ))}
          <line x1={T_X + 20} y1={V_Y + 208} x2={T_X + T_W - 20} y2={V_Y + 208} stroke="var(--border)" />
          <text x={T_X + 22} y={V_Y + 232} fontSize={12.5} fontWeight={700} fill="var(--foreground)">
            Yours: data, permissions, UX.
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
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">YOUR APPLICATION</p>

      <button type="button" onClick={() => onToggle(APP)} aria-expanded={activeKey === APP} className={`${btn} border-primary/40 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-primary">USER · APPLICATION</span>
        <span className="mt-1 block text-[17px] font-extrabold">Your app composes the request</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Permissions, data handling and the interface stay yours.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">REQUEST PATH</p>

      <button type="button" onClick={() => onToggle(POLICY)} aria-expanded={activeKey === POLICY} className={`${btn} border-cyan/40`}>
        <span className="block text-[15.5px] font-bold">Guardrail &amp; policy</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Authentication, quotas and rules — checked on the way in and on the way out.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(CONTEXT)} aria-expanded={activeKey === CONTEXT} className={`${btn} border-cyan/30`}>
        <span className="block text-[15.5px] font-bold">Optional context</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Your own data fetched and attached to this one request. The model does not permanently learn from it.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">MANAGED AI SERVICE</p>

      <button type="button" onClick={() => onToggle(ENDPOINT)} aria-expanded={activeKey === ENDPOINT} className={`${btn} border-primary/40 bg-primary/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-primary">MODEL ENDPOINT</span>
        <span className="mt-1 block text-[16px] font-bold">Authenticated model API</span>
        <span className="block text-[12.5px] text-muted-foreground">Routing, model version, throttling and quotas.</span>
      </button>

      <button type="button" onClick={() => onToggle(COMPUTE)} aria-expanded={activeKey === COMPUTE} className={`${btn} border-violet/40`}>
        <span className="block text-[15.5px] font-bold">Inference compute</span>
        <span className="block text-[12.5px] text-muted-foreground">
          The trained model runs on shared accelerators the provider operates.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(OPS)} aria-expanded={activeKey === OPS} className={`${btn} border-border`}>
        <span className="block text-[15.5px] font-bold">Latency, cost, scaling</span>
        <span className="mt-1 block space-y-1.5">
          {opsChips.map((c) => (
            <span key={c.key} className="block rounded-lg border border-border bg-surface px-2.5 py-2 text-[12.5px]">
              <span className="font-semibold">{c.value}</span> — {c.note}
            </span>
          ))}
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">RESPONSE</p>

      <button type="button" onClick={() => onToggle(RESPONSE)} aria-expanded={activeKey === RESPONSE} className={`${btn} border-cyan/40 bg-cyan/5`}>
        <span className="block text-[15.5px] font-bold">Generated response returns to the app</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Back through the policy step. A suggestion, not a guarantee.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">SEPARATE WORKFLOW</p>

      <button type="button" onClick={() => onToggle(TRAIN)} aria-expanded={activeKey === TRAIN} className={`${btn} border-violet/40 border-dashed`}>
        <span className="block text-[15.5px] font-bold">Training &amp; fine-tuning</span>
        <span className="block text-[12.5px] text-muted-foreground">
          A deliberate job with its own data and cost that produces a new model version — not something that happens on each prompt.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(VALUE)} aria-expanded={activeKey === VALUE} className={`${btn} border-primary/30`}>
        <span className="block text-[15.5px] font-bold">What the cloud gives you</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Managed model access, elastic compute and deployment. Yours: data, permissions and the user experience.
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function CloudAiDiagram() {
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
              Prompt in, inference, response out
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Request", color: "var(--primary)" },
              { label: "Context", color: "var(--cyan)" },
              { label: "Response", color: "var(--violet)" },
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
        AI in the cloud is a managed model endpoint you call like any other service: your app orchestrates the
        request, the provider runs the inference, and training stays a separate workflow.
      </figcaption>
      <StageHint text="Hover the app, the policy step, context retrieval, the model endpoint, inference, the response, the operational indicators or the training rail to isolate related elements; click any component for a short explanation." />
    </figure>
  );
}
