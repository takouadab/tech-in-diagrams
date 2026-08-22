import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/learn", label: "Learn" },
  { to: "/explore", label: "Explore" },
  { to: "/learning-paths", label: "Learning Paths" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-border bg-background/70 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link to="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-surface shadow-soft transition-shadow duration-500 group-hover:shadow-glow">
            <Network className="size-4.5 text-primary" strokeWidth={2.2} />
          </span>
          <span className="font-display text-[15px] font-extrabold tracking-tight">
            Tech in Diagrams
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeProps={{ className: "text-foreground bg-surface border-border shadow-soft" }}
              inactiveProps={{ className: "text-muted-foreground border-transparent" }}
              className="rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-all duration-300 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-3 rounded-full px-4 shadow-glow">
            <Link to="/learn">Start Learning</Link>
          </Button>
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface shadow-soft md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="animate-fade-rise border-t border-border bg-surface/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
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
