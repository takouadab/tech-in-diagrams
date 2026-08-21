import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MousePointerClick, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiagramCanvas } from "@/components/diagram/DiagramCanvas";
import { ConceptCard, PathCard, SectionHeading, TopicCard } from "@/components/site/cards";
import { concepts, conceptsByTopic, featuredConcepts } from "@/content/concepts";
import { learningPaths } from "@/content/paths";
import { topics } from "@/content/topics";
import type { DiagramDef } from "@/content/types";

const heroDiagram: DiagramDef = {
  width: 1180,
  height: 340,
  nodes: [
    { id: "user", label: "User", sub: "Browser or app", kind: "actor", x: 110, y: 150, w: 160, h: 88, detail: "Someone makes a request — a click, a tap, an API call." },
    { id: "app", label: "Application", sub: "Interface & logic", kind: "service", x: 340, y: 150, w: 170, h: 88, detail: "Renders the experience and forwards work to backend services." },
    { id: "api", label: "API", sub: "Contract & auth", kind: "network", x: 570, y: 150, w: 160, h: 88, detail: "A stable, authenticated doorway into the system." },
    { id: "cloud", label: "Cloud services", sub: "Compute · queues · storage", kind: "service", x: 830, y: 150, w: 210, h: 88, detail: "Provider-operated capacity, provisioned on demand and billed by usage." },
    { id: "db", label: "Database", sub: "State", kind: "data", x: 1070, y: 80, w: 170, h: 76, detail: "The system's source of truth." },
    { id: "mon", label: "Monitoring", sub: "Signals", kind: "observe", x: 1070, y: 240, w: 170, h: 76, detail: "Metrics, logs and traces that show whether it all works." },
  ],
  edges: [
    { from: "user", to: "app", animated: true },
    { from: "app", to: "api", animated: true },
    { from: "api", to: "cloud", animated: true },
    { from: "cloud", to: "db", animated: true, bend: -20 },
    { from: "cloud", to: "mon", animated: true, bend: 20 },
  ],
  caption: "A request travelling through a modern system — hover or click any node.",
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

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid opacity-25" aria-hidden="true" />
        <div
          className="absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--primary) 22%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft">
              <Sparkles className="size-3.5 text-primary" />
              Understand IT, one diagram at a time
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Learn IT <span className="text-gradient-brand">visually.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Understand cloud, architecture, DevOps and core IT concepts through clear interactive
              diagrams and simple explanations.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full rounded-full px-7 sm:w-auto">
                <Link to="/learn">Start Learning</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full rounded-full px-7 sm:w-auto"
              >
                <Link to="/explore">Explore Topics</Link>
              </Button>
            </div>
          </div>

          <div className="mt-14">
            <DiagramCanvas diagram={heroDiagram} title="How a modern system handles a request" />
          </div>
        </div>
      </section>

      {/* Learning areas */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
        <SectionHeading
          eyebrow="Four learning areas"
          title="Start where you are"
          description="Every area is built from diagrams, not articles. Pick one and follow the connections."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((t) => (
            <TopicCard key={t.slug} topic={t} count={conceptsByTopic(t.slug).length} />
          ))}
        </div>
      </section>

      {/* Learn through diagrams */}
      <section className="border-y border-border bg-surface-tint">
        <div className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
          <SectionHeading
            eyebrow="Diagram first"
            title="Learn through diagrams"
            description="Each concept opens with a large interactive diagram. Hover to trace connections, click a node for a short, precise explanation."
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/explore">
                  All concepts <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            }
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {featuredConcepts.map((c) => (
              <div key={c.slug} className="flex flex-col gap-4">
                <Link
                  to="/concepts/$slug"
                  params={{ slug: c.slug }}
                  aria-label={`Open ${c.title}`}
                  className="block"
                >
                  <DiagramCanvas diagram={c.diagram} title={c.title} compact />
                </Link>
                <ConceptCard concept={c} />
              </div>
            ))}
          </div>
          <p className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MousePointerClick className="size-4 text-primary" />
            {concepts.length} interactive concept diagrams and growing.
          </p>
        </div>
      </section>

      {/* Learning paths */}
      <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8">
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
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {learningPaths.map((p) => (
            <PathCard key={p.slug} path={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
