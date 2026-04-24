import { useEffect, useState } from "react";
import { Play, Pause, SkipForward, Heart, Share2, Volume2 } from "lucide-react";
import { Waveform } from "./waveform";
import type { EpisodeWithShow } from "@/lib/types";
import { Link } from "@tanstack/react-router";

interface LivePlayerProps {
  episode: EpisodeWithShow | null;
}

export function LivePlayer({ episode }: LivePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!playing || !episode) return;
    const total = episode.duration_seconds ?? 600;
    const t = setInterval(() => {
      setProgress((p) => {
        const next = p + 1;
        return next >= total ? 0 : next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [playing, episode]);

  const total = episode?.duration_seconds ?? 600;
  const accent = (episode?.shows?.accent_color as string | undefined) ?? "#e85d3a";

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-border/70 bg-surface-elevated p-6 shadow-elevated sm:p-9"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 10%, rgba(232,93,58,0.18), transparent 55%), radial-gradient(circle at 90% 90%, rgba(240,160,96,0.10), transparent 55%)",
      }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* Album artwork / RJ disc */}
        <div className="relative flex h-44 w-44 shrink-0 items-center justify-center self-center sm:h-52 sm:w-52">
          <div
            className="absolute inset-0 rounded-full opacity-70 blur-2xl"
            style={{ background: accent }}
          />
          <div
            className="spin-slow relative h-full w-full rounded-full border-4 border-background/40 shadow-elevated"
            style={{
              background: `conic-gradient(from 0deg, ${accent}, oklch(0.20 0.008 60), ${accent})`,
            }}
          >
            <div className="absolute inset-3 rounded-full bg-background/85 backdrop-blur" />
            <div
              className="absolute inset-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background"
              style={{ background: accent }}
            />
          </div>
          {playing && (
            <span className="pulse-live absolute -top-1 right-2 inline-flex h-3 w-3 rounded-full bg-primary" />
          )}
        </div>

        {/* Now playing */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              On Air
            </span>
            {episode?.shows?.name && (
              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {episode.shows.name}
              </span>
            )}
          </div>

          <h2 className="mt-2 font-serif text-2xl leading-tight text-foreground sm:text-3xl">
            {episode?.title ?? "Tuning into Tamil AI Vanoli…"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {episode?.city ? `${episode.city} · ` : ""}AI-generated · Original Tamil script
          </p>

          <div className="mt-5">
            <Waveform active={playing} bars={36} />
            <div className="mt-3 flex items-center gap-3 text-[11px] tabular-nums text-muted-foreground">
              <span>{formatTime(progress)}</span>
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-border/60">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-ember"
                  style={{ width: `${(progress / total) * 100}%` }}
                />
              </div>
              <span>{formatTime(total)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setPlaying((p) => !p)}
              disabled={!episode}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-ember px-6 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.03] disabled:opacity-50"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Pause" : "Listen now"}
            </button>
            <IconBtn label="Skip"><SkipForward className="h-4 w-4" /></IconBtn>
            <IconBtn label="Like"><Heart className="h-4 w-4" /></IconBtn>
            <IconBtn label="Share"><Share2 className="h-4 w-4" /></IconBtn>
            <IconBtn label="Volume"><Volume2 className="h-4 w-4" /></IconBtn>
            {episode && (
              <Link
                to="/episodes/$episodeId"
                params={{ episodeId: episode.id }}
                className="ml-auto rounded-full border border-border bg-surface px-3.5 py-2 text-xs text-foreground/90 transition-colors hover:bg-accent"
              >
                Open episode →
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function IconBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground/85 transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
