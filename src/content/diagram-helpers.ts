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


/**
 * Row plan for a chain. Reading order is always left-to-right, so rows are
 * balanced rather than serpentine: 5 → 3+2, 6 → 3+3, 7 → 4+3.
 */
function rowPlan(count: number): number[] {
  if (count <= MAX_PER_ROW) return [Math.max(count, 1)];
  if (count === 5) return [3, 2];
  if (count === 6) return [3, 3];
  const rows = Math.ceil(count / MAX_PER_ROW);
  const base = Math.floor(count / rows);
  const extra = count % rows;
  return Array.from({ length: rows }, (_, i) => base + (i < extra ? 1 : 0));
}

/**
 * Builds a chain flow whose canvas is derived from the node count instead of
 * compressing nodes into a fixed width. Every row reads left-to-right; the
 * link between rows drops through a side gutter and returns along the
 * mid-row corridor so it never crosses a node.
 */
export function chainDiagram(
  items: ChainItem[],
  options: { caption?: string; branches?: ChainItem[]; branchFrom?: string } = {},
): DiagramDef {
  const plan = rowPlan(items.length);
  const rows = plan.length;
  const perRow = Math.max(...plan);
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

  const rowOf: number[] = [];
  plan.forEach((n, r) => {
    for (let i = 0; i < n; i += 1) rowOf.push(r);
  });
  const rowStartIndex = plan.map((_, r) => plan.slice(0, r).reduce((a, b) => a + b, 0));

  const placed: (DiagramNode & { row: number })[] = items.map((item, i) => {
    const row = rowOf[i]!;
    const idxInRow = i - rowStartIndex[row]!;
    const countInRow = plan[row]!;
    const rowW = countInRow * NODE_W + (countInRow - 1) * COL_GAP;
    const rowStart = (width - rowW) / 2 + NODE_W / 2;
    return {
      ...item,
      w: NODE_W,
      h: NODE_H,
      x: rowStart + idxInRow * (NODE_W + COL_GAP),
      y: topY + row * ROW_GAP,
      row,
    };
  });

  const nodes: DiagramNode[] = placed.map(({ row: _row, ...n }) => n);

  const gutterX = width - 34;

  const edges: DiagramEdge[] = items.slice(1).map((item, i) => {
    const a = placed[i]!;
    const b = placed[i + 1]!;
    if (a.row === b.row) {
      return {
        from: a.id,
        to: b.id,
        animated: true,
        dir: "h" as const,
        ...(item.edgeLabel ? { label: item.edgeLabel } : {}),
      };
    }
    // deliberate row transition: out to the right gutter, down, back along the
    // corridor between rows, then a short drop into the first node of row 2
    const ax = a.x + NODE_W / 2;
    const midY = (a.y + b.y) / 2;
    const c = 26;
    const path = [
      `M ${ax} ${a.y}`,
      `H ${gutterX - c}`,
      `Q ${gutterX} ${a.y} ${gutterX} ${a.y + c}`,
      `V ${midY - c}`,
      `Q ${gutterX} ${midY} ${gutterX - c} ${midY}`,
      `H ${b.x + c}`,
      `Q ${b.x} ${midY} ${b.x} ${midY + c}`,
      `V ${b.y - NODE_H / 2 - 4}`,
    ].join(" ");
    return { from: a.id, to: b.id, animated: true, path };
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
