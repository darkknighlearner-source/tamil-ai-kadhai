import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { LivePlayer } from "@/components/live-player";
import type { EpisodeWithShow, ScriptShape, SourceRef } from "@/lib/types";
import { ExternalLink, MessageCircle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/episodes/$episodeId")({
  head: () => ({
    meta: [
      {"title": "Episode replay \u2014 Tamil AI Vanoli"} ,
      {"name": "description", "content": "Replay a Tamil AI Vanoli episode and read its original script and source references."} ,
      {"property": "og:title", "content": "Episode replay \u2014 Tamil AI Vanoli"} ,
      {"property": "og:description", "content": "Replay a Tamil AI Vanoli episode and read its original script and source references."} ,
      {"property": "og:type", "content": "website"} ,
      {"name": "twitter:card", "content": "summary"} ,
    ],
  }),
  component: EpisodeDetailPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">Episode not found</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">Back home</Link>
      </div>
    </div>
  ),
});

function EpisodeDetailPage() {
  const { episodeId } = Route.useParams();
  const [ep, setEp] = useState<EpisodeWithShow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("episodes")
      .select("*, shows(name, accent_color, format_type)")
      .eq("id", episodeId)
      .maybeSingle()
      .then((r) => {
        setEp((r.data ?? null) as EpisodeWithShow | null);
        setLoading(false);
      });
  }, [episodeId]);

  if (!loading && !ep) throw notFound();

  const script = (ep?.script ?? {}) as ScriptShape;
  const lines = script.lines ?? [];
  const sourceLinks =
    (ep?.source_links as SourceRef[] | null | undefined) ?? script.source_references ?? [];

  return (
    <div className="min-h-screen bg-background bg-radial-ember">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6">
        <LivePlayer episode={ep} />

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <h2 className="font-serif text-2xl text-foreground">Script</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Original AI-generated Tamil script. Not a transcript of any other broadcast.
            </p>

            <div className="mt-6 space-y-4">
              {lines.length === 0 ? (
                <p className="text-sm text-muted-foreground">No script content.</p>
              ) : (
                lines.map((l, i) => <ScriptBubble key={i} speaker={l.speaker} text={l.text} />)
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <ExternalLink className="h-3.5 w-3.5" /> Sources
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                {sourceLinks.length === 0 ? (
                  <li className="text-muted-foreground">No external sources for this segment.</li>
                ) : (
                  sourceLinks.map((s, i) => (
                    <li key={i}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {s.title}
                      </a>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {script.voice_direction && (
              <div className="rounded-2xl border border-border/60 bg-card p-5">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <MessageCircle className="h-3.5 w-3.5" /> Voice direction
                </div>
                <p className="mt-2 text-sm text-foreground/90">{script.voice_direction}</p>
              </div>
            )}

            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" /> Editorial
              </div>
              <p className="mt-2 text-sm text-foreground/90">
                AI-generated radio content based on public sources and verified inputs.
              </p>
              {ep?.moderation_notes && (
                <p className="mt-2 text-xs text-muted-foreground">{ep.moderation_notes}</p>
              )}
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ScriptBubble({ speaker, text }: { speaker: string; text: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-surface/60 p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-primary">{speaker}</div>
      <p className="mt-1.5 text-[15px] leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
