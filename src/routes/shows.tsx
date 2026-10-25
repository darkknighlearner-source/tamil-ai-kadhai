import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ShowCard } from "@/components/show-card";
import type { Show } from "@/lib/types";

export const Route = createFileRoute("/shows")({
  component: ShowsPage,
  head: () => ({
    meta: [
      {"title": "All shows \u2014 Tamil AI Vanoli"} ,
      {"name": "description", "content": "Browse Tamil AI Vanoli channels for news, comedy, cinema, motivation, and stories."} ,
      {"property": "og:title", "content": "All shows \u2014 Tamil AI Vanoli"} ,
      {"property": "og:description", "content": "Browse Tamil AI Vanoli channels for news, comedy, cinema, motivation, and stories."} ,
      {"property": "og:type", "content": "website"} ,
      {"name": "twitter:card", "content": "summary"} ,
    ],
  }),
});

function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  useEffect(() => {
    supabase
      .from("shows")
      .select("*")
      .eq("is_active", true)
      .order("created_at")
      .then((r) => setShows((r.data ?? []) as Show[]));
  }, []);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6">
        <h1 className="font-serif text-4xl text-foreground">All channels</h1>
        <p className="mt-2 text-sm text-muted-foreground">Original Tamil AI radio formats.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shows.map((s) => (
            <ShowCard key={s.id} show={s} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
