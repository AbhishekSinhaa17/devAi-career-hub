-- Add deployment metadata fields to portfolio_deployments

ALTER TABLE portfolio_deployments
ADD COLUMN build_duration INTEGER,
ADD COLUMN deployment_logs JSONB,
ADD COLUMN deployed_at TIMESTAMPTZ;

-- Add RLS policies for the new columns if necessary (they are automatically covered by the table's existing policies)
