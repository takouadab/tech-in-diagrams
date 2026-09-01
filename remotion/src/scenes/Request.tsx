import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../theme";
import { Connector, NodeCard, Packet, Svg, Zone } from "../components/base";

const PATH = "M 540 452 L 540 1058";

export const Request: React.FC = () => (
  <AbsoluteFill>
    <Svg>
      <Connector d="M 540 452 L 540 636" delay={26} />
      <Connector d="M 540 800 L 540 950" delay={54} color={C.cyan} />
      <Packet pathId={PATH} delay={72} dur={78} repeat={4} />
      <Packet pathId={PATH} delay={110} dur={78} repeat={3} color={C.cyan} r={10} />
    </Svg>

    <NodeCard
      x={150}
      y={262}
      w={780}
      h={190}
      label="You"
      sub="No servers to buy, rack or maintain"
      tone="violet"
      index="01"
    />
    <NodeCard
      x={280}
      y={636}
      w={520}
      h={164}
      label="Network"
      sub="Secure request path"
      tone="cyan"
      delay={30}
      index="02"
    />
    <Zone x={80} y={950} w={920} h={420} label="Cloud provider" tone="primary" delay={56} />
    <NodeCard
      x={140}
      y={1058}
      w={800}
      h={220}
      label="Computing resources"
      sub="Provisioned on demand · billed for use"
      tone="primary"
      delay={70}
      index="03"
    />
  </AbsoluteFill>
);
