-- ============================================================
-- Metal Master - Idempotent Combined Migrations
-- Safe to re-run; uses IF NOT EXISTS and guarded ALTERs.
-- ============================================================

-- Ensure pgcrypto
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------
-- Core tables
-- ---------------------------
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  username text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  difficulty_level text,
  duration_minutes int,
  instructor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS riffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  bpm int,
  key text,
  time_signature text,
  genre text,
  difficulty_level text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  riff_id uuid REFERENCES riffs(id) ON DELETE CASCADE,
  title text,
  content text NOT NULL,
  format text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jam_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  bpm int,
  key text,
  time_signature text,
  difficulty_level text,
  duration_seconds int,
  audio_url text,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS jam_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jam_track_id uuid REFERENCES jam_tracks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  notes text,
  duration_seconds int,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  progress int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS riff_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  riff_id uuid REFERENCES riffs(id) ON DELETE CASCADE,
  progress int NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, riff_id)
);

CREATE TABLE IF NOT EXISTS xp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  xp_amount int NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE xp_events
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text,
  tier text,
  category text,
  xp_reward int NOT NULL DEFAULT 0 CHECK (xp_reward >= 0),
  achieved_at timestamptz DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS tone_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  settings jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_feedback_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  riff_id uuid REFERENCES riffs(id) ON DELETE CASCADE,
  accuracy numeric(5,2) NOT NULL,
  timing_deviation numeric(6,3) NOT NULL,
  noise_score numeric(5,2) NOT NULL,
  pick_attack_score numeric(5,2) NOT NULL,
  raw_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- ---------------------------
