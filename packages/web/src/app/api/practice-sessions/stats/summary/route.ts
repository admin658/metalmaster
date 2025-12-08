import { NextRequest } from 'next/server';
import { requireUser } from '../../../_lib/auth';
import { handleRouteError, success } from '../../../_lib/responses';
import type { PracticeSession } from '@metalmaster/shared-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('session_type, duration_seconds, xp_earned, started_at')
      .eq('user_id', user.id);

    if (error) throw error;

    const sessions = (data || []) as PracticeSession[];
    const totalSessions = sessions.length;
    const totalDurationSeconds = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
    const totalXp = sessions.reduce((sum, s) => sum + s.xp_earned, 0);

    const typeCount = sessions.reduce<Record<string, number>>((acc, s) => {
      acc[s.session_type] = (acc[s.session_type] || 0) + 1;
      return acc;
    }, {});
    const mostCommonType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'lesson';

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const weekSessions = sessions.filter((s) => new Date(s.started_at) > new Date(weekAgo));
    const weekXp = weekSessions.reduce((sum, s) => sum + s.xp_earned, 0);

    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) => s.started_at.split('T')[0] === today);
    const todayXp = todaySessions.reduce((sum, s) => sum + s.xp_earned, 0);

    return success({
      total_sessions: totalSessions,
      total_practice_minutes: Math.round(totalDurationSeconds / 60),
      average_session_duration_minutes: totalSessions > 0 ? Math.round(totalDurationSeconds / 60 / totalSessions) : 0,
      most_common_session_type: mostCommonType,
      xp_earned_this_week: weekXp,
      xp_earned_today: todayXp,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
