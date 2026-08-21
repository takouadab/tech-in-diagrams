import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { ConceptCard } from "@/components/site/cards";
import { concepts } from "@/content/concepts";
import { topics } from "@/content/topics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore concept diagrams — Tech in Diagrams" },
      {
        name: "description",
        content:
          "Browse every interactive concept diagram across IT fundamentals, cloud computing, architecture and DevOps.",
      },
      { property: "og:title", content: "Explore concept diagrams — Tech in Diagrams" },
      {
        property: "og:description",
        content: "Filter the full diagram library by learning area and difficulty.",
      },
    ],
  }),
  component: ExplorePage,
});

const difficulties = ["Beginner", "Intermediate", "Advanced"] as const;

function ExplorePage() {
  const [topic, setTopic] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [query, setQuery] = useState("");

  const results = useMemo(
    () =>
      concepts.filter(
        (c) =>
          (topic === "all" || c.topic === topic) &&
          (level === "all" || c.difficulty === level) &&
          (query.trim() === "" ||
            (c.title + c.intro + (c.subArea ?? "")).toLowerCase().includes(query.toLowerCase())),
      ),
    [topic, level, query],
  );

  const chip = (isOn: boolean) =>
    cn(
      "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
      isOn
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-surface text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Explore</p>
      <h1 className="mt-3 text-3xl font-extrabold sm:text-5xl">The diagram library</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
        {concepts.length} concepts, each built around one interactive diagram.
      </p>

      <div className="mt-10 space-y-5 rounded-2xl border border-border bg-surface-tint p-5">
        <label className="relative block">
          <span className="sr-only">Search concepts</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, e.g. containers"
            className="w-full rounded-full border border-border bg-surface py-2.5 pl-10 pr-4 text-sm outline-none ring-ring/40 transition focus:ring-2"
          />
        </label>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by learning area">
            <button type="button" className={chip(topic === "all")} onClick={() => setTopic("all")}>
              All areas
            </button>
            {topics.map((t) => (
              <button
                key={t.slug}
                type="button"
                className={chip(topic === t.slug)}
                onClick={() => setTopic(t.slug)}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by difficulty">
            <button type="button" className={chip(level === "all")} onClick={() => setLevel("all")}>
              All levels
            </button>
            {difficulties.map((d) => (
              <button
                key={d}
                type="button"
                className={chip(level === d)}
                onClick={() => setLevel(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 text-sm text-muted-foreground" aria-live="polite">
        {results.length} concept{results.length === 1 ? "" : "s"}
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((c) => (
          <ConceptCard key={c.slug} concept={c} />
        ))}
      </div>
      {results.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No concepts match those filters yet.
        </p>
      )}
    </div>
  );
}
