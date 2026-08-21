import { Link } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { topics } from "@/content/topics";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface-tint">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface">
              <Network className="size-4.5 text-primary" strokeWidth={2.2} />
            </span>
            <span className="text-[15px] font-bold">Tech in Diagrams</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Understand IT, one diagram at a time. A visual learning platform for beginners,
            students, career changers and non-technical professionals.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Learning areas
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {topics.map((t) => (
              <li key={t.slug}>
                <Link
                  to="/topics/$topic"
                  params={{ topic: t.slug }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Platform
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/learn" className="text-muted-foreground transition-colors hover:text-foreground">
                Learn
              </Link>
            </li>
            <li>
              <Link to="/explore" className="text-muted-foreground transition-colors hover:text-foreground">
                Explore
              </Link>
            </li>
            <li>
              <Link
                to="/learning-paths"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Learning Paths
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-5 py-6 text-center text-xs text-muted-foreground sm:px-8">
        Tech in Diagrams — educational diagrams and explanations. Always check official vendor
        documentation for implementation detail.
      </div>
    </footer>
  );
}
