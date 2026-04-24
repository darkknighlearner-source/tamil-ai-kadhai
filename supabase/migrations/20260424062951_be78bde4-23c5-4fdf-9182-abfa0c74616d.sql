-- 1. Episodes: requires_approval flag for sensitive categories
ALTER TABLE public.episodes
  ADD COLUMN IF NOT EXISTS requires_approval boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sensitive_category text;

-- Tighten public read policy: hide episodes still awaiting approval
DROP POLICY IF EXISTS episodes_public_read_published ON public.episodes;
CREATE POLICY episodes_public_read_published ON public.episodes
  FOR SELECT
  USING (
    (status = 'published' AND requires_approval = false)
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- 2. Pipeline run log
CREATE TABLE IF NOT EXISTS public.pipeline_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by text NOT NULL DEFAULT 'cron', -- cron | manual | api
  show_id uuid,
  city text,
  status text NOT NULL DEFAULT 'running', -- running | success | partial | failed
  news_fetched integer NOT NULL DEFAULT 0,
  episodes_created integer NOT NULL DEFAULT 0,
  episodes_pending_approval integer NOT NULL DEFAULT 0,
  audio_generated integer NOT NULL DEFAULT 0,
  error text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

ALTER TABLE public.pipeline_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY pipeline_runs_admin_all ON public.pipeline_runs
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS pipeline_runs_started_at_idx ON public.pipeline_runs (started_at DESC);
CREATE INDEX IF NOT EXISTS episodes_requires_approval_idx ON public.episodes (requires_approval) WHERE requires_approval = true;