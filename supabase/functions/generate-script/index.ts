import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an original Tamil AI radio scriptwriter for "Tamil AI Vanoli" — an independent AI internet radio station.

STRICT RULES:
- Create FRESH original Tamil RJ scripts based ONLY on the provided source summaries and admin notes.
- DO NOT copy any source wording. Paraphrase entirely in your own conversational Tamil.
- DO NOT invent facts. If a fact is uncertain, say "உறுதி இல்ல" or skip it.
- DO NOT imitate or reference Suryan FM, Chinna Thambi Periya Thambi, Degree Kaapi, or any existing radio brand, RJ, jingle, or show.
- Keep tone natural, local, funny, and radio-friendly. Use conversational Tamil mixed with common English words listeners actually use.
- For serious news (politics, religion, caste, crime, health, finance, legal, emergency): stay respectful, neutral, factual. NO comedy on serious news.
- For comedy: clean only — no insults, caste, religion, politics attack, body shaming, adult content.
- Always include source attribution at the end of factual segments.
- Output STRICT JSON matching the requested schema. No markdown, no commentary.`;

const SHOW_FORMATS: Record<string, string> = {
  morning_news_comedy: `Format: "Kaapi Kadhai" morning news comedy.
Structure:
1. Opening line (warm Tamil greeting, no copied jingles)
2. 3 important headlines (paraphrased, neutral)
3. One local update for the city
4. One light comedy observation (clean)
5. One useful fact
6. One motivational closing line
7. Song intro placeholder line
Single speaker: AI RJ Aanav. Duration ~10 min.`,

  two_character_comedy: `Format: "Rendu Peru Radio" two-character comedy.
Characters:
- Kutty: curious, innocent, asks relatable everyday questions
- Periya: witty, mature, sarcastic-but-respectful, explains the topic
Structure: Topic intro -> back-and-forth comedy -> factual explanation -> local Tamil slang -> clean punchline -> source mention.
NO insults, caste, religion, politics, body-shaming, or adult content.`,

  cinema_talk: `Format: "Cinema Sandhai" cinema entertainment talk.
Structure: trending movie update -> actor/industry update -> audience question -> fun poll line -> song intro placeholder.
Single speaker. Light, fun, respectful. No personal attacks on celebrities.`,

  city_local: `Format: "Ooru Update" hyper-local city update.
Structure: city greeting -> weather/public alert if known -> local event -> traffic/travel note -> business/community spotlight -> closing line + source.
Single speaker. Factual, helpful, local pride tone.`,

  motivation: `Format: "Velicham" short Tamil motivation.
Structure: relatable opening -> 1 short story or example -> 1 practical takeaway -> closing line. Single speaker. Warm, grounded, no preaching.`,

  night_stories: `Format: "Iravu Kadhai" original Tamil bedtime story for adults.
Structure: setting -> characters -> gentle conflict -> resolution -> calm closing. Single narrator. Soothing, original, safe content.`,

  kids_stories: `Format: "Chinnanchiru Kadhaigal" short Tamil kids story.
Structure: friendly opening -> simple story with one moral -> closing line. Single narrator. Safe, kind, no scary themes.`,
};

interface NewsItemInput {
  title: string;
  summary: string;
  url?: string;
  city?: string;
}

interface GenerateBody {
  show_id: string;
  show_name: string;
  format_type: string;
  city?: string;
  news_items?: NewsItemInput[];
  admin_notes?: string;
  duration_estimate?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as GenerateBody;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const formatGuide =
      SHOW_FORMATS[body.format_type] ??
      `Format: ${body.format_type}. Single Tamil RJ speaker, ~8-10 min, original content.`;

    const sourcesBlock =
      body.news_items && body.news_items.length > 0
        ? body.news_items
            .map(
              (n, i) =>
                `(${i + 1}) ${n.title}\nSummary: ${n.summary}\nCity: ${n.city ?? "—"}\nURL: ${n.url ?? "—"}`,
            )
            .join("\n\n")
        : "(No external sources — use admin notes only.)";

    const userPrompt = `Generate a Tamil radio episode script.

Show: ${body.show_name}
Format type: ${body.format_type}
City: ${body.city ?? "All Tamil Nadu"}
Duration target: ${body.duration_estimate ?? 600} seconds

${formatGuide}

Source summaries:
${sourcesBlock}

Admin notes:
${body.admin_notes ?? "(none)"}

Return ONLY valid JSON in this exact shape:
{
  "show_title": string,
  "episode_title": string,
  "language": "ta",
  "city": string|null,
  "duration_estimate": number,
  "characters": string[],
  "lines": [{ "speaker": string, "text": string }],
  "source_references": [{ "title": string, "url": string }],
  "moderation_notes": string,
  "voice_direction": string
}`;

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
        }),
      },
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429)
        return new Response(
          JSON.stringify({
            error: "Rate limited. Please try again in a minute.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      if (aiResp.status === 402)
        return new Response(
          JSON.stringify({
            error:
              "AI credits exhausted. Add funds in Settings > Workspace > Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const raw = aiData?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { error: "Invalid JSON from model", raw };
    }

    return new Response(JSON.stringify({ script: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-script error", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
