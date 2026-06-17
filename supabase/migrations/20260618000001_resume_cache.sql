ALTER TABLE public.resumes ADD COLUMN resume_hash TEXT;
CREATE INDEX idx_resumes_hash_cache ON public.resumes(resume_hash);