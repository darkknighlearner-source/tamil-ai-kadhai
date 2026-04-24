// Automated pipeline: for each active show (and its scheduled cities),
// fetch fresh news → generate Tamil script → save episode → generate audio.
// Sensitive categories (politics/religion/caste/crime/health/finance/legal) are
// saved with requires_approval=true so they don't go live until an admin approves.
//
// Body (all optional): { show_id?: string; city?: string; max_news?: number; skip_audio?: boolean }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SENSITIVE = new Set([
  "politics", "political", "religion", "religious", "caste",
  "crime", "health", "medical", "finance", "financial", "legal", "law",
  "emergency",
]);

function isSensitive(category?: string | null): boolean {
  if (!category) return false;
  return SENSITIVE.has(category.toLowerCase().trim());
}

async function callFn(supabaseUrl: string, serviceKey: string, name: string, body: unknown) {
  const res = await fetch(`${supabaseUrl}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
      apikey: serviceKey,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `${name} ${res.status}`);
  return data;
}

interface AutoBody {
  show_id?: string;
  city?: string;
  max_news?: number;
  skip_audio?: boolean;
  triggered_by?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SERVICE);

  let runId: string | null = null;
  try {
    const body = (await req.json().catch(() => ({}))) as AutoBody;
    const maxNews = body.max_news ?? 5;

    // Log run
    const { data: run } = await supabase.from("pipeline_runs").insert({
      triggered_by: body.triggered_by ?? "manual",
      show_id: body.show_id ?? null,
      city: body.city ?? null,
      status: "running",
    }).select("id").single();
    runId = run?.id ?? null;

    // 1. Fetch fresh news for all active sources
    let newsFetched = 0;
    try {
      const fr = await callFn(SUPABASE_URL, SERVICE, "fetch-news", { limit_per_source: maxNews }) as { summary?: { inserted: number }[] };
      newsFetched = (fr.summary ?? []).reduce((a, s) => a + (s.inserted ?? 0), 0);
    } catch (e) {
      console.warn("fetch-news failed (continuing):", (e as Error).message);
    }

    // 2. Pick shows to process
    let showsQuery = supabase.from("shows").select("*").eq("is_active", true);
    if (body.show_id) showsQuery = showsQuery.eq("id", body.show_id);
    const { data: shows, error: showsErr } = await showsQuery;
    if (showsErr) throw showsErr;

    let episodesCreated = 0;
    let pendingApproval = 0;
    let audioGenerated = 0;
    const errors: string[] = [];

    for (const show of shows ?? []) {
      const cities = body.city
        ? [body.city]
        : show.city
          ? [show.city]
          : ["Chennai"];

      for (const city of cities) {
        try {
          // 3. Pick recent unused approved news for this city/category
          const { data: newsItems } = await supabase
            .from("news_items")
            .select("*")
            .order("published_at", { ascending: false, nullsFirst: false })
            .limit(maxNews);

          const filtered = (newsItems ?? []).filter((n) =>
            !n.city || n.city.toLowerCase() === city.toLowerCase() || city.toLowerCase().includes("all"),
          ).slice(0, maxNews);

          if (filtered.length === 0 && show.format_type !== "kids_stories" && show.format_type !== "night_stories" && show.format_type !== "motivation") {
            // News-driven shows need news; skip if none.
            continue;
          }

          // 4. Generate script
          const scriptResp = await callFn(SUPABASE_URL, SERVICE, "generate-script", {
            show_id: show.id,
            show_name: show.name,
            format_type: show.format_type,
            city,
            news_items: filtered.map((n) => ({
              title: n.title, summary: n.summary ?? "", url: n.url ?? undefined, city: n.city ?? undefined,
            })),
            duration_estimate: show.default_duration ?? 600,
          }) as { script?: Record<string, unknown> };

          const script = scriptResp.script ?? {};

          // 5. Determine sensitivity from any used news category
          const sensitiveHit = filtered.find((n) => isSensitive(n.category));
          const requires_approval = !!sensitiveHit;

          // 6. Insert episode
          const { data: ep, error: insErr } = await supabase.from("episodes").insert({
            show_id: show.id,
            title: (script as { episode_title?: string }).episode_title ?? `${show.name} — ${new Date().toLocaleDateString()}`,
            script: script as never,
            status: requires_approval ? "pending_review" : "published",
            requires_approval,
            sensitive_category: sensitiveHit?.category ?? null,
            city,
            language: (script as { language?: string }).language ?? "ta",
            duration_seconds: (script as { duration_estimate?: number }).duration_estimate ?? show.default_duration ?? 600,
            source_links: ((script as { source_references?: unknown }).source_references ?? []) as never,
            moderation_notes: (script as { moderation_notes?: string }).moderation_notes ?? null,
            published_at: requires_approval ? null : new Date().toISOString(),
          }).select("id").single();

          if (insErr) { errors.push(`${show.name}/${city} insert: ${insErr.message}`); continue; }
          episodesCreated++;
          if (requires_approval) pendingApproval++;

          // 7. Generate audio (skip on stories/long content if requested)
          if (!body.skip_audio && ep) {
            try {
              await callFn(SUPABASE_URL, SERVICE, "generate-audio", { episode_id: ep.id });
              audioGenerated++;
            } catch (e) {
              errors.push(`${show.name}/${city} audio: ${(e as Error).message}`);
            }
          }
        } catch (e) {
          errors.push(`${show.name}/${city}: ${(e as Error).message}`);
        }
      }
    }

    const status = errors.length === 0 ? "success" : (episodesCreated > 0 ? "partial" : "failed");
    if (runId) {
      await supabase.from("pipeline_runs").update({
        status,
        news_fetched: newsFetched,
        episodes_created: episodesCreated,
        episodes_pending_approval: pendingApproval,
        audio_generated: audioGenerated,
        error: errors.length ? errors.slice(0, 5).join(" | ") : null,
        finished_at: new Date().toISOString(),
      }).eq("id", runId);
    }

    return new Response(JSON.stringify({
      ok: true,
      run_id: runId,
      news_fetched: newsFetched,
      episodes_created: episodesCreated,
      episodes_pending_approval: pendingApproval,
      audio_generated: audioGenerated,
      errors,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("auto-pipeline error", e);
    if (runId) {
      await supabase.from("pipeline_runs").update({
        status: "failed",
        error: e instanceof Error ? e.message : "unknown",
        finished_at: new Date().toISOString(),
      }).eq("id", runId);
    }
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