-- Feature tables
-- ---------------------------
CREATE TABLE IF NOT EXISTS speed_trainer_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  riff_id uuid REFERENCES riffs(id) ON DELETE SET NULL,
  exercise_type varchar(50) NOT NULL,
  starting_bpm int NOT NULL CHECK (starting_bpm > 0),
  ending_bpm int NOT NULL CHECK (ending_bpm > 0),
  current_bpm int NOT NULL CHECK (current_bpm > 0),
  target_bpm int NOT NULL CHECK (target_bpm > 0),
  duration_seconds int NOT NULL CHECK (duration_seconds > 0),
  accuracy_percentage decimal(5,2) NOT NULL CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
  notes text,
  auto_increment_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_riffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  riff_id uuid NOT NULL REFERENCES riffs(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  tab_content text NOT NULL,
  description text NOT NULL,
  subgenre varchar(100) NOT NULL,
  difficulty_level varchar(20) NOT NULL,
  xp_bonus int NOT NULL CHECK (xp_bonus > 0),
  featured_date date NOT NULL UNIQUE,
  frequency varchar(20) NOT NULL DEFAULT 'free_weekly' CHECK (frequency IN ('free_weekly', 'subscriber_daily')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS daily_riff_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_riff_id uuid NOT NULL REFERENCES daily_riffs(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  xp_earned int NOT NULL CHECK (xp_earned >= 0),
  bonus_earned boolean DEFAULT false,
  UNIQUE (user_id, daily_riff_id)
);

CREATE TABLE IF NOT EXISTS achievements_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id varchar(100) NOT NULL UNIQUE,
  name varchar(100) NOT NULL,
  description text NOT NULL,
  icon_url text NOT NULL,
  type varchar(50) NOT NULL,
  xp_multiplier decimal(3,2) NOT NULL CHECK (xp_multiplier >= 1 AND xp_multiplier <= 5),
  requirements jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id uuid NOT NULL REFERENCES achievements_library(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  progress_percentage decimal(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  UNIQUE (user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  total_xp int NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
  level int NOT NULL DEFAULT 1 CHECK (level > 0),
  level_tier varchar(50) NOT NULL DEFAULT 'Novice',
  total_practice_minutes int NOT NULL DEFAULT 0 CHECK (total_practice_minutes >= 0),
  total_lessons_completed int NOT NULL DEFAULT 0 CHECK (total_lessons_completed >= 0),
  current_streak_days int NOT NULL DEFAULT 0 CHECK (current_streak_days >= 0),
  longest_streak_days int NOT NULL DEFAULT 0 CHECK (longest_streak_days >= 0),
  accuracy_score decimal(5,2) NOT NULL DEFAULT 0 CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
  speed_score decimal(5,2) NOT NULL DEFAULT 0 CHECK (speed_score >= 0 AND speed_score <= 100),
  rhythm_score decimal(5,2) NOT NULL DEFAULT 0 CHECK (rhythm_score >= 0 AND rhythm_score <= 100),
  tone_knowledge_score decimal(5,2) NOT NULL DEFAULT 0 CHECK (tone_knowledge_score >= 0 AND tone_knowledge_score <= 100),
  subscription_status varchar(50) DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'trial', 'lifetime')),
  stripe_customer_id varchar(255),
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_practice_heatmap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  practice_minutes int NOT NULL DEFAULT 0 CHECK (practice_minutes >= 0),
  lessons_completed int NOT NULL DEFAULT 0 CHECK (lessons_completed >= 0),
  riffs_completed int NOT NULL DEFAULT 0 CHECK (riffs_completed >= 0),
  xp_earned int NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS practice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type varchar(50) NOT NULL,
  related_riff_id uuid REFERENCES riffs(id) ON DELETE SET NULL,
  related_lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  related_jam_track_id uuid REFERENCES jam_tracks(id) ON DELETE SET NULL,
  duration_seconds int NOT NULL DEFAULT 0,
  xp_earned int NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  accuracy_percentage decimal(5,2) CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
  notes text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

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

-- ---------------------------
-- Practice session autosave columns + constraints
-- ---------------------------
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

ALTER TABLE practice_sessions
  ALTER COLUMN duration_seconds SET DEFAULT 0,
  ALTER COLUMN duration_seconds DROP NOT NULL,
  ALTER COLUMN started_at SET DEFAULT now(),
  ALTER COLUMN started_at DROP NOT NULL,
  ALTER COLUMN completed_at SET DEFAULT now(),
  ALTER COLUMN completed_at DROP NOT NULL,
  ALTER COLUMN session_type SET DEFAULT 'lesson';

ALTER TABLE practice_sessions
  DROP CONSTRAINT IF EXISTS practice_sessions_duration_seconds_check;
ALTER TABLE practice_sessions
  ADD CONSTRAINT practice_sessions_duration_seconds_check CHECK (duration_seconds >= 0);

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

-- ---------------------------
-- Practice session summary helper
-- ---------------------------
CREATE OR REPLACE FUNCTION practice_session_summary(p_user_id uuid)
RETURNS TABLE (
  total_sessions bigint,
  total_duration_seconds bigint,
  total_xp bigint,
  most_common_session_type text,
  xp_earned_this_week bigint,
  xp_earned_today bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH user_sessions AS (
    SELECT session_type, duration_seconds, xp_earned, started_at
    FROM practice_sessions
    WHERE user_id = p_user_id
  ),
  totals AS (
    SELECT
      COUNT(*)::bigint AS total_sessions,
      COALESCE(SUM(duration_seconds), 0)::bigint AS total_duration_seconds,
      COALESCE(SUM(xp_earned), 0)::bigint AS total_xp,
      COALESCE(SUM(xp_earned) FILTER (WHERE started_at >= now() - interval '7 days'), 0)::bigint AS xp_earned_this_week,
      COALESCE(SUM(xp_earned) FILTER (WHERE started_at::date = current_date), 0)::bigint AS xp_earned_today
    FROM user_sessions
  ),
  common_type AS (
    SELECT session_type
    FROM user_sessions
    GROUP BY session_type
    ORDER BY COUNT(*) DESC, session_type ASC
    LIMIT 1
  )
  SELECT
    totals.total_sessions,
    totals.total_duration_seconds,
    totals.total_xp,
    COALESCE(common_type.session_type, 'lesson') AS most_common_session_type,
    totals.xp_earned_this_week,
    totals.xp_earned_today
  FROM totals
  LEFT JOIN common_type ON TRUE;
$$;

-- ---------------------------
-- Indexes (IF NOT EXISTS)
-- ---------------------------
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_riff_progress_user ON riff_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_riff_progress_riff ON riff_progress(riff_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_tone_presets_user ON tone_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback_results(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_riff ON ai_feedback_results(riff_id);
CREATE INDEX IF NOT EXISTS idx_speed_trainer_sessions_user ON speed_trainer_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_speed_trainer_sessions_riff ON speed_trainer_sessions(riff_id);
CREATE INDEX IF NOT EXISTS idx_daily_riffs_featured_date ON daily_riffs(featured_date);
CREATE INDEX IF NOT EXISTS idx_daily_riffs_riff ON daily_riffs(riff_id);
CREATE INDEX IF NOT EXISTS idx_daily_riff_completions_user ON daily_riff_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_riff_completions_daily_riff ON daily_riff_completions(daily_riff_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_stripe_customer ON user_stats(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_practice_heatmap_user ON user_practice_heatmap(user_id);
CREATE INDEX IF NOT EXISTS idx_user_practice_heatmap_date ON user_practice_heatmap(date);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_type ON practice_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_started_at ON practice_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_riff ON practice_sessions(related_riff_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_lesson ON practice_sessions(related_lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user ON lesson_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson ON lesson_completions(lesson_id);

-- ---------------------------
-- RLS enable + policies
-- ---------------------------
ALTER TABLE speed_trainer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_riff_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_heatmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

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

-- ---------------------------
-- Level curve seed
-- ---------------------------
CREATE TABLE IF NOT EXISTS system_config (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO system_config (key, value, updated_at)
VALUES (
  'level_curve',
  '{"version": "1.0.0", "curve_name": "SteelRamp_50", "max_level": 50, "xp_definition": "total_xp_required_is_cumulative", "notes": "Early levels are fast for dopamine; mid levels steady; late levels require consistent practice + streaks.", "levels": [{"level": 1, "total_xp_required": 0, "title": "Rust", "rewards": []}, {"level": 2, "total_xp_required": 250, "title": "Spark", "rewards": ["unlock:practice_heatmap"]}, {"level": 3, "total_xp_required": 550, "title": "Forgehand", "rewards": ["unlock:speed_slider"]}, {"level": 4, "total_xp_required": 900, "title": "Iron Nerves", "rewards": ["cosmetic:pick_color_1"]}, {"level": 5, "total_xp_required": 1300, "title": "Chug Apprentice", "rewards": ["unlock:loop_presets"]}, {"level": 6, "total_xp_required": 1750, "title": "Mute Adept", "rewards": []}, {"level": 7, "total_xp_required": 2250, "title": "Riff Squire", "rewards": ["cosmetic:badge_frame_1"]}, {"level": 8, "total_xp_required": 2800, "title": "Tempo Tamer", "rewards": []}, {"level": 9, "total_xp_required": 3400, "title": "Downpick Disciple", "rewards": ["unlock:metronome_modes"]}, {"level": 10, "total_xp_required": 4100, "title": "Iron Wrist", "rewards": ["title_equipped:Iron Wrist"]}, {"level": 11, "total_xp_required": 4900, "title": "Palm-Mute Surgeon", "rewards": []}, {"level": 12, "total_xp_required": 5800, "title": "Chord Cleaver", "rewards": ["cosmetic:theme_accent_1"]}, {"level": 13, "total_xp_required": 6800, "title": "Gallop Runner", "rewards": []}, {"level": 14, "total_xp_required": 7950, "title": "Alternate Assassin", "rewards": ["unlock:practice_goals"]}, {"level": 15, "total_xp_required": 9250, "title": "Crossing Clean", "rewards": ["cosmetic:badge_frame_2"]}, {"level": 16, "total_xp_required": 10700, "title": "Silence Controller", "rewards": []}, {"level": 17, "total_xp_required": 12300, "title": "Burst Certified", "rewards": ["unlock:burst_drills"]}, {"level": 18, "total_xp_required": 14100, "title": "Riffsmith", "rewards": []}, {"level": 19, "total_xp_required": 16100, "title": "Section Jumper", "rewards": ["unlock:section_challenges"]}, {"level": 20, "total_xp_required": 18300, "title": "Foundations: Steel", "rewards": ["unlock:intermediate_path"]}, {"level": 21, "total_xp_required": 20750, "title": "Tempo Hunter", "rewards": []}, {"level": 22, "total_xp_required": 23450, "title": "Precision Fiend", "rewards": ["cosmetic:theme_accent_2"]}, {"level": 23, "total_xp_required": 26400, "title": "Tightness Cultist", "rewards": []}, {"level": 24, "total_xp_required": 29650, "title": "Palm-Mute Warden", "rewards": ["unlock:advanced_loop_tools"]}, {"level": 25, "total_xp_required": 33200, "title": "Riff Enforcer", "rewards": ["cosmetic:badge_frame_3"]}, {"level": 26, "total_xp_required": 37100, "title": "Metronome Marauder", "rewards": []}, {"level": 27, "total_xp_required": 41350, "title": "Streak Reaper", "rewards": ["unlock:streak_challenges"]}, {"level": 28, "total_xp_required": 46000, "title": "Rhythm Executioner", "rewards": []}, {"level": 29, "total_xp_required": 51050, "title": "Fretboard Butcher", "rewards": ["cosmetic:theme_accent_3"]}, {"level": 30, "total_xp_required": 56600, "title": "War Machine", "rewards": ["unlock:pro_riff_trials"]}, {"level": 31, "total_xp_required": 62650, "title": "Precision Warlord", "rewards": []}, {"level": 32, "total_xp_required": 69250, "title": "Tremolo Initiate", "rewards": ["unlock:tremolo_drills"]}, {"level": 33, "total_xp_required": 76450, "title": "Gallop Overlord", "rewards": []}, {"level": 34, "total_xp_required": 84300, "title": "Alternate Blade", "rewards": ["cosmetic:badge_frame_4"]}, {"level": 35, "total_xp_required": 92850, "title": "String Slayer", "rewards": []}, {"level": 36, "total_xp_required": 102150, "title": "Mute Tyrant", "rewards": ["unlock:mute_mastery_tests"]}, {"level": 37, "total_xp_required": 112300, "title": "Timing Necromancer", "rewards": []}, {"level": 38, "total_xp_required": 123350, "title": "Riff Architect", "rewards": ["unlock:riff_builder_beta"]}, {"level": 39, "total_xp_required": 135400, "title": "Practice Juggernaut", "rewards": []}, {"level": 40, "total_xp_required": 148550, "title": "Steel Titan", "rewards": ["cosmetic:theme_accent_4"]}, {"level": 41, "total_xp_required": 162900, "title": "Blackened Commander", "rewards": []}, {"level": 42, "total_xp_required": 178550, "title": "Chromatic Predator", "rewards": ["unlock:chromatic_trials"]}, {"level": 43, "total_xp_required": 195600, "title": "Metronome Killer", "rewards": []}, {"level": 44, "total_xp_required": 214200, "title": "Tempo Demon", "rewards": ["cosmetic:badge_frame_5"]}, {"level": 45, "total_xp_required": 234500, "title": "Riff Wraith", "rewards": []}, {"level": 46, "total_xp_required": 256650, "title": "The Unflinching", "rewards": ["unlock:elite_badges"]}, {"level": 47, "total_xp_required": 280800, "title": "Iron Prophet", "rewards": []}, {"level": 48, "total_xp_required": 307150, "title": "Shred Revenant", "rewards": ["unlock:shred_path"]}, {"level": 49, "total_xp_required": 335900, "title": "Steel Godling", "rewards": []}, {"level": 50, "total_xp_required": 367250, "title": "Steel God", "rewards": ["title_equipped:Steel God", "cosmetic:legend_frame"]}]}'::jsonb,
  now()
)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;

