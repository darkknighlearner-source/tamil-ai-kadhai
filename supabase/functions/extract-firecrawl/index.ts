// Firecrawl-based extraction for approved public domains.
// Stores extracted page as a news_item for later AI summarization.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl";

interface Body {
  url: string;
  source_id?: string;
  category?: string;
  city?: string;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    if (!body.url) throw new Error("url is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY not configured (connect Firecrawl)");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Domain allowlist check
    if (body.source_id) {
      const { data: src } = await supabase.from("sources").select("url, approved_domain_only").eq("id", body.source_id).maybeSingle();
      if (src?.approved_domain_only && src.url) {
        try {
          const allowedHost = new URL(src.url).hostname.replace(/^www\./, "");
          const targetHost = new URL(body.url).hostname.replace(/^www\./, "");
          if (!targetHost.endsWith(allowedHost)) {
            throw new Error(`URL host '${targetHost}' not within approved domain '${allowedHost}'`);
          }
        } catch (e) {
          throw new Error(`Domain check failed: ${(e as Error).message}`);
        }
      }
    }

    const fcRes = await fetch(`${GATEWAY}/v2/scrape`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": FIRECRAWL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: body.url,
        formats: ["markdown", "summary"],
        onlyMainContent: true,
      }),
    });

    if (!fcRes.ok) {
      const t = await fcRes.text();
      throw new Error(`Firecrawl ${fcRes.status}: ${t}`);
    }
    const fc = await fcRes.json();
    const data = fc.data ?? fc;
    const title = (data.metadata?.title ?? body.url).slice(0, 250);
    const summary = (data.summary ?? data.markdown ?? "").slice(0, 1200);

    const hash = await sha256((title + "|" + body.url).toLowerCase());
    const { data: existing } = await supabase.from("news_items").select("id").eq("duplicate_hash", hash).maybeSingle();
    if (existing) {
      return new Response(JSON.stringify({ ok: true, news_item_id: existing.id, duplicate: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: inserted, error } = await supabase.from("news_items").insert({
      source_id: body.source_id ?? null,
      title,
      summary,
      url: body.url,
      category: body.category ?? "public",
      city: body.city ?? null,
      published_at: new Date().toISOString(),
      credibility_score: 0.85,
      duplicate_hash: hash,
      status: "collected",
      approved: false,
    }).select("id").single();
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true, news_item_id: inserted.id, title, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-firecrawl error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
