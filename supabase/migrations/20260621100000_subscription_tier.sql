-- Add is_pro column to track subscription status
ALTER TABLE profiles ADD COLUMN is_pro BOOLEAN DEFAULT false;
