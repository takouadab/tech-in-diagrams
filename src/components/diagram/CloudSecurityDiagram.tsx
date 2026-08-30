import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const IDENT = "identity";
const AUTHN = "authn";
const AUTHZ = "authz";
const DENIED = "denied";
const NET = "network";
const WORK = "workload";
const DATA = "data";
const TRANSIT = "transit";
const SECRETS = "secrets";
const AUDIT = "audit";
const SHARED = "shared";

const related: Record<string, string[]> = {
  [IDENT]: [AUTHN, AUTHZ, TRANSIT],
  [AUTHN]: [IDENT, AUTHZ],
  [AUTHZ]: [IDENT, AUTHN, DENIED, WORK, TRANSIT, AUDIT],
  [DENIED]: [AUTHZ, AUDIT],
  [NET]: [WORK, DATA, TRANSIT],
  [WORK]: [AUTHZ, DATA, NET, SECRETS, TRANSIT, AUDIT],
  [DATA]: [WORK, NET, SECRETS],
  [TRANSIT]: [AUTHZ, WORK, IDENT],
  [SECRETS]: [WORK, DATA],
  [AUDIT]: [AUTHZ, WORK, DENIED],
  [SHARED]: [NET, WORK, DATA, IDENT],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1600;
const H = 838;

/* left identity column */
const L_X = 40;
const L_W = 300;
const ID_Y = 150;
const ID_H = 168;
const AN_Y = 352;
const AN_H = 152;
const DN_Y = 618;
const DN_H = 152;

/* authorization decision */
const AZ_X = 392;
const AZ_W = 256;
const AZ_Y = 262;
const AZ_H = 268;

/* secrets card */
const SC_X = 392;
const SC_Y = 600;
const SC_W = 256;
const SC_H = 186;

/* protected boundary */
const B_X = 700;
const B_Y = 128;
const B_W = 562;
const B_H = 654;

const WK_X = 742;
const WK_Y = 254;
const WK_W = 478;
const WK_H = 168;

const DT_X = 742;
const DT_Y = 496;
const DT_W = 478;
const DT_H = 186;

/* right rail */
const R_X = 1302;
const R_W = 278;
const AU_Y = 150;
const AU_H = 366;
const SH_Y = 552;
const SH_H = 262;

/* paths */
const pIdentAuthn = `M ${L_X + L_W / 2} ${ID_Y + ID_H} L ${L_X + L_W / 2} ${AN_Y}`;
const pAuthnAuthz = `M ${L_X + L_W} ${AN_Y + 74} C 364 ${AN_Y + 74}, 364 ${AZ_Y + 132}, ${AZ_X} ${AZ_Y + 132}`;
const pDenied = `M ${L_X + L_W} ${DN_Y + 70} C 356 ${DN_Y + 70}, 356 470, ${AZ_X - 16} 470`;
const pTransit = `M ${AZ_X + AZ_W} ${AZ_Y + 108} C 700 ${AZ_Y + 108}, 690 ${WK_Y + 84}, ${WK_X} ${WK_Y + 84}`;
const pWorkData = `M ${WK_X + WK_W / 2} ${WK_Y + WK_H} L ${WK_X + WK_W / 2} ${DT_Y}`;
const pSecrets = `M ${SC_X + SC_W} ${SC_Y + 74} C 700 ${SC_Y + 74}, 692 ${WK_Y + 132}, ${WK_X} ${WK_Y + 132}`;
const pAudit = `M ${B_X + B_W} 330 C 1284 330, 1284 300, ${R_X} 300`;
const pDeniedAudit = `M ${AZ_X + AZ_W / 2} ${AZ_Y + AZ_H} C 520 812, 1180 826, ${R_X + 60} ${AU_Y + AU_H}`;

/* --------------------------------- copy ---------------------------------- */

const auditRows = [
  { tag: "ALLOWED", tone: "var(--cyan)", label: "read · reports/2026", note: "app-service identity, role Reader" },
  { tag: "DENIED", tone: "var(--ember)", label: "delete · customer-data", note: "no permission on this resource" },
  { tag: "CONFIG", tone: "var(--violet)", label: "storage rule changed", note: "who changed it, and when" },
] as const;

const sharedRows = [
  { who: "Provider", note: "Data centres, hardware, hypervisor, managed service platform.", tone: "var(--primary)" },
  { who: "You", note: "Identities, permissions, configuration, data and workloads.", tone: "var(--cyan)" },
] as const;

const layerRows = [
  { label: "Identity", tone: "var(--cyan)" },
  { label: "Least privilege", tone: "var(--cyan)" },
  { label: "Segmentation", tone: "var(--primary)" },
  { label: "Encryption", tone: "var(--violet)" },
  { label: "Patching", tone: "var(--primary)" },
  { label: "Visibility", tone: "var(--violet)" },
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case IDENT:
      return {
        eyebrow: "Layer 1",
        title: "Every request comes from an identity",
        body: "A person, or a machine identity belonging to an application. There is no anonymous traffic inside a well-run cloud environment — the identity is the thing every later decision is made about.",
      };
    case AUTHN:
      return {
        eyebrow: "Who are you?",
        title: "Authentication proves the identity is genuine",
        body: "A password alone is a weak proof. A second factor, or a short-lived token issued to a workload, establishes that the caller really is who it claims to be. Authentication answers only this question — it grants nothing.",
      };
    case AUTHZ:
      return {
        eyebrow: "What may you do?",
        title: "Authorisation decides each action",
        body: "A separate decision, made per request against the permissions attached to that identity. Least privilege means those permissions cover the task at hand and nothing more, so a stolen identity is worth much less than a broad one.",
      };
    case DENIED:
      return {
        eyebrow: "Denied",
        title: "Authenticated, but not permitted",
        body: "This caller proved who it is and still gets nothing, because no permission covers the action it asked for. The request stops at the authorisation decision — it never reaches the workload — and the attempt is recorded.",
      };
    case NET:
      return {
        eyebrow: "Layer 3",
        title: "Segmentation narrows the reachable surface",
        body: "Network rules decide which traffic may arrive at all, keeping the workload and its data off the open internet. This is one layer, not the security model: anything allowed through still faces the identity and permission checks.",
      };
    case WORK:
      return {
        eyebrow: "Protected workload",
        title: "The application, kept patched and configured",
        body: "The workload runs with its own identity and its own limited permissions. Most real cloud incidents come from configuration and unpatched components here, not from a broken provider platform.",
      };
    case DATA:
      return {
        eyebrow: "Encryption at rest",
        title: "Stored data is encrypted with managed keys",
        body: "Data on disk, in backups and in snapshots is encrypted so that the physical media alone reveals nothing. Encryption at rest does not protect against a valid identity with too many permissions — that is what least privilege is for.",
      };
    case TRANSIT:
      return {
        eyebrow: "Encryption in transit",
        title: "The request path itself is protected",
        body: "Traffic between the caller and the workload travels over TLS, so it cannot be read or altered on the way. In transit and at rest are two different protections and you want both.",
      };
    case SECRETS:
      return {
        eyebrow: "Secrets & keys",
        title: "Held outside the code, fetched at run time",
        body: "Keys, tokens and connection strings live in a managed secret store, not in source control or an image. The workload's identity is what allows it to read a secret, so access can be granted, rotated and revoked without a redeploy.",
      };
    case AUDIT:
      return {
        eyebrow: "Visibility",
        title: "A record of what was allowed and refused",
        body: "Audit logs capture both outcomes. Denied attempts are often the earliest signal that something is wrong, and the same record is what makes an investigation — or a compliance answer — possible after the fact.",
      };
    case SHARED:
      return {
        eyebrow: "Shared responsibility",
        title: "The provider secures the cloud, you secure what you put in it",
        body: "Facilities, hardware and the managed platform are the provider's job. Identities, permissions, configuration, data and your own workloads stay yours, whichever provider you use.",
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
      aria-label="Cloud security drawn as independent layers rather than one wall. On the left an identity is authenticated, then a separate authorisation decision grants only the permissions it needs; a second request is authenticated but denied at that decision and never reaches the workload. In the centre a segmented boundary contains the protected application and an encrypted data store, reached over an encrypted-in-transit path, with keys held in a separate managed secret store outside the workload. On the right an audit rail records allowed and denied actions, and a shared responsibility card separates what the provider secures from what the customer secures."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 840 }}
    >
      <defs>
        <linearGradient id={`${uid}-boundary`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.08" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={L_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 15 — LAYERS, NOT A SINGLE WALL
        </text>
        <text x={W - 40} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          IDENTITY IS THE PERIMETER
        </text>
        <line x1={L_X} y1={52} x2={W - 40} y2={52} stroke="var(--border)" strokeWidth={1} />
      </g>

      {/* layer ribbon */}
      <g aria-hidden="true">
        {layerRows.map((l, i) => (
          <g key={l.label}>
            <rect
              x={L_X + i * 176}
              y={74}
              width={162}
              height={34}
              rx={12}
              fill={`color-mix(in oklab, ${l.tone} 6%, transparent)`}
              stroke={`color-mix(in oklab, ${l.tone} 26%, transparent)`}
            />
            <text x={L_X + i * 176 + 81} y={96} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--muted-foreground)">
              {l.label}
            </text>
          </g>
        ))}
      </g>

      {/* ------------------------------ identity ------------------------------ */}
      <g opacity={op(IDENT)}>
        <g {...interactive(IDENT, "Identity — every request comes from a user or workload identity")}>
          {card(IDENT, L_X, ID_Y, L_W, ID_H, "var(--cyan)")}
          <text x={L_X + 26} y={ID_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--cyan)">
            LAYER 1 · IDENTITY
          </text>
          <text x={L_X + 26} y={ID_Y + 72} fontSize={19} fontWeight={800} fill="var(--foreground)">
            User or workload
          </text>
          <text x={L_X + 26} y={ID_Y + 102} fontSize={13} fill="var(--muted-foreground)">
            A person, or an application
          </text>
          <text x={L_X + 26} y={ID_Y + 124} fontSize={13} fill="var(--muted-foreground)">
            with its own machine identity.
          </text>
          <text x={L_X + 26} y={ID_Y + 150} fontSize={12} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            id: app-service
          </text>
        </g>
      </g>

      <Flow d={pIdentAuthn} on={on(IDENT) || on(AUTHN)} color="var(--cyan)" />

      {/* --------------------------- authentication --------------------------- */}
      <g opacity={op(AUTHN)}>
        <g {...interactive(AUTHN, "Authentication — proving the identity is genuine")}>
          {card(AUTHN, L_X, AN_Y, L_W, AN_H, "var(--cyan)")}
          <text x={L_X + 26} y={AN_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
            WHO ARE YOU?
          </text>
          <text x={L_X + 26} y={AN_Y + 68} fontSize={19} fontWeight={780} fill="var(--foreground)">
            Authentication
          </text>
          <text x={L_X + 26} y={AN_Y + 98} fontSize={13} fill="var(--muted-foreground)">
            MFA or a short-lived token
          </text>
          <text x={L_X + 26} y={AN_Y + 120} fontSize={13} fill="var(--muted-foreground)">
            proves the claim. Grants nothing.
          </text>
        </g>
      </g>

      <Flow d={pAuthnAuthz} on={on(AUTHN) || on(AUTHZ)} color="var(--cyan)" />
      <Token path={pAuthnAuthz} dur="3s" begin="0s" color="var(--cyan)" />

      {/* ----------------------------- denied caller -------------------------- */}
      <g opacity={op(DENIED)}>
        <g {...interactive(DENIED, "A second identity is authenticated but has no permission — the request is denied")}>
          <rect
            x={L_X}
            y={DN_Y}
            width={L_W}
            height={DN_H}
            rx={22}
            fill="color-mix(in oklab, var(--ember) 5%, var(--surface))"
            stroke={on(DENIED) ? "color-mix(in oklab, var(--ember) 62%, transparent)" : "color-mix(in oklab, var(--ember) 40%, transparent)"}
            strokeWidth={on(DENIED) ? 2.2 : 1.4}
            strokeDasharray="10 7"
            style={{ transition: "stroke .3s ease" }}
          />
          <text x={L_X + 26} y={DN_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--ember)">
            AUTHENTICATED · NOT PERMITTED
          </text>
          <text x={L_X + 26} y={DN_Y + 68} fontSize={19} fontWeight={780} fill="var(--foreground)">
            Second identity
          </text>
          <text x={L_X + 26} y={DN_Y + 98} fontSize={13} fill="var(--muted-foreground)">
            Asks to delete customer data.
          </text>
          <text x={L_X + 26} y={DN_Y + 120} fontSize={13} fill="var(--muted-foreground)">
            No role grants that action.
          </text>
        </g>
      </g>

      <g opacity={op(DENIED)}>
        <path
          d={pDenied}
          fill="none"
          stroke="color-mix(in oklab, var(--ember) 58%, transparent)"
          strokeWidth={2.4}
          strokeDasharray="7 8"
          strokeLinecap="round"
        />
        <g aria-hidden="true">
          <circle cx={AZ_X - 16} cy={470} r={16} fill="var(--surface)" stroke="var(--ember)" strokeWidth={2} />
          <path d="M 369 463 L 383 477 M 383 463 L 369 477" stroke="var(--ember)" strokeWidth={2.4} strokeLinecap="round" />
          <text x={AZ_X - 44} y={512} textAnchor="middle" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--ember)">
            DENIED
          </text>
        </g>
      </g>

      {/* --------------------------- authorisation ---------------------------- */}
      <g opacity={op(AUTHZ)}>
        <g {...interactive(AUTHZ, "Authorisation — least-privilege permissions decide what the identity may do")}>
          {card(AUTHZ, AZ_X, AZ_Y, AZ_W, AZ_H, "var(--primary)")}
          <text x={AZ_X + 24} y={AZ_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--primary)">
            WHAT MAY YOU DO?
          </text>
          <text x={AZ_X + 24} y={AZ_Y + 68} fontSize={19} fontWeight={800} fill="var(--foreground)">
            Authorisation
          </text>
          <text x={AZ_X + 24} y={AZ_Y + 96} fontSize={13} fill="var(--muted-foreground)">
            Least-privilege roles
          </text>
          <g aria-hidden="true">
            <rect
              x={AZ_X + 20}
              y={AZ_Y + 114}
              width={AZ_W - 40}
              height={58}
              rx={14}
              fill="color-mix(in oklab, var(--cyan) 6%, transparent)"
              stroke="color-mix(in oklab, var(--cyan) 30%, transparent)"
            />
            <text x={AZ_X + 38} y={AZ_Y + 140} fontSize={14} fontWeight={720} fill="var(--foreground)">
              Allow · read reports
            </text>
            <text x={AZ_X + 38} y={AZ_Y + 160} fontSize={12.5} fill="var(--muted-foreground)">
              exactly what the task needs
            </text>

            <rect
              x={AZ_X + 20}
              y={AZ_Y + 184}
              width={AZ_W - 40}
              height={58}
              rx={14}
              fill="color-mix(in oklab, var(--ember) 5%, transparent)"
              stroke="color-mix(in oklab, var(--ember) 30%, transparent)"
              strokeDasharray="6 6"
            />
            <text x={AZ_X + 38} y={AZ_Y + 210} fontSize={14} fontWeight={720} fill="var(--foreground)">
              Deny · everything else
            </text>
            <text x={AZ_X + 38} y={AZ_Y + 230} fontSize={12.5} fill="var(--muted-foreground)">
              nothing is granted by default
            </text>
          </g>
        </g>
      </g>

      {/* ------------------------------ secrets ------------------------------- */}
      <g opacity={op(SECRETS)}>
        <g {...interactive(SECRETS, "Secrets and keys held in a managed store outside the workload")}>
          {card(SECRETS, SC_X, SC_Y, SC_W, SC_H, "var(--violet)")}
          <text x={SC_X + 24} y={SC_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--violet)">
            SECRETS &amp; KEYS
          </text>
          <text x={SC_X + 24} y={SC_Y + 68} fontSize={18.5} fontWeight={780} fill="var(--foreground)">
            Managed store
          </text>
          <text x={SC_X + 24} y={SC_Y + 96} fontSize={13} fill="var(--muted-foreground)">
            Never in code or images.
          </text>
          <g aria-hidden="true">
            <rect
              x={SC_X + 20}
              y={SC_Y + 112}
              width={SC_W - 40}
              height={56}
              rx={14}
              fill="color-mix(in oklab, var(--violet) 6%, transparent)"
              stroke="color-mix(in oklab, var(--violet) 28%, transparent)"
            />
            <text x={SC_X + 38} y={SC_Y + 138} fontSize={13.5} fontWeight={700} fill="var(--foreground)">
              Fetched at run time
            </text>
            <text x={SC_X + 38} y={SC_Y + 158} fontSize={12.5} fill="var(--muted-foreground)">
              rotated without a redeploy
            </text>
          </g>
        </g>
      </g>

      <Flow d={pSecrets} on={on(SECRETS) || on(WORK)} color="var(--violet)" dashed />

      {/* --------------------------- encrypted path --------------------------- */}
      <Flow d={pTransit} on={on(TRANSIT) || on(AUTHZ) || on(WORK)} color="var(--cyan)" />
      <Token path={pTransit} dur="2.6s" begin="0.6s" color="var(--cyan)" />
      <g opacity={op(TRANSIT)}>
        <g {...interactive(TRANSIT, "Encryption in transit — the request path is protected with TLS")}>
          <rect
            x={548}
            y={186}
            width={140}
            height={40}
            rx={13}
            fill={on(TRANSIT) ? "color-mix(in oklab, var(--cyan) 10%, var(--surface))" : "var(--surface)"}
            stroke="color-mix(in oklab, var(--cyan) 38%, transparent)"
            strokeWidth={on(TRANSIT) ? 2 : 1.2}
            style={{ transition: "fill .3s ease" }}
          />
          <text x={618} y={212} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="var(--foreground)">
            TLS in transit
          </text>
        </g>
      </g>

      {/* --------------------------- network boundary ------------------------- */}
      <g opacity={op(NET)}>
        <g {...interactive(NET, "Network segmentation — one layer around the workload, not the whole security model")}>
          <rect
            x={B_X}
            y={B_Y}
            width={B_W}
            height={B_H}
            rx={34}
            fill={`url(#${uid}-boundary)`}
            stroke={on(NET) ? "color-mix(in oklab, var(--primary) 58%, transparent)" : "color-mix(in oklab, var(--primary) 30%, transparent)"}
            strokeWidth={on(NET) ? 2.6 : 1.8}
            style={{ transition: "stroke .3s ease" }}
          />
          <text x={B_X + 32} y={B_Y + 42} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--primary)">
            LAYER 3 · NETWORK SEGMENTATION
          </text>
          <text x={B_X + 32} y={B_Y + 76} fontSize={20} fontWeight={800} fill="var(--foreground)">
            Protected environment
          </text>
          <text x={B_X + B_W - 32} y={B_Y + 76} textAnchor="end" fontSize={12.5} fill="var(--muted-foreground)">
            not reachable from the open internet
          </text>
        </g>
      </g>

      {/* ------------------------------ workload ------------------------------ */}
      <g opacity={op(WORK)}>
        <g {...interactive(WORK, "Protected workload — the application, patched and configured, with its own limited permissions")}>
          {card(WORK, WK_X, WK_Y, WK_W, WK_H, "var(--primary)", 24)}
          <text x={WK_X + 28} y={WK_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
            WORKLOAD
          </text>
          <text x={WK_X + 28} y={WK_Y + 70} fontSize={19} fontWeight={800} fill="var(--foreground)">
            Application
          </text>
          <text x={WK_X + 28} y={WK_Y + 100} fontSize={13} fill="var(--muted-foreground)">
            Runs with its own identity and a narrow set of permissions.
          </text>
          <text x={WK_X + 28} y={WK_Y + 122} fontSize={13} fill="var(--muted-foreground)">
            Patched and configured deliberately — no credentials in the code.
          </text>
          <g aria-hidden="true">
            <rect
              x={WK_X + WK_W - 168}
              y={WK_Y + 132}
              width={148}
              height={26}
              rx={9}
              fill="color-mix(in oklab, var(--cyan) 7%, transparent)"
              stroke="color-mix(in oklab, var(--cyan) 28%, transparent)"
            />
            <text x={WK_X + WK_W - 94} y={WK_Y + 150} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="var(--muted-foreground)">
              patched · configured
            </text>
          </g>
        </g>
      </g>

      <Flow d={pWorkData} on={on(WORK) || on(DATA)} color="var(--cyan)" />
      <Token path={pWorkData} dur="2s" begin="1.4s" color="var(--cyan)" />

      {/* -------------------------------- data -------------------------------- */}
      <g opacity={op(DATA)}>
        <g {...interactive(DATA, "Data store — encrypted at rest with managed keys")}>
          {card(DATA, DT_X, DT_Y, DT_W, DT_H, "var(--violet)", 24)}
          <text x={DT_X + 28} y={DT_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--violet)">
            LAYER 4 · ENCRYPTION AT REST
          </text>
          <text x={DT_X + 28} y={DT_Y + 70} fontSize={19} fontWeight={800} fill="var(--foreground)">
            Data store
          </text>
          <text x={DT_X + 28} y={DT_Y + 100} fontSize={13} fill="var(--muted-foreground)">
            Disks, backups and snapshots are encrypted with managed keys,
          </text>
          <text x={DT_X + 28} y={DT_Y + 122} fontSize={13} fill="var(--muted-foreground)">
            so the storage media alone reveals nothing.
          </text>
          {/* lock motif */}
          <g aria-hidden="true">
            <rect
              x={DT_X + DT_W - 96}
              y={DT_Y + 40}
              width={64}
              height={54}
              rx={14}
              fill="color-mix(in oklab, var(--violet) 8%, transparent)"
              stroke="color-mix(in oklab, var(--violet) 40%, transparent)"
            />
            <path
              d={`M ${DT_X + DT_W - 78} ${DT_Y + 66} v -8 a 14 14 0 0 1 28 0 v 8`}
              fill="none"
              stroke="var(--violet)"
              strokeWidth={2.2}
            />
            <rect x={DT_X + DT_W - 82} y={DT_Y + 64} width={36} height={24} rx={7} fill="var(--surface)" stroke="var(--violet)" strokeWidth={1.8} />
            <circle cx={DT_X + DT_W - 64} cy={DT_Y + 76} r={3} fill="var(--violet)" />
          </g>
          <g aria-hidden="true">
            <rect
              x={DT_X + 26}
              y={DT_Y + 138}
              width={DT_W - 130}
              height={28}
              rx={9}
              fill="color-mix(in oklab, var(--violet) 5%, transparent)"
              stroke="color-mix(in oklab, var(--violet) 24%, transparent)"
            />
            <text x={DT_X + 44} y={DT_Y + 157} fontSize={12} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
              keys held in the secret store, not in the app
            </text>
          </g>
        </g>
      </g>

      <g aria-hidden="true" opacity={op(NET)}>
        <text x={B_X + 32} y={B_Y + B_H - 28} fontSize={13} fill="var(--muted-foreground)">
          Network rules alone are not security — anything allowed through
        </text>
        <text x={B_X + 32} y={B_Y + B_H - 6} fontSize={13} fill="var(--muted-foreground)">
          still has to pass the identity and permission checks.
        </text>
      </g>

      {/* -------------------------------- audit ------------------------------- */}
      <Flow d={pAudit} on={on(AUDIT) || on(WORK)} color="var(--violet)" dashed />
      <g opacity={Math.min(op(DENIED), op(AUDIT))}>
        <path
          d={pDeniedAudit}
          fill="none"
          stroke="color-mix(in oklab, var(--ember) 30%, transparent)"
          strokeWidth={1.6}
          strokeDasharray="7 9"
        />
      </g>

      <g opacity={op(AUDIT)}>
        <g {...interactive(AUDIT, "Audit and visibility — a record of allowed and denied actions")}>
          {card(AUDIT, R_X, AU_Y, R_W, AU_H, "var(--violet)")}
          <text x={R_X + 24} y={AU_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--violet)">
            LAYER 6 · VISIBILITY
          </text>
          <text x={R_X + 24} y={AU_Y + 70} fontSize={18.5} fontWeight={780} fill="var(--foreground)">
            Audit log
          </text>
          <text x={R_X + 24} y={AU_Y + 96} fontSize={12.5} fill="var(--muted-foreground)">
            Allowed and refused, both kept.
          </text>
          {auditRows.map((r, i) => {
            const y = AU_Y + 112 + i * 84;
            return (
              <g key={r.label} aria-hidden="true">
                <rect
                  x={R_X + 20}
                  y={y}
                  width={R_W - 40}
                  height={72}
                  rx={15}
                  fill={`color-mix(in oklab, ${r.tone} 5%, transparent)`}
                  stroke={`color-mix(in oklab, ${r.tone} 26%, transparent)`}
                />
                <text x={R_X + 38} y={y + 26} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.12em" fill={r.tone}>
                  {r.tag}
                </text>
                <text x={R_X + 38} y={y + 47} fontSize={13.5} fontWeight={700} fill="var(--foreground)">
                  {r.label}
                </text>
                <text x={R_X + 38} y={y + 64} fontSize={12} fill="var(--muted-foreground)">
                  {r.note}
                </text>
              </g>
            );
          })}
        </g>
      </g>

      {/* -------------------------- shared responsibility --------------------- */}
      <g opacity={op(SHARED)}>
        <g {...interactive(SHARED, "Shared responsibility — the provider secures the cloud, the customer secures what they put in it")}>
          {card(SHARED, R_X, SH_Y, R_W, SH_H, "var(--primary)")}
          <text x={R_X + 24} y={SH_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
            SHARED RESPONSIBILITY
          </text>
          {sharedRows.map((r, i) => {
            const y = SH_Y + 56 + i * 100;
            return (
              <g key={r.who} aria-hidden="true">
                <rect
                  x={R_X + 20}
                  y={y}
                  width={R_W - 40}
                  height={88}
                  rx={15}
                  fill={`color-mix(in oklab, ${r.tone} 5%, transparent)`}
                  stroke={`color-mix(in oklab, ${r.tone} 26%, transparent)`}
                />
                <text x={R_X + 38} y={y + 28} fontSize={14.5} fontWeight={760} fill="var(--foreground)">
                  {r.who} secures
                </text>
                <foreignObject x={R_X + 36} y={y + 36} width={R_W - 72} height={48}>
                  <div
                    // eslint-disable-next-line react/no-unknown-property
                    style={{ fontSize: "12.5px", lineHeight: 1.4, color: "var(--muted-foreground)" }}
                  >
                    {r.note}
                  </div>
                </foreignObject>
              </g>
            );
          })}
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
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">WHO ARE YOU?</p>

      <button type="button" onClick={() => onToggle(IDENT)} aria-expanded={activeKey === IDENT} className={`${btn} border-cyan/40 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-cyan">LAYER 1 · IDENTITY</span>
        <span className="mt-1 block text-[17px] font-extrabold">User or workload</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Every request comes from an identity — a person, or an application with its own.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(AUTHN)} aria-expanded={activeKey === AUTHN} className={`${btn} border-cyan/30`}>
        <span className="block text-[15.5px] font-bold">Authentication</span>
        <span className="block text-[12.5px] text-muted-foreground">
          MFA or a short-lived token proves the claim. It grants nothing on its own.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">WHAT MAY YOU DO?</p>

      <button type="button" onClick={() => onToggle(AUTHZ)} aria-expanded={activeKey === AUTHZ} className={`${btn} border-primary/40 bg-primary/5`}>
        <span className="block text-[15.5px] font-bold">Authorisation · least privilege</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Allow exactly the task at hand. Everything else is denied by default.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(DENIED)} aria-expanded={activeKey === DENIED} className={`${btn} border-dashed border-ember/50 bg-ember/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-ember">DENIED</span>
        <span className="mt-1 block text-[15.5px] font-bold">Authenticated, still refused</span>
        <span className="block text-[12.5px] text-muted-foreground">
          No permission covers the action, so the request stops here and never reaches the workload.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">PROTECTED ENVIRONMENT</p>

      <button type="button" onClick={() => onToggle(TRANSIT)} aria-expanded={activeKey === TRANSIT} className={`${btn} border-cyan/30`}>
        <span className="block text-[15.5px] font-bold">TLS in transit</span>
        <span className="block text-[12.5px] text-muted-foreground">The allowed request travels over an encrypted path.</span>
      </button>

      <button type="button" onClick={() => onToggle(NET)} aria-expanded={activeKey === NET} className={`${btn} border-primary/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-primary">LAYER 3 · SEGMENTATION</span>
        <span className="mt-1 block text-[15.5px] font-bold">Network boundary</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Narrows what can be reached — but network rules alone are not security.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(WORK)} aria-expanded={activeKey === WORK} className={`${btn} border-primary/30`}>
        <span className="block text-[16px] font-extrabold">Workload</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Patched, configured, running with its own narrow permissions.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(DATA)} aria-expanded={activeKey === DATA} className={`${btn} border-violet/40`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-violet">ENCRYPTION AT REST</span>
        <span className="mt-1 block text-[16px] font-extrabold">Data store</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Disks, backups and snapshots encrypted with managed keys.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(SECRETS)} aria-expanded={activeKey === SECRETS} className={`${btn} border-violet/30`}>
        <span className="block text-[15.5px] font-bold">Secrets &amp; keys</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Held in a managed store outside the code, fetched at run time, rotated without a redeploy.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">VISIBILITY</p>

      <button type="button" onClick={() => onToggle(AUDIT)} aria-expanded={activeKey === AUDIT} className={`${btn} border-violet/40`}>
        <span className="block text-[15.5px] font-bold">Audit log</span>
        <span className="mt-1 block space-y-1.5">
          {auditRows.map((r) => (
            <span key={r.label} className="block rounded-lg border border-border bg-surface px-2.5 py-2 text-[12.5px]">
              <span className="font-semibold">{r.tag}</span> — {r.label}
            </span>
          ))}
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">SHARED RESPONSIBILITY</p>

      <button type="button" onClick={() => onToggle(SHARED)} aria-expanded={activeKey === SHARED} className={`${btn} border-primary/30`}>
        <span className="block space-y-1.5">
          {sharedRows.map((r) => (
            <span key={r.who} className="block rounded-lg border border-border bg-surface px-2.5 py-2 text-[13px]">
              <span className="font-semibold">{r.who} secures</span> — {r.note}
            </span>
          ))}
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function CloudSecurityDiagram() {
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
              Independent layers, one protected workload
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Allowed request", color: "var(--cyan)" },
              { label: "Keys & audit", color: "var(--violet)" },
              { label: "Denied", color: "var(--ember)" },
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
        Identity proves who is asking, permissions decide what they may do, and segmentation, encryption,
        secret management and audit each cover what the others cannot.
      </figcaption>
      <StageHint text="Hover identity, the authorisation decision, the boundary, the data store, secrets, audit or the responsibility rail to isolate related paths; click any component for a short explanation." />
    </figure>
  );
}
