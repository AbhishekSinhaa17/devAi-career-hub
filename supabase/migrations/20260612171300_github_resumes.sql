CREATE TABLE IF NOT EXISTS public.github_resumes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    github_username text NOT NULL,
    developer_type text NOT NULL,
    profile_strength integer NOT NULL DEFAULT 0,
    badges jsonb NOT NULL DEFAULT '[]'::jsonb,
    resume_data jsonb NOT NULL,
    insights jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT github_resumes_pkey PRIMARY KEY (id)
);

ALTER TABLE public.github_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own github resumes"
    ON public.github_resumes
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own github resumes"
    ON public.github_resumes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own github resumes"
    ON public.github_resumes
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own github resumes"
    ON public.github_resumes
    FOR DELETE
    USING (auth.uid() = user_id);
