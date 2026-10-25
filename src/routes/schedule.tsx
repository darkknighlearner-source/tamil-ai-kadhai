import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Schedule, Show } from "@/lib/types";
import { Clock } from "lucide-react";

type ScheduleWithShow = Schedule & { shows: Pick<Show, "name" | "accent_color" | "format_type"> };

export const Route = createFileRoute("/schedule")({
  component: SchedulePage,
  head: () => ({
    meta: [
      {"title": "Daily schedule \u2014 Tamil AI Vanoli"} ,
      {"name": "description", "content": "View daily Tamil AI Vanoli show timings for morning, afternoon, evening, and night."} ,
      {"property": "og:title", "content": "Daily schedule \u2014 Tamil AI Vanoli"} ,
      {"property": "og:description", "content": "View daily Tamil AI Vanoli show timings for morning, afternoon, evening, and night."} ,
      {"property": "og:type", "content": "website"} ,
      {"name": "twitter:card", "content": "summary"} ,
    ],
  }),
});

function SchedulePage() {
  const [items, setItems] = useState<ScheduleWithShow[]>([]);
  useEffect(() => {
    supabase
      .from("schedules")
      .select("*, shows(name, accent_color, format_type)")
      .eq("is_active", true)
      .order("time_of_day")
      .then((r) => setItems((r.data ?? []) as ScheduleWithShow[]));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 pb-20 pt-10 sm:px-6">
        <h1 className="font-serif text-4xl text-foreground">Daily schedule</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tamil AI Vanoli daily timings (Indian Standard Time).
        </p>
        <div className="mt-8 space-y-3">
          {items.map((it) => {
            const accent = it.shows.accent_color ?? "#e85d3a";
            return (
              <div
                key={it.id}
                className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4"
              >
                <div
                  className="flex h-14 w-20 flex-col items-center justify-center rounded-lg text-sm font-medium"
                  style={{ background: `${accent}22`, color: accent }}
                >
                  <Clock className="mb-0.5 h-3.5 w-3.5" />
                  <span className="tabular-nums">{it.time_of_day.slice(0, 5)}</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">{it.shows.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    {it.shows.format_type.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
