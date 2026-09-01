import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowRight,
  BookMarked,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  Lightbulb,
  ListOrdered,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";
import { AlertingDiagram } from "@/components/diagram/AlertingDiagram";
import { ApiDiagram } from "@/components/diagram/ApiDiagram";
import { ClientServerDiagram } from "@/components/diagram/ClientServerDiagram";
import { CloudAiDiagram } from "@/components/diagram/CloudAiDiagram";
import { CdnDiagram } from "@/components/diagram/CdnDiagram";
import { CloudComputingDiagram } from "@/components/diagram/CloudComputingDiagram";
import { CloudNetworkDiagram } from "@/components/diagram/CloudNetworkDiagram";
import { CloudSecurityDiagram } from "@/components/diagram/CloudSecurityDiagram";



import { ComputerDiagram } from "@/components/diagram/ComputerDiagram";
import { ContainersDiagram } from "@/components/diagram/ContainersDiagram";
import { DatabaseDiagram } from "@/components/diagram/DatabaseDiagram";
import { DiagramCanvas } from "@/components/diagram/DiagramCanvas";
import { IacDiagram } from "@/components/diagram/IacDiagram";
import { LoadBalancerDiagram } from "@/components/diagram/LoadBalancerDiagram";
import { ObservabilityDiagram } from "@/components/diagram/ObservabilityDiagram";
import { OperatingSystemDiagram } from "@/components/diagram/OperatingSystemDiagram";
import { ModernWorkDiagram } from "@/components/diagram/ModernWorkDiagram";
import { MonolithMicroservicesDiagram } from "@/components/diagram/MonolithMicroservicesDiagram";
import { PipelineDiagram } from "@/components/diagram/PipelineDiagram";
import { RegionsZonesDiagram } from "@/components/diagram/RegionsZonesDiagram";
import { ServiceModelsDiagram } from "@/components/diagram/ServiceModelsDiagram";
import { ServerDiagram } from "@/components/diagram/ServerDiagram";
import { VirtualMachineDiagram } from "@/components/diagram/VirtualMachineDiagram";

import { DifficultyBadge } from "@/components/site/cards";
import { conceptBySlug } from "@/content/concepts";
import { topicBySlug } from "@/content/topics";
import { canonical, socialMeta } from "@/lib/site";

