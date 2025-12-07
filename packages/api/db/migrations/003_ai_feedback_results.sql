-- AI Feedback Results Table
CREATE TABLE ai_feedback_results (
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

CREATE INDEX idx_ai_feedback_user ON ai_feedback_results(user_id);
CREATE INDEX idx_ai_feedback_riff ON ai_feedback_results(riff_id);