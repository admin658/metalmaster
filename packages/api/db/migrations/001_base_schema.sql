-- 001_base_schema.sql
-- Core Metal Master schema (users, content, progress, XP, achievements, AI feedback)

-- Ensure UUID generation is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
    id uuid PRIMARY KEY,
    email text UNIQUE NOT NULL,
    username text,
    avatar_url text,
    bio text,
    created_at timestamptz DEFAULT now()
);

-- Lessons
CREATE TABLE lessons (
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

-- Riffs
CREATE TABLE riffs (
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

-- Tabs for riffs
CREATE TABLE tabs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    riff_id uuid REFERENCES riffs(id) ON DELETE CASCADE,
    title text,
    content text NOT NULL,
    format text,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Jam tracks and sessions
CREATE TABLE jam_tracks (
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

CREATE TABLE jam_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    jam_track_id uuid REFERENCES jam_tracks(id) ON DELETE CASCADE,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    notes text,
    duration_seconds int,
    created_at timestamptz DEFAULT now()
);

-- Progress tracking
CREATE TABLE lesson_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
    progress int NOT NULL DEFAULT 0,
    completed boolean NOT NULL DEFAULT false,
    updated_at timestamptz DEFAULT now(),
    UNIQUE (user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);

CREATE TABLE riff_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    riff_id uuid REFERENCES riffs(id) ON DELETE CASCADE,
    progress int NOT NULL DEFAULT 0,
    completed boolean NOT NULL DEFAULT false,
    updated_at timestamptz DEFAULT now(),
    UNIQUE (user_id, riff_id)
);

CREATE INDEX idx_riff_progress_user ON riff_progress(user_id);
CREATE INDEX idx_riff_progress_riff ON riff_progress(riff_id);

CREATE TABLE xp_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    event_type text NOT NULL,
    xp_amount int NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_xp_events_user ON xp_events(user_id);

-- User achievements (streaks, etc.)
CREATE TABLE achievements (
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

CREATE INDEX idx_achievements_user ON achievements(user_id);

-- Tone presets
CREATE TABLE tone_presets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    settings jsonb NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tone_presets_user ON tone_presets(user_id);

-- AI feedback results
CREATE TABLE ai_feedback_results (
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

CREATE INDEX idx_ai_feedback_user ON ai_feedback_results(user_id);
CREATE INDEX idx_ai_feedback_riff ON ai_feedback_results(riff_id);
