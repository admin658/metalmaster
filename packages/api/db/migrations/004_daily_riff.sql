-- Daily Riff Table
CREATE TABLE daily_riffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    riff_id UUID REFERENCES riffs(id) ON DELETE CASCADE,
    date DATE NOT NULL UNIQUE,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Daily Riff Progress
CREATE TABLE user_daily_riff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    daily_riff_id UUID REFERENCES daily_riffs(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, daily_riff_id)
);

CREATE INDEX idx_daily_riff_date ON daily_riffs(date);
CREATE INDEX idx_user_daily_riff_user ON user_daily_riff(user_id);
