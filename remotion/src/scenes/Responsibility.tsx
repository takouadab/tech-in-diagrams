import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE_OUT, jakarta, mono, sora } from "../theme";

const left = ["Your apps", "Your data", "Your configuration"];
const right = ["Servers & racks", "Networking", "Power & cooling", "Maintenance"];

const Column: React.FC<{
  x: number;
  title: string;
  accent: string;
  items: string[];
  delay: number;
}> = ({ x, title, accent, items, delay }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x,
          top: 380,
          width: 420,
          opacity: p,
          transform: `translateY(${(1 - p) * 22}px)`,
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "10px 26px",
            borderRadius: 999,
            background: accent,
            color: "#fff",
            fontFamily: mono,
            fontSize: 24,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {title}
        </div>
      </div>
      {items.map((it, i) => {
        const o = interpolate(frame - delay, [16 + i * 16, 42 + i * 16], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        return (
          <div
            key={it}
            style={{
              position: "absolute",
              left: x,
              top: 490 + i * 168,
              width: 420,
              height: 140,
              borderRadius: 28,
              background: C.surface,
              border: `2px solid ${C.border}`,
              borderLeft: `10px solid ${accent}`,
              boxShadow: "0 26px 50px -40px rgba(21,30,56,0.5)",
              display: "flex",
              alignItems: "center",
              padding: "0 30px",
              fontFamily: jakarta,
              fontWeight: 600,
              fontSize: 34,
              color: C.navy,
              opacity: o,
              transform: `translateX(${(1 - o) * (x < 540 ? -24 : 24)}px)`,
            }}
          >
            {it}
          </div>
        );
      })}
    </>
  );
};

export const Responsibility: React.FC = () => {
  const frame = useCurrentFrame();
  const line = interpolate(frame, [8, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 80, top: 200, right: 80 }}>
        <div
          style={{
            fontFamily: sora,
            fontWeight: 800,
            fontSize: 66,
            letterSpacing: "-0.03em",
            color: C.navy,
            opacity: line,
          }}
        >
          Who operates what
        </div>
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line
          x1={540}
          y1={340}
          x2={540}
          y2={340 + 1030 * line}
          stroke={C.borderStrong}
          strokeWidth={4}
          strokeDasharray="12 16"
        />
      </svg>

      <Column x={80} title="You" accent={C.violet} items={left} delay={10} />
      <Column x={580} title="Cloud provider" accent={C.primary} items={right} delay={34} />
    </AbsoluteFill>
  );
};
