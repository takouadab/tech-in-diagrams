import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Clock, MousePointerClick, Sparkles, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConceptMotif } from "@/components/diagram/ConceptMotif";
import { HeroSystemMap } from "@/components/diagram/HeroSystemMap";
import { ConceptCard, DifficultyBadge, PathCard, SectionHeading, TopicCard } from "@/components/site/cards";
import { concepts, conceptsByTopic, featuredConcepts } from "@/content/concepts";
import { learningPaths } from "@/content/paths";
import { topics } from "@/content/topics";
import { canonical, socialMeta } from "@/lib/site";

const HOME_TITLE = "Tech in Diagrams — Learn IT Visually";
const HOME_DESCRIPTION =
  "Understand IT, one diagram at a time. Explore cloud, architecture, DevOps and core IT concepts through clear interactive diagrams.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      ...socialMeta({ title: HOME_TITLE, description: HOME_DESCRIPTION, path: "/" }),
    ],
    links: [{ rel: "canonical", href: canonical("/") }],
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
  const [lead, ...rest] = featuredConcepts;

  return (
    <div>
      {/* Hero — editorial split: headline block left, system map dominant right */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-aurora opacity-70 animate-drift" aria-hidden="true" />
        <div className="absolute inset-0 bg-dots opacity-[0.5]" aria-hidden="true" />
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          aria-hidden="true"
          style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
        />

        <div className="relative mx-auto w-full max-w-[92rem] px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
          <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <span className="reveal inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft backdrop-blur">
                <Sparkles className="size-3.5 text-primary" />
                Understand IT, one diagram at a time
              </span>
              <h1
                className="reveal mt-6 text-[2.75rem] font-extrabold leading-[0.94] sm:text-[4.25rem] xl:text-[5rem]"
                style={{ animationDelay: "80ms" }}
              >
                Learn IT <span className="text-gradient-brand">visually.</span>
              </h1>
              <p
                className="reveal mt-5 max-w-lg text-[16.5px] leading-relaxed text-muted-foreground"
                style={{ animationDelay: "160ms" }}
              >
                Cloud, architecture, DevOps and core IT — explained through crafted interactive
                diagrams instead of long articles.
              </p>
              <div
                className="reveal mt-8 flex flex-col gap-3 sm:flex-row"
                style={{ animationDelay: "240ms" }}
              >
                <Button asChild size="lg" className="rounded-full px-8 shadow-glow">
                  <Link to="/learn">Start Learning</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full border-border-strong bg-surface/70 px-8 backdrop-blur"
                >
                  <Link to="/explore">Explore Topics</Link>
                </Button>
              </div>
            </div>

            <dl
              className="reveal grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 lg:col-span-5 lg:pb-2"
              style={{ animationDelay: "320ms" }}
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="block font-display text-[1.75rem] font-extrabold tracking-tight">
                      {s.value}
                    </span>
                    <span className="mt-1 block text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {s.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="reveal mt-12" style={{ animationDelay: "200ms" }}>
            <HeroSystemMap />
          </div>

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

      {/* Featured concepts — asymmetric: one lead, two supporting */}
      <section className="relative border-y border-border bg-surface-sunken">
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="flex items-center gap-2 eyebrow">
                <span className="h-px w-6 bg-primary/50" />
                Diagram first
              </p>
              <h2 className="mt-3 max-w-lg text-[1.75rem] font-bold leading-tight sm:text-[2.3rem]">
                Three diagrams to start with
              </h2>
            </div>
            <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Each concept opens with a large interactive diagram. Hover to trace connections, click
              a node for a short, precise explanation.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            {lead && (
              <Link
                to="/concepts/$slug"
                params={{ slug: lead.slug }}
                className="group lift-hover relative flex flex-col overflow-hidden rounded-[28px] border border-border bg-surface p-3 shadow-soft lg:col-span-7"
              >
                <ConceptMotif slug={lead.slug} className="min-h-[260px]" />
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <DifficultyBadge level={lead.difficulty} />
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                      <Clock className="size-3.5" /> {lead.estimatedMinutes} min
                    </span>
                  </div>
                  <h3 className="mt-4 text-[1.5rem] font-bold leading-snug sm:text-[1.75rem]">
                    {lead.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                    {lead.intro}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Open the diagram
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            )}

            <div className="grid gap-6 lg:col-span-5">
              {rest.map((c) => (
                <div key={c.slug} className="flex flex-col gap-4">
                  <Link
                    to="/concepts/$slug"
                    params={{ slug: c.slug }}
                    aria-label={`Open ${c.title}`}
                    className="block transition-transform duration-500 hover:-translate-y-1"
                  >
                    <ConceptMotif slug={c.slug} />
                  </Link>
                  <ConceptCard concept={c} className="flex-1" />
                </div>
              ))}
            </div>
          </div>

          <p className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted-foreground shadow-soft">
            <MousePointerClick className="size-4 text-primary" />
            {concepts.length} interactive concept diagrams and growing.
          </p>
          <Button asChild variant="outline" className="ml-3 rounded-full bg-surface">
            <Link to="/explore">
              All concepts <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
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
