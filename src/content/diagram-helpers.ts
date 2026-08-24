import type { DiagramDef, DiagramEdge, DiagramNode, NodeKind } from "./types";

interface ChainItem {
  id: string;
  label: string;
  sub?: string;
  kind?: NodeKind;
  detail?: string;
  edgeLabel?: string;
}

/** Desktop chain geometry — sized for legibility, never squeezed to fit a canvas. */
const NODE_W = 228;
const NODE_H = 112;
const COL_GAP = 84;
const ROW_GAP = 200;
const MARGIN_X = 84;
const MARGIN_Y = 96;
const BRANCH_GAP = 214;
const MIN_HEIGHT = 470;
const MIN_HEIGHT_SINGLE_ROW = 360;
/** at most four steps read comfortably on one desktop row */
const MAX_PER_ROW = 4;

function perRowFor(count: number) {
  if (count <= MAX_PER_ROW) return Math.max(count, 1);
  const rows = Math.ceil(count / MAX_PER_ROW);
  return Math.ceil(count / rows);
}

/**
 * Builds a chain flow whose canvas is derived from the node count instead of
 * compressing nodes into a fixed width. Rows read left-to-right, then
 * right-to-left, so the link between rows drops straight down.
 */
export function chainDiagram(
  items: ChainItem[],
  options: { caption?: string; branches?: ChainItem[]; branchFrom?: string } = {},
): DiagramDef {
  const perRow = perRowFor(items.length);
  const rows = Math.ceil(items.length / perRow);
  const branches = options.branches ?? [];

  const branchW = 224;
  const branchH = 106;
  const branchRowW = branches.length
    ? branches.length * branchW + (branches.length - 1) * 64
    : 0;

  const chainRowW = perRow * NODE_W + (perRow - 1) * COL_GAP;
  const width = Math.round(Math.max(chainRowW, branchRowW) + MARGIN_X * 2);

  const branchOffset = branches.length ? BRANCH_GAP : 0;
  const contentH = (rows - 1) * ROW_GAP + NODE_H + branchOffset + (branches.length ? branchH : 0);
  const height = Math.round(
    Math.max(contentH + MARGIN_Y * 2, rows > 1 || branches.length ? MIN_HEIGHT : MIN_HEIGHT_SINGLE_ROW),
  );
  const topY = (height - contentH) / 2 + NODE_H / 2;

  const placed: (DiagramNode & { row: number })[] = items.map((item, i) => {
    const row = Math.floor(i / perRow);
    const idxInRow = i % perRow;
    const countInRow = Math.min(perRow, items.length - row * perRow);
    const rowW = countInRow * NODE_W + (countInRow - 1) * COL_GAP;
    const rowStart = (width - rowW) / 2 + NODE_W / 2;
    // serpentine: reverse odd rows so the row-to-row link is a short drop
    const col = row % 2 === 1 ? countInRow - 1 - idxInRow : idxInRow;
    return {
      ...item,
      w: NODE_W,
      h: NODE_H,
      x: rowStart + col * (NODE_W + COL_GAP),
      y: topY + row * ROW_GAP,
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
    const bStart = (width - branchRowW) / 2 + branchW / 2;
    const by = topY + (rows - 1) * ROW_GAP + branchOffset;
    branches.forEach((b, i) => {
      nodes.push({
        ...b,
        w: branchW,
        h: branchH,
        x: bStart + i * (branchW + 64),
        y: by,
      });
      edges.push({ from: source.id, to: b.id, animated: true, dashed: true, dir: "v" });
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
