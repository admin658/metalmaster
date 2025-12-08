import { NextRequest } from 'next/server';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success, failure } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { xp_earned, practice_minutes, lesson_completed } = await req.json();

    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!currentStats) {
      return failure(404, 'NOT_FOUND', 'User stats not found');
    }

    const now = new Date();
    const today = new Date(now.toISOString().split('T')[0]);
    const lastActive = currentStats.last_active_at ? new Date(currentStats.last_active_at) : null;
    const daysSinceLast =
      lastActive ? Math.floor((today.getTime() - new Date(lastActive.toISOString().split('T')[0]).getTime()) / (1000 * 60 * 60 * 24)) : null;

    let newStreak = currentStats.current_streak_days || 0;
    if (daysSinceLast === null) {
      newStreak = 1;
    } else if (daysSinceLast === 0) {
      newStreak = Math.max(newStreak, 1);
    } else if (daysSinceLast === 1) {
      newStreak = newStreak + 1;
    } else {
      newStreak = 1;
    }

    const newLongestStreak = Math.max(currentStats.longest_streak_days || 0, newStreak);
    const newTotalXp = currentStats.total_xp + (xp_earned || 0);
    const newLevel = Math.floor(newTotalXp / 1000) + 1;

    const tiers = [
      'Novice',
      'Acolyte',
      'Hammerhand',
      'Thrash Apprentice',
      'Riff Adept',
      'Blackened Knight',
      'Djent Architect',
      'Shred Overlord',
    ];
    const newTier = tiers[Math.min(newLevel - 1, tiers.length - 1)];

    const { data: updatedStats, error } = await supabase
      .from('user_stats')
      .update({
        total_xp: newTotalXp,
        level: newLevel,
        level_tier: newTier,
        total_practice_minutes: currentStats.total_practice_minutes + (practice_minutes || 0),
        total_lessons_completed: currentStats.total_lessons_completed + (lesson_completed ? 1 : 0),
        current_streak_days: newStreak,
        longest_streak_days: newLongestStreak,
        last_active_at: now.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error) throw error;

    return success(updatedStats);
  } catch (err) {
    return handleRouteError(err);
  }
}
