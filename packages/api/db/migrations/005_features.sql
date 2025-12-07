-- Metal Master Feature Tables Migration

-- SPEED TRAINER SESSIONS TABLE
CREATE TABLE speed_trainer_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    riff_id UUID REFERENCES riffs(id) ON DELETE SET NULL,
    exercise_type VARCHAR(50) NOT NULL,
    starting_bpm INTEGER NOT NULL CHECK (starting_bpm > 0),
    ending_bpm INTEGER NOT NULL CHECK (ending_bpm > 0),
    current_bpm INTEGER NOT NULL CHECK (current_bpm > 0),
    target_bpm INTEGER NOT NULL CHECK (target_bpm > 0),
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    accuracy_percentage DECIMAL(5,2) NOT NULL CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
    notes TEXT,
    auto_increment_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_speed_trainer_sessions_user ON speed_trainer_sessions(user_id);
CREATE INDEX idx_speed_trainer_sessions_riff ON speed_trainer_sessions(riff_id);

-- DAILY RIFFS TABLE
CREATE TABLE daily_riffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    riff_id UUID NOT NULL REFERENCES riffs(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    tab_content TEXT NOT NULL,
    description TEXT NOT NULL,
    subgenre VARCHAR(100) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL,
    xp_bonus INTEGER NOT NULL CHECK (xp_bonus > 0),
    featured_date DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_daily_riffs_featured_date ON daily_riffs(featured_date);
CREATE INDEX idx_daily_riffs_riff ON daily_riffs(riff_id);

-- DAILY RIFF COMPLETIONS TABLE
CREATE TABLE daily_riff_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    daily_riff_id UUID NOT NULL REFERENCES daily_riffs(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    xp_earned INTEGER NOT NULL CHECK (xp_earned >= 0),
    bonus_earned BOOLEAN DEFAULT false,
    UNIQUE(user_id, daily_riff_id)
);

CREATE INDEX idx_daily_riff_completions_user ON daily_riff_completions(user_id);
CREATE INDEX idx_daily_riff_completions_daily_riff ON daily_riff_completions(daily_riff_id);

-- ACHIEVEMENTS LIBRARY TABLE (Master list of all achievements)
CREATE TABLE achievements_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    xp_multiplier DECIMAL(3,2) NOT NULL CHECK (xp_multiplier >= 1 AND xp_multiplier <= 5),
    requirements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- USER ACHIEVEMENTS TABLE
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements_library(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    progress_percentage DECIMAL(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- USER STATS TABLE
CREATE TABLE user_stats (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    total_xp INTEGER NOT NULL DEFAULT 0 CHECK (total_xp >= 0),
    level INTEGER NOT NULL DEFAULT 1 CHECK (level > 0),
    level_tier VARCHAR(50) NOT NULL DEFAULT 'Novice',
    total_practice_minutes INTEGER NOT NULL DEFAULT 0 CHECK (total_practice_minutes >= 0),
    total_lessons_completed INTEGER NOT NULL DEFAULT 0 CHECK (total_lessons_completed >= 0),
    current_streak_days INTEGER NOT NULL DEFAULT 0 CHECK (current_streak_days >= 0),
    longest_streak_days INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak_days >= 0),
    accuracy_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (accuracy_score >= 0 AND accuracy_score <= 100),
    speed_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (speed_score >= 0 AND speed_score <= 100),
    rhythm_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (rhythm_score >= 0 AND rhythm_score <= 100),
    tone_knowledge_score DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (tone_knowledge_score >= 0 AND tone_knowledge_score <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- USER PRACTICE HEATMAP TABLE
CREATE TABLE user_practice_heatmap (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    practice_minutes INTEGER NOT NULL DEFAULT 0 CHECK (practice_minutes >= 0),
    lessons_completed INTEGER NOT NULL DEFAULT 0 CHECK (lessons_completed >= 0),
    riffs_completed INTEGER NOT NULL DEFAULT 0 CHECK (riffs_completed >= 0),
    xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    UNIQUE(user_id, date)
);

CREATE INDEX idx_user_practice_heatmap_user ON user_practice_heatmap(user_id);
CREATE INDEX idx_user_practice_heatmap_date ON user_practice_heatmap(date);

-- PRACTICE SESSIONS TABLE
CREATE TABLE practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL,
    related_riff_id UUID REFERENCES riffs(id) ON DELETE SET NULL,
    related_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    related_jam_track_id UUID REFERENCES jam_tracks(id) ON DELETE SET NULL,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    accuracy_percentage DECIMAL(5,2) CHECK (accuracy_percentage >= 0 AND accuracy_percentage <= 100),
    notes TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_practice_sessions_user ON practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_type ON practice_sessions(session_type);
CREATE INDEX idx_practice_sessions_started_at ON practice_sessions(started_at);
CREATE INDEX idx_practice_sessions_riff ON practice_sessions(related_riff_id);
CREATE INDEX idx_practice_sessions_lesson ON practice_sessions(related_lesson_id);

-- ENABLE ROW-LEVEL SECURITY
ALTER TABLE speed_trainer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_riff_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_practice_heatmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
