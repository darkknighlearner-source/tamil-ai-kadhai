// Generate Sarvam TTS audio for an episode's script lines, concatenate, upload to Storage.
// Body: { episode_id: string }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScriptLine { speaker: string; text: string; voice_direction?: string }

const SARVAM_TTS_URL = "https://api.sarvam.ai/text-to-speech";
const DEFAULT_SPEAKER = "anushka";
const DEFAULT_LANG = "ta-IN";

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

async function sarvamTTS(apiKey: string, text: string, speaker: string, lang: string, pace: number, pitch: number): Promise<Uint8Array> {
  // Sarvam supports up to ~500 chars/segment; chunk by sentence boundaries.
  const chunks: string[] = [];
  let buf = "";
  for (const part of text.split(/(?<=[.!?。.!?])\s+/)) {
    if ((buf + " " + part).trim().length > 450) {
      if (buf) chunks.push(buf.trim());
      buf = part;
    } else {
      buf = buf ? buf + " " + part : part;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());

  const audios: Uint8Array[] = [];
  for (const chunk of chunks) {
    const res = await fetch(SARVAM_TTS_URL, {
      method: "POST",
      headers: { "api-subscription-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: [chunk],
        target_language_code: lang,
        speaker,
        pitch,
        pace,
        loudness: 1.0,
        speech_sample_rate: 22050,
        enable_preprocessing: true,
        model: "bulbul:v2",
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Sarvam ${res.status}: ${t.slice(0, 300)}`);
    }
    const data = await res.json();
    const audio = data.audios?.[0];
    if (!audio) throw new Error("Sarvam returned no audio");
    audios.push(b64ToBytes(audio));
  }
  return concatBytes(audios);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { episode_id } = await req.json();
    if (!episode_id) throw new Error("episode_id required");

    const SARVAM_API_KEY = Deno.env.get("SARVAM_API_KEY");
    if (!SARVAM_API_KEY) throw new Error("SARVAM_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: ep, error: epErr } = await supabase.from("episodes").select("id, script, title").eq("id", episode_id).single();
    if (epErr) throw epErr;

    const { data: voices } = await supabase.from("voices").select("character_name, speaker, target_language_code, pace, pitch").eq("is_active", true);
    const voiceMap = new Map<string, any>();
    for (const v of voices ?? []) voiceMap.set((v.character_name || "").toLowerCase(), v);

    const script = ep.script as { lines?: ScriptLine[] } | null;
    const lines = script?.lines ?? [];
    if (lines.length === 0) throw new Error("Episode script has no lines");

    const segments: Uint8Array[] = [];
    for (const line of lines) {
      if (!line.text?.trim()) continue;
      const v = voiceMap.get((line.speaker || "").toLowerCase());
      const speaker = v?.speaker || DEFAULT_SPEAKER;
      const lang = v?.target_language_code || DEFAULT_LANG;
      const pace = Number(v?.pace ?? 1.0);
      const pitch = Number(v?.pitch ?? 0);
      const audio = await sarvamTTS(SARVAM_API_KEY, line.text, speaker, lang, pace, pitch);
      segments.push(audio);
    }

    const finalAudio = concatBytes(segments);
    const path = `${episode_id}/${Date.now()}.wav`;
    const { error: upErr } = await supabase.storage.from("episode-audio").upload(path, finalAudio, {
      contentType: "audio/wav",
      upsert: true,
    });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from("episode-audio").getPublicUrl(path);
    const audio_url = pub.publicUrl;

    // Estimate duration: WAV ~22050Hz mono 16-bit ≈ 44100 bytes/sec
    const duration_seconds = Math.max(1, Math.round(finalAudio.length / 44100));

    await supabase.from("episodes").update({ audio_url, duration_seconds }).eq("id", episode_id);

    return new Response(JSON.stringify({ ok: true, audio_url, duration_seconds, segments: segments.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-audio error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
