-- 004_xp_badges.sql
-- XP metadata, lesson completions, and badge seeds for Lessons 1-10.

-- Add metadata for XP events
ALTER TABLE xp_events
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Lesson completion tracking
CREATE TABLE IF NOT EXISTS lesson_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  best_clean_tempo int DEFAULT 0,
  best_aggro_tempo int DEFAULT 0,
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_completions_user ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson ON lesson_completions(lesson_id);

ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'lesson_completions'
      AND policyname = 'lesson_completions_user_rw'
  ) THEN
    CREATE POLICY lesson_completions_user_rw
    ON lesson_completions
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
  END IF;
END;
$$;

-- Seed achievements library for lesson badges
INSERT INTO achievements_library (badge_id, name, description, icon_url, type, xp_multiplier, requirements)
VALUES
  ('B01', 'Iron Wrist I', 'Complete L03 at clean tempo.', '/badges/b01-iron-wrist.png', 'lesson', 1, '{"lessonId":"L03","type":"completion_clean"}'),
  ('B02', 'Mute Surgeon', 'Hit a perfect 5-loop streak in L02 at clean tempo.', '/badges/b02-mute-surgeon.png', 'lesson', 1, '{"lessonId":"L02","type":"perfect_streak_clean","streak":5}'),
  ('B03', 'Chord Executioner', 'Complete L04 without pauses or seeks.', '/badges/b03-chord-executioner.png', 'lesson', 1, '{"lessonId":"L04","type":"completion_no_pauses_seeks"}'),
  ('B04', 'Gallop Engine', 'Reach aggro tempo in L05.', '/badges/b04-gallop-engine.png', 'lesson', 1, '{"lessonId":"L05","type":"aggro_tempo"}'),
  ('B05', 'Alternate Assassin', 'Hit an 8-loop perfect streak in L06.', '/badges/b05-alternate-assassin.png', 'lesson', 1, '{"lessonId":"L06","type":"perfect_streak","streak":8}'),
  ('B06', 'Crossing Clean', 'Hit a 5-loop perfect streak in L07.', '/badges/b06-crossing-clean.png', 'lesson', 1, '{"lessonId":"L07","type":"perfect_streak","streak":5}'),
  ('B07', 'Silence Controller', 'Hit a 6-loop perfect streak in L08.', '/badges/b07-silence-controller.png', 'lesson', 1, '{"lessonId":"L08","type":"perfect_streak","streak":6}'),
  ('B08', 'Burst Certified', 'Reach aggro tempo in L09.', '/badges/b08-burst-certified.png', 'lesson', 1, '{"lessonId":"L09","type":"aggro_tempo"}'),
  ('B09', 'First Riff Forged', 'Complete L10 at clean tempo.', '/badges/b09-first-riff-forged.png', 'lesson', 1, '{"lessonId":"L10","type":"completion_clean"}'),
  ('B10', 'Foundations: Steel', 'Complete lessons L01 through L10.', '/badges/b10-foundations-steel.png', 'lesson', 1, '{"type":"all_lessons","lessons":["L01","L02","L03","L04","L05","L06","L07","L08","L09","L10"]}')
ON CONFLICT (badge_id) DO NOTHING;
