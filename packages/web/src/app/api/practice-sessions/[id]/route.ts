import { NextRequest } from 'next/server';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success, failure } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireUser(_req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;
    const { id } = params;

    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return failure(404, 'NOT_FOUND', 'Practice session not found');
    }

    return success(data);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireUser(_req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;
    const { id } = params;

    const { error } = await supabase
      .from('practice_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return success(null);
  } catch (err) {
    return handleRouteError(err);
  }
}
