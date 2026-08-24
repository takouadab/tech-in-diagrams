import { useId } from "react";

/**
 * Tiny illustrated miniatures used on cards. These are motifs, not shrunken
 * diagrams: each one communicates its subject with a handful of marks.
 */
export function ConceptMotif({ slug, className }: { slug: string; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const grad = `${uid}-g`;

  const defs = (
    <defs>
      <linearGradient id={grad} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--primary)" />
        <stop offset="100%" stopColor="var(--cyan)" />
      </linearGradient>
      <pattern id={`${uid}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0H0v20" fill="none" stroke="var(--grid)" strokeWidth="1" opacity="0.45" />
      </pattern>
    </defs>
  );

  const shell = (children: React.ReactNode) => (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border bg-surface shadow-soft ${className ?? ""}`}
    >
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(70% 60% at 20% 0%, color-mix(in oklab, var(--primary) 7%, transparent), transparent 70%), radial-gradient(60% 60% at 100% 100%, color-mix(in oklab, var(--cyan) 8%, transparent), transparent 70%)",
        }}
      />
      <svg viewBox="0 0 420 200" className="relative w-full" aria-hidden="true">
        {defs}
        <rect x="0" y="0" width="420" height="200" fill={`url(#${uid}-grid)`} opacity="0.5" />
        {children}
      </svg>
    </div>
  );

  if (slug === "what-is-cloud-computing") {
    const tiles = [
      [232, 66],
      [306, 66],
      [232, 118],
      [306, 118],
    ];
    return shell(
      <>
        <path
          d="M 66 100 C 120 100 140 100 186 100"
          fill="none"
          stroke={`url(#${grad})`}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle r="3.6" fill={`url(#${grad})`}>
          <animateMotion dur="3.4s" repeatCount="indefinite" path="M 66 100 C 120 100 140 100 186 100" />
        </circle>
        <circle cx="52" cy="100" r="15" fill="color-mix(in oklab, var(--violet) 12%, var(--surface))" stroke="color-mix(in oklab, var(--violet) 50%, transparent)" />
        <circle cx="52" cy="95" r="4.4" fill="var(--violet)" opacity="0.8" />
        <path d="M45 108c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6" fill="none" stroke="var(--violet)" strokeWidth="1.6" opacity="0.8" />
        <rect
          x="196"
          y="40"
          width="188"
          height="120"
          rx="26"
          fill="color-mix(in oklab, var(--primary) 5%, transparent)"
          stroke="color-mix(in oklab, var(--primary) 26%, transparent)"
        />
        <text x="212" y="34" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          CLOUD
        </text>
        {tiles.map(([x, y], i) => (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width="62"
              height="38"
              rx="11"
              fill="color-mix(in oklab, var(--primary) 8%, var(--surface))"
              stroke="color-mix(in oklab, var(--primary) 24%, transparent)"
            />
            <circle cx={x! + 14} cy={y! + 19} r="3.4" fill="var(--primary)" opacity={0.75 - i * 0.12} />
            <path d={`M ${x! + 26} ${y! + 15} h 22 M ${x! + 26} ${y! + 24} h 14`} stroke="var(--grid)" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
        <path d="M 214 154 h 152" stroke="var(--grid)" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 8" />
      </>,
    );
  }

  if (slug === "what-is-ci-cd") {
    const xs = [70, 172, 258, 350];
    const track = "M 70 118 C 130 118 130 82 172 82 C 220 82 216 118 258 118 C 300 118 306 82 350 82";
    return shell(
      <>
        <path d={track} fill="none" stroke="var(--grid)" strokeWidth="6" strokeLinecap="round" />
        <path d={track} fill="none" stroke={`url(#${grad})`} strokeWidth="2.4" strokeLinecap="round" />
        <circle r="4" fill={`url(#${grad})`}>
          <animateMotion dur="4.2s" repeatCount="indefinite" path={track} />
        </circle>
        {xs.map((x, i) => {
          const y = i % 2 === 0 ? 118 : 82;
          return (
            <g key={x}>
              <circle cx={x} cy={y} r="15" fill="var(--surface)" stroke="color-mix(in oklab, var(--primary) 40%, transparent)" strokeWidth="1.6" />
              <circle cx={x} cy={y} r="5.4" fill="var(--primary)" opacity={0.85 - i * 0.12} />
              <text x={x} y={y + 34} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="0.14em" fill="var(--muted-foreground)">
                {["BUILD", "TEST", "STAGE", "PROD"][i]}
              </text>
            </g>
          );
        })}
        <path d="M 40 160 h 340" stroke="var(--grid)" strokeWidth="1.4" />
        <text x="40" y="42" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          PIPELINE
        </text>
      </>,
    );
  }

  if (slug === "what-is-a-load-balancer") {
    const branches = [
      { d: "M 246 100 C 292 100 296 54 340 54", y: 54 },
      { d: "M 246 100 C 292 100 296 100 340 100", y: 100 },
      { d: "M 246 100 C 292 100 296 146 340 146", y: 146 },
    ];
    return shell(
      <>
        <path d="M 92 100 H 190" fill="none" stroke={`url(#${grad})`} strokeWidth="2.2" strokeLinecap="round" />
        <circle r="3.6" fill={`url(#${grad})`}>
          <animateMotion dur="2.6s" repeatCount="indefinite" path="M 92 100 H 190" />
        </circle>
        <circle cx="76" cy="100" r="15" fill="color-mix(in oklab, var(--cyan) 14%, var(--surface))" stroke="color-mix(in oklab, var(--cyan) 50%, transparent)" />
        <circle cx="76" cy="100" r="4" fill="var(--cyan)" />
        <rect
          x="190"
          y="70"
          width="56"
          height="60"
          rx="16"
          fill="color-mix(in oklab, var(--primary) 10%, var(--surface))"
          stroke="color-mix(in oklab, var(--primary) 45%, transparent)"
        />
        <path d="M 204 90 h 28 M 204 100 h 28 M 204 110 h 28" stroke="var(--primary)" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
        {branches.map((b, i) => (
          <g key={i}>
            <path d={b.d} fill="none" stroke="var(--grid)" strokeWidth="2" strokeLinecap="round" />
            <circle r="3.2" fill={`url(#${grad})`}>
              <animateMotion dur="3s" begin={`${i * 0.6}s`} repeatCount="indefinite" path={b.d} />
            </circle>
            <rect
              x="340"
              y={b.y - 17}
              width="44"
              height="34"
              rx="11"
              fill="var(--surface)"
              stroke="color-mix(in oklab, var(--primary) 26%, transparent)"
            />
            <circle cx="356" cy={b.y} r="3.2" fill="var(--primary)" opacity="0.7" />
            <path d={`M 366 ${b.y} h 10`} stroke="var(--grid)" strokeWidth="3" strokeLinecap="round" />
          </g>
        ))}
        <text x="40" y="42" fontSize="10" fontFamily="var(--font-mono)" letterSpacing="0.18em" fill="var(--muted-foreground)">
          DISTRIBUTION
        </text>
      </>,
    );
  }

  // generic motif: a signal crossing three surfaces
  return shell(
    <>
      <path d="M 50 140 C 130 140 130 60 210 60 C 290 60 290 140 370 140" fill="none" stroke={`url(#${grad})`} strokeWidth="2.2" strokeLinecap="round" />
      <circle r="3.6" fill={`url(#${grad})`}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M 50 140 C 130 140 130 60 210 60 C 290 60 290 140 370 140" />
      </circle>
      {[70, 210, 350].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={i === 1 ? 60 : 140}
          r="13"
          fill="var(--surface)"
          stroke="color-mix(in oklab, var(--primary) 40%, transparent)"
          strokeWidth="1.6"
        />
      ))}
    </>,
  );
}
