-- Migration: Admin Audit Logs
-- Description: Creates the admin_audit_logs table to track high-privilege actions.

CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_id UUID,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: Only admins can view audit logs (or strictly service role). We'll restrict to service role / admins.
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON admin_audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Only service_role can insert audit logs via the backend
-- So we don't need a public INSERT policy.

-- Index for querying by admin or action
CREATE INDEX admin_audit_logs_admin_id_idx ON admin_audit_logs(admin_id);
CREATE INDEX admin_audit_logs_created_at_idx ON admin_audit_logs(created_at);
