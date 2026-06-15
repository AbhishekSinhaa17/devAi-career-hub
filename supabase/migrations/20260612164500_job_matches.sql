CREATE TABLE IF NOT EXISTS public.job_matches (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    job_role text NOT NULL,
    job_description text NOT NULL,
    resume_file_name text NOT NULL,
    resume_text text NOT NULL,
    ats_score integer NOT NULL,
    hiring_probability integer NOT NULL,
    interview_readiness integer NOT NULL,
    ai_summary text,
    analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT job_matches_pkey PRIMARY KEY (id)
);

ALTER TABLE public.job_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job matches"
    ON public.job_matches
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job matches"
    ON public.job_matches
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job matches"
    ON public.job_matches
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job matches"
    ON public.job_matches
    FOR DELETE
    USING (auth.uid() = user_id);
