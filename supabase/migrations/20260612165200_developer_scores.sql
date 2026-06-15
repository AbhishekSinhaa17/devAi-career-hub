CREATE TABLE IF NOT EXISTS public.developer_scores (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    overall_score integer NOT NULL,
    github_score integer NOT NULL,
    resume_score integer NOT NULL,
    job_match_score integer NOT NULL,
    interview_score integer NOT NULL,
    profile_score integer NOT NULL,
    strengths jsonb NOT NULL DEFAULT '[]'::jsonb,
    weaknesses jsonb NOT NULL DEFAULT '[]'::jsonb,
    recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
    suggested_projects jsonb NOT NULL DEFAULT '[]'::jsonb,
    certifications jsonb NOT NULL DEFAULT '[]'::jsonb,
    job_roles jsonb NOT NULL DEFAULT '[]'::jsonb,
    ai_insights jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT developer_scores_pkey PRIMARY KEY (id)
);

ALTER TABLE public.developer_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own developer scores"
    ON public.developer_scores
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own developer scores"
    ON public.developer_scores
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own developer scores"
    ON public.developer_scores
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own developer scores"
    ON public.developer_scores
    FOR DELETE
    USING (auth.uid() = user_id);
