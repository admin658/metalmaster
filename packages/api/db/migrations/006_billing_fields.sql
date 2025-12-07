-- Add Stripe billing fields to user_stats table

ALTER TABLE user_stats 
ADD COLUMN stripe_customer_id VARCHAR(255),
ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'trial', 'lifetime'));

-- Create index on stripe_customer_id for faster lookups
CREATE INDEX idx_user_stats_stripe_customer ON user_stats(stripe_customer_id);
