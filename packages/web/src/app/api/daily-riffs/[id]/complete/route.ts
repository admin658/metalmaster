import { NextRequest } from 'next/server';
import { requireUser } from '../../../_lib/auth';
import { handleRouteError, success, failure } from '../../../_lib/responses';
import { CreateDailyRiffCompletionSchema } from '@metalmaster/shared-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { id } = await params;
    const parsed = CreateDailyRiffCompletionSchema.parse({ daily_riff_id: id });

    const { data: dailyRiff, error: riffError } = await supabase
      .from('daily_riffs')
      .select('xp_bonus, featured_date')
      .eq('id', parsed.daily_riff_id)
      .single();

    if (riffError || !dailyRiff) {
      return failure(404, 'NOT_FOUND', 'Daily riff not found');
    }

    const completedDate = new Date();
    const featuredDate = new Date(dailyRiff.featured_date);
    const hoursElapsed = (completedDate.getTime() - featuredDate.getTime()) / (1000 * 60 * 60);
    const bonusEarned = hoursElapsed <= 24;
    const xpEarned = dailyRiff.xp_bonus * (bonusEarned ? 1.5 : 1);

    const { data, error } = await supabase
      .from('daily_riff_completions')
      .insert({
        user_id: user.id,
        daily_riff_id: parsed.daily_riff_id,
        xp_earned: Math.round(xpEarned),
        bonus_earned: bonusEarned,
      })
      .select('*')
      .single();

    if (error) throw error;

    return success(data, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
