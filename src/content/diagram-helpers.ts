import type { DiagramDef, DiagramEdge, DiagramNode, NodeKind } from "./types";

interface ChainItem {
  id: string;
  label: string;
  sub?: string;
  kind?: NodeKind;
  detail?: string;
  edgeLabel?: string;
}

/**
 * Builds a horizontal left-to-right flow diagram using the shared
 * diagram visual language. Used for concepts whose story is a sequence.
 */
export function chainDiagram(
  items: ChainItem[],
  options: { caption?: string; branches?: ChainItem[]; branchFrom?: string } = {},
): DiagramDef {
  const width = 1080;
  const height = options.branches?.length ? 460 : 340;
  const nodeW = 176;
  const nodeH = 96;
  const gap = (width - 80 - items.length * nodeW) / Math.max(items.length - 1, 1);
  const rowY = options.branches?.length ? 150 : height / 2;

  const nodes: DiagramNode[] = items.map((item, i) => ({
    ...item,
    w: nodeW,
    h: nodeH,
    x: 40 + nodeW / 2 + i * (nodeW + gap),
    y: rowY,
  }));

  const edges: DiagramEdge[] = items.slice(1).map((item, i) => ({
    from: items[i]!.id,
    to: item.id,
    animated: true,
    ...(item.edgeLabel ? { label: item.edgeLabel } : {}),
  }));

  if (options.branches?.length && options.branchFrom) {
    const source = nodes.find((n) => n.id === options.branchFrom)!;
    const bw = 200;
    const bgap = (width - 80 - options.branches.length * bw) / Math.max(options.branches.length - 1, 1);
    options.branches.forEach((b, i) => {
      nodes.push({
        ...b,
        w: bw,
        h: 84,
        x: 40 + bw / 2 + i * (bw + bgap),
        y: 360,
      });
      edges.push({ from: source.id, to: b.id, animated: true, dashed: true });
    });
  }

  return {
    width,
    height,
    nodes,
    edges,
    ...(options.caption ? { caption: options.caption } : {}),
  };
}
