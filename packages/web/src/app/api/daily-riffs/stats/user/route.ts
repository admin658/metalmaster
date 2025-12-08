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

    const today = new Date().toISOString().split('T')[0];

    const { data: todayCompletion } = await supabase
      .from('daily_riff_completions')
      .select('id')
      .eq('user_id', user.id)
      .gte('completed_at', `${today}T00:00:00`)
      .single();

    const { data: completions } = await supabase
      .from('daily_riff_completions')
      .select('completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    let streak = 0;
    if (completions && completions.length > 0) {
      let currentDate = new Date();
      for (const completion of completions) {
        const completionDate = new Date(completion.completed_at);
        const daysDiff = Math.floor(
          (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysDiff === streak) {
          streak++;
          currentDate = new Date(completionDate);
        } else {
          break;
        }
      }
    }

    return success({
      completed_today: !!todayCompletion,
      days_completed_streak: streak,
      total_completed: completions?.length || 0,
      next_riff_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
