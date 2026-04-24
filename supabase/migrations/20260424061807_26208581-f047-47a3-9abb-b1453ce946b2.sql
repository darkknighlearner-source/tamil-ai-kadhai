
ALTER TABLE public.episodes ADD COLUMN IF NOT EXISTS script_text text;
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS approved_domain_only boolean NOT NULL DEFAULT true;
ALTER TABLE public.sources ADD COLUMN IF NOT EXISTS api_provider text;
ALTER TABLE public.news_items ADD COLUMN IF NOT EXISTS duplicate_hash text;
ALTER TABLE public.news_items ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'collected';
CREATE INDEX IF NOT EXISTS news_items_dup_hash_idx ON public.news_items(duplicate_hash);
ALTER TABLE public.voices ADD COLUMN IF NOT EXISTS speaker text;
ALTER TABLE public.voices ADD COLUMN IF NOT EXISTS target_language_code text DEFAULT 'ta-IN';
ALTER TABLE public.voices ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('episode-audio', 'episode-audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "episode_audio_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'episode-audio');

CREATE POLICY "episode_audio_admin_write"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'episode-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "episode_audio_admin_update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'episode-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "episode_audio_admin_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'episode-audio' AND public.has_role(auth.uid(), 'admin'));
