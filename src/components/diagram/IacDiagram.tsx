import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const CODE = "code";
const REVIEW = "review";
const PLAN = "plan";
const APPLY = "apply";
const API = "api";
const INFRA = "infra";
const NET = "net";
const APPRES = "appres";
const DB = "db";
const STATE = "state";
const DRIFT = "drift";
const CONSOLE = "console";
const NOOP = "noop";

const related: Record<string, string[]> = {
  [CODE]: [REVIEW, PLAN],
  [REVIEW]: [CODE, PLAN],
  [PLAN]: [CODE, REVIEW, STATE, APPLY, DRIFT],
  [APPLY]: [PLAN, API, APPRES, INFRA],
  [API]: [APPLY, INFRA, NET, APPRES, DB],
  [INFRA]: [NET, APPRES, DB, API],
  [NET]: [INFRA, APPRES, DB],
  [APPRES]: [INFRA, NET, DB, API, APPLY],
  [DB]: [INFRA, NET, CONSOLE, DRIFT],
  [STATE]: [PLAN, DRIFT],
  [DRIFT]: [CONSOLE, DB, STATE, PLAN],
  [CONSOLE]: [DRIFT, DB],
  [NOOP]: [PLAN, STATE],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1760;
const H = 880;

/* left: code + review */
const L_X = 40;
const L_W = 350;
const C_Y = 130;
const C_H = 330;
const R_Y = 500;
const R_H = 230;

/* center: engine */
const F_X = 440;
const F_W = 400;
const F_Y = 110;
const F_H = 560;

const P_X = 470;
const P_Y = 190;
const P_W = 340;
const P_H = 200;

const A_Y = 420;
const A_H = 210;

const API_Y = 700;
const API_H = 120;

/* right: infrastructure */
const I_X = 900;
const I_W = 560;
const I_Y = 110;
const I_H = 520;

const N_X = 930;
const N_Y = 190;
const N_W = 500;
const N_H = 100;

const RES_Y = 330;
const RES_H = 150;

const CON_X = 900;
const CON_Y = 690;
const CON_W = 300;
const CON_H = 150;

const DR_X = 1240;
const DR_W = 220;

/* far-right rail */
const S_X = 1466;
const S_W = 254;
const S_Y = 130;
const S_H = 250;
const NO_Y = 410;
const NO_H = 200;
const V_Y = 640;
const V_H = 200;

/* --------------------------------- paths --------------------------------- */

const sCodePlan = `M ${L_X + L_W} 280 C 418 280, 420 260, ${P_X} 260`;
const sReviewPlan = `M ${L_X + L_W} 600 C 424 600, 430 350, ${P_X} 330`;
const sPlanApply = `M 640 ${P_Y + P_H} V ${A_Y}`;
const sApplyApi = `M 640 ${A_Y + A_H} V ${API_Y}`;
const sApiInfra = `M ${P_X + P_W} 760 C 880 760, 940 540, 1050 ${RES_Y + RES_H}`;
const sStatePlan = `M ${S_X} 180 C 1380 60, 820 58, 640 ${P_Y}`;
const sDrift = `M 1050 ${CON_Y} C 1050 600, 1310 560, 1310 ${RES_Y + RES_H}`;
const sDriftState = `M ${DR_X + DR_W} 760 C 1560 760, 1600 560, 1600 ${S_Y + S_H}`;

/* --------------------------------- copy ---------------------------------- */

const codeLines = [
  { t: "network \"core\" {", tone: "var(--primary)" },
  { t: "  cidr = \"10.0.0.0/16\"", tone: "var(--muted-foreground)" },
  { t: "}", tone: "var(--primary)" },
  { t: "service \"web\" {", tone: "var(--primary)" },
  { t: "  network  = core", tone: "var(--muted-foreground)" },
  { t: "  replicas = 3", tone: "var(--ember)" },
  { t: "}", tone: "var(--primary)" },
  { t: "database \"orders\" {", tone: "var(--primary)" },
  { t: "  size = \"small\"", tone: "var(--muted-foreground)" },
  { t: "}", tone: "var(--primary)" },
] as const;

const planRows = [
  { t: "~ service.web  replicas: 2 → 3", tone: "var(--ember)" },
  { t: "+ 1 instance", tone: "var(--cyan)" },
  { t: "0 to add · 1 to change · 0 to destroy", tone: "var(--muted-foreground)" },
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case CODE:
      return {
        eyebrow: "Desired state",
        title: "The infrastructure you want, written down",
        body: "This file does not click through a console and it is not a script of commands. It declares what should exist: a network, a service with three replicas, a database. Running it twice does not build two networks — it describes an end state, and the tooling works out how to get there.",
      };
    case REVIEW:
      return {
        eyebrow: "Version control",
        title: "Infrastructure changes get reviewed like code",
        body: "Because the definition is a file in a repository, a change arrives as a diff someone can read, question and approve. You get history, blame, rollback and reproducibility — the same conveniences application code has had for decades, applied to servers and networks.",
      };
    case PLAN:
      return {
        eyebrow: "Plan",
        title: "Compare desired state with reality first",
        body: "Plan reads the recorded state, inspects what actually exists, and prints the difference as a readable change set before touching anything. It is the safety step: you see 1 to change, 0 to destroy, and can stop if that is not what you meant.",
      };
    case APPLY:
      return {
        eyebrow: "Apply",
        title: "Reconcile until reality matches the file",
        body: "Apply executes only the approved change set, in dependency order — network before the service that sits in it. Resources that already match are left completely alone. When it finishes, actual infrastructure equals desired state, and the recorded state is updated.",
      };
    case API:
      return {
        eyebrow: "Provider API",
        title: "Nothing magic happens here",
        body: "The engine talks to the cloud provider's ordinary APIs — the same ones the web console calls. Create, update, delete. That is why IaC works across providers: the declarative model is yours, the provider plugin translates it into API calls.",
      };
    case INFRA:
      return {
        eyebrow: "Actual infrastructure",
        title: "Real resources, related to each other",
        body: "What actually runs. Resources have dependencies: the network exists before the service, and the service points at the database. The tooling derives that order from the references in your code, so you describe relationships rather than sequencing steps by hand.",
      };
    case NET:
      return {
        eyebrow: "Dependency",
        title: "Network first, because everything sits in it",
        body: "The service and database reference the network, so it must exist before them. You never wrote 'create the network first' — that ordering falls out of the references in the definition.",
      };
    case APPRES:
      return {
        eyebrow: "The changed resource",
        title: "Only this resource changed",
        body: "The code went from two replicas to three, so exactly one instance was added. The network was untouched, the database was untouched. A small, reviewed diff produced a small, contained change — that is the whole promise of the plan step.",
      };
    case DB:
      return {
        eyebrow: "Managed resource",
        title: "Also declared, also reconciled",
        body: "The database is described in the same file as everything else. It is also where the drift happened: someone changed it by hand in the console, so the recorded state and the real resource no longer agree.",
      };
    case STATE:
      return {
        eyebrow: "State",
        title: "What the tooling believes it created",
        body: "State is metadata — a record mapping resources in your code to real resource IDs. It is not the code and it is not the infrastructure; it is the bookkeeping that lets plan tell 'new resource' apart from 'existing resource that moved'.",
      };
    case CONSOLE:
      return {
        eyebrow: "Manual change",
        title: "Someone edited a resource by hand",
        body: "A quick fix in the web console during an incident. Perfectly normal, and completely invisible to the code. The file still says small, the real database now says medium, and nothing has reconciled the two.",
      };
    case DRIFT:
      return {
        eyebrow: "Drift",
        title: "Detected on the next plan, not swallowed",
        body: "Because plan inspects reality rather than trusting the record, the manual edit shows up as a difference. You then decide deliberately: change the code to keep it, or apply and let reconciliation put the resource back the way the file says.",
      };
    case NOOP:
      return {
        eyebrow: "Idempotence",
        title: "Run it again — nothing happens",
        body: "With no code change and no drift, the second run reports no changes at all. Declarative definitions are safe to re-run: the tooling only acts when reality differs from the file, which is what makes automation trustworthy.",
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
      aria-label="Infrastructure as code drawn as a reconciliation loop. On the left, a version-controlled definition declares a network, a service with three replicas and a database, with a pull-request diff showing replicas changing from two to three. In the centre, an engine runs a plan step that compares the desired state with reality and prints a small change set, then an apply step that calls ordinary provider APIs. On the right, the actual infrastructure frame contains the network, the application service where one instance was added, and the database. A recorded state file sits on the far right, along with a no-op rerun reporting no changes. Below the infrastructure, a manual change made in the cloud console alters the database by hand, and a drift detector feeds that difference back into the next plan."
      className="w-full"
      style={{ minHeight: 640, maxHeight: 900 }}
    >
      <defs>
        <linearGradient id={`${uid}-engine`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.09" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={`${uid}-infra`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={L_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 19 — DESIRED STATE, PLAN, APPLY, RECONCILE
        </text>
        <text x={W - 40} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          THE FILE IS THE SOURCE OF TRUTH
        </text>
        <line x1={L_X} y1={52} x2={W - 40} y2={52} stroke="var(--border)" strokeWidth={1} />
        <text x={L_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--primary)">
          VERSION-CONTROLLED DEFINITION
        </text>
        <text x={F_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--cyan)">
          IAC ENGINE
        </text>
        <text x={I_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--violet)">
          ACTUAL INFRASTRUCTURE
        </text>
      </g>

      {/* ------------------------------ flows -------------------------------- */}
      <g>
        <Flow d={sStatePlan} on={on(STATE) || on(PLAN)} color="var(--violet)" dashed />
        <Flow d={sCodePlan} on={on(CODE) || on(PLAN)} color="var(--primary)" />
        <Flow d={sReviewPlan} on={on(REVIEW) || on(PLAN)} color="var(--primary)" />
        <Flow d={sPlanApply} on={on(PLAN) || on(APPLY)} color="var(--cyan)" />
        <Flow d={sApplyApi} on={on(APPLY) || on(API)} color="var(--cyan)" />
        <Flow d={sApiInfra} on={on(API) || on(APPRES) || on(INFRA)} color="var(--cyan)" />
        <Flow d={sDrift} on={on(CONSOLE) || on(DRIFT) || on(DB)} color="var(--ember)" dashed />
        <Flow d={sDriftState} on={on(DRIFT) || on(STATE)} color="var(--ember)" dashed />

        <g className="motion-safe:block motion-reduce:hidden" aria-hidden="true">
          <Token path={sCodePlan} dur="0.8s" begin="0s" color="var(--primary)" />
          <Token path={sPlanApply} dur="0.7s" begin="1.1s" color="var(--cyan)" />
          <Token path={sApplyApi} dur="0.7s" begin="2s" color="var(--cyan)" />
          <Token path={sApiInfra} dur="1.3s" begin="2.8s" color="var(--cyan)" />
          <Token path={sDrift} dur="1.6s" begin="4.6s" color="var(--ember)" />
        </g>
      </g>

      {/* ------------------------------- code -------------------------------- */}
      <g opacity={op(CODE)}>
        <g {...interactive(CODE, "Version-controlled definition — the infrastructure you want, declared in code")}>
          {card(CODE, L_X, C_Y, L_W, C_H, "var(--primary)")}
          <text x={L_X + 24} y={C_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
            DESIRED STATE · main.tf
          </text>
          <text x={L_X + 24} y={C_Y + 64} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            Declared, not clicked
          </text>
          <rect x={L_X + 20} y={C_Y + 82} width={L_W - 40} height={228} rx={16} fill="color-mix(in oklab, var(--primary) 5%, transparent)" stroke="color-mix(in oklab, var(--primary) 22%, transparent)" />
          {codeLines.map((l, i) => (
            <text key={`${i}-${l.t}`} x={L_X + 38} y={C_Y + 110 + i * 22} fontSize={12.5} fontFamily="var(--font-mono)" fill={l.tone}>
              {l.t}
            </text>
          ))}
        </g>
      </g>

      {/* ------------------------------ review ------------------------------- */}
      <g opacity={op(REVIEW)}>
        <g {...interactive(REVIEW, "Pull request review — infrastructure changes are diffed and approved like code")}>
          {card(REVIEW, L_X, R_Y, L_W, R_H, "var(--primary)")}
          <text x={L_X + 24} y={R_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
            PULL REQUEST · REVIEWED
          </text>
          <text x={L_X + 24} y={R_Y + 62} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            Scale web tier
          </text>
          <rect x={L_X + 20} y={R_Y + 80} width={L_W - 40} height={38} rx={11} fill="color-mix(in oklab, var(--ember) 8%, transparent)" stroke="color-mix(in oklab, var(--ember) 26%, transparent)" />
          <text x={L_X + 36} y={R_Y + 105} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            - replicas = 2
          </text>
          <rect x={L_X + 20} y={R_Y + 124} width={L_W - 40} height={38} rx={11} fill="color-mix(in oklab, var(--cyan) 9%, transparent)" stroke="color-mix(in oklab, var(--cyan) 28%, transparent)" />
          <text x={L_X + 36} y={R_Y + 149} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            + replicas = 3
          </text>
          <text x={L_X + 24} y={R_Y + 192} fontSize={12.5} fill="var(--muted-foreground)">
            History, diff, rollback — same as
          </text>
          <text x={L_X + 24} y={R_Y + 212} fontSize={12.5} fill="var(--muted-foreground)">
            any application change.
          </text>
        </g>
      </g>

      {/* ------------------------------ engine ------------------------------- */}
      <g opacity={op(PLAN) && op(APPLY) === 1 ? 1 : 1}>
        <rect
          x={F_X}
          y={F_Y}
          width={F_W}
          height={F_H}
          rx={30}
          fill={`url(#${uid}-engine)`}
          stroke="var(--border-strong)"
          strokeWidth={1.4}
        />
        <text x={F_X + 28} y={F_Y + 40} fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--cyan)" aria-hidden="true">
          CONTROL PLANE
        </text>
      </g>

      {/* plan */}
      <g opacity={op(PLAN)}>
        <g {...interactive(PLAN, "Plan — compares desired state with real infrastructure and prints the change set")}>
          {card(PLAN, P_X, P_Y, P_W, P_H, "var(--primary)")}
          <text x={P_X + 22} y={P_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--primary)">
            STEP 1 · PLAN
          </text>
          <text x={P_X + 22} y={P_Y + 62} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            Nothing changes yet
          </text>
          <rect x={P_X + 20} y={P_Y + 80} width={P_W - 40} height={100} rx={14} fill="var(--surface)" stroke="var(--border)" />
          {planRows.map((r, i) => (
            <text key={r.t} x={P_X + 36} y={P_Y + 108 + i * 30} fontSize={12.5} fontFamily="var(--font-mono)" fill={r.tone}>
              {r.t}
            </text>
          ))}
        </g>
      </g>

      {/* apply */}
      <g opacity={op(APPLY)}>
        <g {...interactive(APPLY, "Apply — reconciles real infrastructure until it matches the desired state")}>
          {card(APPLY, P_X, A_Y, P_W, A_H, "var(--cyan)")}
          <text x={P_X + 22} y={A_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--cyan)">
            STEP 2 · APPLY
          </text>
          <text x={P_X + 22} y={A_Y + 62} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            Reconcile to desired
          </text>
          <text x={P_X + 22} y={A_Y + 92} fontSize={13} fill="var(--muted-foreground)">
            Executes only the approved change
          </text>
          <text x={P_X + 22} y={A_Y + 112} fontSize={13} fill="var(--muted-foreground)">
            set, in dependency order.
          </text>
          <rect x={P_X + 20} y={A_Y + 128} width={P_W - 40} height={62} rx={14} fill="color-mix(in oklab, var(--cyan) 7%, transparent)" stroke="color-mix(in oklab, var(--cyan) 26%, transparent)" />
          <text x={P_X + 36} y={A_Y + 152} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            network → service → database
          </text>
          <text x={P_X + 36} y={A_Y + 176} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            matching resources untouched
          </text>
        </g>
      </g>

      {/* provider api */}
      <g opacity={op(API)}>
        <g {...interactive(API, "Provider API — ordinary create, update and delete calls")}>
          {card(API, P_X, API_Y, P_W, API_H, "var(--cyan)", 20)}
          <text x={P_X + 22} y={API_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            PROVIDER API
          </text>
          <text x={P_X + 22} y={API_Y + 60} fontSize={17} fontWeight={800} fill="var(--foreground)">
            create · update · delete
          </text>
          <text x={P_X + 22} y={API_Y + 90} fontSize={12.5} fill="var(--muted-foreground)">
            The same APIs the console calls.
          </text>
        </g>
      </g>

      {/* --------------------------- infrastructure --------------------------- */}
      <g opacity={op(INFRA)}>
        <rect
          x={I_X}
          y={I_Y}
          width={I_W}
          height={I_H}
          rx={30}
          fill={`url(#${uid}-infra)`}
          stroke={on(INFRA) ? "color-mix(in oklab, var(--violet) 52%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(INFRA) ? 2.2 : 1.4}
          style={{ transition: "stroke .3s ease" }}
        />
        <g {...interactive(INFRA, "Actual infrastructure — the real resources and their dependencies")}>
          <rect x={I_X} y={I_Y} width={I_W} height={62} rx={30} fill="transparent" />
          <text x={I_X + 28} y={I_Y + 40} fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--violet)">
            REAL RESOURCES · WHAT EXISTS NOW
          </text>
        </g>

        {/* network */}
        <g opacity={op(NET)}>
          <g {...interactive(NET, "Network — created before the resources that reference it")}>
            {card(NET, N_X, N_Y, N_W, N_H, "var(--cyan)", 20)}
            <text x={N_X + 22} y={N_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
              NETWORK · core
            </text>
            <text x={N_X + 22} y={N_Y + 60} fontSize={17.5} fontWeight={800} fill="var(--foreground)">
              Created first
            </text>
            <text x={N_X + 22} y={N_Y + 84} fontSize={12.5} fill="var(--muted-foreground)">
              Everything below references it, so the ordering is derived, not scripted.
            </text>
            <text x={N_X + N_W - 22} y={N_Y + 30} textAnchor="end" fontSize={11.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              unchanged
            </text>
          </g>
        </g>

        {/* dependency ticks */}
        <g aria-hidden="true" opacity={op(NET)}>
          <path d={`M 1050 ${N_Y + N_H} V ${RES_Y}`} stroke="var(--border-strong)" strokeWidth={1.6} fill="none" />
          <path d={`M 1310 ${N_Y + N_H} V ${RES_Y}`} stroke="var(--border-strong)" strokeWidth={1.6} fill="none" />
        </g>

        {/* app service */}
        <g opacity={op(APPRES)}>
          <g {...interactive(APPRES, "Application service — the only resource this change touched")}>
            {card(APPRES, 930, RES_Y, 240, RES_H, "var(--ember)", 20)}
            <text x={952} y={RES_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--ember)">
              SERVICE · web
            </text>
            <text x={952} y={RES_Y + 58} fontSize={17.5} fontWeight={800} fill="var(--foreground)">
              3 instances
            </text>
            <g aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <rect
                  key={i}
                  x={952 + i * 62}
                  y={RES_Y + 74}
                  width={52}
                  height={34}
                  rx={10}
                  fill={i === 2 ? "color-mix(in oklab, var(--ember) 16%, transparent)" : "var(--surface)"}
                  stroke={i === 2 ? "color-mix(in oklab, var(--ember) 55%, transparent)" : "var(--border-strong)"}
                />
              ))}
            </g>
            <text x={952} y={RES_Y + 132} fontSize={12} fontFamily="var(--font-mono)" fill="var(--ember)">
              + 1 added by apply
            </text>
          </g>
        </g>

        {/* database */}
        <g opacity={op(DB)}>
          <g {...interactive(DB, "Database resource — also where a manual console change caused drift")}>
            {card(DB, 1190, RES_Y, 240, RES_H, "var(--violet)", 20)}
            <text x={1212} y={RES_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
              DATABASE · orders
            </text>
            <text x={1212} y={RES_Y + 58} fontSize={17.5} fontWeight={800} fill="var(--foreground)">
              size: medium
            </text>
            <rect x={1210} y={RES_Y + 74} width={200} height={38} rx={11} fill="color-mix(in oklab, var(--ember) 8%, transparent)" stroke="color-mix(in oklab, var(--ember) 30%, transparent)" />
            <text x={1226} y={RES_Y + 99} fontSize={12} fontFamily="var(--font-mono)" fill="var(--ember)">
              code says: small
            </text>
            <text x={1212} y={RES_Y + 132} fontSize={12} fill="var(--muted-foreground)">
              Changed outside the code.
            </text>
          </g>
        </g>
      </g>

      {/* ------------------------------ console ------------------------------- */}
      <g opacity={op(CONSOLE)}>
        <g {...interactive(CONSOLE, "Manual console change — an edit made by hand, invisible to the code")}>
          <rect
            x={CON_X}
            y={CON_Y}
            width={CON_W}
            height={CON_H}
            rx={22}
            fill={on(CONSOLE) ? "color-mix(in oklab, var(--ember) 7%, var(--surface))" : "var(--surface)"}
            stroke={on(CONSOLE) ? "color-mix(in oklab, var(--ember) 55%, transparent)" : "var(--border-strong)"}
            strokeDasharray="7 7"
            strokeWidth={on(CONSOLE) ? 2 : 1.3}
            style={{ transition: "fill .3s ease, stroke .3s ease" }}
          />
          <text x={CON_X + 22} y={CON_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--ember)">
            MANUAL CHANGE · WEB CONSOLE
          </text>
          <text x={CON_X + 22} y={CON_Y + 62} fontSize={17} fontWeight={800} fill="var(--foreground)">
            Resized by hand
          </text>
          <text x={CON_X + 22} y={CON_Y + 92} fontSize={12.5} fill="var(--muted-foreground)">
            A quick fix during an incident —
          </text>
          <text x={CON_X + 22} y={CON_Y + 112} fontSize={12.5} fill="var(--muted-foreground)">
            never written back to the code.
          </text>
        </g>
      </g>

      {/* ------------------------------- drift -------------------------------- */}
      <g opacity={op(DRIFT)}>
        <g {...interactive(DRIFT, "Drift detected — the next plan reports the difference instead of accepting it")}>
          {card(DRIFT, DR_X, CON_Y, DR_W, CON_H, "var(--ember)")}
          <text x={DR_X + 20} y={CON_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--ember)">
            DRIFT DETECTED
          </text>
          <text x={DR_X + 20} y={CON_Y + 62} fontSize={16.5} fontWeight={800} fill="var(--foreground)">
            1 difference
          </text>
          <text x={DR_X + 20} y={CON_Y + 90} fontSize={12} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            medium → small
          </text>
          <text x={DR_X + 20} y={CON_Y + 118} fontSize={12.5} fill="var(--muted-foreground)">
            Feeds the next plan.
          </text>
        </g>
      </g>

      {/* ------------------------------- state -------------------------------- */}
      <g opacity={op(STATE)}>
        <g {...interactive(STATE, "State — the recorded mapping between code and real resource IDs")}>
          {card(STATE, S_X, S_Y, S_W, S_H, "var(--violet)")}
          <text x={S_X + 20} y={S_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
            STATE · METADATA
          </text>
          <text x={S_X + 20} y={S_Y + 62} fontSize={17} fontWeight={800} fill="var(--foreground)">
            The bookkeeping
          </text>
          {["network.core → vpc-8f21", "service.web → svc-41c9", "database.orders → db-77a0"].map((t, i) => (
            <g key={t} aria-hidden="true">
              <rect x={S_X + 18} y={S_Y + 82 + i * 48} width={S_W - 36} height={38} rx={11} fill="color-mix(in oklab, var(--violet) 5%, transparent)" stroke="color-mix(in oklab, var(--violet) 22%, transparent)" />
              <text x={S_X + 32} y={S_Y + 106 + i * 48} fontSize={11.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
                {t}
              </text>
            </g>
          ))}
          <text x={S_X + 20} y={S_Y + 234} fontSize={12} fill="var(--muted-foreground)">
            Not the code. Not the cloud.
          </text>
        </g>
      </g>

      {/* ------------------------------- no-op -------------------------------- */}
      <g opacity={op(NOOP)}>
        <g {...interactive(NOOP, "Idempotence — running again with no change reports no changes")}>
          {card(NOOP, S_X, NO_Y, S_W, NO_H, "var(--cyan)")}
          <text x={S_X + 20} y={NO_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            RUN AGAIN · IDEMPOTENT
          </text>
          <rect x={S_X + 18} y={NO_Y + 48} width={S_W - 36} height={54} rx={14} fill="color-mix(in oklab, var(--cyan) 9%, transparent)" stroke="color-mix(in oklab, var(--cyan) 30%, transparent)" />
          <text x={S_X + 34} y={NO_Y + 82} fontSize={15} fontWeight={800} fontFamily="var(--font-mono)" fill="var(--cyan)">
            NO CHANGES
          </text>
          <text x={S_X + 20} y={NO_Y + 128} fontSize={12.5} fill="var(--muted-foreground)">
            Same file, same reality —
          </text>
          <text x={S_X + 20} y={NO_Y + 148} fontSize={12.5} fill="var(--muted-foreground)">
            so the tooling does nothing.
          </text>
          <text x={S_X + 20} y={NO_Y + 176} fontSize={12} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            0 add · 0 change · 0 destroy
          </text>
        </g>
      </g>

      {/* ------------------------------- value -------------------------------- */}
      <g aria-hidden="true">
        <rect x={S_X} y={V_Y} width={S_W} height={V_H} rx={22} fill="var(--surface)" stroke="var(--border)" />
        <text x={S_X + 20} y={V_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--muted-foreground)">
          THE LOOP
        </text>
        {["Describe the end state", "Read the computed change", "Let tooling reconcile", "Re-run safely, any time"].map((t, i) => (
          <text key={t} x={S_X + 20} y={V_Y + 62 + i * 34} fontSize={12.5} fill="var(--muted-foreground)">
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
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">CODE &amp; REVIEW</p>

      <button type="button" onClick={() => onToggle(CODE)} aria-expanded={activeKey === CODE} className={`${btn} border-primary/40 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-primary">DESIRED STATE</span>
        <span className="mt-1 block text-[17px] font-extrabold">Infrastructure declared in code</span>
        <span className="mt-2 block rounded-xl border border-primary/25 bg-primary/5 p-3 font-mono text-[12px] leading-relaxed text-muted-foreground">
          network &quot;core&quot; {"{"} … {"}"}
          <br />
          service &quot;web&quot; {"{"} replicas = 3 {"}"}
          <br />
          database &quot;orders&quot; {"{"} … {"}"}
        </span>
      </button>

      <button type="button" onClick={() => onToggle(REVIEW)} aria-expanded={activeKey === REVIEW} className={`${btn} border-primary/30`}>
        <span className="block text-[15.5px] font-bold">Reviewed like application code</span>
        <span className="block text-[12.5px] text-muted-foreground">
          The change arrives as a diff: <span className="font-mono">- replicas = 2</span> /{" "}
          <span className="font-mono">+ replicas = 3</span>. History, review and rollback included.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">ENGINE</p>

      <button type="button" onClick={() => onToggle(PLAN)} aria-expanded={activeKey === PLAN} className={`${btn} border-primary/40 bg-primary/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-primary">STEP 1 · PLAN</span>
        <span className="mt-1 block text-[16px] font-bold">Compare desired state with reality</span>
        <span className="mt-2 block rounded-xl border border-border bg-surface p-3 font-mono text-[12px] text-muted-foreground">
          ~ service.web replicas: 2 → 3
          <br />
          0 add · 1 change · 0 destroy
        </span>
      </button>

      <button type="button" onClick={() => onToggle(APPLY)} aria-expanded={activeKey === APPLY} className={`${btn} border-cyan/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-cyan">STEP 2 · APPLY</span>
        <span className="mt-1 block text-[16px] font-bold">Reconcile until reality matches</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Only the approved change set runs, in dependency order: network → service → database.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(API)} aria-expanded={activeKey === API} className={`${btn} border-cyan/30`}>
        <span className="block text-[15.5px] font-bold">Provider API</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Ordinary create, update and delete calls — the same ones the web console uses.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">ACTUAL INFRASTRUCTURE</p>

      <button type="button" onClick={() => onToggle(NET)} aria-expanded={activeKey === NET} className={`${btn} border-border`}>
        <span className="block text-[15.5px] font-bold">Network · core — unchanged</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Exists before the resources that reference it; the ordering is derived, not scripted.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(APPRES)} aria-expanded={activeKey === APPRES} className={`${btn} border-ember/40 bg-ember/5`}>
        <span className="block text-[15.5px] font-bold">Service · web — 3 instances</span>
        <span className="block text-[12.5px] text-muted-foreground">
          One instance added. The only resource this change touched.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(DB)} aria-expanded={activeKey === DB} className={`${btn} border-violet/40`}>
        <span className="block text-[15.5px] font-bold">Database · orders</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Declared in the same file — and the resource someone later edited by hand.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">STATE &amp; DRIFT</p>

      <button type="button" onClick={() => onToggle(STATE)} aria-expanded={activeKey === STATE} className={`${btn} border-violet/30`}>
        <span className="block text-[15.5px] font-bold">State · metadata</span>
        <span className="block text-[12.5px] text-muted-foreground">
          A record mapping resources in the code to real resource IDs. Not the code, not the cloud.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(CONSOLE)} aria-expanded={activeKey === CONSOLE} className={`${btn} border-dashed border-ember/40`}>
        <span className="block text-[15.5px] font-bold">Manual console change</span>
        <span className="block text-[12.5px] text-muted-foreground">
          The database was resized by hand during an incident and never written back to the code.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(DRIFT)} aria-expanded={activeKey === DRIFT} className={`${btn} border-ember/40 bg-ember/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-ember">DRIFT DETECTED</span>
        <span className="mt-1 block text-[16px] font-bold">medium → small</span>
        <span className="block text-[12.5px] text-muted-foreground">
          The next plan reports the difference instead of silently accepting it.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">RE-RUN</p>

      <button type="button" onClick={() => onToggle(NOOP)} aria-expanded={activeKey === NOOP} className={`${btn} border-cyan/40`}>
        <span className="block text-[15.5px] font-bold">NO CHANGES</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Same file, same reality: 0 add · 0 change · 0 destroy. Declarative definitions are safe to re-run.
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function IacDiagram() {
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
              Desired state · plan · apply · reconcile
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Desired state", color: "var(--primary)" },
              { label: "Reconcile", color: "var(--cyan)" },
              { label: "Drift", color: "var(--ember)" },
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
        Infrastructure as code is a loop: declare the end state, read the computed change, let the tooling
        reconcile real resources — and see drift when reality quietly moves away from the file.
      </figcaption>
      <StageHint text="Hover the definition, the review diff, plan, apply, the provider API, any resource, state, the manual change or the drift detector to isolate related elements; click any component for a short explanation." />
    </figure>
  );
}
