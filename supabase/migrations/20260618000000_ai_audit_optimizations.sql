ALTER TABLE public.ai_usage_events ADD COLUMN client_ip TEXT;
ALTER TABLE public.job_matches ADD COLUMN hash_key TEXT;
CREATE INDEX idx_ai_usage_events_client_ip ON public.ai_usage_events(client_ip);
CREATE INDEX idx_job_matches_hash_key ON public.job_matches(hash_key);