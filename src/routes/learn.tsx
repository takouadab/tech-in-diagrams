import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConceptCard, PageIntro, PathTrack, SectionHeading } from "@/components/site/cards";
import { conceptBySlug, conceptsByTopic } from "@/content/concepts";
import { learningPaths } from "@/content/paths";
import { topics } from "@/content/topics";
import { ConceptMotif } from "@/components/diagram/ConceptMotif";
import { canonical, socialMeta } from "@/lib/site";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn — Tech in Diagrams" },
      { name: "description", content: "Start learning IT visually: begin with cloud computing, then follow the four learning areas and guided paths." },
      ...socialMeta({ title: "Learn — Tech in Diagrams", description: "Start learning IT visually: begin with cloud computing, then follow the four learning areas and guided paths.", path: "/learn" }),
    ],
    links: [{ rel: "canonical", href: canonical("/learn") }],
  }),
  component: LearnPage,
});

function LearnPage() {
  const start = conceptBySlug("what-is-cloud-computing")!;

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-aurora opacity-55" aria-hidden="true" />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
          <PageIntro
            eyebrow="Learn"
            title={
              <>
                A visual route through <span className="text-gradient-brand">modern IT.</span>
              </>
            }
            description="No long articles, no quizzes. Each step is a diagram you can interact with, followed by a short, precise explanation."
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
        <section className="relative overflow-hidden rounded-[28px] border border-border bg-surface p-5 shadow-lift sm:p-9">
          <div className="absolute inset-0 bg-grid-fine opacity-40" aria-hidden="true" />
          <div className="relative">
            <SectionHeading
              eyebrow="Start here"
              title={start.title}
              description={start.intro}
              action={
                <Button asChild className="rounded-full shadow-glow">
                  <Link to="/concepts/$slug" params={{ slug: start.slug }}>
                    Open concept <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              }
            />
            <div className="mt-9">
              <Link
                to="/concepts/$slug"
                params={{ slug: start.slug }}
                aria-label={`Open ${start.title}`}
                className="block transition-transform duration-500 hover:-translate-y-1"
              >
                <ConceptMotif slug={start.slug} className="min-h-[240px]" />
              </Link>
            </div>
          </div>
        </section>

        {topics.map((topic) => (
          <section key={topic.slug} className="mt-20">
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
            <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {conceptsByTopic(topic.slug).map((c) => (
                <ConceptCard key={c.slug} concept={c} />
              ))}
            </div>
          </section>
        ))}

        <section className="mt-24">
          <SectionHeading
            eyebrow="Guided"
            title="Or follow a learning path"
            description="Three ordered sequences that build up understanding step by step."
          />
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {learningPaths.map((p) => (
              <div
                key={p.slug}
                className="group hairline-top relative flex flex-col overflow-hidden rounded-3xl p-6 shadow-soft surface-card"
              >
                <h3 className="text-[1.15rem] font-bold">{p.name}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{p.summary}</p>
                <PathTrack steps={p.steps} />
                <Button asChild variant="outline" size="sm" className="mt-auto w-fit rounded-full">
                  <Link to="/learning-paths">View path</Link>
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
