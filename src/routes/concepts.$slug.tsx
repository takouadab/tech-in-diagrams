import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, Clock, ExternalLink, Lightbulb, TriangleAlert } from "lucide-react";
import { DiagramCanvas } from "@/components/diagram/DiagramCanvas";
import { DifficultyBadge } from "@/components/site/cards";
import { conceptBySlug } from "@/content/concepts";
import { topicBySlug } from "@/content/topics";

export const Route = createFileRoute("/concepts/$slug")({
  loader: ({ params }) => {
    const concept = conceptBySlug(params.slug);
    if (!concept) throw notFound();
    return { concept };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Concept not found — Tech in Diagrams" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { concept } = loaderData;
    const title = `${concept.title} — Tech in Diagrams`;
    return {
      meta: [
        { title },
        { name: "description", content: concept.intro },
        { property: "og:title", content: title },
        { property: "og:description", content: concept.intro },
      ],
    };
  },
  component: ConceptPage,
});

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ConceptPage() {
  const { concept } = Route.useLoaderData();
  const topic = topicBySlug(concept.topic);
  const next = concept.next ? conceptBySlug(concept.next) : undefined;

  return (
    <article className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/explore" className="hover:text-foreground">
          Explore
        </Link>
        <ChevronRight className="size-3.5" />
        {topic && (
          <>
            <Link to="/topics/$topic" params={{ topic: topic.slug }} className="hover:text-foreground">
              {topic.name}
            </Link>
            <ChevronRight className="size-3.5" />
          </>
        )}
        {concept.subArea && (
          <>
            <span>{concept.subArea}</span>
            <ChevronRight className="size-3.5" />
          </>
        )}
        <span className="font-medium text-foreground">{concept.title}</span>
      </nav>

      <header className="mt-6">
        <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">{concept.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <DifficultyBadge level={concept.difficulty} />
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-4" /> {concept.estimatedMinutes} min read
          </span>
          {topic && <span className="text-sm text-muted-foreground">· {topic.name}</span>}
        </div>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
          {concept.intro}
        </p>
      </header>

      <div className="mt-10">
        <DiagramCanvas diagram={concept.diagram} title={concept.title} />
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-12">
          {concept.whatYouAreLookingAt && (
            <Panel title="What you are looking at">
              <div className="space-y-3 text-[15px] leading-relaxed text-muted-foreground">
                {concept.whatYouAreLookingAt.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </Panel>
          )}

          {concept.howItWorks && (
            <Panel title="How it works">
              <ol className="space-y-3">
                {concept.howItWorks.map((s, i) => (
                  <li
                    key={s.step}
                    className="flex gap-4 rounded-2xl border border-border bg-surface p-4 shadow-soft"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="text-[15px] leading-relaxed">
                      <span className="font-semibold">{s.step}.</span>{" "}
                      <span className="text-muted-foreground">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Panel>
          )}

          {concept.whyItMatters && (
            <Panel title="Why it matters">
              <ul className="space-y-3">
                {concept.whyItMatters.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan" />
                    {p}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {concept.misconception && (
            <Panel title="Common misconception">
              <div className="rounded-2xl border border-border bg-surface-tint p-5">
                <p className="flex items-start gap-2.5 text-[15px] font-semibold">
                  <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-violet" />
                  {concept.misconception.claim}
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {concept.misconception.reality}
                </p>
              </div>
            </Panel>
          )}

          {concept.realWorldExample && (
            <Panel title="Real-world example">
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
                <p className="flex items-start gap-2.5 text-[15px] leading-relaxed text-muted-foreground">
                  <Lightbulb className="mt-0.5 size-4.5 shrink-0 text-primary" />
                  {concept.realWorldExample}
                </p>
              </div>
            </Panel>
          )}
        </div>

        <aside className="space-y-12">
          {concept.keyTerms && (
            <Panel title="Key terms">
              <dl className="space-y-3">
                {concept.keyTerms.map((t) => (
                  <div key={t.term} className="rounded-xl border border-border bg-surface p-4">
                    <dt className="text-sm font-bold">{t.term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {t.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </Panel>
          )}

          {concept.sources && (
            <Panel title="Sources & further reading">
              <ul className="space-y-2.5">
                {concept.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-2 rounded-xl border border-border bg-surface p-3.5 transition-colors hover:border-primary/40"
                    >
                      <ExternalLink className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm">
                        <span className="font-semibold">{s.label}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {s.publisher}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </aside>
      </div>

      {next && (
        <section className="mt-20">
          <Link
            to="/concepts/$slug"
            params={{ slug: next.slug }}
            className="group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-surface-tint p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <span
              className="absolute inset-0 opacity-40"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(600px 200px at 90% 50%, color-mix(in oklab, var(--cyan) 16%, transparent), transparent)",
              }}
            />
            <span className="relative">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Next concept
              </span>
              <span className="mt-2 block text-2xl font-bold">{next.title}</span>
              <span className="mt-2 block max-w-xl text-sm leading-relaxed text-muted-foreground">
                {next.intro}
              </span>
            </span>
            <span className="relative mt-6 inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-1 sm:mt-0">
              <ArrowRight className="size-5" />
            </span>
          </Link>
        </section>
      )}
    </article>
  );
}
