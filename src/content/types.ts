export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type TopicSlug = "it-fundamentals" | "cloud-computing" | "architecture" | "devops";

export type NodeKind = "actor" | "network" | "service" | "data" | "platform" | "observe";

export interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
  /** position of the node center, in diagram units */
  x: number;
  y: number;
  w?: number;
  h?: number;
  kind?: NodeKind;
  /** contextual explanation shown when the node is activated */
  detail?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
  dashed?: boolean;
  /** curve amount; positive bends downward */
  bend?: number;
  /** force horizontal or vertical anchoring instead of auto */
  dir?: "h" | "v";
  /** fully precomputed SVG path (used by the mobile layout) */
  path?: string;
}

export interface DiagramGroup {
  id: string;
  label: string;
  sub?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tone?: "primary" | "cyan" | "violet" | "neutral";
}

export interface DiagramPill {
  label: string;
  note: string;
  x: number;
  y: number;
  /** fixed pill width; defaults to a width derived from the label */
  w?: number;
}

export interface DiagramDef {
  width: number;
  height: number;
  groups?: DiagramGroup[];
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  pills?: DiagramPill[];
  legend?: { label: string; tone: NodeKind }[];
  caption?: string;
}

export interface KeyTerm {
  term: string;
  definition: string;
}

export interface Source {
  label: string;
  publisher: string;
  url: string;
}

export interface Concept {
  slug: string;
  title: string;
  topic: TopicSlug;
  subArea?: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  intro: string;
  diagram: DiagramDef;
  whatYouAreLookingAt?: string[];
  howItWorks?: { step: string; text: string }[];
  whyItMatters?: string[];
  keyTerms?: KeyTerm[];
  misconception?: { claim: string; reality: string };
  realWorldExample?: string;
  sources?: Source[];
  next?: string;
  status?: "published" | "planned";
}

export interface Topic {
  slug: TopicSlug;
  name: string;
  tagline: string;
  description: string;
  subAreas: string[];
}

export interface LearningPath {
  slug: string;
  name: string;
  summary: string;
  level: Difficulty;
  steps: { slug: string; title: string }[];
}
