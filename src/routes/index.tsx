import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LivePlayer } from "@/components/live-player";
import { ShowCard } from "@/components/show-card";
import { EpisodeCard } from "@/components/episode-card";
import { TAMIL_CITIES, type EpisodeWithShow, type Show } from "@/lib/types";
import { Sparkles, Info } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      {"title": "Tamil AI Vanoli \u2014 Live AI Tamil Radio"} ,
      {"name": "description", "content": "Listen to original AI-generated Tamil radio shows, city updates, comedy, cinema talk, and stories."} ,
      {"property": "og:title", "content": "Tamil AI Vanoli \u2014 Live AI Tamil Radio"} ,
      {"property": "og:description", "content": "Listen to original AI-generated Tamil radio shows, city updates, comedy, cinema talk, and stories."} ,
      {"property": "og:type", "content": "website"} ,
      {"name": "twitter:card", "content": "summary"} ,
    ],
  }),
});

function HomePage() {
  const [city, setCity] = useState<string>("All Tamil Nadu");
  const [shows, setShows] = useState<Show[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeWithShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [showsRes, epsRes] = await Promise.all([
        supabase.from("shows").select("*").eq("is_active", true).order("created_at"),
        supabase
          .from("episodes")
          .select("*, shows(name, accent_color, format_type)")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(12),
      ]);
      if (cancelled) return;
      setShows((showsRes.data ?? []) as Show[]);
      setEpisodes((epsRes.data ?? []) as EpisodeWithShow[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredEpisodes =
    city === "All Tamil Nadu"
      ? episodes
      : episodes.filter((e) => !e.city || e.city === city);

  const liveEpisode = filteredEpisodes[0] ?? episodes[0] ?? null;

  return (
    <div className="min-h-screen bg-background bg-radial-ember">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-10">
        {/* Hero */}
        <section className="mb-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" /> AI-powered Tamil radio
              </div>
              <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] text-foreground sm:text-5xl">
                Original Tamil shows,{" "}
                <span className="text-gradient-ember">always on air.</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                Tamil AI Vanoli streams original AI-generated radio — morning news comedy,
                two-character comedy talk, cinema chats, and hyper-local city updates. We do not
                copy any existing radio show or RJ.
              </p>
            </div>

            <CitySelector value={city} onChange={setCity} />
          </div>
        </section>

        <LivePlayer episode={liveEpisode} />

        {/* Disclosure ribbon */}
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-border/60 bg-surface/60 p-3.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p>
            <span className="text-foreground">AI-generated radio content based on public sources and verified inputs.</span>{" "}
            Source links are shown beside factual segments. Sensitive segments go through admin
            review before publishing.
          </p>
        </div>

        {/* Channels */}
        <section className="mt-14">
          <SectionTitle title="Channels" subtitle="Original Tamil show formats" />
          {loading ? (
            <SkeletonGrid />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shows.map((s) => (
                <ShowCard key={s.id} show={s} />
              ))}
            </div>
          )}
        </section>

        {/* Latest episodes */}
        <section className="mt-14">
          <SectionTitle
            title="Latest episodes"
            subtitle={city === "All Tamil Nadu" ? "Recently aired" : `For ${city}`}
          />
          {loading ? (
            <div className="space-y-2.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />
              ))}
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <EmptyState text="No episodes yet for this city. Check back soon." />
          ) : (
            <div className="grid gap-2.5">
              {filteredEpisodes.map((e) => (
                <EpisodeCard key={e.id} episode={e} />
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function CitySelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">City</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-border bg-surface-elevated px-3.5 py-1.5 text-sm text-foreground focus:border-primary focus:outline-none"
      >
        {TAMIL_CITIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <div>
        <h2 className="font-serif text-2xl text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-2xl bg-surface" />
      ))}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 bg-surface/40 p-10 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
