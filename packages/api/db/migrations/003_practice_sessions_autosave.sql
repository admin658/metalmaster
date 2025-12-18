-- 003_practice_sessions_autosave.sql
-- Align practice_sessions schema with autosave fields used by Tab Lab.

-- Add autosave-friendly columns
ALTER TABLE practice_sessions
  ADD COLUMN IF NOT EXISTS session_key uuid,
  ADD COLUMN IF NOT EXISTS track_index int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS position_seconds numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS speed numeric DEFAULT 1,
  ADD COLUMN IF NOT EXISTS bpm int DEFAULT 120,
  ADD COLUMN IF NOT EXISTS loop_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS loop_in_seconds numeric,
  ADD COLUMN IF NOT EXISTS loop_out_seconds numeric,
  ADD COLUMN IF NOT EXISTS active_section_id text,
  ADD COLUMN IF NOT EXISTS current_bar_number int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS rack_tab text DEFAULT 'practice',
  ADD COLUMN IF NOT EXISTS coach_open boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ui jsonb DEFAULT '{}'::jsonb;

-- Loosen legacy NOT NULLs so autosave writes without duration/start/end
ALTER TABLE practice_sessions
  ALTER COLUMN duration_seconds SET DEFAULT 0,
  ALTER COLUMN duration_seconds DROP NOT NULL,
  ALTER COLUMN started_at SET DEFAULT now(),
  ALTER COLUMN started_at DROP NOT NULL,
  ALTER COLUMN completed_at SET DEFAULT now(),
  ALTER COLUMN completed_at DROP NOT NULL,
  ALTER COLUMN session_type SET DEFAULT 'lesson';

-- Relax old CHECK constraint (was > 0)
ALTER TABLE practice_sessions
  DROP CONSTRAINT IF EXISTS practice_sessions_duration_seconds_check;
ALTER TABLE practice_sessions
  ADD CONSTRAINT practice_sessions_duration_seconds_check CHECK (duration_seconds >= 0);

-- Backfill new keys and enforce uniqueness per user/session/track
UPDATE practice_sessions
SET session_key = gen_random_uuid()
WHERE session_key IS NULL;

UPDATE practice_sessions
SET track_index = 0
WHERE track_index IS NULL;

ALTER TABLE practice_sessions
  ALTER COLUMN session_key SET NOT NULL,
  ALTER COLUMN session_key SET DEFAULT gen_random_uuid(),
  ALTER COLUMN track_index SET NOT NULL,
  ALTER COLUMN track_index SET DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'practice_sessions_user_session_track_key'
  ) THEN
    ALTER TABLE practice_sessions
      ADD CONSTRAINT practice_sessions_user_session_track_key
      UNIQUE (user_id, session_key, track_index);
  END IF;
END;
$$;

-- RLS policy: user can read/write their own sessions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'practice_sessions'
      AND policyname = 'practice_sessions_user_rw'
  ) THEN
    CREATE POLICY practice_sessions_user_rw
    ON practice_sessions
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END;
$$;
