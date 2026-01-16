-- Migration: add total_riffs_completed to user_stats
-- Run this against your Supabase/Postgres database (or include in your migration runner)

BEGIN;

ALTER TABLE IF EXISTS user_stats
ADD COLUMN IF NOT EXISTS total_riffs_completed integer DEFAULT 0;

COMMIT;
