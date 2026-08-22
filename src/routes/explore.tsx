import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { ConceptCard, PageIntro } from "@/components/site/cards";
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
      "rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-all duration-300",
      isOn
        ? "border-transparent bg-primary text-primary-foreground shadow-glow"
        : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
    );

  return (
    <div>
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-aurora opacity-55" aria-hidden="true" />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
          <PageIntro
            eyebrow="Explore"
            title={
              <>
                The <span className="text-gradient-brand">diagram library.</span>
              </>
            }
            description={`${concepts.length} concepts, each built around one interactive diagram you can hover, click and trace.`}
          />
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <div className="sticky top-20 z-30 space-y-5 rounded-[24px] p-5 shadow-soft glass">
          <label className="relative block">
            <span className="sr-only">Search concepts</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, e.g. containers"
              className="w-full rounded-full border border-border bg-surface py-3 pl-11 pr-4 text-sm outline-none ring-ring/30 transition focus:border-primary/40 focus:ring-4"
            />
          </label>

          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by learning area">
              <span className="mr-1 hidden items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:flex">
                <SlidersHorizontal className="size-3.5" /> Area
              </span>
              <button type="button" className={chip(topic === "all")} onClick={() => setTopic("all")}>
                All
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
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by difficulty">
              <span className="mr-1 hidden w-[4.6rem] text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:block">
                Level
              </span>
              <button type="button" className={chip(level === "all")} onClick={() => setLevel("all")}>
                All
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

        <p
          className="mt-10 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
          aria-live="polite"
        >
          {String(results.length).padStart(2, "0")} concept{results.length === 1 ? "" : "s"}
        </p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c, i) => (
            <ConceptCard
              key={c.slug}
              concept={c}
              className="reveal"
              // stagger reveal
              {...{ style: { animationDelay: `${Math.min(i, 9) * 40}ms` } }}
            />
          ))}
        </div>
        {results.length === 0 && (
          <p className="mt-10 rounded-[24px] border border-dashed border-border-strong p-14 text-center text-sm text-muted-foreground">
            No concepts match those filters yet.
          </p>
        )}
      </div>
    </div>
  );
}
