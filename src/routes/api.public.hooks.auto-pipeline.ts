// Public cron endpoint that triggers the automated radio pipeline.
// Called by pg_cron on a schedule. Authenticated by a shared secret header.
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/auto-pipeline")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.CRON_SECRET;
        const provided = request.headers.get("x-cron-secret");
        if (!expected || !provided || provided !== expected) {
          return new Response(JSON.stringify({ error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        const body = await request.json().catch(() => ({})) as {
          show_id?: string;
          city?: string;
          max_news?: number;
          skip_audio?: boolean;
        };

        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return new Response(JSON.stringify({ error: "backend not configured" }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }

        const res = await fetch(`${supabaseUrl}/functions/v1/auto-pipeline`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
            apikey: serviceKey,
          },
          body: JSON.stringify({ ...body, triggered_by: "cron" }),
        });

        const text = await res.text();
        return new Response(text, {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
