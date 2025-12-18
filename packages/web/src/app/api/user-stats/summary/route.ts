import { NextRequest } from 'next/server';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success, failure } from '../../_lib/responses';
import { UserStatsSchema } from '@metalmaster/shared-validation';
import { supabaseAdmin } from '../../_lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;
    const writeClient = supabaseAdmin || supabase;

    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // Upsert user row then create default stats
      const { error: upsertUserError } = await writeClient
        .from('users')
        .upsert({ id: user.id, email: user.email }, { onConflict: 'id' });
      if (upsertUserError && upsertUserError.code !== '23505') {
        return failure(
          500,
          upsertUserError.code || 'USER_INSERT_FAILED',
          upsertUserError.message || 'Failed to insert user row',
          upsertUserError,
        );
      }

      const { data: newStats, error: createError } = await writeClient
        .from('user_stats')
        .insert({
          user_id: user.id,
          total_xp: 0,
          level: 1,
          level_tier: 'Novice',
          total_practice_minutes: 0,
          total_lessons_completed: 0,
          current_streak_days: 0,
          longest_streak_days: 0,
          accuracy_score: 0,
          speed_score: 0,
          rhythm_score: 0,
          tone_knowledge_score: 0,
          subscription_status: 'free',
        })
        .select('*')
        .single();

      if (createError) {
        // Fall back to a demo payload when service role / RLS prevents creation
        return success({
          total_xp: 0,
          level: 1,
          level_tier: 'Novice',
          total_practice_minutes: 0,
          current_streak_days: 0,
          longest_streak_days: 0,
          today: { practice_minutes: 0, xp_earned: 0 },
          this_week: { practice_minutes: 0, xp_earned: 0 },
        });
      }

      const stats = UserStatsSchema.parse(newStats);
      return success({
        total_xp: stats.total_xp,
        level: stats.level,
        level_tier: stats.level_tier,
        total_practice_minutes: stats.total_practice_minutes,
        current_streak_days: stats.current_streak_days,
        longest_streak_days: stats.longest_streak_days,
        today: { practice_minutes: 0, xp_earned: 0 },
        this_week: { practice_minutes: 0, xp_earned: 0 },
      });
    }

    if (error) {
      return success({
        total_xp: 0,
        level: 1,
        level_tier: 'Novice',
        total_practice_minutes: 0,
        current_streak_days: 0,
        longest_streak_days: 0,
        today: { practice_minutes: 0, xp_earned: 0 },
        this_week: { practice_minutes: 0, xp_earned: 0 },
      });
    }

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
