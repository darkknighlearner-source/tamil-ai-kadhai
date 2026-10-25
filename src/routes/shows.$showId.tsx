import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { EpisodeCard } from "@/components/episode-card";
import type { EpisodeWithShow, Show } from "@/lib/types";
import { Radio } from "lucide-react";

export const Route = createFileRoute("/shows/$showId")({
  head: () => ({
    meta: [
      {"title": "Show episodes \u2014 Tamil AI Vanoli"} ,
      {"name": "description", "content": "Explore a Tamil AI Vanoli show and its published episodes."} ,
      {"property": "og:title", "content": "Show episodes \u2014 Tamil AI Vanoli"} ,
      {"property": "og:description", "content": "Explore a Tamil AI Vanoli show and its published episodes."} ,
      {"property": "og:type", "content": "website"} ,
      {"name": "twitter:card", "content": "summary"} ,
    ],
  }),
  component: ShowDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">Show not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">Back home</Link>
      </div>
    </div>
  ),
});

function ShowDetailPage() {
  const { showId } = Route.useParams();
  const [show, setShow] = useState<Show | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeWithShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [s, e] = await Promise.all([
        supabase.from("shows").select("*").eq("id", showId).maybeSingle(),
        supabase
          .from("episodes")
          .select("*, shows(name, accent_color, format_type)")
          .eq("show_id", showId)
          .eq("status", "published")
          .order("published_at", { ascending: false }),
      ]);
      if (cancelled) return;
      setShow((s.data ?? null) as Show | null);
      setEpisodes((e.data ?? []) as EpisodeWithShow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [showId]);

  if (!loading && !show) throw notFound();

  const accent = show?.accent_color ?? "#e85d3a";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
        <section
          className="overflow-hidden rounded-3xl border border-border/70 bg-surface-elevated p-8"
          style={{ backgroundImage: `radial-gradient(circle at 80% 0%, ${accent}33, transparent 60%)` }}
        >
          <div className="flex items-start gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: `${accent}33`, color: accent }}
            >
              <Radio className="h-7 w-7" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {show?.format_type?.replace(/_/g, " ")}
              </div>
              <h1 className="mt-1 font-serif text-3xl text-foreground sm:text-4xl">{show?.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{show?.description}</p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-2xl">Episodes</h2>
          <div className="mt-4 grid gap-2.5">
            {episodes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 bg-surface/40 p-10 text-center text-sm text-muted-foreground">
                No published episodes yet for this show.
              </div>
            ) : (
              episodes.map((e) => <EpisodeCard key={e.id} episode={e} />)
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
