import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Episode, NewsItem, ScriptShape, Show, Source, UserRequest, Voice } from "@/lib/types";
import { Sparkles, Plus, FileText, CheckCircle2, XCircle, Clock, Users, Radio, Newspaper, Rss, Mic, Download, Globe } from "lucide-react";
import { toast } from "sonner";
import { invokeFn } from "@/lib/fn";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin — Tamil AI Vanoli" }] }),
});

type Tab = "overview" | "sources" | "news" | "generate" | "episodes" | "voices" | "requests";

function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Studio</div>
            <h1 className="mt-1 font-serif text-4xl text-foreground">Admin dashboard</h1>
          </div>
          <div className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs text-warning">
            Demo mode — admin actions are open. Add auth before going live.
          </div>
        </div>

        <nav className="mt-6 flex flex-wrap gap-1.5 border-b border-border/60 pb-px">
          {(
            [
              ["overview", "Overview", Radio],
              ["sources", "Sources", Rss],
              ["news", "News", Newspaper],
              ["generate", "Generate script", Sparkles],
              ["episodes", "Episodes", FileText],
              ["voices", "Voices", Mic],
              ["requests", "Requests", Users],
            ] as const
          ).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`inline-flex items-center gap-1.5 rounded-t-lg px-3.5 py-2 text-sm transition-colors ${
                tab === k
                  ? "bg-surface-elevated text-foreground border border-b-transparent border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {tab === "overview" && <OverviewTab />}
          {tab === "sources" && <SourcesTab />}
          {tab === "news" && <NewsTab />}
          {tab === "generate" && <GenerateTab />}
          {tab === "episodes" && <EpisodesTab />}
          {tab === "voices" && <VoicesTab />}
          {tab === "requests" && <RequestsTab />}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-3xl text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function RunPipelinePanel() {
  const [shows, setShows] = useState<Show[]>([]);
  const [showId, setShowId] = useState<string>("");
  const [city, setCity] = useState("");
  const [maxNews, setMaxNews] = useState(5);
  const [skipAudio, setSkipAudio] = useState(false);
  const [running, setRunning] = useState(false);
  const [last, setLast] = useState<{
    episodes_created?: number;
    episodes_pending_approval?: number;
    audio_generated?: number;
    news_fetched?: number;
    errors?: string[];
  } | null>(null);

  useEffect(() => {
    supabase.from("shows").select("*").eq("is_active", true).order("name").then((r) => {
      setShows((r.data ?? []) as Show[]);
    });
  }, []);

  async function run() {
    setRunning(true);
    setLast(null);
    try {
      const body: Record<string, unknown> = { max_news: maxNews, skip_audio: skipAudio, triggered_by: "admin" };
      if (showId) body.show_id = showId;
      if (city.trim()) body.city = city.trim();
      const data = await invokeFn<typeof last & { ok?: boolean }>("auto-pipeline", body);
      setLast(data);
      const created = data?.episodes_created ?? 0;
      const pending = data?.episodes_pending_approval ?? 0;
      toast.success(`Pipeline finished — ${created} episode(s), ${pending} pending approval`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Pipeline run failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 to-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-primary">Automation</div>
          <h3 className="mt-1 font-serif text-xl">Run auto-pipeline now</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Fetches fresh news → generates Tamil scripts → creates episodes → renders audio.
            Sensitive categories are queued for approval.
          </p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-ember px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" /> {running ? "Running…" : "Run now"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Show (optional)</Label>
          <select className={inputCls} value={showId} onChange={(e) => setShowId(e.target.value)} disabled={running}>
            <option value="">All active shows</option>
            {shows.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <Label>City (optional)</Label>
          <input className={inputCls} placeholder="e.g. Chennai" value={city} onChange={(e) => setCity(e.target.value)} disabled={running} />
        </div>
        <div>
          <Label>Max news per show</Label>
          <input type="number" min={1} max={20} className={inputCls} value={maxNews} onChange={(e) => setMaxNews(Number(e.target.value) || 5)} disabled={running} />
        </div>
        <div className="flex items-end">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={skipAudio} onChange={(e) => setSkipAudio(e.target.checked)} disabled={running} />
            Skip audio generation
          </label>
        </div>
      </div>

      {last && (
        <div className="mt-4 rounded-xl border border-border/60 bg-surface/60 p-3 text-xs">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><span className="text-muted-foreground">News fetched:</span> <span className="font-medium text-foreground">{last.news_fetched ?? 0}</span></span>
            <span><span className="text-muted-foreground">Episodes created:</span> <span className="font-medium text-foreground">{last.episodes_created ?? 0}</span></span>
            <span><span className="text-muted-foreground">Pending approval:</span> <span className="font-medium text-warning">{last.episodes_pending_approval ?? 0}</span></span>
            <span><span className="text-muted-foreground">Audio generated:</span> <span className="font-medium text-foreground">{last.audio_generated ?? 0}</span></span>
          </div>
          {last.errors && last.errors.length > 0 && (
            <ul className="mt-2 list-disc space-y-0.5 pl-4 text-warning">
              {last.errors.map((er, i) => <li key={i}>{er}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState({ episodes: 0, published: 0, pending: 0, requests: 0, news: 0, shows: 0 });
  useEffect(() => {
    (async () => {
      const [a, b, c, d, e, f] = await Promise.all([
        supabase.from("episodes").select("*", { count: "exact", head: true }),
        supabase.from("episodes").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("episodes").select("*", { count: "exact", head: true }).eq("status", "pending_review"),
        supabase.from("user_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase.from("news_items").select("*", { count: "exact", head: true }),
        supabase.from("shows").select("*", { count: "exact", head: true }).eq("is_active", true),
      ]);
      setStats({
        episodes: a.count ?? 0,
        published: b.count ?? 0,
        pending: c.count ?? 0,
        requests: d.count ?? 0,
        news: e.count ?? 0,
        shows: f.count ?? 0,
      });
    })();
  }, []);
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Stat label="Active shows" value={stats.shows} />
      <Stat label="Total episodes" value={stats.episodes} />
      <Stat label="Published" value={stats.published} hint="Live to listeners" />
      <Stat label="Pending review" value={stats.pending} hint="Awaiting approval" />
      <Stat label="News items" value={stats.news} />
      <Stat label="New listener requests" value={stats.requests} />
    </div>
  );
}

function NewsTab() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [form, setForm] = useState({ title: "", summary: "", url: "", city: "Chennai", category: "general", source_id: "" });

  async function refresh() {
    const [n, s] = await Promise.all([
      supabase.from("news_items").select("*").order("published_at", { ascending: false }).limit(50),
      supabase.from("sources").select("*").order("name"),
    ]);
    setItems((n.data ?? []) as NewsItem[]);
    setSources((s.data ?? []) as Source[]);
    if (!form.source_id && s.data?.[0]) setForm((f) => ({ ...f, source_id: s.data[0].id }));
  }
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  async function add() {
    if (!form.title.trim() || !form.summary.trim()) return toast.error("Title and summary are required");
    const { error } = await supabase.from("news_items").insert({
      title: form.title.trim(),
      summary: form.summary.trim(),
      url: form.url.trim() || null,
      city: form.city || null,
      category: form.category || null,
      source_id: form.source_id || null,
      published_at: new Date().toISOString(),
    });
    if (error) return toast.error(error.message);
    toast.success("News item added");
    setForm({ ...form, title: "", summary: "", url: "" });
    refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h3 className="font-serif text-xl">Add news item</h3>
        <p className="mt-1 text-xs text-muted-foreground">Manual entry. Store only summary, not full article.</p>
        <div className="mt-4 space-y-3">
          <input className={inputCls} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className={inputCls} rows={4} placeholder="Short summary (paraphrased)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          <input className={inputCls} placeholder="Source URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className={inputCls} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <select className={inputCls} value={form.source_id} onChange={(e) => setForm({ ...form, source_id: e.target.value })}>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-ember px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
            <Plus className="h-3.5 w-3.5" /> Add news item
          </button>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-xl">Recent news</h3>
        <div className="mt-3 space-y-2">
          {items.length === 0 && <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">No news items yet.</div>}
          {items.map((n) => (
            <div key={n.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{n.city ?? "—"} · {n.category ?? "general"}</div>
                  <div className="mt-0.5 font-medium">{n.title}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.summary}</p>
                </div>
                {n.url && <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">source ↗</a>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GenerateTab() {
  const [shows, setShows] = useState<Show[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showId, setShowId] = useState<string>("");
  const [city, setCity] = useState("Chennai");
  const [adminNotes, setAdminNotes] = useState("");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<ScriptShape | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [s, n] = await Promise.all([
        supabase.from("shows").select("*").eq("is_active", true).order("name"),
        supabase.from("news_items").select("*").order("published_at", { ascending: false }).limit(30),
      ]);
      setShows((s.data ?? []) as Show[]);
      setNews((n.data ?? []) as NewsItem[]);
      if (s.data?.[0]) setShowId(s.data[0].id);
    })();
  }, []);

  function toggle(id: string) {
    const next = new Set(picked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setPicked(next);
  }

  async function generate() {
    const show = shows.find((s) => s.id === showId);
    if (!show) return;
    setGenerating(true);
    setResult(null);
    try {
      const items = news.filter((n) => picked.has(n.id)).map((n) => ({
        title: n.title, summary: n.summary ?? "", url: n.url ?? undefined, city: n.city ?? undefined,
      }));
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-script`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          show_id: show.id, show_name: show.name, format_type: show.format_type,
          city, news_items: items, admin_notes: adminNotes, duration_estimate: show.default_duration ?? 600,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) { toast.error(data.error ?? "Generation failed"); return; }
      setResult(data.script as ScriptShape);
      toast.success("Script generated. Review before publishing.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function saveAsDraft(status: "pending_review" | "published") {
    if (!result || !showId) return;
    setSaving(true);
    const { error } = await supabase.from("episodes").insert({
      show_id: showId,
      title: result.episode_title ?? "Untitled episode",
      script: result as never,
      status,
      city,
      language: result.language ?? "ta",
      duration_seconds: result.duration_estimate ?? 600,
      source_links: (result.source_references ?? []) as never,
      moderation_notes: result.moderation_notes ?? null,
      published_at: status === "published" ? new Date().toISOString() : null,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(status === "published" ? "Published to listeners!" : "Saved for review");
    setResult(null);
    setPicked(new Set());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="space-y-3 rounded-2xl border border-border/60 bg-card p-5">
        <h3 className="font-serif text-xl">AI script generator</h3>
        <p className="text-xs text-muted-foreground">Powered by Lovable AI. Original Tamil scripts only — no copying of source articles.</p>

        <Label>Show</Label>
        <select className={inputCls} value={showId} onChange={(e) => setShowId(e.target.value)}>
          {shows.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.format_type}</option>)}
        </select>

        <Label>City</Label>
        <input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} />

        <Label>Pick news items (optional)</Label>
        <div className="max-h-48 space-y-1.5 overflow-auto rounded-lg border border-border/60 p-2">
          {news.length === 0 && <div className="p-2 text-xs text-muted-foreground">No news yet — add some in the News tab.</div>}
          {news.map((n) => (
            <label key={n.id} className="flex cursor-pointer items-start gap-2 rounded p-1.5 text-xs hover:bg-accent">
              <input type="checkbox" checked={picked.has(n.id)} onChange={() => toggle(n.id)} className="mt-0.5" />
              <span><span className="font-medium text-foreground">{n.title}</span><span className="text-muted-foreground"> — {n.city ?? "—"}</span></span>
            </label>
          ))}
        </div>

        <Label>Admin notes (optional)</Label>
        <textarea className={inputCls} rows={3} placeholder="Tone, angle, must-include points…" value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />

        <button onClick={generate} disabled={generating || !showId} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-ember px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-50">
          <Sparkles className="h-4 w-4" /> {generating ? "Generating…" : "Generate Tamil script"}
        </button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h3 className="font-serif text-xl">Preview & approve</h3>
        {!result ? (
          <div className="mt-6 rounded-xl border border-dashed border-border/60 p-12 text-center text-sm text-muted-foreground">
            Generated script will appear here for review.
          </div>
        ) : (
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{result.show_title}</div>
            <h4 className="mt-1 font-serif text-2xl">{result.episode_title}</h4>
            <div className="mt-1 text-xs text-muted-foreground">{result.city ?? "—"} · {result.duration_estimate ?? "?"}s · {(result.characters ?? []).join(", ")}</div>

            <div className="mt-4 space-y-2">
              {(result.lines ?? []).map((l, i) => (
                <div key={i} className="rounded-lg border border-border/60 bg-surface p-3">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-primary">{l.speaker}</div>
                  <p className="mt-1 text-sm text-foreground">{l.text}</p>
                </div>
              ))}
            </div>

            {result.source_references && result.source_references.length > 0 && (
              <div className="mt-4 rounded-lg border border-border/60 bg-surface/60 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Sources</div>
                <ul className="mt-1.5 space-y-1 text-sm">
                  {result.source_references.map((s, i) => (
                    <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{s.title}</a></li>
                  ))}
                </ul>
              </div>
            )}

            {result.moderation_notes && (
              <div className="mt-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs text-foreground">
                <span className="font-medium">Moderation notes:</span> {result.moderation_notes}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <button disabled={saving} onClick={() => saveAsDraft("pending_review")} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm hover:bg-accent disabled:opacity-50">
                <Clock className="h-3.5 w-3.5" /> Save for review
              </button>
              <button disabled={saving} onClick={() => saveAsDraft("published")} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-ember px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-50">
                <CheckCircle2 className="h-3.5 w-3.5" /> Approve & publish
              </button>
              <button onClick={() => setResult(null)} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-accent">
                <XCircle className="h-3.5 w-3.5" /> Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EpisodesTab() {
  const [eps, setEps] = useState<(Episode & { shows: { name: string } | null })[]>([]);
  async function refresh() {
    const r = await supabase.from("episodes").select("*, shows(name)").order("created_at", { ascending: false });
    setEps((r.data ?? []) as never);
  }
  useEffect(() => { refresh(); }, []);

  async function setStatus(id: string, status: Episode["status"]) {
    const patch: Partial<Episode> = { status };
    if (status === "published") patch.published_at = new Date().toISOString();
    const { error } = await supabase.from("episodes").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${status}`);
    refresh();
  }

  const [genAudio, setGenAudio] = useState<string | null>(null);
  async function genAudioFor(id: string) {
    setGenAudio(id);
    try {
      await invokeFn("generate-audio", { episode_id: id });
      toast.success("Sarvam audio generated");
      refresh();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Audio failed"); }
    finally { setGenAudio(null); }
  }

  return (
    <div className="space-y-2.5">
      {eps.length === 0 && <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">No episodes yet.</div>}
      {eps.map((e) => (
        <div key={e.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-card p-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{e.shows?.name ?? "—"} · {e.city ?? "all"}</div>
            <div className="mt-0.5 truncate font-medium">{e.title}</div>
            {e.audio_url && <audio src={e.audio_url} controls className="mt-2 h-8 w-full max-w-md" />}
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${statusColor(e.status)}`}>{e.status}</span>
          <div className="flex gap-1.5">
            <button disabled={genAudio === e.id} onClick={() => genAudioFor(e.id)} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50">
              <Mic className="h-3 w-3" /> {genAudio === e.id ? "Generating…" : e.audio_url ? "Regen audio" : "Gen audio"}
            </button>
            {e.status !== "published" && <button onClick={() => setStatus(e.id, "published")} className="rounded-full bg-gradient-ember px-3 py-1.5 text-xs font-medium text-primary-foreground">Publish</button>}
            {e.status !== "rejected" && <button onClick={() => setStatus(e.id, "rejected")} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent">Reject</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SourcesTab() {
  const [items, setItems] = useState<Source[]>([]);
  const [form, setForm] = useState({ name: "", type: "rss", url: "", api_provider: "", category: "general", city: "", language: "ta", credibility_score: 0.85, approved_domain_only: true });
  const [fetching, setFetching] = useState<string | null>(null);
  const [extractUrl, setExtractUrl] = useState("");
  const [extractingFor, setExtractingFor] = useState<string | null>(null);

  async function refresh() {
    const r = await supabase.from("sources").select("*").order("name");
    setItems((r.data ?? []) as Source[]);
  }
  useEffect(() => { refresh(); }, []);

  async function add() {
    if (!form.name.trim()) return toast.error("Name required");
    const { error } = await supabase.from("sources").insert({
      name: form.name.trim(), type: form.type, url: form.url.trim() || null,
      api_provider: form.api_provider || null, category: form.category, city: form.city || null,
      language: form.language, credibility_score: form.credibility_score, approved_domain_only: form.approved_domain_only,
      is_active: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Source added");
    setForm({ ...form, name: "", url: "", api_provider: "" });
    refresh();
  }

  async function fetchNow(id: string) {
    setFetching(id);
    try {
      const r = await invokeFn<{ summary: { source: string; inserted: number; skipped: number; error?: string }[] }>("fetch-news", { source_id: id, limit_per_source: 15 });
      const s = r.summary?.[0];
      if (s?.error) toast.error(`${s.source}: ${s.error}`);
      else toast.success(`${s?.source}: +${s?.inserted ?? 0} new, ${s?.skipped ?? 0} dup`);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Fetch failed"); }
    finally { setFetching(null); }
  }

  async function extract(id: string) {
    if (!extractUrl.trim()) return toast.error("Enter a URL");
    setExtractingFor(id);
    try {
      await invokeFn("extract-firecrawl", { url: extractUrl.trim(), source_id: id });
      toast.success("Page extracted to news items");
      setExtractUrl("");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Extract failed"); }
    finally { setExtractingFor(null); }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h3 className="font-serif text-xl">Add news source</h3>
        <p className="mt-1 text-xs text-muted-foreground">RSS, NewsAPI, Firecrawl approved-domain, or manual.</p>
        <div className="mt-4 space-y-3">
          <input className={inputCls} placeholder="Source name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="rss">RSS feed</option>
            <option value="api">API (NewsAPI/GDELT)</option>
            <option value="firecrawl">Firecrawl (approved domain)</option>
            <option value="manual">Manual entry</option>
          </select>
          <input className={inputCls} placeholder="URL or feed URL" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
          {form.type === "api" && (
            <input className={inputCls} placeholder="API provider (newsapi / gdelt)" value={form.api_provider} onChange={(e) => setForm({ ...form, api_provider: e.target.value })} />
          )}
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className={inputCls} placeholder="City (optional)" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={form.approved_domain_only} onChange={(e) => setForm({ ...form, approved_domain_only: e.target.checked })} />
            Restrict Firecrawl to this approved domain
          </label>
          <button onClick={add} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-ember px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">
            <Plus className="h-3.5 w-3.5" /> Add source
          </button>
        </div>
      </div>
      <div>
        <h3 className="font-serif text-xl">Active sources</h3>
        <div className="mt-3 space-y-2">
          {items.map((s) => (
            <div key={s.id} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{s.type} · {s.category ?? "—"} · {s.city ?? "all"}</div>
                  <div className="mt-0.5 truncate font-medium">{s.name}</div>
                  {s.url && <div className="mt-0.5 truncate text-xs text-muted-foreground">{s.url}</div>}
                </div>
                <div className="flex gap-1.5">
                  {(s.type === "rss" || s.type === "api") && (
                    <button onClick={() => fetchNow(s.id)} disabled={fetching === s.id} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50">
                      <Download className="h-3 w-3" /> {fetching === s.id ? "Fetching…" : "Fetch now"}
                    </button>
                  )}
                </div>
              </div>
              {s.type === "firecrawl" && (
                <div className="mt-3 flex gap-2">
                  <input className={inputCls} placeholder={`Extract URL within ${s.url ?? "domain"}…`} value={extractingFor === s.id ? extractUrl : ""} onChange={(e) => { setExtractingFor(s.id); setExtractUrl(e.target.value); }} />
                  <button onClick={() => extract(s.id)} disabled={extractingFor !== s.id || !extractUrl.trim()} className="inline-flex items-center gap-1 rounded-full bg-gradient-ember px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50">
                    <Globe className="h-3 w-3" /> Extract
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VoicesTab() {
  const [items, setItems] = useState<Voice[]>([]);
  useEffect(() => { supabase.from("voices").select("*").order("character_name").then((r) => setItems((r.data ?? []) as Voice[])); }, []);
  async function update(id: string, patch: Partial<Voice>) {
    const { error } = await supabase.from("voices").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Voice updated");
  }
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground">Map each RJ character to a Sarvam speaker. Edit and tab out to save.</p>
      {items.map((v) => (
        <div key={v.id} className="grid gap-2 rounded-xl border border-border/60 bg-card p-4 sm:grid-cols-[1.5fr_1fr_1fr_80px_80px]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Character</div>
            <div className="font-medium">{v.character_name}</div>
          </div>
          <input className={inputCls} defaultValue={v.speaker ?? ""} onBlur={(e) => update(v.id, { speaker: e.target.value })} placeholder="Sarvam speaker" />
          <input className={inputCls} defaultValue={v.target_language_code ?? "ta-IN"} onBlur={(e) => update(v.id, { target_language_code: e.target.value })} placeholder="ta-IN" />
          <input className={inputCls} type="number" step="0.05" defaultValue={v.speed ?? 1.0} onBlur={(e) => update(v.id, { speed: Number(e.target.value) })} />
          <input className={inputCls} type="number" step="0.05" defaultValue={v.pitch ?? 0} onBlur={(e) => update(v.id, { pitch: Number(e.target.value) })} />
        </div>
      ))}
    </div>
  );
}

function RequestsTab() {
  const [items, setItems] = useState<UserRequest[]>([]);
  useEffect(() => {
    supabase.from("user_requests").select("*").order("created_at", { ascending: false }).then((r) => setItems((r.data ?? []) as UserRequest[]));
  }, []);
  return (
    <div className="space-y-2.5">
      {items.length === 0 && <div className="rounded-xl border border-dashed border-border/60 p-10 text-center text-sm text-muted-foreground">No listener requests yet.</div>}
      {items.map((r) => (
        <div key={r.id} className="rounded-xl border border-border/60 bg-card p-4">
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{r.user_name ?? "Anonymous"} · {r.city ?? "—"} · {new Date(r.created_at).toLocaleString()}</div>
          <p className="mt-1.5 text-sm text-foreground">{r.request_text}</p>
        </div>
      ))}
    </div>
  );
}

function statusColor(s: string) {
  if (s === "published") return "bg-success/15 text-success";
  if (s === "pending_review") return "bg-warning/15 text-warning";
  if (s === "rejected") return "bg-destructive/15 text-destructive";
  return "bg-muted text-muted-foreground";
}

const inputCls = "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none";

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{children}</div>;
}
