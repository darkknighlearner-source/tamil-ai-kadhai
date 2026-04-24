import { Link } from "@tanstack/react-router";
import type { Show } from "@/lib/types";
import { Radio } from "lucide-react";

export function ShowCard({ show }: { show: Show }) {
  const accent = show.accent_color ?? "#e85d3a";
  return (
    <Link
      to="/shows/$showId"
      params={{ showId: show.id }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-glow"
    >
      <div
        className="absolute inset-x-0 top-0 h-28 opacity-60 transition-opacity group-hover:opacity-90"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${accent}55, transparent 65%)`,
        }}
      />
      <div className="relative">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: `${accent}22`, color: accent }}
        >
          <Radio className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-serif text-xl text-foreground">{show.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {show.description ?? "Original Tamil AI radio show."}
        </p>
        <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>{formatLabel(show.format_type)}</span>
          <span>{Math.round((show.default_duration ?? 600) / 60)} min</span>
        </div>
      </div>
    </Link>
  );
}

function formatLabel(t: string) {
  return t.replace(/_/g, " ");
}
