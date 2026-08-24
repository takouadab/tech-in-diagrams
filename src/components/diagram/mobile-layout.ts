import type { DiagramDef, DiagramGroup, DiagramNode } from "@/content/types";

const W = 380;
const NODE_W = 304;
const MAX_SUB = 30;
const CX = W / 2;
const GAP = 46;
const GROUP_HEAD = 62;
const GROUP_PAD = 20;
const PILL_H = 44;

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function nodeHeight(_n: DiagramNode) {
  return 104;
}

function groupOf(n: DiagramNode, groups: DiagramGroup[]) {
  return groups.find(
    (g) => n.x >= g.x && n.x <= g.x + g.w && n.y >= g.y && n.y <= g.y + g.h,
  );
}

/**
 * Rebuilds a diagram as a purpose-built single-column mobile composition:
 * full-width nodes at readable text sizes, stacked groups, vertical flow.
 * Nothing is scaled down — the graph is re-laid out.
 */
export function toMobileDiagram(d: DiagramDef): DiagramDef {
  const groups = d.groups ?? [];

  // order nodes so group members stay contiguous, otherwise source order
  const ordered: DiagramNode[] = [];
  const seen = new Set<string>();
  for (const n of d.nodes) {
    if (seen.has(n.id)) continue;
    const g = groupOf(n, groups);
    if (g) {
      for (const m of d.nodes) {
        if (!seen.has(m.id) && groupOf(m, groups)?.id === g.id) {
          ordered.push(m);
          seen.add(m.id);
        }
      }
    } else {
      ordered.push(n);
      seen.add(n.id);
    }
  }

  const nodes: DiagramNode[] = [];
  const newGroups: DiagramGroup[] = [];
  let y = 34;
  let currentGroup: string | null = null;
  let groupStart = 0;

  const closeGroup = (endY: number) => {
    if (!currentGroup) return;
    const g = groups.find((x) => x.id === currentGroup)!;
    newGroups.push({
      ...g,
      ...(g.sub ? { sub: clip(g.sub, 38) } : {}),
      x: 12,
      y: groupStart,
      w: W - 24,
      h: endY - groupStart + GROUP_PAD,
    });
    currentGroup = null;
  };

  ordered.forEach((n) => {
    const g = groupOf(n, groups);
    if (g?.id !== currentGroup) {
      closeGroup(y - GAP);
      if (g) {
        y += 18;
        groupStart = y;
        currentGroup = g.id;
        y += GROUP_HEAD;
      }
    }
    const h = nodeHeight(n);
    nodes.push({ ...n, ...(n.sub ? { sub: clip(n.sub, MAX_SUB) } : {}), x: CX, y: y + h / 2, w: NODE_W, h });
    y += h + GAP;
  });
  closeGroup(y - GAP);

  const index = new Map(nodes.map((n, i) => [n.id, i]));
  const edges = d.edges.map((e) => {
    const ai = index.get(e.from);
    const bi = index.get(e.to);
    const a = nodes.find((n) => n.id === e.from);
    const b = nodes.find((n) => n.id === e.to);
    if (ai === undefined || bi === undefined || !a || !b) return e;
    if (Math.abs(ai - bi) === 1) {
      return { ...e, dir: "v" as const, bend: 0 };
    }
    // long link: arc down the right-hand gutter so it never crosses a node
    const side = CX + NODE_W / 2 + 16;
    const ax = a.x + NODE_W / 2;
    const bx = b.x + NODE_W / 2 + 10;
    const path = `M ${ax} ${a.y} C ${side + 14} ${a.y} ${side + 14} ${b.y} ${bx} ${b.y}`;
    const { label: _label, ...rest } = e;
    return { ...rest, path };
  });

  let pillY = y + 6;
  const pills = d.pills?.map((p) => {
    const at = { ...p, x: CX, y: pillY + PILL_H / 2 };
    pillY += PILL_H + 12;
    return at;
  });

  const height = (pills?.length ? pillY + 10 : y) + 12;

  return {
    ...d,
    width: W,
    height,
    groups: newGroups,
    nodes,
    edges,
    ...(pills ? { pills } : {}),
  };
}

/**
 * A small, legible card preview: the first few nodes of the flow laid out
 * on a tight canvas so text stays readable once scaled into a card.
 */
export function toPreviewDiagram(d: DiagramDef): DiagramDef {
  const picked = d.nodes.slice(0, 3);
  const nw = 176;
  const gap = 22;
  const total = picked.length * nw + (picked.length - 1) * gap;
  const startX = (620 - total) / 2 + nw / 2;
  const nodes = picked.map((n, i) => ({
    ...n,
    x: startX + i * (nw + gap),
    y: 112,
    w: nw,
    h: 92,
  }));
  const ids = new Set(nodes.map((n) => n.id));
  const edges = d.edges
    .filter((e) => ids.has(e.from) && ids.has(e.to))
    .map((e) => {
      const { label: _label, path: _path, ...rest } = e;
      return { ...rest, bend: 0, dir: "h" as const };
    });
  return { width: 620, height: 224, nodes, edges };
}
