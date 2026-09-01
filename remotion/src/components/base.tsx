import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, EASE_OUT, jakarta, mono, sora } from "../theme";

/* ------------------------------ backdrop -------------------------------- */

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 190) * 26;
  const drift2 = Math.cos(frame / 240) * 34;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at ${18 + drift}% ${14 + drift2 / 3}%, rgba(43,84,234,0.12), transparent 62%),
            radial-gradient(820px 820px at ${86 - drift / 2}% ${78 + drift2 / 4}%, rgba(31,168,196,0.14), transparent 60%),
            radial-gradient(700px 700px at 70% 8%, rgba(122,70,220,0.08), transparent 65%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.borderStrong} 1px, transparent 1px), linear-gradient(90deg, ${C.borderStrong} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.32,
          maskImage: "radial-gradient(closest-side at 50% 45%, black 55%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/* -------------------------------- text ---------------------------------- */

export const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; delay?: number }> = ({
  children,
  color = C.muted,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 26,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
};

export const Title: React.FC<{
  children: React.ReactNode;
  delay?: number;
  size?: number;
  color?: string;
  align?: "left" | "center";
}> = ({ children, delay = 0, size = 88, color = C.navy, align = "left" }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 26], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  return (
    <div
      style={{
        fontFamily: sora,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.08,
        letterSpacing: "-0.025em",
        color,
        textAlign: align,
        opacity: p,
        transform: `translateY(${(1 - p) * 34}px)`,
      }}
    >
      {children}
    </div>
  );
};

/* -------------------------------- cards ---------------------------------- */

type Tone = "primary" | "cyan" | "violet" | "neutral";

const toneMap: Record<Tone, { accent: string; soft: string }> = {
  primary: { accent: C.primary, soft: C.primarySoft },
  cyan: { accent: C.cyan, soft: C.cyanSoft },
  violet: { accent: C.violet, soft: C.violetSoft },
  neutral: { accent: C.slate, soft: "#EEF1F7" },
};

export const NodeCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  tone?: Tone;
  delay?: number;
  dim?: number;
  index?: string;
}> = ({ x, y, w, h, label, sub, tone = "primary", delay = 0, dim = 1, index }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const t = toneMap[tone];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 34,
        background: C.surface,
        border: `2px solid ${C.border}`,
        boxShadow: `0 30px 60px -40px rgba(21,30,56,0.45)`,
        opacity: p * dim,
        transform: `translateY(${(1 - p) * 26}px) scale(${0.965 + p * 0.035})`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "0 40px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 12,
          background: t.accent,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -70,
          top: -70,
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: t.soft,
          opacity: 0.75,
        }}
      />
      {index && (
        <div
          style={{
            position: "absolute",
            right: 34,
            top: 28,
            fontFamily: mono,
            fontSize: 22,
            letterSpacing: "0.18em",
            color: t.accent,
            fontWeight: 500,
          }}
        >
          {index}
        </div>
      )}
      <div
        style={{
          position: "relative",
          fontFamily: sora,
          fontWeight: 700,
          fontSize: 46,
          color: C.navy,
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </div>
      {sub && (
        <div
          style={{
            position: "relative",
            marginTop: 10,
            fontFamily: jakarta,
            fontWeight: 500,
            fontSize: 28,
            color: C.muted,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

/* ------------------------------ zone frame -------------------------------- */

export const Zone: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone?: Tone;
  delay?: number;
  dashed?: boolean;
}> = ({ x, y, w, h, label, tone = "primary", delay = 0, dashed = false }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const t = toneMap[tone];
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h * p,
        borderRadius: 44,
        border: `3px ${dashed ? "dashed" : "solid"} ${t.accent}55`,
        background: `${t.soft}66`,
        opacity: p,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -22,
          left: 46,
          padding: "6px 22px",
          borderRadius: 999,
          background: C.surface,
          border: `2px solid ${t.accent}55`,
          fontFamily: mono,
          fontSize: 22,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: t.accent,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
};

/* ------------------------------ connectors -------------------------------- */

export const Connector: React.FC<{
  d: string;
  delay?: number;
  dur?: number;
  dashed?: boolean;
  color?: string;
  width?: number;
  length?: number;
}> = ({ d, delay = 0, dur = 26, dashed = false, color = C.primary, width = 4, length = 1200 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={dashed ? "14 16" : `${length} ${length}`}
      strokeDashoffset={dashed ? 0 : length * (1 - p)}
      opacity={dashed ? p * 0.55 : p * 0.85}
    />
  );
};

/** Animated token travelling along a path */
export const Packet: React.FC<{
  pathId: string;
  delay?: number;
  dur?: number;
  color?: string;
  r?: number;
  repeat?: number;
}> = ({ pathId, delay = 0, dur = 60, color = C.primary, r = 13, repeat = 1 }) => {
  const frame = useCurrentFrame();
  const local = frame - delay;
  if (local < 0) return null;
  const cycle = local % dur;
  const idx = Math.floor(local / dur);
  if (idx >= repeat) return null;
  const t = cycle / dur;
  const fade = Math.min(1, Math.min(t, 1 - t) * 8);
  return (
    <g opacity={fade}>
      <circle r={r * 2.6} fill={color} opacity={0.16}>
        <animateMotion dur="1s" />
      </circle>
      <g
        style={{
          offsetPath: `path("${pathId}")`,
          offsetDistance: `${t * 100}%`,
        }}
      >
        <circle r={r * 2.4} fill={color} opacity={0.14} />
        <circle r={r} fill={color} />
        <circle r={r} fill="none" stroke="#fff" strokeWidth={3} opacity={0.7} />
      </g>
    </g>
  );
};

/* --------------------------------- svg ------------------------------------ */

export const Svg: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg
    width={1080}
    height={1920}
    viewBox="0 0 1080 1920"
    style={{ position: "absolute", inset: 0, overflow: "visible" }}
  >
    {children}
  </svg>
);
