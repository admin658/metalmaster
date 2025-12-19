import { NextRequest } from 'next/server';
import { requireUser } from '../../../_lib/auth';
import { handleRouteError, success, failure } from '../../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ achievementId: string }> },
) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { achievementId } = await params;

    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId)
      .maybeSingle();

    if (existing) {
      return failure(400, 'ALREADY_EARNED', 'Achievement already earned by this user');
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievementId,
        earned_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;

    return success(data, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
