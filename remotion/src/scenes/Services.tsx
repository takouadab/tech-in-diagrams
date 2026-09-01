import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, mono } from "../theme";
import { Connector, NodeCard, Packet, Svg, Zone } from "../components/base";

const svc = [
  { label: "Compute", sub: "VMs · containers", x: 130, y: 500, tone: "primary" as const, i: "01" },
  { label: "Storage", sub: "Object · block", x: 550, y: 500, tone: "cyan" as const, i: "02" },
  { label: "Databases", sub: "Managed engines", x: 130, y: 850, tone: "violet" as const, i: "03" },
  {
    label: "Managed",
    sub: "Identity · messaging · AI",
    x: 550,
    y: 850,
    tone: "primary" as const,
    i: "04",
  },
];

const paths = [
  "M 540 300 C 540 400 330 400 330 500",
  "M 540 300 C 540 400 750 400 750 500",
  "M 330 790 L 330 850",
  "M 750 790 L 750 850",
];

export const Services: React.FC = () => {
  const frame = useCurrentFrame();
  const foot = interpolate(frame, [300, 340], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill>
      <Svg>
        <Connector d={paths[0]!} delay={40} />
        <Connector d={paths[1]!} delay={58} color={C.cyan} />
        <Connector d={paths[2]!} delay={150} color={C.violet} />
        <Connector d={paths[3]!} delay={168} />
        <Packet pathId={paths[0]!} delay={60} dur={64} repeat={5} />
        <Packet pathId={paths[1]!} delay={80} dur={64} repeat={5} color={C.cyan} />
      </Svg>

      <NodeCard
        x={290}
        y={150}
        w={500}
        h={150}
        label="Your request"
        tone="violet"
        delay={0}
      />
      <Zone
        x={70}
        y={360}
        w={940}
        h={1080}
        label="Cloud provider"
        tone="primary"
        delay={16}
      />
      {svc.map((s, i) => (
        <NodeCard
          key={s.label}
          x={s.x}
          y={s.y}
          w={400}
          h={290}
          label={s.label}
          sub={s.sub}
          tone={s.tone}
          delay={54 + i * 46}
          index={s.i}
        />
      ))}
      <div
        style={{
          position: "absolute",
          left: 130,
          top: 1230,
          width: 820,
          opacity: foot,
          fontFamily: mono,
          fontSize: 26,
          letterSpacing: "0.18em",
          color: C.muted,
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        Consumed as services · not owned
      </div>
    </AbsoluteFill>
  );
};
