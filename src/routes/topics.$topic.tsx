import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ConceptCard, SectionHeading } from "@/components/site/cards";
import { conceptsByTopic } from "@/content/concepts";
import { topicBySlug, topics } from "@/content/topics";
import { canonical, socialMeta } from "@/lib/site";

export const Route = createFileRoute("/topics/$topic")({
  loader: ({ params }) => {
    const topic = topicBySlug(params.topic);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Area not found — Tech in Diagrams" }, { name: "robots", content: "noindex" }] };
    }
    const { topic } = loaderData;
    const title = `${topic.name} — Tech in Diagrams`;
    const path = `/topics/${params.topic}`;
    return {
      meta: [
        { title },
        { name: "description", content: topic.description },
        ...socialMeta({ title, description: topic.description, path }),
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
    };
  },
  component: TopicPage,
});

function TopicPage() {
  const { topic } = Route.useLoaderData();
  const list = conceptsByTopic(topic.slug);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8">
      <div className="relative -mx-5 overflow-hidden border-b border-border px-5 py-14 sm:-mx-8 sm:px-8">
        <div className="absolute inset-0 bg-aurora opacity-55" aria-hidden="true" />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
        <div className="relative">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-[13px] text-muted-foreground"
          >
            <Link to="/learn" className="transition-colors hover:text-foreground">
              Learn
            </Link>
            <ChevronRight className="size-3.5 opacity-60" />
            <span className="font-medium text-foreground">{topic.name}</span>
          </nav>

          <h1 className="reveal mt-7 text-[2.3rem] font-extrabold leading-[1.03] sm:text-[3.25rem]">
            {topic.name}
          </h1>
          <p className="mt-3 text-[15px] font-bold uppercase tracking-[0.16em] text-primary">
            {topic.tagline}
          </p>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
            {topic.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {topic.subAreas.map((s) => (
              <span
                key={s}
                className="rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground shadow-soft backdrop-blur"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Concepts"
          title={`${list.length} diagrams in this area`}
          description="Every concept opens with an interactive diagram."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
