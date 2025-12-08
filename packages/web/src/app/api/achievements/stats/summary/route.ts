import { NextRequest } from 'next/server';
import { requireUser } from '../../../_lib/auth';
import { handleRouteError, success } from '../../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { data: achievements, error } = await supabase
      .from('user_achievements')
      .select('achievements_library(xp_multiplier)')
      .eq('user_id', user.id);

    if (error) throw error;

    const totalAchievements = (achievements || []).length;
    const xpMultiplier =
      achievements?.reduce((sum, a: any) => sum + (a.achievements_library?.xp_multiplier || 1), 0) || 0;

    return success({
      total_achievements: totalAchievements,
      cumulative_xp_multiplier: Math.round((xpMultiplier / Math.max(totalAchievements, 1)) * 100) / 100,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
