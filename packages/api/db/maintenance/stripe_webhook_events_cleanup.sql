-- Cleanup old Stripe webhook events to keep the idempotency table small.
-- Run manually or schedule via Supabase cron.

DELETE FROM stripe_webhook_events
WHERE received_at < now() - interval '90 days';

-- Optional: schedule daily cleanup with pg_cron (requires extension enabled).
-- create extension if not exists pg_cron;
-- select cron.schedule(
--   'stripe-webhook-events-cleanup',
--   '0 3 * * *',
--   $$DELETE FROM stripe_webhook_events WHERE received_at < now() - interval '90 days';$$
-- );
