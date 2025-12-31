-- SQL schema for Edu-Pro Supabase integration
-- Run this in Supabase SQL editor or via the provided one-click script

-- Recommended extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE IF NOT EXISTS app_state (
  id TEXT PRIMARY KEY,
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optional: a simple index on updated_at for faster reads by timestamp
CREATE INDEX IF NOT EXISTS idx_app_state_updated_at ON app_state (updated_at);

-- Development RLS policy (permissive)
-- IMPORTANT: tighten policies for production — these allow public reads/writes
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Ensure policies are created idempotently: DROP IF EXISTS then CREATE
DROP POLICY IF EXISTS allow_select ON app_state;
CREATE POLICY allow_select ON app_state
  FOR SELECT USING (true);

DROP POLICY IF EXISTS allow_write ON app_state;
CREATE POLICY allow_write ON app_state
  FOR ALL
  USING (true)
  WITH CHECK (true);
