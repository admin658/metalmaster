-- SQL helper to aggregate practice session stats without loading all rows.
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
