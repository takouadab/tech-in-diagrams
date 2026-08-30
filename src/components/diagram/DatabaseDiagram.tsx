import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const APP = "app";
const QUERY = "query";
const WRITE = "write";
const PARSE = "parse";
const INDEX = "index";
const TABLE = "table";
const TXN = "txn";
const STORAGE = "storage";
const RESULT = "result";
const ROLLBACK = "rollback";

const P_Q = "p-q";
const P_PLAN = "p-plan";
const P_LOOK = "p-look";
const P_ROWS = "p-rows";
const P_OUT = "p-out";
const P_W = "p-w";
const P_COMMIT = "p-commit";
const P_ROLL = "p-roll";

const related: Record<string, string[]> = {
  [APP]: [QUERY, WRITE, RESULT, P_Q, P_OUT, P_W],
  [QUERY]: [APP, P_Q, PARSE, INDEX, TABLE, RESULT, P_PLAN, P_LOOK, P_ROWS, P_OUT],
  [PARSE]: [QUERY, P_Q, P_PLAN, INDEX],
  [INDEX]: [PARSE, P_PLAN, P_LOOK, TABLE, P_ROWS, RESULT],
  [TABLE]: [INDEX, P_LOOK, P_ROWS, RESULT, STORAGE],
  [RESULT]: [TABLE, P_ROWS, P_OUT, APP],
  [WRITE]: [APP, P_W, TXN, STORAGE, P_COMMIT, ROLLBACK, P_ROLL],
  [TXN]: [WRITE, P_W, P_COMMIT, STORAGE, ROLLBACK, P_ROLL],
  [ROLLBACK]: [TXN, P_ROLL, WRITE],
  [STORAGE]: [TXN, P_COMMIT, TABLE],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1600;
const H = 880;

/* application column */
const A_X = 44;
const A_W = 322;
const APP_Y = 122;
const APP_H = 108;
const Q_Y = 260;
const Q_H = 178;
const WR_Y = 476;
const WR_H = 162;
const RES_Y = 676;
const RES_H = 158;

/* engine zone */
const E_X = 556;
const E_W = 424;
const E_Y = 96;
const E_H = 748;
const R_X = E_X + 30;
const R_W = E_W - 60;
const PARSE_Y = 176;
const PARSE_H = 128;
const IDX_Y = 348;
const IDX_H = 140;
const TXN_Y = 540;
const TXN_H = 138;
const RES_E_Y = 716;
const RES_E_H = 96;

/* storage zone */
const S_X = 1128;
const S_W = 428;
const BT_Y = 152;
const BT_H = 158;
const TB_Y = 356;
const TB_H = 262;
const ST_Y = 668;
const ST_H = 146;

/* paths */
const pQ = `M ${A_X + A_W} ${Q_Y + 66} C ${A_X + A_W + 110} ${Q_Y + 66}, ${E_X - 110} ${PARSE_Y + PARSE_H / 2}, ${E_X - 6} ${PARSE_Y + PARSE_H / 2}`;
const pPlan = `M ${R_X + R_W / 2} ${PARSE_Y + PARSE_H} L ${R_X + R_W / 2} ${IDX_Y - 6}`;
const pLook = `M ${E_X + E_W + 6} ${IDX_Y + 44} C ${E_X + E_W + 90} ${IDX_Y + 44}, ${S_X - 90} ${BT_Y + BT_H / 2}, ${S_X - 6} ${BT_Y + BT_H / 2}`;
const pRows = `M ${S_X - 6} ${TB_Y + 96} C ${S_X - 100} ${TB_Y + 96}, ${E_X + E_W + 96} ${RES_E_Y + RES_E_H / 2}, ${E_X + E_W + 6} ${RES_E_Y + RES_E_H / 2}`;
const pIdxRow = `M ${S_X + 120} ${BT_Y + BT_H} L ${S_X + 120} ${TB_Y - 6}`;
const pOut = `M ${E_X - 6} ${RES_E_Y + RES_E_H / 2} C ${E_X - 130} ${RES_E_Y + RES_E_H / 2}, ${A_X + A_W + 110} ${RES_Y + RES_H / 2}, ${A_X + A_W} ${RES_Y + RES_H / 2}`;
const pW = `M ${A_X + A_W} ${WR_Y + WR_H / 2} C ${A_X + A_W + 110} ${WR_Y + WR_H / 2}, ${E_X - 110} ${TXN_Y + TXN_H / 2}, ${E_X - 6} ${TXN_Y + TXN_H / 2}`;
const pCommit = `M ${E_X + E_W + 6} ${TXN_Y + 44} C ${E_X + E_W + 96} ${TXN_Y + 44}, ${S_X - 96} ${ST_Y + ST_H / 2}, ${S_X - 6} ${ST_Y + ST_H / 2}`;
const pRoll = `M ${E_X + 78} ${TXN_Y + TXN_H} C ${E_X + 78} ${TXN_Y + TXN_H + 70}, ${A_X + A_W + 40} ${WR_Y + WR_H + 60}, ${A_X + A_W - 40} ${WR_Y + WR_H + 6}`;

/* --------------------------------- data ---------------------------------- */

const cols = ["id", "email", "city", "created"] as const;
const tableRows = [
  ["41", "sam@…", "Lyon", "2026-02-04"],
  ["42", "ada@…", "Paris", "2026-03-11"],
  ["43", "kim@…", "Oslo", "2026-03-19"],
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case APP:
      return {
        eyebrow: "Caller",
        title: "Application",
        body: "The application holds no lasting state of its own. Whenever it needs to know or change something, it sends a statement to the database and waits for a reliable answer.",
      };
    case QUERY:
      return {
        eyebrow: "Read path",
        title: "A query asks a question",
        body: "SELECT * FROM users WHERE id = 42 describes what is wanted, not how to find it. The application never says which file to open or which row to jump to — that is the engine's job.",
      };
    case PARSE:
      return {
        eyebrow: "Engine",
        title: "Parse and plan",
        body: "The engine checks the statement, resolves the table and columns, then picks an execution plan. Given a filter on an indexed column it chooses an index lookup; with no useful index it falls back to reading every row.",
      };
    case INDEX:
      return {
        eyebrow: "Access path",
        title: "Index lookup, not a full scan",
        body: "An index is a sorted structure that maps a column value to the rows holding it, so the engine reaches row 42 in a handful of steps instead of examining a million. Indexes cost extra space and slow writes slightly — that is the trade.",
      };
    case TABLE:
      return {
        eyebrow: "Data model",
        title: "Rows, columns and a primary key",
        body: "A table is a fixed set of columns with a type each, and any number of rows. The primary key — here id — identifies exactly one row, which is what lets other tables, indexes and updates point at it unambiguously.",
      };
    case RESULT:
      return {
        eyebrow: "Answer",
        title: "The matching rows come back",
        body: "Only the rows the query asked for are returned, in a shape the application can read straight away. Same question, same answer — even while other clients are writing at the same moment.",
      };
    case WRITE:
      return {
        eyebrow: "Write path",
        title: "INSERT and UPDATE change state",
        body: "Writes take the same route through the engine, but they must also be safe: constraints are enforced, indexes are kept in step, and the change only becomes visible to others once it is committed.",
      };
    case TXN:
      return {
        eyebrow: "Transaction",
        title: "All of it, or none of it",
        body: "A transaction groups one or more statements. On COMMIT every change takes effect together; if anything fails — a constraint, a crash, an explicit ROLLBACK — the whole group is undone and the data looks as if the write never started.",
      };
    case ROLLBACK:
      return {
        eyebrow: "Failure branch",
        title: "ROLLBACK",
        body: "When a transaction cannot complete, the engine restores the earlier state and reports the failure. There is no half-applied write: an order is either recorded with its payment, or neither exists.",
      };
    case STORAGE:
      return {
        eyebrow: "Durability",
        title: "Data files and the write-ahead log",
        body: "Committed changes are written to a log on durable storage before they are acknowledged. Stop the application, restart the machine, replace the server — the data is still there, and any interrupted work is recovered from the log.",
      };
    default:
      return null;
  }
}

