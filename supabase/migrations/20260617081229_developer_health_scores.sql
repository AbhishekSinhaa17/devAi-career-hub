CREATE TABLE IF NOT EXISTS public.developer_health_scores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    github_score integer NOT NULL,
    resume_score integer NOT NULL,
    interview_score integer NOT NULL,
    job_match_score integer NOT NULL,
    portfolio_score integer NOT NULL,
    overall_score integer NOT NULL,
    strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
    weaknesses jsonb NOT NULL DEFAULT '[]'::jsonb,
    recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT developer_health_scores_pkey PRIMARY KEY (id)
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_developer_health_scores_updated_at
BEFORE UPDATE ON public.developer_health_scores
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX developer_health_scores_user_id_idx ON public.developer_health_scores (user_id);
CREATE INDEX developer_health_scores_created_at_idx ON public.developer_health_scores (created_at DESC);
CREATE INDEX developer_health_scores_overall_score_idx ON public.developer_health_scores (overall_score);

-- Permissions
ALTER TABLE public.developer_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health scores"
    ON public.developer_health_scores
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health scores"
    ON public.developer_health_scores
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health scores"
    ON public.developer_health_scores
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health scores"
    ON public.developer_health_scores
    FOR DELETE
    USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.developer_health_scores TO authenticated;
GRANT ALL ON public.developer_health_scores TO service_role;
