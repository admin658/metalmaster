-- ============================================================
-- Metal Master - All Migrations Combined
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- Migration 001: Initial Schema
-- ============================================================
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

-- ============================================================
-- Migration 002: Metal Master Schema (Additional Tables)
-- ============================================================
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS riff_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    riff_id UUID REFERENCES riffs(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, riff_id)
);

CREATE TABLE IF NOT EXISTS xp_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    xp_amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tone_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_riff_progress_user ON riff_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_riff_progress_riff ON riff_progress(riff_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_tone_presets_user ON tone_presets(user_id);

-- ============================================================
-- Migration 003: AI Feedback Results Table
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_feedback_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    riff_id UUID REFERENCES riffs(id) ON DELETE CASCADE,
    accuracy NUMERIC(5,2) NOT NULL,
    timing_deviation NUMERIC(6,3) NOT NULL,
    noise_score NUMERIC(5,2) NOT NULL,
    pick_attack_score NUMERIC(5,2) NOT NULL,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback_results(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_riff ON ai_feedback_results(riff_id);

-- ============================================================
-- Migration 004: Daily Riff Table
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_riffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    riff_id UUID REFERENCES riffs(id) ON DELETE CASCADE,
    date DATE NOT NULL UNIQUE,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_daily_riff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    daily_riff_id UUID REFERENCES daily_riffs(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, daily_riff_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_riff_date ON daily_riffs(date);
CREATE INDEX IF NOT EXISTS idx_user_daily_riff_user ON user_daily_riff(user_id);
