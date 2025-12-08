import { NextRequest } from 'next/server';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success, failure } from '../../_lib/responses';
import { UserStatsSchema } from '@metalmaster/shared-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return failure(404, 'NOT_FOUND', 'User stats not found');
    }

    if (error) throw error;

    const stats = UserStatsSchema.parse(data);

    const today = new Date().toISOString().split('T')[0];
    const { data: todayHeatmap } = await supabase
      .from('user_practice_heatmap')
      .select('practice_minutes, xp_earned')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: weekHeatmap } = await supabase
      .from('user_practice_heatmap')
      .select('practice_minutes, xp_earned')
      .eq('user_id', user.id)
      .gte('date', weekAgo);

    const weekPracticeMins = (weekHeatmap || []).reduce((sum, h: any) => sum + h.practice_minutes, 0);
    const weekXp = (weekHeatmap || []).reduce((sum, h: any) => sum + h.xp_earned, 0);

    return success({
      total_xp: data.total_xp,
      level: data.level,
      level_tier: data.level_tier,
      total_practice_minutes: data.total_practice_minutes,
      current_streak_days: data.current_streak_days,
      longest_streak_days: data.longest_streak_days,
      today: {
        practice_minutes: todayHeatmap?.practice_minutes || 0,
        xp_earned: todayHeatmap?.xp_earned || 0,
      },
      this_week: {
        practice_minutes: weekPracticeMins,
        xp_earned: weekXp,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
