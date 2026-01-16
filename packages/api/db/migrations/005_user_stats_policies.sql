-- Migration: create row-level security policy for user_stats
-- Allows authenticated users to read and update only their own stats

BEGIN;

-- Create policy if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_stats'
      AND policyname = 'user_stats_user_rw'
  ) THEN
    CREATE POLICY user_stats_user_rw
      ON user_stats
      FOR ALL
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END;
$$;

COMMIT;
