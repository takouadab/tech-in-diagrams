import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Network } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/learn", label: "Learn" },
  { to: "/explore", label: "Explore" },
  { to: "/learning-paths", label: "Learning Paths" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface shadow-soft">
            <Network className="size-4.5 text-primary" strokeWidth={2.2} />
          </span>
          <span className="text-[15px] font-bold tracking-tight">Tech in Diagrams</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-foreground bg-secondary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-3 rounded-full px-4">
            <Link to="/learn">Start Learning</Link>
          </Button>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-rise border-t border-border bg-surface px-5 py-4 md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <Button asChild className="mt-2 rounded-full">
              <Link to="/learn" onClick={() => setOpen(false)}>
                Start Learning
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
