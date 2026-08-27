import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Eye, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { topics } from "@/content/topics";
import { canonical, socialMeta } from "@/lib/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Tech in Diagrams" },
      { name: "description", content: "Tech in Diagrams is a diagram-first learning platform for understanding modern IT: no long articles, no quizzes, just clear visuals." },
      ...socialMeta({ title: "About — Tech in Diagrams", description: "Tech in Diagrams is a diagram-first learning platform for understanding modern IT: no long articles, no quizzes, just clear visuals.", path: "/about" }),
    ],
    links: [{ rel: "canonical", href: canonical("/about") }],
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
    <div>
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-aurora opacity-55" aria-hidden="true" />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-4xl px-5 py-16 sm:px-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-primary shadow-soft backdrop-blur">
            About
          </p>
          <h1 className="reveal mt-6 text-[2.3rem] font-extrabold leading-[1.03] sm:text-[3.25rem]">
            Understand IT, <span className="text-gradient-brand">one diagram at a time.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
            Tech in Diagrams is a visual learning platform for beginners, students, career changers
            and non-technical professionals. Most IT material explains systems in paragraphs;
            systems are shaped like graphs. So we start with the graph.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-5 pb-24 pt-16 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {principles.map((p, i) => (
            <div
              key={p.title}
              className="hairline-top surface-card group relative overflow-hidden rounded-3xl p-6 shadow-soft transition-transform duration-500 hover:-translate-y-1"
            >
              <span className="text-[11px] font-bold tracking-[0.2em] text-muted-foreground/70">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-4 flex size-11 items-center justify-center rounded-2xl border border-border bg-surface-tint">
                <p.icon className="size-5 text-primary" />
              </span>
              <h2 className="mt-4 text-base font-bold">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>


        <section className="mt-20">
          <h2 className="text-2xl font-bold sm:text-3xl">What a concept page contains</h2>
          <ul className="mt-6 space-y-3 text-[15px] leading-relaxed text-muted-foreground">
            {[
              "A large interactive diagram with hover highlighting and click-through explanations.",
              "What you are looking at, how it works, and why it matters — in a few sentences each.",
              "Compact key terms, one common misconception and one real-world example.",
              "Links to official sources, then a clear next concept.",
            ].map((line) => (
              <li key={line} className="flex gap-3">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {line}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[15px] font-semibold leading-relaxed text-foreground">
            No long articles. No quizzes. No blog.
          </p>
        </section>

        <section className="mt-20">
          <h2 className="text-2xl font-bold sm:text-3xl">Four learning areas</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {topics.map((t) => (
              <Link
                key={t.slug}
                to="/topics/$topic"
                params={{ topic: t.slug }}
                className="hairline-top surface-card rounded-3xl p-6 shadow-soft transition-transform duration-500 hover:-translate-y-1"
              >
                <h3 className="text-base font-bold">{t.name}</h3>
                <p className="mt-1 text-sm font-semibold text-primary">{t.tagline}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                  {t.subAreas.join(" · ")}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className="relative mt-20 overflow-hidden rounded-[28px] border border-border bg-surface p-10 text-center shadow-lift">
          <div className="absolute inset-0 bg-aurora opacity-60" aria-hidden="true" />
          <div className="absolute inset-0 bg-grid-fine opacity-40" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-2xl font-bold sm:text-3xl">Start with cloud computing</h2>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              The first full concept diagram explains what cloud computing actually is — including
              the infrastructure that never went away.
            </p>
            <Button asChild size="lg" className="mt-7 rounded-full px-7 shadow-glow">
              <Link to="/concepts/$slug" params={{ slug: "what-is-cloud-computing" }}>
                Open the diagram <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

