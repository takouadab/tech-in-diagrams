import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MousePointerClick, Sparkles, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagramCanvas } from "@/components/diagram/DiagramCanvas";
import { ConceptCard, PathCard, SectionHeading, TopicCard } from "@/components/site/cards";
import { concepts, conceptsByTopic, featuredConcepts } from "@/content/concepts";
import { learningPaths } from "@/content/paths";
import { topics } from "@/content/topics";
import type { DiagramDef } from "@/content/types";

const heroDiagram: DiagramDef = {
  width: 1320,
  height: 680,
  groups: [
    {
      id: "platform",
      label: "Cloud platform",
      sub: "Provider-operated capacity",
      x: 790,
      y: 120,
      w: 500,
      h: 440,
      tone: "primary",
    },
  ],
  nodes: [
    { id: "user", label: "User", sub: "Browser or app", kind: "actor", x: 130, y: 340, w: 210, h: 116, detail: "Someone makes a request — a click, a tap, an API call. Everything downstream exists to answer it." },
    { id: "app", label: "Application", sub: "Interface & logic", kind: "service", x: 390, y: 340, w: 210, h: 116, detail: "Renders the experience, holds the product logic and forwards real work to backend services." },
    { id: "api", label: "API", sub: "Contract & auth", kind: "network", x: 640, y: 340, w: 200, h: 116, detail: "A stable, authenticated doorway into the system. It hides how the backend is built from whoever calls it." },
    { id: "cloud", label: "Cloud services", sub: "Compute · queues · cache", kind: "service", x: 925, y: 235, w: 250, h: 112, detail: "Provider-operated capacity, provisioned on demand and billed by usage instead of bought up front." },
    { id: "db", label: "Database", sub: "Source of truth", kind: "data", x: 925, y: 435, w: 250, h: 112, detail: "Where the system's state lives — queried and updated by the services above it." },
    { id: "mon", label: "Monitoring", sub: "Metrics · logs · traces", kind: "observe", x: 1180, y: 340, w: 210, h: 112, detail: "The signals that show whether the whole flow is actually working, and where it slows down." },
  ],
  edges: [
    { from: "user", to: "app", animated: true, label: "request" },
    { from: "app", to: "api", animated: true, label: "call" },
    { from: "api", to: "cloud", animated: true, bend: -26 },
    { from: "api", to: "db", animated: true, bend: 26 },
    { from: "cloud", to: "mon", dashed: true, dir: "h", bend: 12 },
    { from: "db", to: "mon", dashed: true, dir: "h", bend: -12 },
  ],
  caption: "A request travelling through a modern system — hover to trace a route, click any node for a short explanation.",
  legend: [
    { label: "People", tone: "actor" },
    { label: "Network", tone: "network" },
    { label: "Services", tone: "service" },
    { label: "Data", tone: "data" },
    { label: "Observability", tone: "observe" },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tech in Diagrams — Learn IT visually" },
      {
        name: "description",
        content:
          "Understand cloud, architecture, DevOps and core IT concepts through clear interactive diagrams and simple explanations.",
      },
      { property: "og:title", content: "Tech in Diagrams — Learn IT visually" },
      {
        property: "og:description",
        content: "Interactive diagrams that explain modern IT for beginners and non-technical professionals.",
      },
    ],
  }),
  component: Home,
});

