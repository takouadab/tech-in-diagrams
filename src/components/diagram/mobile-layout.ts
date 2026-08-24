import type { DiagramDef, DiagramGroup, DiagramNode } from "@/content/types";

const W = 400;
const NODE_W = 316;
const NODE_H = 112;
const MAX_SUB = 30;
const CX = W / 2;
const GAP = 54;
const GROUP_HEAD = 66;
const GROUP_PAD = 22;
const PILL_H = 46;

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function groupOf(n: DiagramNode, groups: DiagramGroup[]) {
  return groups.find((g) => n.x >= g.x && n.x <= g.x + g.w && n.y >= g.y && n.y <= g.y + g.h);
}

/**
 * Rebuilds a diagram as a purpose-built single-column mobile composition:
 * full-width nodes at readable text sizes, stacked groups, vertical flow.
 * Nothing is scaled down — the graph is re-laid out. A diagram may instead
 * ship an explicit `mobile` composition, which always wins.
 */
export function toMobileDiagram(d: DiagramDef): DiagramDef {
  if (d.mobile) {
    return {
      ...d.mobile,
      ...(d.caption ? { caption: d.caption } : {}),
      ...(d.legend ? { legend: d.legend } : {}),
    };
  }
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
  let y = 36;
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
        y += 20;
        groupStart = y;
        currentGroup = g.id;
        y += GROUP_HEAD;
      }
    }
    nodes.push({
      ...n,
      ...(n.sub ? { sub: clip(n.sub, MAX_SUB) } : {}),
      x: CX,
      y: y + NODE_H / 2,
      w: NODE_W,
      h: NODE_H,
    });
    y += NODE_H + GAP;
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
    const side = CX + NODE_W / 2 + 14;
    const ax = a.x + NODE_W / 2;
    const bx = b.x + NODE_W / 2 + 10;
    const path = `M ${ax} ${a.y} C ${side + 16} ${a.y} ${side + 16} ${b.y} ${bx} ${b.y}`;
    const { label: _label, ...rest } = e;
    return { ...rest, path };
  });

  let pillY = y + 8;
  const pills = d.pills?.map((p) => {
    const at = { ...p, x: CX, y: pillY + PILL_H / 2, w: W - 48 };
    pillY += PILL_H + 12;
    return at;
  });

  const height = (pills?.length ? pillY + 10 : y) + 14;

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
 * A decorative card motif: at most three nodes, labels only, generously sized
 * so the preview stays legible when it is rendered a few hundred pixels wide.
 */
export function toPreviewDiagram(d: DiagramDef): DiagramDef {
  const picked = d.nodes.slice(0, 3);
  const nw = 320;
  const nh = 104;
  const gap = 34;
  const width = 520;
  const startY = (nw ? 0 : 0) + 46;
  const nodes = picked.map((n, i) => {
    const { sub: _sub, ...rest } = n;
    return {
      ...rest,
      x: width / 2 + (i % 2 === 0 ? -18 : 18),
      y: startY + i * (nh + gap) + nh / 2,
      w: nw,
      h: nh,
    };
  });
  const ids = new Set(nodes.map((n) => n.id));
  const edges = d.edges
    .filter((e) => ids.has(e.from) && ids.has(e.to))
    .map((e) => {
      const { label: _label, path: _path, ...rest } = e;
      return { ...rest, bend: 0, dir: "v" as const };
    });
  const height = startY * 2 + picked.length * nh + (picked.length - 1) * gap;
  return { width, height, nodes, edges };
}