export const Route = createFileRoute("/concepts/$slug")({
  loader: ({ params }) => {
    const concept = conceptBySlug(params.slug);
    if (!concept) throw notFound();
    return { concept };
  },
  head: ({ params, loaderData }) => {
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
    const path = `/concepts/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: concept.intro },
        ...socialMeta({ title, description: concept.intro, path, type: "article" }),
      ],
      links: [{ rel: "canonical", href: canonical(path) }],
    };
  },
  component: ConceptPage,
});

function Panel({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-xl border border-border bg-surface shadow-soft">
          <Icon className="size-4 text-primary" />
        </span>
        <h2 className="eyebrow">{title}</h2>
        <span className="hidden flex-1 rule-gradient sm:block" />
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ConceptPage() {
  const { concept } = Route.useLoaderData();
  const topic = topicBySlug(concept.topic);
  const next = concept.next ? conceptBySlug(concept.next) : undefined;
  const hasBody = Boolean(
    concept.whatYouAreLookingAt ||
      concept.howItWorks ||
      concept.whyItMatters ||
      concept.misconception,
  );

  return (
    <article>
      {/* Stage header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-aurora opacity-55" aria-hidden="true" />
        <div className="absolute inset-0 bg-dots opacity-40" aria-hidden="true" />
        <div
          className="absolute inset-x-0 bottom-0 h-32"
          aria-hidden="true"
          style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-8 sm:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground"
          >
            <Link to="/explore" className="transition-colors hover:text-foreground">
              Explore
            </Link>
            <ChevronRight className="size-3.5 opacity-60" />
            {topic && (
              <>
                <Link
                  to="/topics/$topic"
                  params={{ topic: topic.slug }}
                  className="transition-colors hover:text-foreground"
                >
                  {topic.name}
                </Link>
                <ChevronRight className="size-3.5 opacity-60" />
              </>
            )}
            {concept.subArea && (
              <>
                <span>{concept.subArea}</span>
                <ChevronRight className="size-3.5 opacity-60" />
              </>
            )}
            <span className="font-medium text-foreground">{concept.title}</span>
          </nav>

          <header className="reveal mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-[2.3rem] font-extrabold leading-[1.03] sm:text-[3.4rem]">
                {concept.title}
              </h1>
              <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
                {concept.intro}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <DifficultyBadge level={concept.difficulty} />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-soft">
                <Clock className="size-3.5" /> {concept.estimatedMinutes} min
              </span>
              {topic && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold text-muted-foreground shadow-soft">
                  <Sparkles className="size-3.5 text-primary" /> {topic.name}
                </span>
              )}
            </div>
          </header>

          <div className="reveal mt-12" style={{ animationDelay: "120ms" }}>
            {concept.slug === "what-is-cloud-computing" ? (
              <CloudComputingDiagram />
            ) : concept.slug === "iaas-paas-saas" ? (
              <ServiceModelsDiagram />
            ) : concept.slug === "what-is-ci-cd" ? (
              <PipelineDiagram />
            ) : concept.slug === "what-is-a-load-balancer" ? (
              <LoadBalancerDiagram />
            ) : concept.slug === "what-are-containers" ? (
              <ContainersDiagram />
            ) : concept.slug === "what-is-a-virtual-machine" ? (
              <VirtualMachineDiagram />
            ) : concept.slug === "what-is-an-api" ? (
              <ApiDiagram />
            ) : concept.slug === "what-is-a-database" ? (
              <DatabaseDiagram />
            ) : concept.slug === "client-server-architecture" ? (
              <ClientServerDiagram />
            ) : concept.slug === "monolith-vs-microservices" ? (
              <MonolithMicroservicesDiagram />
            ) : concept.slug === "what-is-a-cdn" ? (
              <CdnDiagram />
            ) : concept.slug === "cloud-networking-basics" ? (
              <CloudNetworkDiagram />
            ) : concept.slug === "regions-and-availability-zones" ? (
              <RegionsZonesDiagram />
            ) : concept.slug === "monitoring-vs-observability" ? (
              <ObservabilityDiagram />
            ) : concept.slug === "cloud-security-basics" ? (
              <CloudSecurityDiagram />
            ) : concept.slug === "ai-in-the-cloud" ? (
              <CloudAiDiagram />
            ) : concept.slug === "microsoft-cloud-and-modern-work" ? (
              <ModernWorkDiagram />
            ) : concept.slug === "infrastructure-as-code" ? (
              <IacDiagram />
            ) : concept.slug === "monitoring-and-alerting" ? (
              <AlertingDiagram />
            ) : concept.slug === "what-is-a-server" ? (
              <ServerDiagram />
            ) : concept.slug === "what-is-a-computer" ? (
              <ComputerDiagram />
            ) : concept.slug === "what-is-an-operating-system" ? (
              <OperatingSystemDiagram />







            ) : (

              <DiagramCanvas diagram={concept.diagram} title={concept.title} stage />
            )}
          </div>

        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div
          className={
            hasBody
              ? "mt-16 grid gap-14 lg:grid-cols-[minmax(0,1fr)_340px]"
              : "mt-16 grid gap-14"
          }
        >
          <div className={hasBody ? "space-y-16" : "hidden"}>
            {concept.whatYouAreLookingAt && (
              <Panel title="What you are looking at" icon={Eye}>
                <div className="space-y-4 text-[16px] leading-[1.75] text-muted-foreground">
                  {concept.whatYouAreLookingAt.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </Panel>
            )}

            {concept.howItWorks && (
              <Panel title="How it works" icon={ListOrdered}>
                <ol className="space-y-3">
                  {concept.howItWorks.map((s, i) => (
                    <li
                      key={s.step}
                      className="group relative flex gap-4 overflow-hidden rounded-2xl p-5 shadow-soft transition-colors surface-card hover:border-primary/30"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                        style={{
                          background: "linear-gradient(to bottom, var(--primary), var(--cyan))",
                        }}
                      />
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary font-mono text-[11px] font-bold text-primary-foreground shadow-glow">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[15.5px] leading-relaxed">
                        <span className="font-semibold">{s.step}.</span>{" "}
                        <span className="text-muted-foreground">{s.text}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Panel>
            )}

            {concept.whyItMatters && (
              <Panel title="Why it matters" icon={Target}>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {concept.whyItMatters.map((p) => (
                    <li
                      key={p}
                      className="rounded-2xl border border-border bg-surface p-4 text-[14.5px] leading-relaxed text-muted-foreground shadow-soft"
                    >
                      <span className="mb-2.5 block h-1 w-8 rounded-full bg-cyan" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {concept.misconception && (
              <Panel title="Common misconception" icon={TriangleAlert}>
                <div className="relative overflow-hidden rounded-2xl border border-border p-6 shadow-soft">
                  <span
                    className="absolute inset-0"
                    aria-hidden="true"
                    style={{
                      background:
                        "linear-gradient(120deg, color-mix(in oklab, var(--violet) 8%, transparent), transparent 60%)",
                    }}
                  />
                  <p className="relative text-[16px] font-semibold leading-snug">
                    “{concept.misconception.claim}”
                  </p>
                  <div className="relative mt-4 rule-gradient" />
                  <p className="relative mt-4 text-[15px] leading-relaxed text-muted-foreground">
                    {concept.misconception.reality}
                  </p>
                </div>
              </Panel>
            )}

            {concept.realWorldExample && (
              <Panel title="Real-world example" icon={Lightbulb}>
                <div className="rounded-2xl p-6 shadow-soft surface-card">
                  <p className="flex items-start gap-3 text-[15.5px] leading-relaxed text-muted-foreground">
                    <Lightbulb className="mt-0.5 size-5 shrink-0 text-ember" />
                    {concept.realWorldExample}
                  </p>
                </div>
              </Panel>
            )}
          </div>

          <aside className="space-y-14 lg:sticky lg:top-24 lg:self-start">
            {concept.keyTerms && (
              <Panel title="Key terms" icon={BookMarked}>
                <dl className="space-y-2.5">
                  {concept.keyTerms.map((t) => (
                    <div
                      key={t.term}
                      className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-primary/30"
                    >
                      <dt className="text-[13.5px] font-bold">{t.term}</dt>
                      <dd className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                        {t.definition}
                      </dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            )}

            {concept.sources && (
              <Panel title="Sources" icon={ExternalLink}>
                <ul className="space-y-2.5">
                  {concept.sources.map((s) => (
                    <li key={s.url}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2.5 rounded-2xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
                      >
                        <ExternalLink className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span className="text-[13.5px]">
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
          <section className="mb-24 mt-24">
            <Link
              to="/concepts/$slug"
              params={{ slug: next.slug }}
              className="group relative flex flex-col overflow-hidden rounded-[28px] border border-border bg-surface p-7 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lift sm:flex-row sm:items-center sm:justify-between sm:p-10"
            >
              <span className="absolute inset-0 bg-aurora opacity-50" aria-hidden="true" />
              <span className="absolute inset-0 bg-grid-fine opacity-40" aria-hidden="true" />
              <span className="relative">
                <span className="eyebrow">Next concept</span>
                <span className="mt-3 block font-display text-[1.6rem] font-extrabold tracking-tight sm:text-[2rem]">
                  {next.title}
                </span>
                <span className="mt-3 block max-w-xl text-[14.5px] leading-relaxed text-muted-foreground">
                  {next.intro}
                </span>
              </span>
              <span className="relative mt-7 inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform duration-500 group-hover:translate-x-1.5 sm:mt-0">
                <ArrowRight className="size-5" />
              </span>
            </Link>
          </section>
        )}
      </div>
    </article>
  );
}
