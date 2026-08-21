import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConceptCard, PathTrack, SectionHeading } from "@/components/site/cards";
import { conceptBySlug, conceptsByTopic } from "@/content/concepts";
import { learningPaths } from "@/content/paths";
import { topics } from "@/content/topics";
import { DiagramCanvas } from "@/components/diagram/DiagramCanvas";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Tech in Diagrams" },
      {
        name: "description",
        content:
          "Start learning IT visually: begin with cloud computing, then follow the four learning areas and guided paths.",
      },
      { property: "og:title", content: "Learn IT visually — Tech in Diagrams" },
      {
        property: "og:description",
        content: "A guided starting point across IT fundamentals, cloud, architecture and DevOps.",
      },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
  const start = conceptBySlug("what-is-cloud-computing")!;

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Learn</p>
      <h1 className="mt-3 max-w-3xl text-3xl font-extrabold sm:text-5xl">
        A visual route through modern IT
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        No long articles, no quizzes. Each step is a diagram you can interact with, followed by a
        short, precise explanation.
      </p>

      <section className="mt-12 rounded-3xl border border-border bg-surface-tint p-5 sm:p-8">
        <SectionHeading
          eyebrow="Start here"
          title={start.title}
          description={start.intro}
          action={
            <Button asChild className="rounded-full">
              <Link to="/concepts/$slug" params={{ slug: start.slug }}>
                Open concept <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-8">
          <Link
            to="/concepts/$slug"
            params={{ slug: start.slug }}
            aria-label={`Open ${start.title}`}
            className="block"
          >
            <DiagramCanvas diagram={start.diagram} title={start.title} compact />
          </Link>
        </div>
      </section>

      {topics.map((topic) => (
        <section key={topic.slug} className="mt-16">
          <SectionHeading
            eyebrow={topic.tagline}
            title={topic.name}
            description={topic.description}
            action={
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/topics/$topic" params={{ topic: topic.slug }}>
                  Open area <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            }
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {conceptsByTopic(topic.slug).map((c) => (
              <ConceptCard key={c.slug} concept={c} />
            ))}
          </div>
        </section>
      ))}

      <section className="mt-20">
        <SectionHeading
          eyebrow="Guided"
          title="Or follow a learning path"
          description="Three ordered sequences that build up understanding step by step."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {learningPaths.map((p) => (
            <div key={p.slug} className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
              <PathTrack steps={p.steps} />
              <Button asChild variant="outline" size="sm" className="mt-2 rounded-full">
                <Link to="/learning-paths">View path</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
