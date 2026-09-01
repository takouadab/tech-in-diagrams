import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, EASE_OUT, jakarta } from "../theme";

export type Caption = { from: number; to: number; text: string };

export const CAPTIONS: Caption[] = [
  { from: 4, to: 66, text: "Cloud computing sounds abstract." },
  { from: 66, to: 120, text: "But the idea is actually simple." },
  { from: 126, to: 292, text: "Instead of buying and maintaining your own physical servers…" },
  { from: 292, to: 450, text: "…you access computing resources over a network." },
  { from: 456, to: 640, text: "Those resources can be compute, storage or databases…" },
  { from: 640, to: 870, text: "…or managed services like identity, messaging and AI." },
  { from: 876, to: 1020, text: "The hardware hasn't disappeared." },
  { from: 1020, to: 1170, text: "Real servers, networking, power and cooling still exist underneath." },
  { from: 1176, to: 1312, text: "The cloud provider operates that infrastructure…" },
  { from: 1312, to: 1440, text: "…while you consume what you need as a service." },
  { from: 1446, to: 1530, text: "That's cloud computing." },
];

export const CaptionLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const active = CAPTIONS.find((c) => frame >= c.from && frame < c.to);
  if (!active) return null;
  const local = frame - active.from;
  const remain = active.to - frame;
  const inP = interpolate(local, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const outP = interpolate(remain, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const p = inP * outP;

  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        right: 70,
        bottom: 190,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: 900,
          padding: "34px 44px 34px 52px",
          borderRadius: 32,
          background: "rgba(255,255,255,0.92)",
          border: `2px solid ${C.border}`,
          boxShadow: "0 34px 70px -44px rgba(21,30,56,0.55)",
          opacity: p,
          transform: `translateY(${(1 - inP) * 26}px)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 22,
            top: 34,
            bottom: 34,
            width: 8,
            borderRadius: 8,
            background: `linear-gradient(${C.primary}, ${C.cyan})`,
          }}
        />
        <div
          style={{
            fontFamily: jakarta,
            fontWeight: 600,
            fontSize: 46,
            lineHeight: 1.28,
            color: C.navy,
            letterSpacing: "-0.01em",
            textAlign: "left",
          }}
        >
          {active.text}
        </div>
      </div>
    </div>
  );
};
