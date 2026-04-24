import { Link } from "@tanstack/react-router";
import type { EpisodeWithShow } from "@/lib/types";
import { Play, Clock } from "lucide-react";

export function EpisodeCard({ episode }: { episode: EpisodeWithShow }) {
  const accent = episode.shows?.accent_color ?? "#e85d3a";
  return (
    <Link
      to="/episodes/$episodeId"
      params={{ episodeId: episode.id }}
      className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 transition-all hover:border-primary/40 hover:bg-surface-elevated"
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${accent}22`, color: accent }}
      >
        <Play className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>{episode.shows?.name ?? "Show"}</span>
          {episode.city && <span>· {episode.city}</span>}
        </div>
        <div className="mt-0.5 truncate font-medium text-foreground">{episode.title}</div>
      </div>
      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
        <Clock className="h-3.5 w-3.5" />
        {Math.round((episode.duration_seconds ?? 600) / 60)}m
      </div>
    </Link>
  );
}
