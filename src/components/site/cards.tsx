import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Concept, LearningPath, Topic } from "@/content/types";

export function DifficultyBadge({ level }: { level: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-surface-tint px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
      {level}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
        )}
        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2>
        {description && (
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function TopicCard({ topic, count }: { topic: Topic; count: number }) {
  return (
    <Link
      to="/topics/$topic"
      params={{ topic: topic.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
    >
      <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary to-cyan opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Layers className="size-3.5 text-primary" /> {count} concepts
      </div>
      <h3 className="mt-4 text-lg font-bold">{topic.name}</h3>
      <p className="mt-1.5 text-sm font-medium text-primary">{topic.tagline}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
        Open area
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function ConceptCard({ concept, className }: { concept: Concept; className?: string }) {
  return (
    <Link
      to="/concepts/$slug"
      params={{ slug: concept.slug }}
      className={cn(
        "group flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <DifficultyBadge level={concept.difficulty} />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {concept.estimatedMinutes} min
        </span>
      </div>
      <h3 className="mt-4 text-base font-bold leading-snug">{concept.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {concept.intro}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        View diagram
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function PathCard({ path }: { path: LearningPath }) {
  return (
    <Link
      to="/learning-paths"
      className="group block rounded-2xl border border-border bg-surface p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <DifficultyBadge level={path.level} />
        <span className="text-xs text-muted-foreground">{path.steps.length} steps</span>
      </div>
      <h3 className="mt-4 text-lg font-bold">{path.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{path.summary}</p>
      <PathTrack steps={path.steps} />
    </Link>
  );
}

export function PathTrack({ steps }: { steps: { slug: string; title: string }[] }) {
  return (
    <ol className="mt-5 space-y-0">
      {steps.map((s, i) => (
        <li key={s.slug} className="relative flex gap-3 pb-4 last:pb-0">
          {i < steps.length - 1 && (
            <span className="absolute left-[13px] top-7 h-[calc(100%-16px)] w-px bg-border" />
          )}
          <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-tint text-[11px] font-bold text-primary">
            {i + 1}
          </span>
          <span className="pt-1 text-sm font-medium text-muted-foreground">{s.title}</span>
        </li>
      ))}
    </ol>
  );
}
