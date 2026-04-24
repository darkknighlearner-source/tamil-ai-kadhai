// Fetch news from RSS / NewsAPI / GDELT sources, dedupe, store.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FetchBody {
  source_id?: string; // if omitted, fetch all active sources
  limit_per_source?: number;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function stripHtml(s: string) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function clip(s: string, n = 400) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

// Tiny RSS/Atom parser — extracts title/link/description/pubDate
function parseRss(xml: string) {
  const items: { title: string; url: string; summary: string; published_at: string | null }[] = [];
  const itemRegex = /<(item|entry)[\s\S]*?<\/(item|entry)>/g;
  const matches = xml.match(itemRegex) ?? [];
  for (const block of matches) {
    const title = stripHtml((block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? "")
      .replace(/<!\[CDATA\[|\]\]>/g, ""));
    const link = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1] ?? "").trim()
      || block.match(/<link[^>]*href=["']([^"']+)["']/)?.[1] ?? "";
    const desc = stripHtml((block.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1]
      ?? block.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]
      ?? block.match(/<content[^>]*>([\s\S]*?)<\/content>/)?.[1]
      ?? "").replace(/<!\[CDATA\[|\]\]>/g, ""));
    const pub = (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/)?.[1]
      ?? block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/)?.[1]
      ?? block.match(/<published[^>]*>([\s\S]*?)<\/published>/)?.[1] ?? "").trim();
    if (title && link) {
      items.push({
        title: clip(title, 250),
        url: link,
        summary: clip(desc, 600),
        published_at: pub ? new Date(pub).toISOString() : null,
      });
    }
  }
  return items;
}

async function fetchRss(url: string, limit: number) {
  const res = await fetch(url, { headers: { "User-Agent": "TamilAIVanoli/1.0" } });
  if (!res.ok) throw new Error(`RSS ${res.status}`);
  return parseRss(await res.text()).slice(0, limit);
}

async function fetchNewsApi(apiKey: string, params: { category?: string; city?: string; lang?: string }, limit: number) {
  const q = encodeURIComponent(params.city ? `${params.city}` : "Tamil Nadu");
  const url = `https://newsapi.org/v2/everything?q=${q}&language=${params.lang ?? "en"}&pageSize=${limit}&sortBy=publishedAt&apiKey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
  const data = await res.json();
  return (data.articles ?? []).map((a: any) => ({
    title: clip(a.title ?? "", 250),
    url: a.url,
    summary: clip(a.description ?? a.content ?? "", 600),
    published_at: a.publishedAt ?? null,
  }));
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json().catch(() => ({}))) as FetchBody;
    const limit = body.limit_per_source ?? 10;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let q = supabase.from("sources").select("*").eq("is_active", true);
    if (body.source_id) q = q.eq("id", body.source_id);
    const { data: sources, error: srcErr } = await q;
    if (srcErr) throw srcErr;

    const summary: { source: string; fetched: number; inserted: number; skipped: number; error?: string }[] = [];

    for (const src of sources ?? []) {
      let fetched: { title: string; url: string; summary: string; published_at: string | null }[] = [];
      try {
        if (src.type === "rss" && src.url) {
          fetched = await fetchRss(src.url, limit);
        } else if (src.type === "api" && src.api_provider === "newsapi") {
          const key = Deno.env.get("NEWSAPI_KEY");
          if (!key) throw new Error("NEWSAPI_KEY not configured");
          fetched = await fetchNewsApi(key, { category: src.category, city: src.city, lang: src.language }, limit);
        } else {
          summary.push({ source: src.name, fetched: 0, inserted: 0, skipped: 0, error: "Unsupported type for auto-fetch" });
          continue;
        }
      } catch (e) {
        summary.push({ source: src.name, fetched: 0, inserted: 0, skipped: 0, error: (e as Error).message });
        continue;
      }

      let inserted = 0;
      let skipped = 0;
      for (const it of fetched) {
        const hash = await sha256((it.title + "|" + it.url).toLowerCase());
        const { data: existing } = await supabase.from("news_items").select("id").eq("duplicate_hash", hash).maybeSingle();
        if (existing) { skipped++; continue; }
        const { error: insErr } = await supabase.from("news_items").insert({
          source_id: src.id,
          title: it.title,
          summary: it.summary,
          url: it.url,
          category: src.category,
          city: src.city,
          published_at: it.published_at,
          credibility_score: src.credibility_score ?? 0.8,
          duplicate_hash: hash,
          status: "collected",
          approved: false,
        });
        if (!insErr) inserted++;
      }
      summary.push({ source: src.name, fetched: fetched.length, inserted, skipped });
    }

    return new Response(JSON.stringify({ ok: true, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fetch-news error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
