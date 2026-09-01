import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Backdrop } from "./components/base";
import { CaptionLayer } from "./components/Captions";
import { Hook } from "./scenes/Hook";
import { Request } from "./scenes/Request";
import { Services } from "./scenes/Services";
import { Physical } from "./scenes/Physical";
import { Responsibility } from "./scenes/Responsibility";
import { EndCard } from "./scenes/EndCard";

export const TOTAL_FRAMES = 1650; // 55s @ 30fps

const scenes: { from: number; dur: number; el: React.ReactNode }[] = [
  { from: 0, dur: 120, el: <Hook /> },
  { from: 120, dur: 330, el: <Request /> },
  { from: 450, dur: 420, el: <Services /> },
  { from: 870, dur: 300, el: <Physical /> },
  { from: 1170, dur: 270, el: <Responsibility /> },
  { from: 1440, dur: 210, el: <EndCard /> },
];

export const MainVideo: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    {scenes.map((s) => (
      <Sequence key={s.from} from={s.from} durationInFrames={s.dur}>
        <SceneFade dur={s.dur}>{s.el}</SceneFade>
      </Sequence>
    ))}
    <CaptionLayer />
  </AbsoluteFill>
);

import { interpolate, useCurrentFrame } from "remotion";

const SceneFade: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const o =
    interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [dur - 12, dur - 2], [1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
