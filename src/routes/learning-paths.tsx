import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flag, Route as RouteIcon } from "lucide-react";
import { DifficultyBadge, PageIntro } from "@/components/site/cards";
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
    <div>
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-aurora opacity-55" aria-hidden="true" />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
          <PageIntro
            eyebrow="Learning Paths"
            title={
              <>
                Connected sequences <span className="text-gradient-brand">of diagrams.</span>
              </>
            }
            description="Each path is ordered so every diagram builds on the previous one — a visual route rather than a reading list."
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl space-y-20 px-5 py-20 sm:px-8">
        {learningPaths.map((path) => (
          <section
            key={path.slug}
            className="relative overflow-hidden rounded-[28px] border border-border bg-surface p-5 shadow-soft sm:p-9"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 45%, transparent), transparent)",
              }}
            />
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-border bg-surface-tint shadow-soft">
                <RouteIcon className="size-5 text-primary" />
              </span>
              <h2 className="text-[1.5rem] font-bold sm:text-[1.75rem]">{path.name}</h2>
              <DifficultyBadge level={path.level} />
              <span className="font-mono text-[11px] tracking-widest text-muted-foreground">
                {String(path.steps.length).padStart(2, "0")} STEPS
              </span>
            </div>
            <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-muted-foreground">
              {path.summary}
            </p>

            {/* connected flow */}
            <div className="relative mt-10">
              <span
                aria-hidden="true"
                className="absolute left-4 top-0 hidden h-full w-px lg:block"
                style={{
                  background:
                    "linear-gradient(to bottom, color-mix(in oklab, var(--primary) 45%, transparent), color-mix(in oklab, var(--cyan) 40%, transparent), transparent)",
                }}
              />
              <ol className="space-y-4">
                {path.steps.map((s, i) => {
                  const concept = conceptBySlug(s.slug);
                  return (
                    <li key={s.slug} className="relative lg:pl-14">
                      <span
                        aria-hidden="true"
                        className="absolute left-0 top-6 hidden size-8 items-center justify-center rounded-full border border-border bg-surface font-mono text-[11px] font-bold text-primary shadow-soft lg:flex"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Link
                        to="/concepts/$slug"
                        params={{ slug: s.slug }}
                        className="group flex flex-col gap-3 rounded-2xl p-5 shadow-soft transition-all duration-400 surface-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift sm:flex-row sm:items-center sm:gap-6"
                      >
                        <span className="flex items-center gap-3 sm:w-72 sm:shrink-0">
                          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] font-bold text-primary lg:hidden">
                            {i + 1}
                          </span>
                          <span className="font-display text-[1.02rem] font-bold leading-snug">
                            {s.title}
                          </span>
                        </span>
                        {concept && (
                          <span className="flex-1 text-[14px] leading-relaxed text-muted-foreground">
                            {concept.intro}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary">
                          Open
                          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </li>
                  );
                })}
                <li className="relative lg:pl-14">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-2 hidden size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow lg:flex"
                  >
                    <Flag className="size-3.5" />
                  </span>
                  <p className="pt-2.5 text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Path complete
                  </p>
                </li>
              </ol>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
