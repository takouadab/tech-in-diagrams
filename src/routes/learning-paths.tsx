import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Route as RouteIcon } from "lucide-react";
import { DifficultyBadge } from "@/components/site/cards";
import { learningPaths } from "@/content/paths";
import { conceptBySlug } from "@/content/concepts";

export const Route = createFileRoute("/learning-paths")({
  head: () => ({
    meta: [
      { title: "Learning Paths — Tech in Diagrams" },
      {
        name: "description",
        content:
          "Three guided visual paths: IT Basics, Cloud Fundamentals and DevOps Foundations, each a connected sequence of diagrams.",
      },
      { property: "og:title", content: "Learning Paths — Tech in Diagrams" },
      {
        property: "og:description",
        content: "Follow connected diagram sequences instead of reading long articles.",
      },
    ],
  }),
  component: PathsPage,
});

function PathsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Learning Paths
      </p>
      <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">Connected sequences of diagrams</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        Each path is ordered so every diagram builds on the previous one.
      </p>

      <div className="mt-14 space-y-16">
        {learningPaths.map((path) => (
          <section key={path.slug} className="rounded-3xl border border-border bg-surface p-5 shadow-soft sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-tint">
                <RouteIcon className="size-5 text-primary" />
              </span>
              <h2 className="text-2xl font-bold">{path.name}</h2>
              <DifficultyBadge level={path.level} />
              <span className="text-xs text-muted-foreground">{path.steps.length} steps</span>
            </div>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
              {path.summary}
            </p>

            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {path.steps.map((s, i) => {
                const concept = conceptBySlug(s.slug);
                return (
                  <li key={s.slug} className="relative">
                    <Link
                      to="/concepts/$slug"
                      params={{ slug: s.slug }}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-surface-tint p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
                    >
                      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                        Step {i + 1}
                      </span>
                      <h3 className="mt-3 text-base font-bold leading-snug">{s.title}</h3>
                      {concept && (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                          {concept.intro}
                        </p>
                      )}
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                        Open diagram
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Link>
                    {i < path.steps.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-2.5 top-1/2 hidden size-1.5 rounded-full bg-primary sm:block"
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
