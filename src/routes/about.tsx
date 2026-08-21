import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Eye, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { topics } from "@/content/topics";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Tech in Diagrams" },
      {
        name: "description",
        content:
          "Tech in Diagrams is a diagram-first learning platform for understanding modern IT: no long articles, no quizzes, just clear visuals.",
      },
      { property: "og:title", content: "About Tech in Diagrams" },
      {
        property: "og:description",
        content: "Why diagrams are the product, and how each concept page is built.",
      },
    ],
  }),
  component: AboutPage,
});

const principles = [
  {
    icon: Eye,
    title: "The diagram is the lesson",
    text: "Every concept opens with a large interactive diagram. Text exists to support the visual, never to replace it.",
  },
  {
    icon: Ruler,
    title: "Precise, not simplified away",
    text: "Explanations stay short but technically correct, with official vendor and standards documentation linked on each concept.",
  },
  {
    icon: Compass,
    title: "One consistent visual language",
    text: "The same node shapes, connectors, flow animation and colour meanings are reused everywhere, so new topics feel familiar immediately.",
  },
];

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-14 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">About</p>
      <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">
        Understand IT, one diagram at a time.
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
        Tech in Diagrams is a visual learning platform for beginners, students, career changers and
        non-technical professionals. Most IT material explains systems in paragraphs; systems are
        shaped like graphs. So we start with the graph.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {principles.map((p) => (
          <div key={p.title} className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
            <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-tint">
              <p.icon className="size-5 text-primary" />
            </span>
            <h2 className="mt-4 text-base font-bold">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
          </div>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">What a concept page contains</h2>
        <ul className="mt-5 space-y-2.5 text-[15px] leading-relaxed text-muted-foreground">
          <li>A large interactive diagram with hover highlighting and click-through explanations.</li>
          <li>What you are looking at, how it works, and why it matters — in a few sentences each.</li>
          <li>Compact key terms, one common misconception and one real-world example.</li>
          <li>Links to official sources, then a clear next concept.</li>
        </ul>
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
          No long articles. No quizzes. No blog.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Four learning areas</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {topics.map((t) => (
            <Link
              key={t.slug}
              to="/topics/$topic"
              params={{ topic: t.slug }}
              className="rounded-2xl border border-border bg-surface p-5 shadow-soft transition-colors hover:border-primary/40"
            >
              <h3 className="text-base font-bold">{t.name}</h3>
              <p className="mt-1 text-sm text-primary">{t.tagline}</p>
              <p className="mt-2 text-sm text-muted-foreground">{t.subAreas.join(" · ")}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-16 rounded-3xl border border-border bg-surface-tint p-8 text-center">
        <h2 className="text-2xl font-bold">Start with cloud computing</h2>
        <p className="mx-auto mt-3 max-w-xl text-[15px] text-muted-foreground">
          The first full concept diagram explains what cloud computing actually is — including the
          infrastructure that never went away.
        </p>
        <Button asChild size="lg" className="mt-6 rounded-full px-7">
          <Link to="/concepts/$slug" params={{ slug: "what-is-cloud-computing" }}>
            Open the diagram <ArrowRight className="ml-1.5 size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
