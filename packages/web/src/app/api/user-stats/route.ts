import { NextRequest } from 'next/server';
import { requireUser } from '../_lib/auth';
import { handleRouteError, success, failure } from '../_lib/responses';

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
      const { data: newStats, error: createError } = await supabase
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
        })
        .select('*')
        .single();

      if (createError) throw createError;
      return success(newStats);
    }

    if (error) throw error;

    return success(data);
  } catch (err) {
    return handleRouteError(err);
  }
}
