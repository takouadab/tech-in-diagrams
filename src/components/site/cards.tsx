import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Concept, LearningPath, Topic } from "@/content/types";

const levelTone: Record<string, string> = {
  Beginner: "var(--cyan)",
  Intermediate: "var(--primary)",
  Advanced: "var(--violet)",
};

export function DifficultyBadge({ level }: { level: string }) {
  const tone = levelTone[level] ?? "var(--primary)";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{
        borderColor: `color-mix(in oklab, ${tone} 32%, transparent)`,
        background: `color-mix(in oklab, ${tone} 8%, transparent)`,
        color: `color-mix(in oklab, ${tone} 70%, var(--foreground))`,
      }}
    >
      <span className="size-1.5 rounded-full" style={{ background: tone }} />
      {level}
    </span>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="reveal max-w-3xl">
      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 shadow-soft eyebrow">
        <span className="size-1.5 rounded-full bg-primary" />
        {eyebrow}
      </span>
      <h1 className="mt-5 text-[2.1rem] font-extrabold leading-[1.05] sm:text-[3.25rem]">{title}</h1>
      {description && (
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </div>
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
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="flex items-center gap-2 eyebrow">
            <span className="h-px w-6 bg-primary/50" />
            {eyebrow}
          </p>
        )}
        <h2 className="mt-3 text-[1.6rem] font-bold leading-tight sm:text-[2.1rem]">{title}</h2>
        {description && (
          <p className="mt-3.5 text-[15.5px] leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function TopicCard({ topic, count, index }: { topic: Topic; count: number; index?: number }) {
  return (
    <Link
      to="/topics/$topic"
      params={{ topic: topic.slug }}
      className="group hairline-top lift-hover relative flex flex-col overflow-hidden rounded-3xl p-6 shadow-soft surface-card"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--primary) 26%, transparent), transparent 70%)",
        }}
      />
      <div className="relative flex items-start justify-between">
        <span className="font-mono text-xs font-medium tracking-widest text-muted-foreground/70">
          {String((index ?? 0) + 1).padStart(2, "0")}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          <Layers className="size-3 text-primary" /> {count}
        </span>
      </div>
      <h3 className="relative mt-6 text-[1.15rem] font-bold leading-snug">{topic.name}</h3>
      <p className="relative mt-1.5 text-[13px] font-semibold uppercase tracking-wider text-primary">
        {topic.tagline}
      </p>
      <p className="relative mt-3.5 text-sm leading-relaxed text-muted-foreground">
        {topic.description}
      </p>
      <span className="relative mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
        Open area
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
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
        "group hairline-top lift-hover relative flex flex-col overflow-hidden rounded-3xl p-5 shadow-soft surface-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <DifficultyBadge level={concept.difficulty} />
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Clock className="size-3.5" /> {concept.estimatedMinutes} min
        </span>
      </div>
      <h3 className="mt-4 text-[1.02rem] font-bold leading-snug">{concept.title}</h3>
      <p className="mt-2.5 line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
        {concept.intro}
      </p>
      <div className="mt-4 rule-gradient" />
      <span className="mt-3.5 inline-flex items-center justify-between text-[13px] font-semibold text-primary">
        View diagram
        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function PathCard({ path }: { path: LearningPath }) {
  return (
    <Link
      to="/learning-paths"
      className="group hairline-top lift-hover relative block overflow-hidden rounded-3xl p-6 shadow-soft surface-card"
    >
      <div className="flex items-center justify-between">
        <DifficultyBadge level={path.level} />
        <span className="font-mono text-[11px] tracking-widest text-muted-foreground">
          {String(path.steps.length).padStart(2, "0")} STEPS
        </span>
      </div>
      <h3 className="mt-5 text-[1.15rem] font-bold">{path.name}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{path.summary}</p>
      <PathTrack steps={path.steps} />
    </Link>
  );
}

export function PathTrack({ steps }: { steps: { slug: string; title: string }[] }) {
  return (
    <ol className="mt-6 space-y-0">
      {steps.map((s, i) => (
        <li key={s.slug} className="relative flex gap-3.5 pb-4 last:pb-0">
          {i < steps.length - 1 && (
            <span
              className="absolute left-[13px] top-7 h-[calc(100%-16px)] w-px"
              style={{
                background:
                  "linear-gradient(to bottom, color-mix(in oklab, var(--primary) 35%, transparent), var(--border))",
              }}
            />
          )}
          <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-[10px] font-bold text-primary shadow-soft">
            {i + 1}
          </span>
          <span className="pt-1 text-[13.5px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">
            {s.title}
          </span>
        </li>
      ))}
    </ol>
  );
}
