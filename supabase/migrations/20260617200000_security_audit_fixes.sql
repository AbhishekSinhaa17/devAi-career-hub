-- Migration: Security Audit Fixes (RLS, Exposure, Indexes, FK Constraints)

-- 1. CRITICAL: Fix public exposure of profiles table
DROP POLICY IF EXISTS "Profiles publicly viewable" ON public.profiles;

CREATE POLICY "Users view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 2. CRITICAL: Add `is_public` to `github_resumes`
ALTER TABLE public.github_resumes 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- 3. HIGH: Add missing foreign key constraints for user-owned tables
-- Clean up any orphaned records before adding the constraint to avoid migration failure
DELETE FROM public.job_matches WHERE user_id NOT IN (SELECT id FROM auth.users);
ALTER TABLE public.job_matches 
ADD CONSTRAINT fk_job_matches_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DELETE FROM public.developer_scores WHERE user_id NOT IN (SELECT id FROM auth.users);
ALTER TABLE public.developer_scores 
ADD CONSTRAINT fk_developer_scores_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DELETE FROM public.github_resumes WHERE user_id NOT IN (SELECT id FROM auth.users);
ALTER TABLE public.github_resumes 
ADD CONSTRAINT fk_github_resumes_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DELETE FROM public.portfolio_deployments WHERE user_id NOT IN (SELECT id FROM auth.users);
ALTER TABLE public.portfolio_deployments 
ADD CONSTRAINT fk_portfolio_deployments_user 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. MEDIUM: Add missing foreign key indexes (prevents full table scans)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_github_analyses_user_id ON public.github_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_code_reviews_user_id ON public.code_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON public.roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_user_id ON public.job_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_developer_scores_user_id ON public.developer_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_github_resumes_user_id ON public.github_resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_user_id ON public.mock_interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_deployments_user_id ON public.portfolio_deployments(user_id);

-- 5. MEDIUM: Add missing DELETE policy for portfolio_deployments
DROP POLICY IF EXISTS "Users can delete their own deployments" ON public.portfolio_deployments;
CREATE POLICY "Users can delete their own deployments" 
ON public.portfolio_deployments 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);
