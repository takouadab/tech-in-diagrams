import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE_OUT, jakarta, mono, sora } from "../theme";

export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const e = (d: number) =>
    interpolate(frame - d, [0, 26], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE_OUT,
    });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(540 700)" opacity={e(0)}>
          <circle r={210} fill="none" stroke={C.primary} strokeWidth={3} opacity={0.25} />
          <circle r={300} fill="none" stroke={C.cyan} strokeWidth={3} opacity={0.18} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 - frame / 140;
            return (
              <circle
                key={i}
                cx={Math.cos(a) * 255}
                cy={Math.sin(a) * 255}
                r={13}
                fill={i % 2 ? C.cyan : C.violet}
                opacity={0.8}
              />
            );
          })}
          <circle r={96} fill="#fff" stroke={C.primary} strokeWidth={6} />
          <circle r={26} fill={C.primary} />
        </g>
      </svg>

      <div style={{ position: "absolute", top: 1030, left: 80, right: 80, textAlign: "center" }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 26,
            letterSpacing: "0.3em",
            color: C.primary,
            textTransform: "uppercase",
            opacity: e(6),
          }}
        >
          Explore the interactive diagram
        </div>
        <div
          style={{
            marginTop: 34,
            fontFamily: sora,
            fontWeight: 800,
            fontSize: 92,
            letterSpacing: "-0.035em",
            color: C.navy,
            lineHeight: 1.05,
            opacity: e(18),
            transform: `translateY(${(1 - e(18)) * 26}px)`,
          }}
        >
          Tech in Diagrams
        </div>
        <div
          style={{
            marginTop: 26,
            fontFamily: jakarta,
            fontWeight: 500,
            fontSize: 42,
            color: C.navySoft,
            opacity: e(34),
          }}
        >
          Understand IT, one diagram at a time.
        </div>
        <div
          style={{
            marginTop: 62,
            display: "inline-block",
            padding: "26px 56px",
            borderRadius: 999,
            background: C.primary,
            color: "#fff",
            fontFamily: jakarta,
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: "-0.01em",
            boxShadow: "0 30px 60px -30px rgba(43,84,234,0.7)",
            opacity: e(48),
            transform: `scale(${0.94 + e(48) * 0.06})`,
          }}
        >
          techindiagrams.cloud
        </div>
      </div>
    </AbsoluteFill>
  );
};
