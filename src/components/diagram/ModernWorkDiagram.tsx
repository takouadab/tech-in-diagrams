import { useId, useState } from "react";
import { ExplainPanel, StageBackdrop, StageHint, useNarrow } from "./parts";

/* --------------------------------- keys ---------------------------------- */

const USER = "user";
const TRUST = "trust";
const ENTRA = "entra";
const M365 = "m365";
const DATA = "data";
const ALLOWED = "allowed";
const BLOCKED = "blocked";
const COPILOT = "copilot";
const RAIL = "rail";

const related: Record<string, string[]> = {
  [USER]: [TRUST, ENTRA, M365],
  [TRUST]: [USER, ENTRA],
  [ENTRA]: [USER, TRUST, M365, DATA, COPILOT, RAIL],
  [M365]: [ENTRA, DATA, USER],
  [DATA]: [M365, ENTRA, ALLOWED, BLOCKED, COPILOT],
  [ALLOWED]: [DATA, COPILOT, ENTRA],
  [BLOCKED]: [DATA, COPILOT, RAIL],
  [COPILOT]: [ENTRA, DATA, ALLOWED, BLOCKED, RAIL],
  [RAIL]: [COPILOT, ENTRA, BLOCKED],
};

/* ------------------------------- geometry -------------------------------- */

const W = 1760;
const H = 830;

/* left column */
const U_X = 40;
const U_Y = 220;
const U_W = 300;
const U_H = 190;

const T_Y = 450;
const T_H = 190;

/* identity anchor */
const E_X = 390;
const E_Y = 180;
const E_W = 270;
const E_H = 440;

/* microsoft 365 constellation */
const F_X = 710;
const F_Y = 100;
const F_W = 560;
const F_H = 360;

const S_W = 245;
const S_H = 110;
const S_X1 = 735;
const S_X2 = 1000;
const S_Y1 = 170;
const S_Y2 = 300;

/* data plane */
const D_X = 710;
const D_Y = 510;
const D_W = 560;
const D_H = 280;

const FILE_Y = 580;
const FILE_H = 110;
const FILE_W = 245;

/* right column */
const C_X = 1330;
const C_Y = 140;
const C_W = 390;
const C_H = 310;

const R_Y = 500;
const R_H = 290;

/* --------------------------------- paths --------------------------------- */

const sUserEntra = `M ${U_X + U_W} 315 C 366 315, 366 330, ${E_X} 330`;
const sTrustEntra = `M ${U_X + U_W} 545 C 368 545, 368 432, ${E_X} 432`;
const sEntraM365 = `M ${E_X + E_W} 300 C 686 300, 690 280, ${F_X} 280`;
const sEntraData = `M ${E_X + E_W} 420 C 686 420, 686 620, ${D_X} 620`;
const sM365Data = `M 990 ${F_Y + F_H} V ${D_Y + 2}`;
const sEntraCopilot = `M ${E_X + E_W} 240 C 900 58, 1160 58, ${C_X} 200`;
const sCopilotAllowed = `M ${C_X} 380 C 1300 400, 1292 618, 1245 635`;
const sCopilotBlocked = `M ${C_X} 430 C 1180 474, 1030 494, 952 534`;

/* --------------------------------- copy ---------------------------------- */

const services = [
  {
    key: "mail",
    x: S_X1,
    y: S_Y1,
    tag: "MAIL",
    title: "Outlook · Exchange",
    sub: "Mailboxes and calendars",
  },
  {
    key: "teams",
    x: S_X2,
    y: S_Y1,
    tag: "CHAT · MEETINGS",
    title: "Teams",
    sub: "Conversations and channels",
  },
  {
    key: "files",
    x: S_X1,
    y: S_Y2,
    tag: "FILES · SITES",
    title: "SharePoint · OneDrive",
    sub: "Shared and personal files",
  },
  {
    key: "office",
    x: S_X2,
    y: S_Y2,
    tag: "DOCUMENTS",
    title: "Office apps",
    sub: "Word, Excel, PowerPoint",
  },
] as const;

