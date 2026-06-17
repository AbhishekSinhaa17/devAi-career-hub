CREATE TABLE public.ai_usage_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ai_usage_events_created_at_idx ON public.ai_usage_events (created_at DESC);
CREATE INDEX ai_usage_events_user_id_idx ON public.ai_usage_events (user_id);
CREATE INDEX ai_usage_events_endpoint_idx ON public.ai_usage_events (endpoint);
CREATE INDEX ai_usage_events_status_idx ON public.ai_usage_events (status);
GRANT SELECT ON public.ai_usage_events TO authenticated;
GRANT ALL ON public.ai_usage_events TO service_role;
ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view all usage" ON public.ai_usage_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own usage" ON public.ai_usage_events FOR SELECT TO authenticated USING (auth.uid() = user_id);