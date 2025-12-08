import { NextRequest } from 'next/server';
import { requireUser } from '../_lib/auth';
import { handleRouteError, success } from '../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*, achievements_library(*)')
      .eq('user_id', user.id)
      .order('earned_at', { ascending: false });

    if (error) throw error;

    return success(data || []);
  } catch (err) {
    return handleRouteError(err);
  }
}
