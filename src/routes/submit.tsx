import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TAMIL_CITIES } from "@/lib/types";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const RequestSchema = z.object({
  user_name: z.string().trim().max(60).optional(),
  city: z.string().trim().max(40).optional(),
  request_text: z.string().trim().min(4, "Tell us a bit more").max(800),
});

export const Route = createFileRoute("/submit")({
  component: SubmitPage,
  head: () => ({
    meta: [
      {"title": "Submit a topic \u2014 Tamil AI Vanoli"} ,
      {"name": "description", "content": "Send a topic, question, or request to Tamil AI Vanoli."} ,
      {"property": "og:title", "content": "Submit a topic \u2014 Tamil AI Vanoli"} ,
      {"property": "og:description", "content": "Send a topic, question, or request to Tamil AI Vanoli."} ,
      {"property": "og:type", "content": "website"} ,
      {"name": "twitter:card", "content": "summary"} ,
    ],
  }),
});

function SubmitPage() {
  const [name, setName] = useState("");
  const [city, setCity] = useState<string>("Chennai");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = RequestSchema.safeParse({ user_name: name, city, request_text: text });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("user_requests").insert({
      user_name: parsed.data.user_name || null,
      city: parsed.data.city || null,
      request_text: parsed.data.request_text,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Could not submit. Please try again.");
      return;
    }
    setDone(true);
    setText("");
    toast.success("Thanks! Your topic has been received.");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-12 sm:px-6">
        <h1 className="font-serif text-4xl text-foreground">Submit a topic</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Send a question, topic, or local update. We may use it in an upcoming AI radio segment.
          Please don't include private info.
        </p>

        {done ? (
          <div className="mt-8 rounded-2xl border border-success/40 bg-success/10 p-6 text-sm text-foreground">
            Thanks for submitting! Our editorial team will review and may use your topic in an
            upcoming show.
            <button onClick={() => setDone(false)} className="ml-2 underline">
              Send another
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card p-6">
            <Field label="Your name (optional)">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="e.g. Karthik"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Your city">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {TAMIL_CITIES.filter((c) => c !== "All Tamil Nadu").map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Your topic, question or request">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                maxLength={800}
                placeholder="What do you want our AI RJ to talk about?"
                className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
              <div className="mt-1 text-right text-[11px] text-muted-foreground">{text.length}/800</div>
            </Field>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-ember px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-glow disabled:opacity-50"
            >
              <Send className="h-4 w-4" /> {submitting ? "Sending…" : "Send to AI Vanoli"}
            </button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      {children}
    </label>
  );
}