const stats = [
  { value: `${concepts.length}`, label: "Interactive diagrams" },
  { value: "4", label: "Learning areas" },
  { value: `${learningPaths.length}`, label: "Guided paths" },
  { value: "0", label: "Walls of text" },
];

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-aurora opacity-70 animate-drift" aria-hidden="true" />
        <div className="absolute inset-0 bg-dots opacity-[0.5]" aria-hidden="true" />
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          aria-hidden="true"
          style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-16 sm:px-8 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="reveal inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft backdrop-blur">
              <Sparkles className="size-3.5 text-primary" />
              Understand IT, one diagram at a time
            </span>
            <h1
              className="reveal mt-7 text-[2.75rem] font-extrabold leading-[0.98] sm:text-[4.5rem]"
              style={{ animationDelay: "80ms" }}
            >
              Learn IT <span className="text-gradient-brand">visually.</span>
            </h1>
            <p
              className="reveal mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground sm:text-lg"
              style={{ animationDelay: "160ms" }}
            >
              Cloud, architecture, DevOps and core IT — explained through crafted interactive
              diagrams instead of long articles.
            </p>
            <div
              className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              <Button asChild size="lg" className="w-full rounded-full px-8 shadow-glow sm:w-auto">
                <Link to="/learn">Start Learning</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-full border-border-strong bg-surface/70 px-8 backdrop-blur sm:w-auto"
              >
                <Link to="/explore">Explore Topics</Link>
              </Button>
            </div>
          </div>

          <div className="reveal mt-16" style={{ animationDelay: "320ms" }}>
            <DiagramCanvas
              diagram={heroDiagram}
              title="How a modern system handles a request"
              stage
            />
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border/70 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface/85 px-5 py-6 text-center backdrop-blur">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-3xl font-extrabold tracking-tight">
                    {s.value}
                  </span>
                  <span className="mt-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Learning areas */}
      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <SectionHeading
          eyebrow="Four learning areas"
          title="Start where you are"
          description="Every area is built from diagrams, not articles. Pick one and follow the connections."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((t, i) => (
            <TopicCard key={t.slug} topic={t} index={i} count={conceptsByTopic(t.slug).length} />
          ))}
        </div>
      </section>

      {/* Learn through diagrams */}
      <section className="relative border-y border-border bg-surface-sunken">
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <SectionHeading
            eyebrow="Diagram first"
            title="Learn through diagrams"
            description="Each concept opens with a large interactive diagram. Hover to trace connections, click a node for a short, precise explanation."
            action={
              <Button asChild variant="outline" className="rounded-full bg-surface">
                <Link to="/explore">
                  All concepts <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            }
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featuredConcepts.map((c) => (
              <div key={c.slug} className="flex flex-col gap-4">
                <Link
                  to="/concepts/$slug"
                  params={{ slug: c.slug }}
                  aria-label={`Open ${c.title}`}
                  className="block transition-transform duration-500 hover:-translate-y-1"
                >
                  <DiagramCanvas diagram={c.diagram} title={c.title} compact bare />
                </Link>
                <ConceptCard concept={c} className="flex-1" />
              </div>
            ))}
          </div>
          <p className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted-foreground shadow-soft">
            <MousePointerClick className="size-4 text-primary" />
            {concepts.length} interactive concept diagrams and growing.
          </p>
        </div>
      </section>

      {/* Learning paths */}
      <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
        <SectionHeading
          eyebrow="Learning paths"
          title="Follow a connected sequence"
          description="Paths order the diagrams so each one builds on the last."
          action={
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/learning-paths">
                View all paths <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {learningPaths.map((p) => (
            <PathCard key={p.slug} path={p} />
          ))}
        </div>
      </section>

      {/* Closing band */}
      <section className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-border bg-surface p-8 shadow-lift sm:p-14">
          <div className="absolute inset-0 bg-aurora opacity-60" aria-hidden="true" />
          <div className="absolute inset-0 bg-grid-fine opacity-50" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <p className="flex items-center gap-2 eyebrow">
              <Waypoints className="size-3.5" /> Ready when you are
            </p>
            <h2 className="mt-4 text-[1.9rem] font-extrabold leading-tight sm:text-[2.6rem]">
              One diagram is worth a thousand paragraphs.
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted-foreground">
              Begin with cloud computing — the concept everything else in modern IT leans on.
            </p>
            <Button asChild size="lg" className="mt-8 rounded-full px-8 shadow-glow">
              <Link to="/concepts/$slug" params={{ slug: "what-is-cloud-computing" }}>
                Start with Cloud Computing <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
