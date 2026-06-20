-- Add pro_expires_at column to track subscription expiration date
ALTER TABLE profiles ADD COLUMN pro_expires_at TIMESTAMPTZ;
