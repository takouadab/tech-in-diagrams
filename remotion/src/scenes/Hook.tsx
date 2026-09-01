import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE_OUT, mono, sora } from "../theme";
import { Eyebrow } from "../components/base";

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const ring = interpolate(frame, [10, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const q = interpolate(frame, [16, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, top: 300 }}>
        <Eyebrow delay={0} color={C.primary}>
          Tech in Diagrams
        </Eyebrow>
      </div>

      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: 380,
          fontFamily: sora,
          fontWeight: 800,
          fontSize: 118,
          lineHeight: 1.02,
          letterSpacing: "-0.035em",
          color: C.navy,
          opacity: q,
          transform: `translateY(${(1 - q) * 40}px)`,
        }}
      >
        What is
        <br />
        <span style={{ color: C.primary }}>cloud</span>
        <br />
        computing?
      </div>

      {/* schematic seed: node + orbiting ring */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", inset: 0 }}
      >
        <g transform="translate(540 1180)">
          <circle
            r={230 * ring}
            fill="none"
            stroke={C.primary}
            strokeWidth={3}
            opacity={0.28 * ring}
            strokeDasharray="10 18"
          />
          <circle
            r={330 * ring}
            fill="none"
            stroke={C.cyan}
            strokeWidth={3}
            opacity={0.2 * ring}
          />
          <circle r={120 * ring} fill={C.primary} opacity={0.1} />
          <circle r={78 * ring} fill="#fff" stroke={C.primary} strokeWidth={5} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 + frame / 120;
            const rr = 280;
            const show = interpolate(frame, [26 + i * 6, 56 + i * 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <circle
                key={i}
                cx={Math.cos(a) * rr}
                cy={Math.sin(a) * rr * 0.86}
                r={14}
                fill={i % 2 ? C.cyan : C.violet}
                opacity={0.85 * show}
              />
            );
          })}
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1520,
          textAlign: "center",
          fontFamily: mono,
          fontSize: 26,
          letterSpacing: "0.2em",
          color: C.primary,
          fontWeight: 500,
          opacity: ring,
        }}
      >
        FIG. 01
      </div>
    </AbsoluteFill>
  );
};
