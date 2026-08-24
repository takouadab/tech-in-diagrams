import type { DiagramDef, DiagramEdge, DiagramNode, NodeKind } from "./types";

interface ChainItem {
  id: string;
  label: string;
  sub?: string;
  kind?: NodeKind;
  detail?: string;
  edgeLabel?: string;
}

const WIDTH = 1220;
const NODE_W = 268;
const NODE_H = 122;
const COL_GAP = 84;
const ROW_GAP = 196;
const MIN_HEIGHT = 580;

/**
 * Builds a generously spaced serpentine flow diagram using the shared
 * diagram visual language. Rows read left-to-right, then right-to-left, so
 * the link between rows drops straight down instead of crossing the canvas.
 */
export function chainDiagram(
  items: ChainItem[],
  options: { caption?: string; branches?: ChainItem[]; branchFrom?: string } = {},
): DiagramDef {
  const perRow = items.length <= 3 ? Math.max(items.length, 1) : 3;
  const rows = Math.ceil(items.length / perRow);
  const rowWidth = perRow * NODE_W + (perRow - 1) * COL_GAP;
  const startX = (WIDTH - rowWidth) / 2 + NODE_W / 2;

  const branches = options.branches ?? [];
  const branchRowY = (rows - 1) * ROW_GAP + 190;
  const lastY = branches.length ? branchRowY : (rows - 1) * ROW_GAP;
  const contentH = lastY + NODE_H;
  const height = Math.max(contentH + 150, MIN_HEIGHT);
  const offsetY = (height - contentH) / 2 + NODE_H / 2;

  const placed: (DiagramNode & { row: number })[] = items.map((item, i) => {
    const row = Math.floor(i / perRow);
    const idxInRow = i % perRow;
    const countInRow = Math.min(perRow, items.length - row * perRow);
    // centre short trailing rows, and reverse odd rows for a serpentine read
    const rowW = countInRow * NODE_W + (countInRow - 1) * COL_GAP;
    const rowStart = (WIDTH - rowW) / 2 + NODE_W / 2;
    const col = row % 2 === 1 ? countInRow - 1 - idxInRow : idxInRow;
    return {
      ...item,
      w: NODE_W,
      h: NODE_H,
      x: rowStart + col * (NODE_W + COL_GAP),
      y: offsetY + row * ROW_GAP,
      row,
    };
  });

  const nodes: DiagramNode[] = placed.map(({ row: _row, ...n }) => n);

  const edges: DiagramEdge[] = items.slice(1).map((item, i) => {
    const a = placed[i]!;
    const b = placed[i + 1]!;
    const sameRow = a.row === b.row;
    return {
      from: a.id,
      to: b.id,
      animated: true,
      dir: sameRow ? ("h" as const) : ("v" as const),
      ...(item.edgeLabel ? { label: item.edgeLabel } : {}),
    };
  });

  if (branches.length && options.branchFrom) {
    const source = placed.find((n) => n.id === options.branchFrom) ?? placed[placed.length - 1]!;
    const bw = 250;
    const bh = 104;
    const bRowW = branches.length * bw + (branches.length - 1) * 56;
    const bStart = (WIDTH - bRowW) / 2 + bw / 2;
    branches.forEach((b, i) => {
      nodes.push({
        ...b,
        w: bw,
        h: bh,
        x: bStart + i * (bw + 56),
        y: offsetY + branchRowY,
      });
      edges.push({ from: source.id, to: b.id, animated: true, dashed: true, dir: "v" });
    });
  }

  return {
    width: WIDTH,
    height: Math.round(height),
    nodes,
    edges,
    ...(options.caption ? { caption: options.caption } : {}),
  };
}
