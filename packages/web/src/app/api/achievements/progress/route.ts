import { NextRequest } from 'next/server';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { data: library, error: libError } = await supabase
      .from('achievements_library')
      .select('*');
    if (libError) throw libError;

    const { data: earned, error: earnedError } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at, progress_percentage')
      .eq('user_id', user.id);
    if (earnedError) throw earnedError;

    const earnedMap = new Map(earned?.map(e => [e.achievement_id, e]) || []);
    const progress = (library || []).map(achievement => ({
      achievement_id: achievement.id,
      badge_id: achievement.badge_id,
      name: achievement.name,
      progress_percentage: earnedMap.get(achievement.id)?.progress_percentage || 0,
      earned: earnedMap.has(achievement.id),
      earned_date: earnedMap.get(achievement.id)?.earned_at,
    }));

    return success(progress);
  } catch (err) {
    return handleRouteError(err);
  }
}
