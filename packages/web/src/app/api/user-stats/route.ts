import { NextRequest } from 'next/server';
import { requireUser } from '../_lib/auth';
import { handleRouteError, success, failure } from '../_lib/responses';
import { supabaseAdmin } from '../_lib/supabase';

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
      // Ensure a corresponding user row exists (FK constraint)
      const writeClient = supabaseAdmin || supabase;

      const { data: userRow, error: userRowError } = await writeClient
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (userRowError && userRowError.code !== 'PGRST116') {
        throw userRowError;
      }

      const { error: insertUserError } = await writeClient
        .from('users')
        .upsert(
          {
            id: user.id,
            email: user.email,
          },
          { onConflict: 'id' },
        );
      if (insertUserError && insertUserError.code !== '23505') {
        return failure(
          500,
          insertUserError.code || 'USER_INSERT_FAILED',
          insertUserError.message || 'Failed to insert user row',
          insertUserError,
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
        });
      }
      return success(newStats);
    }

    if (error) {
      return success({
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
      });
    }

    return success(data);
  } catch (err) {
    return handleRouteError(err);
  }
}
