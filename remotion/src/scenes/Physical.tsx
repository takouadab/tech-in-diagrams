import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE_OUT, jakarta, mono, sora } from "../theme";
import { Connector, Svg, Zone } from "../components/base";

const pills = ["Compute", "Storage", "Databases", "Managed"];
const tiles = [
  { label: "Servers & racks", sub: "Real machines", x: 130, y: 830 },
  { label: "Networking", sub: "Switches · fibre", x: 550, y: 830 },
  { label: "Power", sub: "Feeds · backup", x: 130, y: 1110 },
  { label: "Cooling", sub: "Heat removal", x: 550, y: 1110 },
];

export const Physical: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Zone x={70} y={200} w={940} h={280} label="Cloud services" tone="primary" delay={0} />
      <div
        style={{
          position: "absolute",
          left: 110,
          top: 300,
          width: 860,
          display: "flex",
          gap: 18,
        }}
      >
        {pills.map((p, i) => {
          const o = interpolate(frame, [6 + i * 5, 26 + i * 5], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: EASE_OUT,
          });
          return (
            <div
              key={p}
              style={{
                flex: 1,
                height: 110,
                borderRadius: 24,
                background: C.surface,
                border: `2px solid ${C.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: jakarta,
                fontWeight: 600,
                fontSize: 30,
                color: C.navy,
                opacity: o,
                transform: `translateY(${(1 - o) * 16}px)`,
              }}
            >
              {p}
            </div>
          );
        })}
      </div>

      <Svg>
        {[230, 430, 640, 850].map((x, i) => (
          <Connector
            key={x}
            d={`M ${x} 490 L ${x} 690`}
            delay={40 + i * 8}
            dashed
            color={C.slate}
            width={5}
          />
        ))}
      </Svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 552,
          textAlign: "center",
          fontFamily: mono,
          fontSize: 26,
          letterSpacing: "0.28em",
          color: C.muted,
          opacity: interpolate(frame, [46, 70], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span style={{ background: C.bg, padding: "0 24px" }}>RUN ON</span>
      </div>

      <Zone
        x={70}
        y={700}
        w={940}
        h={740}
        label="Physical infrastructure"
        tone="neutral"
        delay={60}
      />
      {tiles.map((t, i) => {
        const o = interpolate(frame, [86 + i * 22, 116 + i * 22], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        return (
          <div
            key={t.label}
            style={{
              position: "absolute",
              left: t.x,
              top: t.y,
              width: 400,
              height: 230,
              borderRadius: 30,
              background: C.surface,
              border: `2px solid ${C.border}`,
              boxShadow: "0 28px 54px -40px rgba(21,30,56,0.5)",
              opacity: o,
              transform: `translateY(${(1 - o) * 22}px)`,
              padding: "34px 32px",
            }}
          >
            <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
              {[0, 1, 2, 3].map((k) => (
                <div
                  key={k}
                  style={{
                    width: 46,
                    height: 14,
                    borderRadius: 4,
                    background: k <= (frame / 12 + i) % 4 ? C.cyan : C.borderStrong,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                fontFamily: sora,
                fontWeight: 700,
                fontSize: 40,
                color: C.navy,
                letterSpacing: "-0.02em",
              }}
            >
              {t.label}
            </div>
            <div style={{ fontFamily: jakarta, fontSize: 27, color: C.muted, marginTop: 8 }}>
              {t.sub}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
