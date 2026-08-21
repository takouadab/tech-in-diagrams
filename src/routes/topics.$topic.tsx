import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ConceptCard, SectionHeading } from "@/components/site/cards";
import { conceptsByTopic } from "@/content/concepts";
import { topicBySlug, topics } from "@/content/topics";

export const Route = createFileRoute("/topics/$topic")({
  loader: ({ params }) => {
    const topic = topicBySlug(params.topic);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Area not found — Tech in Diagrams" }, { name: "robots", content: "noindex" }] };
    }
    const { topic } = loaderData;
    const title = `${topic.name} — Tech in Diagrams`;
    return {
      meta: [
        { title },
        { name: "description", content: topic.description },
        { property: "og:title", content: title },
        { property: "og:description", content: topic.description },
      ],
    };
  },
  component: TopicPage,
});

function TopicPage() {
  const { topic } = Route.useLoaderData();
  const list = conceptsByTopic(topic.slug);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/learn" className="hover:text-foreground">
          Learn
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{topic.name}</span>
      </nav>

      <h1 className="mt-6 text-3xl font-extrabold sm:text-5xl">{topic.name}</h1>
      <p className="mt-2 text-lg font-medium text-primary">{topic.tagline}</p>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {topic.description}
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        {topic.subAreas.map((s) => (
          <span
            key={s}
            className="rounded-full border border-border bg-surface-tint px-3.5 py-1.5 text-sm text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>

      <section className="mt-14">
        <SectionHeading
          eyebrow="Concepts"
          title={`${list.length} diagrams in this area`}
          description="Every concept opens with an interactive diagram."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => (
            <ConceptCard key={c.slug} concept={c} />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-xl font-bold">Other learning areas</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {topics
            .filter((t) => t.slug !== topic.slug)
            .map((t) => (
              <Link
                key={t.slug}
                to="/topics/$topic"
                params={{ topic: t.slug }}
                className="rounded-2xl border border-border bg-surface px-5 py-4 text-sm font-semibold shadow-soft transition-colors hover:border-primary/40"
              >
                {t.name}
                <span className="ml-2 font-normal text-muted-foreground">{t.tagline}</span>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
