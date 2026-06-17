CREATE TABLE IF NOT EXISTS public.portfolio_deployments (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    portfolio_id uuid NOT NULL REFERENCES public.github_resumes(id) ON DELETE CASCADE,
    provider text NOT NULL,
    deployment_id text NOT NULL,
    deployment_url text,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT portfolio_deployments_pkey PRIMARY KEY (id)
);

ALTER TABLE public.portfolio_deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own deployments"
    ON public.portfolio_deployments
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deployments"
    ON public.portfolio_deployments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deployments"
    ON public.portfolio_deployments
    FOR UPDATE
    USING (auth.uid() = user_id);
