-- 002_feature_tables.sql
-- Feature tables: daily riffs, speed trainer, practice sessions, achievements library, user stats, billing

-- Ensure UUID generation is available for this migration step
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Speed trainer sessions
CREATE TABLE speed_trainer_sessions (
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

CREATE INDEX idx_speed_trainer_sessions_user ON speed_trainer_sessions(user_id);
CREATE INDEX idx_speed_trainer_sessions_riff ON speed_trainer_sessions(riff_id);

-- Daily riff content
CREATE TABLE daily_riffs (
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

CREATE INDEX idx_daily_riffs_featured_date ON daily_riffs(featured_date);
CREATE INDEX idx_daily_riffs_riff ON daily_riffs(riff_id);

CREATE TABLE daily_riff_completions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_riff_id uuid NOT NULL REFERENCES daily_riffs(id) ON DELETE CASCADE,
    completed_at timestamptz DEFAULT now(),
    xp_earned int NOT NULL CHECK (xp_earned >= 0),
    bonus_earned boolean DEFAULT false,
    UNIQUE (user_id, daily_riff_id)
);

CREATE INDEX idx_daily_riff_completions_user ON daily_riff_completions(user_id);
CREATE INDEX idx_daily_riff_completions_daily_riff ON daily_riff_completions(daily_riff_id);

-- Achievements library and earned achievements
CREATE TABLE achievements_library (
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

CREATE TABLE user_achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id uuid NOT NULL REFERENCES achievements_library(id) ON DELETE CASCADE,
    earned_at timestamptz DEFAULT now(),
    progress_percentage decimal(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- User stats (includes billing fields)
CREATE TABLE user_stats (
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

CREATE INDEX idx_user_stats_stripe_customer ON user_stats(stripe_customer_id);

-- Practice heatmap
CREATE TABLE user_practice_heatmap (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date date NOT NULL,
    practice_minutes int NOT NULL DEFAULT 0 CHECK (practice_minutes >= 0),
    lessons_completed int NOT NULL DEFAULT 0 CHECK (lessons_completed >= 0),
    riffs_completed int NOT NULL DEFAULT 0 CHECK (riffs_completed >= 0),
    xp_earned int NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    UNIQUE (user_id, date)
);

CREATE INDEX idx_user_practice_heatmap_user ON user_practice_heatmap(user_id);
CREATE INDEX idx_user_practice_heatmap_date ON user_practice_heatmap(date);

-- Practice sessions
CREATE TABLE practice_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type varchar(50) NOT NULL,
    related_riff_id uuid REFERENCES riffs(id) ON DELETE SET NULL,
    related_lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
    related_jam_track_id uuid REFERENCES jam_tracks(id) ON DELETE SET NULL,
    duration_seconds int NOT NULL CHECK (duration_seconds > 0),
    xp_earned int NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    accuracy_percentage decimal(5,2) CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
    notes text,
    started_at timestamptz NOT NULL,
    completed_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_type ON practice_sessions(session_type);
CREATE INDEX idx_practice_sessions_started_at ON practice_sessions(started_at);
CREATE INDEX idx_practice_sessions_riff ON practice_sessions(related_riff_id);
CREATE INDEX idx_practice_sessions_lesson ON practice_sessions(related_lesson_id);

-- Enable row level security for user-owned tables (policies to be defined in Supabase)
ALTER TABLE speed_trainer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_riff_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_heatmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