const dataChips = [
  { key: "mailbox", label: "Mailbox items" },
  { key: "docs", label: "Documents" },
  { key: "chats", label: "Chats & sites" },
  { key: "business", label: "Business data" },
] as const;

const railRows = [
  "Copilot signs in as you — no separate access",
  "It can read only what you could already open",
  "Nothing it returns widens existing permissions",
] as const;

function explain(key: string): { eyebrow: string; title: string; body: string } | null {
  switch (key) {
    case USER:
      return {
        eyebrow: "User and device",
        title: "One person, one work identity",
        body: "An employee signs in once on a managed laptop or phone. That single work identity — not the device, not each individual app — is what the rest of the environment recognises. Mail, chat, files and business apps all resolve back to the same person.",
      };
    case TRUST:
      return {
        eyebrow: "Device trust",
        title: "Conditional access checks the situation, not just the password",
        body: "Before access is granted, policies look at signals: is the device managed and compliant, is multifactor satisfied, does the sign-in look normal. A healthy device passes quietly; an unmanaged or non-compliant one can be limited or blocked. It is a trust signal attached to the sign-in, not a separate login.",
      };
    case ENTRA:
      return {
        eyebrow: "Identity control plane",
        title: "Microsoft Entra ID authenticates and carries context",
        body: "Entra ID is where the identity lives. It verifies who is signing in, applies conditional access, and issues tokens that carry group memberships and permissions into every service the user opens. Because the same identity flows everywhere, access is decided in one place rather than app by app.",
      };
    case M365:
      return {
        eyebrow: "Productivity services",
        title: "Microsoft 365 as one working environment",
        body: "Outlook, Teams, SharePoint, OneDrive and the Office apps are cloud services in your organisation's tenant. Microsoft operates the software; you own the content and the configuration. They feel like one environment because they share the same identity, the same permissions and the same underlying content.",
      };
    case DATA:
      return {
        eyebrow: "Organisational data",
        title: "Content with permissions already attached",
        body: "Mail, files, chats, sites and business records sit behind the services people use daily. None of it is globally visible: every item carries the permissions it was given, and what a person sees is the subset their identity unlocks. Permissions follow the user across the whole environment.",
      };
    case ALLOWED:
      return {
        eyebrow: "Allowed content",
        title: "A file this identity may open",
        body: "The team project plan is shared with the user's group, so it appears in search, in the file list and as grounding for an assistant request. The access decision is the same one that would apply if the person opened the document by hand.",
      };
    case BLOCKED:
      return {
        eyebrow: "Excluded content",
        title: "A file this identity may not open",
        body: "A restricted document — say a finance folder the user is not a member of — is left out. It is not hidden by the assistant as a special case; it is simply not accessible to this identity, so it never enters the results or the response.",
      };
    case COPILOT:
      return {
        eyebrow: "Assistant layer",
        title: "Copilot works through the signed-in user",
        body: "A Copilot request runs with the same identity and the same permissions as the person asking. It finds relevant mail, files and chats the user can already reach, uses them as grounding, and returns an answer that points back at that content. It does not have its own privileged view of the tenant.",
      };
    case RAIL:
      return {
        eyebrow: "Same permissions apply",
        title: "Assistance does not bypass access control",
        body: "Adding an assistant does not change who may see what. If a document was inaccessible before, it stays inaccessible in an answer. That is why permissions and sharing hygiene matter more once an assistant makes content easier to find.",
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
      aria-label="The Microsoft Cloud modern work environment drawn as one connected system. On the left an employee on a managed device signs in, with a device compliance and conditional access card beneath. A tall Microsoft Entra ID identity control plane sits next to it and issues permissions that flow onward. In the centre a Microsoft 365 constellation groups Outlook and Exchange, Teams, SharePoint and OneDrive, and the Office apps, with an organisational data plane beneath holding mail, documents, chats, sites and business data. On the right a Copilot assistant layer sends a request that uses the same identity: it reaches an allowed shared project plan but is excluded from a restricted finance document, marked with a denial cross. A rail beneath Copilot repeats that the same permissions apply."
      className="w-full"
      style={{ minHeight: 620, maxHeight: 880 }}
    >
      <defs>
        <linearGradient id={`${uid}-m365`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.09" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={`${uid}-data`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* figure rail */}
      <g aria-hidden="true">
        <text x={U_X} y={36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.2em" fill="var(--muted-foreground)">
          FIG. 18 — IDENTITY BINDS THE MODERN WORK ENVIRONMENT
        </text>
        <text x={W - 40} y={36} textAnchor="end" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          COPILOT INHERITS YOUR PERMISSIONS
        </text>
        <line x1={U_X} y1={52} x2={W - 40} y2={52} stroke="var(--border)" strokeWidth={1} />
        <text x={U_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--muted-foreground)">
          PERSON · DEVICE
        </text>
        <text x={E_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--cyan)">
          IDENTITY CONTROL PLANE
        </text>
        <text x={C_X} y={96} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--violet)">
          ASSISTANT LAYER
        </text>
      </g>

      {/* ------------------------------ flows -------------------------------- */}
      <g>
        <Flow d={sUserEntra} on={on(USER) || on(ENTRA)} color="var(--primary)" />
        <Flow d={sTrustEntra} on={on(TRUST) || on(ENTRA)} color="var(--cyan)" dashed />
        <Flow d={sEntraM365} on={on(ENTRA) || on(M365)} color="var(--primary)" />
        <Flow d={sEntraData} on={on(ENTRA) || on(DATA)} color="var(--cyan)" dashed />
        <Flow d={sM365Data} on={on(M365) || on(DATA)} color="var(--primary)" />
        <Flow d={sEntraCopilot} on={on(ENTRA) || on(COPILOT)} color="var(--violet)" />
        <Flow d={sCopilotAllowed} on={on(COPILOT) || on(ALLOWED)} color="var(--violet)" />
        <path
          d={sCopilotBlocked}
          fill="none"
          stroke={on(COPILOT) || on(BLOCKED) ? "var(--danger, #d94a4a)" : "var(--border-strong)"}
          strokeWidth={2.2}
          strokeDasharray="7 8"
          strokeLinecap="round"
          style={{ transition: "stroke .25s ease" }}
        />

        <g className="motion-safe:block motion-reduce:hidden" aria-hidden="true">
          <Token path={sUserEntra} dur="0.9s" begin="0s" color="var(--primary)" />
          <Token path={sEntraM365} dur="0.9s" begin="0.9s" color="var(--primary)" />
          <Token path={sM365Data} dur="0.7s" begin="1.8s" color="var(--primary)" />
          <Token path={sEntraCopilot} dur="1.4s" begin="2.6s" color="var(--violet)" />
          <Token path={sCopilotAllowed} dur="1s" begin="4s" color="var(--violet)" />
        </g>
      </g>

      {/* denial marker */}
      <g opacity={op(BLOCKED)} aria-hidden="true">
        <circle cx={952} cy={534} r={17} fill="var(--surface)" stroke="var(--danger, #d94a4a)" strokeWidth={2} />
        <path d="M 945 527 L 959 541 M 959 527 L 945 541" stroke="var(--danger, #d94a4a)" strokeWidth={2.4} strokeLinecap="round" />
        <text x={975} y={528} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--danger, #d94a4a)">
          NO PERMISSION
        </text>
      </g>

      {/* ------------------------------- user -------------------------------- */}
      <g opacity={op(USER)}>
        <g {...interactive(USER, "Employee on a managed device signing in with one work identity")}>
          {card(USER, U_X, U_Y, U_W, U_H, "var(--primary)")}
          <text x={U_X + 24} y={U_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
            EMPLOYEE · MANAGED DEVICE
          </text>
          <text x={U_X + 24} y={U_Y + 68} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            One sign-in
          </text>
          <text x={U_X + 24} y={U_Y + 96} fontSize={13} fill="var(--muted-foreground)">
            Laptop or phone, one work
          </text>
          <text x={U_X + 24} y={U_Y + 116} fontSize={13} fill="var(--muted-foreground)">
            account for the whole day.
          </text>
          <rect x={U_X + 22} y={U_Y + 132} width={U_W - 44} height={44} rx={13} fill="color-mix(in oklab, var(--primary) 6%, transparent)" stroke="color-mix(in oklab, var(--primary) 26%, transparent)" />
          <text x={U_X + 38} y={U_Y + 160} fontSize={12.5} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            user@contoso.com
          </text>
        </g>
      </g>

      {/* --------------------------- device trust ----------------------------- */}
      <g opacity={op(TRUST)}>
        <g {...interactive(TRUST, "Device compliance and conditional access signals")}>
          {card(TRUST, U_X, T_Y, U_W, T_H, "var(--cyan)")}
          <text x={U_X + 24} y={T_Y + 34} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            DEVICE TRUST · CONDITIONAL ACCESS
          </text>
          <text x={U_X + 24} y={T_Y + 66} fontSize={17.5} fontWeight={800} fill="var(--foreground)">
            Signals, not just a password
          </text>
          {["Device managed & compliant", "Multifactor satisfied", "Sign-in risk normal"].map((t, i) => (
            <g key={t} aria-hidden="true">
              <circle cx={U_X + 32} cy={T_Y + 92 + i * 30} r={5} fill="var(--cyan)" />
              <text x={U_X + 48} y={T_Y + 97 + i * 30} fontSize={12.5} fill="var(--muted-foreground)">
                {t}
              </text>
            </g>
          ))}
        </g>
      </g>

      {/* ------------------------------ entra --------------------------------- */}
      <g opacity={op(ENTRA)}>
        <g {...interactive(ENTRA, "Microsoft Entra ID — the identity control plane")}>
          {card(ENTRA, E_X, E_Y, E_W, E_H, "var(--cyan)", 26)}
          <text x={E_X + 24} y={E_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--cyan)">
            MICROSOFT ENTRA ID
          </text>
          <text x={E_X + 24} y={E_Y + 70} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            Identity is the
          </text>
          <text x={E_X + 24} y={E_Y + 94} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            control plane
          </text>
          <text x={E_X + 24} y={E_Y + 124} fontSize={13} fill="var(--muted-foreground)">
            Authenticates once, then
          </text>
          <text x={E_X + 24} y={E_Y + 144} fontSize={13} fill="var(--muted-foreground)">
            carries context onward.
          </text>
          {["Authentication", "Conditional access", "Group membership", "Permissions in token"].map((t, i) => (
            <g key={t} aria-hidden="true">
              <rect x={E_X + 20} y={E_Y + 170 + i * 54} width={E_W - 40} height={44} rx={13} fill="color-mix(in oklab, var(--cyan) 5%, transparent)" stroke="color-mix(in oklab, var(--cyan) 24%, transparent)" />
              <text x={E_X + 36} y={E_Y + 198 + i * 54} fontSize={12.5} fill="var(--muted-foreground)">
                {t}
              </text>
            </g>
          ))}
          <text x={E_X + 24} y={E_Y + 412} fontSize={12.5} fontWeight={700} fill="var(--foreground)">
            Access decided in one place.
          </text>
        </g>
      </g>

      {/* ---------------------------- microsoft 365 --------------------------- */}
      <g opacity={op(M365)}>
        <rect
          x={F_X}
          y={F_Y}
          width={F_W}
          height={F_H}
          rx={30}
          fill={`url(#${uid}-m365)`}
          stroke={on(M365) ? "color-mix(in oklab, var(--primary) 52%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(M365) ? 2.2 : 1.4}
          style={{ transition: "stroke .3s ease" }}
        />
        <g {...interactive(M365, "Microsoft 365 productivity services in your tenant")}>
          <rect x={F_X} y={F_Y} width={F_W} height={62} rx={30} fill="transparent" />
          <text x={F_X + 28} y={F_Y + 40} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--primary)">
            MICROSOFT 365 · YOUR TENANT
          </text>
        </g>
        {services.map((s) => (
          <g key={s.key} aria-hidden="true">
            <rect
              x={s.x}
              y={s.y}
              width={S_W}
              height={S_H}
              rx={18}
              fill="var(--surface)"
              stroke={on(M365) ? "color-mix(in oklab, var(--primary) 34%, transparent)" : "var(--border)"}
              style={{ transition: "stroke .3s ease" }}
            />
            <text x={s.x + 20} y={s.y + 30} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
              {s.tag}
            </text>
            <text x={s.x + 20} y={s.y + 60} fontSize={16.5} fontWeight={700} fill="var(--foreground)">
              {s.title}
            </text>
            <text x={s.x + 20} y={s.y + 86} fontSize={12.5} fill="var(--muted-foreground)">
              {s.sub}
            </text>
          </g>
        ))}
      </g>

      {/* ----------------------------- data plane ----------------------------- */}
      <g opacity={op(DATA)}>
        <rect
          x={D_X}
          y={D_Y}
          width={D_W}
          height={D_H}
          rx={28}
          fill={`url(#${uid}-data)`}
          stroke={on(DATA) ? "color-mix(in oklab, var(--cyan) 52%, transparent)" : "var(--border-strong)"}
          strokeWidth={on(DATA) ? 2.2 : 1.4}
          strokeDasharray="10 8"
          style={{ transition: "stroke .3s ease" }}
        />
        <g {...interactive(DATA, "Organisational data with permissions attached")}>
          <rect x={D_X} y={D_Y} width={D_W} height={58} rx={28} fill="transparent" />
          <text x={D_X + 28} y={D_Y + 38} fontSize={12.5} fontFamily="var(--font-mono)" letterSpacing="0.16em" fill="var(--cyan)">
            ORGANISATIONAL DATA · PERMISSIONS FOLLOW THE USER
          </text>
        </g>

        {/* blocked file */}
        <g opacity={op(BLOCKED)}>
          <g {...interactive(BLOCKED, "Restricted document excluded because this identity has no permission")}>
            <rect
              x={735}
              y={FILE_Y}
              width={FILE_W}
              height={FILE_H}
              rx={18}
              fill={on(BLOCKED) ? "color-mix(in oklab, var(--danger, #d94a4a) 6%, var(--surface))" : "var(--surface)"}
              stroke={on(BLOCKED) ? "color-mix(in oklab, var(--danger, #d94a4a) 55%, transparent)" : "var(--border-strong)"}
              strokeWidth={on(BLOCKED) ? 2 : 1.2}
              strokeDasharray="6 6"
              style={{ transition: "fill .3s ease, stroke .3s ease" }}
            />
            <text x={755} y={FILE_Y + 30} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--danger, #d94a4a)">
              NOT ACCESSIBLE
            </text>
            <text x={755} y={FILE_Y + 60} fontSize={16.5} fontWeight={700} fill="var(--foreground)">
              Finance forecast
            </text>
            <text x={755} y={FILE_Y + 86} fontSize={12.5} fill="var(--muted-foreground)">
              User is not a member
            </text>
          </g>
        </g>

        {/* allowed file */}
        <g opacity={op(ALLOWED)}>
          <g {...interactive(ALLOWED, "Shared project plan this identity is allowed to open")}>
            <rect
              x={1000}
              y={FILE_Y}
              width={FILE_W}
              height={FILE_H}
              rx={18}
              fill={on(ALLOWED) ? "color-mix(in oklab, var(--violet) 7%, var(--surface))" : "var(--surface)"}
              stroke={on(ALLOWED) ? "color-mix(in oklab, var(--violet) 55%, transparent)" : "var(--border-strong)"}
              strokeWidth={on(ALLOWED) ? 2 : 1.2}
              style={{ transition: "fill .3s ease, stroke .3s ease" }}
            />
            <text x={1020} y={FILE_Y + 30} fontSize={10.5} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
              ACCESS ALLOWED
            </text>
            <text x={1020} y={FILE_Y + 60} fontSize={16.5} fontWeight={700} fill="var(--foreground)">
              Team project plan
            </text>
            <text x={1020} y={FILE_Y + 86} fontSize={12.5} fill="var(--muted-foreground)">
              Shared with the user&apos;s group
            </text>
          </g>
        </g>

        {/* data types */}
        <g aria-hidden="true">
          {dataChips.map((c, i) => (
            <g key={c.key}>
              <rect x={735 + i * 128} y={712} width={120} height={50} rx={14} fill="var(--surface)" stroke="var(--border)" />
              <text x={795 + i * 128} y={742} textAnchor="middle" fontSize={12} fill="var(--muted-foreground)">
                {c.label}
              </text>
            </g>
          ))}
        </g>
      </g>

      {/* ------------------------------ copilot ------------------------------- */}
      <g opacity={op(COPILOT)}>
        <g {...interactive(COPILOT, "Copilot assistant working through the signed-in user's permissions")}>
          {card(COPILOT, C_X, C_Y, C_W, C_H, "var(--violet)", 26)}
          <text x={C_X + 24} y={C_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--violet)">
            COPILOT · ASSISTANT LAYER
          </text>
          <text x={C_X + 24} y={C_Y + 70} fontSize={18.5} fontWeight={800} fill="var(--foreground)">
            Asks as you, sees as you
          </text>
          <rect x={C_X + 22} y={C_Y + 90} width={C_W - 44} height={54} rx={14} fill="color-mix(in oklab, var(--violet) 6%, transparent)" stroke="color-mix(in oklab, var(--violet) 26%, transparent)" />
          <text x={C_X + 38} y={C_Y + 122} fontSize={13} fontFamily="var(--font-mono)" fill="var(--muted-foreground)">
            &quot;Summarise our project status&quot;
          </text>
          <text x={C_X + 24} y={C_Y + 176} fontSize={13} fill="var(--muted-foreground)">
            Finds mail, files and chats the
          </text>
          <text x={C_X + 24} y={C_Y + 196} fontSize={13} fill="var(--muted-foreground)">
            signed-in user can already open.
          </text>
          <rect x={C_X + 22} y={C_Y + 214} width={C_W - 44} height={66} rx={14} fill="var(--surface)" stroke="var(--border)" />
          <text x={C_X + 38} y={C_Y + 240} fontSize={12.5} fontWeight={700} fill="var(--foreground)">
            Grounded response
          </text>
          <text x={C_X + 38} y={C_Y + 264} fontSize={12.5} fill="var(--muted-foreground)">
            Cites the content it was allowed to use.
          </text>
        </g>
      </g>

      {/* --------------------------- permission rail --------------------------- */}
      <g opacity={op(RAIL)}>
        <g {...interactive(RAIL, "Same permissions apply — the assistant does not bypass access control")}>
          {card(RAIL, C_X, R_Y, C_W, R_H, "var(--primary)")}
          <text x={C_X + 24} y={R_Y + 36} fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--primary)">
            SAME PERMISSIONS APPLY
          </text>
          {railRows.map((t, i) => (
            <foreignObject key={t} x={C_X + 20} y={R_Y + 52 + i * 62} width={C_W - 40} height={58} aria-hidden="true">
              <div style={{ fontSize: "13px", lineHeight: 1.4, color: "var(--muted-foreground)" }}>{t}</div>
            </foreignObject>
          ))}
          <line x1={C_X + 20} y1={R_Y + 240} x2={C_X + C_W - 20} y2={R_Y + 240} stroke="var(--border)" />
          <text x={C_X + 24} y={R_Y + 266} fontSize={12.5} fontWeight={700} fill="var(--foreground)">
            Sharing hygiene matters more, not less.
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
      <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground">PERSON · DEVICE</p>

      <button type="button" onClick={() => onToggle(USER)} aria-expanded={activeKey === USER} className={`${btn} border-primary/40 shadow-soft`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-primary">EMPLOYEE · MANAGED DEVICE</span>
        <span className="mt-1 block text-[17px] font-extrabold">One sign-in for the whole day</span>
        <span className="block text-[12.5px] text-muted-foreground">
          One work identity, not a separate account per app.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(TRUST)} aria-expanded={activeKey === TRUST} className={`${btn} border-cyan/40`}>
        <span className="block text-[15.5px] font-bold">Device trust &amp; conditional access</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Managed and compliant device, multifactor satisfied, sign-in risk normal.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">IDENTITY CONTROL PLANE</p>

      <button type="button" onClick={() => onToggle(ENTRA)} aria-expanded={activeKey === ENTRA} className={`${btn} border-cyan/50 bg-cyan/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-cyan">MICROSOFT ENTRA ID</span>
        <span className="mt-1 block text-[16px] font-bold">Identity carries permissions onward</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Authentication, conditional access, group membership and permissions in one place.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">MICROSOFT 365 SERVICES</p>

      <button type="button" onClick={() => onToggle(M365)} aria-expanded={activeKey === M365} className={`${btn} border-primary/40`}>
        <span className="block text-[15.5px] font-bold">One working environment</span>
        <span className="mt-1 block space-y-1.5">
          {services.map((s) => (
            <span key={s.key} className="block rounded-lg border border-border bg-surface px-2.5 py-2 text-[12.5px]">
              <span className="font-semibold">{s.title}</span> — {s.sub}
            </span>
          ))}
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">ORGANISATIONAL DATA</p>

      <button type="button" onClick={() => onToggle(DATA)} aria-expanded={activeKey === DATA} className={`${btn} border-cyan/30 border-dashed`}>
        <span className="block text-[15.5px] font-bold">Mail, files, chats, sites, business data</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Nothing is globally visible — what you see is the subset your identity unlocks.
        </span>
      </button>

      <p className="pt-2 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">COPILOT · SAME PERMISSIONS</p>

      <button type="button" onClick={() => onToggle(COPILOT)} aria-expanded={activeKey === COPILOT} className={`${btn} border-violet/50 bg-violet/5`}>
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-violet">ASSISTANT LAYER</span>
        <span className="mt-1 block text-[16px] font-bold">Asks as you, sees as you</span>
        <span className="block text-[12.5px] text-muted-foreground">
          A request runs with your identity and returns a grounded answer from content you can already open.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(ALLOWED)} aria-expanded={activeKey === ALLOWED} className={`${btn} border-violet/40`}>
        <span className="block text-[15.5px] font-bold">Allowed: team project plan</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Shared with the user&apos;s group, so it can ground the answer.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(BLOCKED)} aria-expanded={activeKey === BLOCKED} className={`${btn} border-dashed`} style={{ borderColor: "color-mix(in oklab, var(--danger, #d94a4a) 45%, transparent)" }}>
        <span className="font-mono text-[10.5px] tracking-[0.16em]" style={{ color: "var(--danger, #d94a4a)" }}>
          NO PERMISSION
        </span>
        <span className="mt-1 block text-[15.5px] font-bold">Excluded: finance forecast</span>
        <span className="block text-[12.5px] text-muted-foreground">
          Not accessible to this identity, so it never enters the response.
        </span>
      </button>

      <button type="button" onClick={() => onToggle(RAIL)} aria-expanded={activeKey === RAIL} className={`${btn} border-primary/30`}>
        <span className="block text-[15.5px] font-bold">Assistance does not bypass access control</span>
        <span className="block text-[12.5px] text-muted-foreground">
          If a document was inaccessible before, it stays inaccessible in an answer.
        </span>
      </button>
    </div>
  );
}

/* ------------------------------- component ------------------------------- */

export function ModernWorkDiagram() {
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
              Identity, services, data, assistance
            </span>
          </div>
          <ul className="flex flex-wrap items-center gap-4">
            {[
              { label: "Work session", color: "var(--primary)" },
              { label: "Permissions", color: "var(--cyan)" },
              { label: "Copilot", color: "var(--violet)" },
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
        Modern Work connects identity, devices, productivity services, organisational data and an assistant — and
        the permissions carried by one identity bind the whole experience together.
      </figcaption>
      <StageHint text="Hover the person, device trust, Entra ID, the Microsoft 365 services, the data plane, the allowed or excluded file, Copilot or the permission rail to isolate related paths; click any component for a short explanation." />
    </figure>
  );
}
