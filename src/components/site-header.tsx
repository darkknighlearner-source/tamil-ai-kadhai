import { Link } from "@tanstack/react-router";
import { Radio, LayoutDashboard, Send } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-ember shadow-glow">
            <Radio className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg text-foreground">Tamil AI Vanoli</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              தமிழ் AI வானொலி
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground bg-accent" }}
          >
            Live
          </Link>
          <Link
            to="/shows"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground bg-accent" }}
          >
            Shows
          </Link>
          <Link
            to="/schedule"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground bg-accent" }}
          >
            Schedule
          </Link>
          <Link
            to="/submit"
            className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-sm text-foreground bg-accent" }}
          >
            Submit
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/submit"
            className="hidden items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-xs text-foreground transition-colors hover:bg-accent sm:inline-flex"
          >
            <Send className="h-3.5 w-3.5" /> Request topic
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-ember px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
          >
            <LayoutDashboard className="h-3.5 w-3.5" /> Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
