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
      { title: "All shows — Tamil AI Vanoli" },
      { name: "description", content: "Browse every Tamil AI Vanoli channel — comedy, news, cinema, kids, motivation, and more." },
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