/* -------------------------------- desktop -------------------------------- */

function Token({
  path,
  dur,
  begin,
  color,
  reverse,
  square,
}: {
  path: string;
  dur: string;
  begin: string;
  color: string;
  reverse?: boolean;
  square?: boolean;
}) {
  return (
    <g>
      {square ? (
        <rect x={-9} y={-9} width={18} height={18} rx={5} fill="var(--surface)" stroke={color} strokeWidth={1.8} />
      ) : (
        <>
          <circle r={7.5} fill="var(--surface)" stroke={color} strokeWidth={1.8} />
          <circle r={3} fill={color} />
        </>
      )}
      <animateMotion
        dur={dur}
        begin={begin}
        repeatCount="indefinite"
        path={path}
        keyPoints={reverse ? "1;0" : "0;1"}
        keyTimes="0;1"
        calcMode="linear"
      />
    </g>
  );
}

function Flow({
  d,
  on,
  op,
  color,
  dashed,
}: {
  d: string;
  on: boolean;
  op: number;
  color: string;
  dashed?: boolean;
}) {
  return (
    <g opacity={op} style={{ transition: "opacity .3s ease" }}>
      <path
        d={d}
        fill="none"
        stroke={on ? color : "var(--border-strong)"}
        strokeWidth={on ? 3.2 : 1.9}
        strokeLinecap="round"
        strokeDasharray={dashed ? "6 9" : undefined}
        className={dashed ? "motion-safe:animate-[dash-travel_5s_linear_infinite]" : undefined}
        style={{ transition: "stroke-width .25s ease, stroke .25s ease" }}
      />
    </g>
  );
}

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

  const card = (key: string, x: number, y: number, w: number, h: number, accent: string, r = 24) => (
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
      aria-label="A cutaway of a database system: an application on the left sends a SELECT query and an UPDATE write. In the centre the database engine parses and plans the statement, chooses an index lookup instead of a full scan, and runs writes inside a transaction that either commits or rolls back. On the right an index structure points into a table of rows and columns with a primary key, and committed changes land in durable data files and a write-ahead log. Matching rows return to the application."
      className="w-full"
      style={{ minHeight: 640, maxHeight: 820 }}
    >
      <defs>
        <linearGradient id={`${uid}-read`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--primary)" />
        </linearGradient>
        <linearGradient id={`${uid}-back`} x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--cyan)" />
        </linearGradient>
        <linearGradient id={`${uid}-engine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.13" />
          <stop offset="55%" stopColor="var(--primary)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--violet)" stopOpacity="0.12" />
        </linearGradient>
        <filter id={`${uid}-lift`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="var(--primary)" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={A_X} y={48} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 09 — ASK, FIND, COMMIT, KEEP
        </text>
        <text x={W - 44} y={48} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          APPLICATION → ENGINE → STORED DATA
        </text>
        <line x1={A_X} y1={68} x2={W - 44} y2={68} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* engine zone */}
      <g opacity={op(PARSE)} style={{ transition: "opacity .3s ease" }}>
        <rect
          x={E_X}
          y={E_Y}
          width={E_W}
          height={E_H}
          rx={34}
          fill={`url(#${uid}-engine)`}
          stroke="color-mix(in oklab, var(--primary) 22%, transparent)"
        />
        <text x={E_X + 30} y={E_Y + 40} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          DATABASE ENGINE
        </text>
      </g>

      {/* storage zone */}
      <g opacity={op(TABLE)} style={{ transition: "opacity .3s ease" }}>
        <rect
          x={S_X - 40}
          y={E_Y}
          width={S_W + 80}
          height={E_H}
          rx={34}
          fill="color-mix(in oklab, var(--primary) 3.5%, transparent)"
          stroke="color-mix(in oklab, var(--primary) 18%, transparent)"
        />
        <text x={S_X - 8} y={E_Y + 40} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          STORED DATA — SURVIVES RESTARTS
        </text>
      </g>

      {/* flows */}
      <Flow d={pQ} on={lit(P_Q) && hover !== null} op={op(P_Q)} color={`url(#${uid}-read)`} />
      <Flow d={pPlan} on={lit(P_PLAN) && hover !== null} op={op(P_PLAN)} color="var(--primary)" />
      <Flow d={pLook} on={lit(P_LOOK) && hover !== null} op={op(P_LOOK)} color="var(--primary)" />
      <Flow d={pIdxRow} on={lit(P_LOOK) && hover !== null} op={op(P_LOOK)} color="var(--violet)" dashed />
      <Flow d={pRows} on={lit(P_ROWS) && hover !== null} op={op(P_ROWS)} color={`url(#${uid}-back)`} />
      <Flow d={pOut} on={lit(P_OUT) && hover !== null} op={op(P_OUT)} color={`url(#${uid}-back)`} />
      <Flow d={pW} on={lit(P_W) && hover !== null} op={op(P_W)} color="var(--violet)" />
      <Flow d={pCommit} on={lit(P_COMMIT) && hover !== null} op={op(P_COMMIT)} color="var(--violet)" />
      <Flow d={pRoll} on={lit(P_ROLL) && hover !== null} op={op(P_ROLL)} color="var(--ember, var(--chart-5))" dashed />

      <g opacity={op(P_Q)}>
        <Token path={pQ} dur="4s" begin="0s" color="var(--primary)" />
      </g>
      <g opacity={op(P_LOOK)}>
        <Token path={pLook} dur="3s" begin="1.2s" color="var(--primary)" />
      </g>
      <g opacity={op(P_ROWS)}>
        <Token path={pRows} dur="3.2s" begin="0.4s" color="var(--cyan)" square />
      </g>
      <g opacity={op(P_OUT)}>
        <Token path={pOut} dur="4s" begin="1.8s" color="var(--cyan)" square />
      </g>
      <g opacity={op(P_W)}>
        <Token path={pW} dur="4.4s" begin="0.8s" color="var(--violet)" square />
      </g>
      <g opacity={op(P_COMMIT)}>
        <Token path={pCommit} dur="3.4s" begin="2.2s" color="var(--violet)" square />
      </g>

      {/* flow labels */}
      <g aria-hidden="true" opacity={op(P_Q)}>
        <text x={A_X + A_W + 34} y={Q_Y + 34} fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
          READ
        </text>
      </g>
      <g aria-hidden="true" opacity={op(P_W)}>
        <text x={A_X + A_W + 34} y={WR_Y + 34} fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
          WRITE
        </text>
      </g>
      <g aria-hidden="true" opacity={op(P_OUT)}>
        <text x={A_X + A_W + 34} y={RES_Y + RES_H - 6} fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
          RESULT
        </text>
      </g>
      <g aria-hidden="true" opacity={op(P_COMMIT)}>
        <text x={E_X + E_W + 60} y={TXN_Y + 26} fontSize={12} fontFamily="var(--font-mono)" letterSpacing="0.12em" fill="var(--violet)">
          COMMIT
        </text>
      </g>

      {/* --------------------------- application column ----------------------- */}
      <g aria-hidden="true" opacity={op(APP)}>
        <text x={A_X} y={96} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          APPLICATION
        </text>
      </g>

      <g {...interactive(APP, "Application — sends queries and writes")} opacity={op(APP)}>
        <rect
          x={A_X}
          y={APP_Y}
          width={A_W}
          height={APP_H}
          rx={26}
          fill={on(APP) ? "color-mix(in oklab, var(--primary) 7%, var(--surface))" : "var(--surface)"}
          stroke={on(APP) ? "color-mix(in oklab, var(--primary) 55%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(APP) ? 2 : 1.2}
          filter={`url(#${uid}-lift)`}
          style={{ transition: "fill .3s ease, stroke .3s ease" }}
        />
        <circle cx={A_X + 44} cy={APP_Y + APP_H / 2} r={13} fill="none" stroke="var(--violet)" strokeWidth={1.9} />
        <circle cx={A_X + 44} cy={APP_Y + APP_H / 2} r={4.4} fill="var(--violet)" />
        <text x={A_X + 74} y={APP_Y + 48} fontSize={21} fontWeight={780} fill="var(--foreground)">
          Application
        </text>
        <text x={A_X + 74} y={APP_Y + 74} fontSize={13.5} fill="var(--muted-foreground)">
          Keeps no lasting state itself
        </text>
      </g>

      {/* query console */}
      <g {...interactive(QUERY, "Query — SELECT statement sent to the database")} opacity={op(QUERY)}>
        {card(QUERY, A_X, Q_Y, A_W, Q_H, "var(--primary)")}
        <text x={A_X + 24} y={Q_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          QUERY · READ
        </text>
        <text x={A_X + 24} y={Q_Y + 72} fontSize={16} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--primary)">
          SELECT id, email, city
        </text>
        <text x={A_X + 24} y={Q_Y + 100} fontSize={16} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--primary)">
          FROM users
        </text>
        <text x={A_X + 24} y={Q_Y + 128} fontSize={16} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--primary)">
          WHERE id = 42;
        </text>
        <text x={A_X + 24} y={Q_Y + 158} fontSize={12.5} fill="var(--muted-foreground)">
          Says what is wanted, not how to find it
        </text>
      </g>

      {/* write console */}
      <g {...interactive(WRITE, "Write — UPDATE statement inside a transaction")} opacity={op(WRITE)}>
        {card(WRITE, A_X, WR_Y, A_W, WR_H, "var(--violet)")}
        <text x={A_X + 24} y={WR_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          WRITE · CHANGES STATE
        </text>
        <text x={A_X + 24} y={WR_Y + 68} fontSize={16} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--violet)">
          UPDATE users
        </text>
        <text x={A_X + 24} y={WR_Y + 94} fontSize={16} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--violet)">
          SET city = 'Berlin'
        </text>
        <text x={A_X + 24} y={WR_Y + 120} fontSize={16} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--violet)">
          WHERE id = 42;
        </text>
        <text x={A_X + 24} y={WR_Y + 146} fontSize={12.5} fill="var(--muted-foreground)">
          INSERT works the same way
        </text>
      </g>

      {/* result card */}
      <g {...interactive(RESULT, "Result — the matching rows returned to the application")} opacity={op(RESULT)}>
        {card(RESULT, A_X, RES_Y, A_W, RES_H, "var(--cyan)")}
        <text x={A_X + 24} y={RES_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          RESULT SET · 1 ROW
        </text>
        <line x1={A_X + 24} y1={RES_Y + 50} x2={A_X + A_W - 24} y2={RES_Y + 50} stroke="var(--border)" />
        <text x={A_X + 24} y={RES_Y + 78} fontSize={13.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
          id | email | city
        </text>
        <text x={A_X + 24} y={RES_Y + 104} fontSize={14.5} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--foreground)">
          42 | ada@… | Paris
        </text>
        <text x={A_X + 24} y={RES_Y + 132} fontSize={12.5} fill="var(--muted-foreground)">
          Only the rows that matched
        </text>
      </g>

      {/* ------------------------------ engine rows --------------------------- */}
      <g {...interactive(PARSE, "Parse and plan — the engine chooses an execution plan")} opacity={op(PARSE)}>
        {card(PARSE, R_X, PARSE_Y, R_W, PARSE_H, "var(--primary)", 22)}
        <text x={R_X + 24} y={PARSE_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          01 · PARSE &amp; PLAN
        </text>
        <text x={R_X + 24} y={PARSE_Y + 66} fontSize={19} fontWeight={760} fill="var(--foreground)">
          Understand, then choose
        </text>
        <text x={R_X + 24} y={PARSE_Y + 96} fontSize={13} fill="var(--muted-foreground)">
          Filter on an indexed column → index lookup
        </text>
        <text x={R_X + 24} y={PARSE_Y + 116} fontSize={13} fill="var(--muted-foreground)">
          No useful index → read every row
        </text>
      </g>

      <g {...interactive(INDEX, "Index lookup — finding rows without scanning everything")} opacity={op(INDEX)}>
        {card(INDEX, R_X, IDX_Y, R_W, IDX_H, "var(--primary)", 22)}
        <text x={R_X + 24} y={IDX_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          02 · ACCESS PATH
        </text>
        <text x={R_X + 24} y={IDX_Y + 66} fontSize={19} fontWeight={760} fill="var(--foreground)">
          Index lookup
        </text>
        <g aria-hidden="true">
          <rect
            x={R_X + 24}
            y={IDX_Y + 84}
            width={R_W - 48}
            height={38}
            rx={12}
            fill="color-mix(in oklab, var(--cyan) 8%, transparent)"
            stroke="color-mix(in oklab, var(--cyan) 32%, transparent)"
          />
          <text x={R_X + 40} y={IDX_Y + 108} fontSize={13} fontFamily="var(--font-mono)" fill="var(--foreground)">
            3 steps, not 1 000 000 rows
          </text>
        </g>
      </g>

      <g {...interactive(TXN, "Transaction — commit or roll back")} opacity={op(TXN)}>
        {card(TXN, R_X, TXN_Y, R_W, TXN_H, "var(--violet)", 22)}
        <text x={R_X + 24} y={TXN_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          03 · TRANSACTION
        </text>
        <text x={R_X + 24} y={TXN_Y + 66} fontSize={19} fontWeight={760} fill="var(--foreground)">
          All of it, or none of it
        </text>
        <g aria-hidden="true">
          <rect
            x={R_X + 24}
            y={TXN_Y + 84}
            width={130}
            height={34}
            rx={17}
            fill="color-mix(in oklab, var(--violet) 12%, transparent)"
            stroke="color-mix(in oklab, var(--violet) 42%, transparent)"
          />
          <text x={R_X + 46} y={TXN_Y + 106} fontSize={12.5} fontFamily="var(--font-mono)" fontWeight={700} fill="var(--violet)">
            COMMIT
          </text>
        </g>
      </g>

      <g {...interactive(ROLLBACK, "Rollback — a failed write leaves no trace")} opacity={op(ROLLBACK)}>
        <rect
          x={R_X + 168}
          y={TXN_Y + 84}
          width={140}
          height={34}
          rx={17}
          fill={on(ROLLBACK) ? "color-mix(in oklab, var(--chart-5) 10%, transparent)" : "transparent"}
          stroke={on(ROLLBACK) ? "color-mix(in oklab, var(--chart-5) 60%, transparent)" : "var(--border-strong)"}
          strokeDasharray="5 6"
        />
        <text x={R_X + 190} y={TXN_Y + 106} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
          ROLLBACK
        </text>
      </g>

      <g aria-hidden="true" opacity={op(P_ROLL)}>
        <text x={A_X + A_W + 34} y={WR_Y + WR_H + 76} fontSize={12.5} fill="var(--muted-foreground)">
          If it fails, the earlier state is restored
        </text>
      </g>


      <g {...interactive(RESULT, "Result assembly — rows collected for the caller")} opacity={op(RESULT)}>
        {card(RESULT, R_X, RES_E_Y, R_W, RES_E_H, "var(--cyan)", 22)}
        <text x={R_X + 24} y={RES_E_Y + 30} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          04 · RESULT
        </text>
        <text x={R_X + 24} y={RES_E_Y + 62} fontSize={18} fontWeight={740} fill="var(--foreground)">
          Matching rows, assembled
        </text>
      </g>

      {/* ------------------------------- storage ------------------------------ */}
      <g {...interactive(INDEX, "Index structure on the id column")} opacity={op(INDEX)}>
        {card(INDEX, S_X, BT_Y, S_W, BT_H, "var(--cyan)")}
        <text x={S_X + 24} y={BT_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          INDEX ON users(id)
        </text>
        <g aria-hidden="true">
          <rect x={S_X + 158} y={BT_Y + 50} width={104} height={30} rx={9} fill="var(--surface)" stroke="color-mix(in oklab, var(--cyan) 45%, transparent)" />
          <text x={S_X + 178} y={BT_Y + 70} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--foreground)">
            1 – 999k
          </text>
          {[0, 1, 2].map((i) => {
            const x = S_X + 34 + i * 124;
            return (
              <g key={i}>
                <path
                  d={`M ${S_X + 210} ${BT_Y + 80} C ${S_X + 210} ${BT_Y + 100}, ${x + 42} ${BT_Y + 96}, ${x + 42} ${BT_Y + 112}`}
                  fill="none"
                  stroke="color-mix(in oklab, var(--cyan) 40%, transparent)"
                  strokeWidth={1.4}
                />
                <rect
                  x={x}
                  y={BT_Y + 112}
                  width={84}
                  height={28}
                  rx={9}
                  fill={i === 1 ? "color-mix(in oklab, var(--cyan) 14%, var(--surface))" : "var(--surface)"}
                  stroke={i === 1 ? "color-mix(in oklab, var(--cyan) 60%, transparent)" : "var(--border)"}
                />
                <text
                  x={x + 42}
                  y={BT_Y + 131}
                  textAnchor="middle"
                  fontSize={12}
                  fontFamily="var(--font-mono)"
                  fill={i === 1 ? "var(--foreground)" : "var(--muted-foreground)"}
                >
                  {["1–40", "41–43", "44–…"][i]}
                </text>
              </g>
            );
          })}
        </g>
      </g>

      <g {...interactive(TABLE, "Table users — rows, columns and a primary key")} opacity={op(TABLE)}>
        {card(TABLE, S_X, TB_Y, S_W, TB_H, "var(--primary)")}
        <text x={S_X + 24} y={TB_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          TABLE · users
        </text>
        <g aria-hidden="true">
          {cols.map((c, i) => (
            <text
              key={c}
              x={S_X + 30 + i * 96}
              y={TB_Y + 74}
              fontSize={12.5}
              fontFamily="var(--font-mono)"
              fontWeight={700}
              fill={i === 0 ? "var(--primary)" : "var(--muted-foreground)"}
            >
              {c}
            </text>
          ))}
          <line x1={S_X + 24} y1={TB_Y + 86} x2={S_X + S_W - 24} y2={TB_Y + 86} stroke="var(--border-strong)" />
          {tableRows.map((r, ri) => {
            const y = TB_Y + 104 + ri * 42;
            const match = r[0] === "42";
            return (
              <g key={r[0]}>
                <rect
                  x={S_X + 20}
                  y={y}
                  width={S_W - 40}
                  height={34}
                  rx={10}
                  fill={match ? "color-mix(in oklab, var(--cyan) 12%, transparent)" : "transparent"}
                  stroke={match ? "color-mix(in oklab, var(--cyan) 45%, transparent)" : "transparent"}
                />
                {r.map((cell, ci) => (
                  <text
                    key={ci}
                    x={S_X + 30 + ci * 96}
                    y={y + 23}
                    fontSize={13}
                    fontFamily="var(--font-mono)"
                    fontWeight={ci === 0 ? 700 : 400}
                    fill={ci === 0 ? "var(--foreground)" : "var(--muted-foreground)"}
                  >
                    {cell}
                  </text>
                ))}
              </g>
            );
          })}
          <text x={S_X + 24} y={TB_Y + TB_H - 20} fontSize={12.5} fill="var(--muted-foreground)">
            id is the primary key — it identifies exactly one row
          </text>
        </g>
      </g>

      <g {...interactive(STORAGE, "Durable storage — data files and write-ahead log")} opacity={op(STORAGE)}>
        {card(STORAGE, S_X, ST_Y, S_W, ST_H, "var(--violet)")}
        <text x={S_X + 24} y={ST_Y + 32} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          DURABLE STORAGE
        </text>
        <g aria-hidden="true" transform={`translate(${S_X + 30} ${ST_Y + 52})`}>
          <ellipse cx={26} cy={12} rx={26} ry={9} fill="none" stroke="var(--violet)" strokeWidth={1.7} />
          <path d="M0 12v38c0 5 11.6 9 26 9s26-4 26-9V12" fill="none" stroke="var(--violet)" strokeWidth={1.7} />
          <path d="M0 31c0 5 11.6 9 26 9s26-4 26-9" fill="none" stroke="var(--violet)" strokeWidth={1.7} />
        </g>
        <text x={S_X + 110} y={ST_Y + 74} fontSize={18} fontWeight={740} fill="var(--foreground)">
          Data files + write-ahead log
        </text>
        <text x={S_X + 110} y={ST_Y + 100} fontSize={13} fill="var(--muted-foreground)">
          Committed before the write is acknowledged
        </text>
        <text x={S_X + 110} y={ST_Y + 122} fontSize={13} fill="var(--muted-foreground)">
          Still there after the app stops or restarts
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
  const Step = ({ text }: { text: string }) => (
    <div className="flex items-center gap-2 pl-6" aria-hidden="true">
      <span className="h-6 w-px bg-border-strong" />
      <span className="text-[11.5px] text-muted-foreground">{text}</span>
    </div>
  );

  return (
    <div className="space-y-3 px-4 py-5">
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">APPLICATION</p>

      <button
        type="button"
        onClick={() => onToggle(APP)}
        aria-expanded={activeKey === APP}
        className="w-full rounded-3xl border border-border bg-surface px-4 py-4 text-left shadow-soft"
      >
        <span className="block text-[18px] font-extrabold">Application</span>
        <span className="block text-[13px] text-muted-foreground">Keeps no lasting state itself</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(QUERY)}
        aria-expanded={activeKey === QUERY}
        className="w-full rounded-3xl border border-primary/35 bg-surface px-4 py-4 text-left"
      >
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">QUERY · READ</span>
        <span className="mt-1.5 block font-mono text-[14.5px] font-bold leading-relaxed text-primary">
          SELECT id, email, city
          <br />
          FROM users WHERE id = 42;
        </span>
      </button>

      <Step text="sent to the engine" />

      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">DATABASE ENGINE</p>

      <div className="space-y-2 rounded-3xl border border-cyan/40 bg-surface-tint p-3">
        <button
          type="button"
          onClick={() => onToggle(PARSE)}
          aria-expanded={activeKey === PARSE}
          className="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-left"
        >
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground">01 · PARSE &amp; PLAN</span>
          <span className="mt-1 block text-[15.5px] font-bold">Understand, then choose</span>
          <span className="block text-[12.5px] text-muted-foreground">
            Indexed filter → lookup. Otherwise → read every row.
          </span>
        </button>
        <button
          type="button"
          onClick={() => onToggle(INDEX)}
          aria-expanded={activeKey === INDEX}
          className="w-full rounded-2xl border border-border bg-surface px-3.5 py-3 text-left"
        >
          <span className="font-mono text-[10.5px] tracking-[0.14em] text-muted-foreground">02 · ACCESS PATH</span>
          <span className="mt-1 block text-[15.5px] font-bold">Index lookup</span>
          <span className="block text-[12.5px] text-muted-foreground">3 steps, not 1 000 000 rows</span>
        </button>
      </div>

      <Step text="reads the matching rows" />

      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">STORED DATA</p>

      <button
        type="button"
        onClick={() => onToggle(TABLE)}
        aria-expanded={activeKey === TABLE}
        className="w-full rounded-3xl border border-border bg-surface px-4 py-4 text-left shadow-soft"
      >
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">TABLE · users</span>
        <span className="mt-2 block overflow-x-auto font-mono text-[12.5px] leading-relaxed">
          <span className="block font-bold text-muted-foreground">id · email · city · created</span>
          {tableRows.map((r) => (
            <span
              key={r[0]}
              className={`block ${r[0] === "42" ? "font-bold text-foreground" : "text-muted-foreground"}`}
            >
              {r.join(" · ")}
            </span>
          ))}
        </span>
        <span className="mt-2 block text-[12.5px] text-muted-foreground">
          id is the primary key — it identifies exactly one row
        </span>
      </button>

      <Step text="returned to the caller" />

      <button
        type="button"
        onClick={() => onToggle(RESULT)}
        aria-expanded={activeKey === RESULT}
        className="w-full rounded-3xl border border-cyan/45 bg-surface px-4 py-4 text-left"
      >
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">RESULT SET · 1 ROW</span>
        <span className="mt-1.5 block font-mono text-[13.5px] font-bold">42 | ada@… | Paris</span>
        <span className="block text-[12.5px] text-muted-foreground">Only the rows that matched</span>
      </button>

      <div className="pt-2">
        <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">WRITE PATH</p>
      </div>

      <button
        type="button"
        onClick={() => onToggle(WRITE)}
        aria-expanded={activeKey === WRITE}
        className="w-full rounded-3xl border border-violet/35 bg-surface px-4 py-4 text-left"
      >
        <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">WRITE · CHANGES STATE</span>
        <span className="mt-1.5 block font-mono text-[14.5px] font-bold leading-relaxed text-violet">
          UPDATE users SET city = 'Berlin'
          <br />
          WHERE id = 42;
        </span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(TXN)}
        aria-expanded={activeKey === TXN}
        className="w-full rounded-3xl border border-violet/30 bg-surface px-4 py-4 text-left"
      >
        <span className="block text-[15.5px] font-bold">Transaction</span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-violet/45 px-2.5 py-1 font-mono text-[11px]">COMMIT</span>
          <span className="rounded-full border border-dashed border-border-strong px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            ROLLBACK
          </span>
        </span>
        <span className="mt-1.5 block text-[12.5px] text-muted-foreground">All of it, or none of it</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(ROLLBACK)}
        aria-expanded={activeKey === ROLLBACK}
        className="w-full rounded-2xl border border-dashed border-border-strong px-3.5 py-3 text-left"
      >
        <span className="block text-[13.5px] font-semibold">If it fails</span>
        <span className="block text-[12.5px] text-muted-foreground">The earlier state is restored — no half write.</span>
      </button>

      <button
        type="button"
        onClick={() => onToggle(STORAGE)}
        aria-expanded={activeKey === STORAGE}
        className="w-full rounded-3xl border border-border bg-surface px-4 py-4 text-left shadow-soft"
      >
        <span className="block text-[15.5px] font-bold">Durable storage</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Data files + write-ahead log — still there after the app stops or restarts
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function DatabaseDiagram() {
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
              Structured state · queried and updated
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Read path", color: "var(--primary)" },
              { label: "Result path", color: "var(--cyan)" },
              { label: "Write & commit", color: "var(--violet)" },
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
            side="left"
          />
        )}
      </div>
      <figcaption className="mt-3 max-w-3xl text-xs leading-relaxed text-muted-foreground">
        A query describes what is wanted; the engine plans it, reaches the rows through an index and
        returns only what matched. Writes run inside a transaction that either commits to durable
        storage or rolls back completely — and the data outlives the application process.
      </figcaption>
      <StageHint text="Hover a component to isolate its path; click the application, the query, the planner, the index, the table, the transaction or the storage layer for a short explanation." />
    </figure>
  );
}
