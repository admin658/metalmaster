import { NextRequest } from 'next/server';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success, failure } from '../../_lib/responses';
import { UpdateSpeedTrainerSessionSchema } from '@metalmaster/shared-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { id } = params;
    const { data, error } = await supabase
      .from('speed_trainer_sessions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !data) {
      return failure(404, 'NOT_FOUND', 'Speed trainer session not found');
    }

    return success(data);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { id } = params;
    const body = await req.json();
    const parsed = UpdateSpeedTrainerSessionSchema.parse(body);

    const { data, error } = await supabase
      .from('speed_trainer_sessions')
      .update(parsed)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error || !data) {
      return failure(404, 'NOT_FOUND', 'Speed trainer session not found');
    }

    return success(data);
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;
    const { id } = params;

    const { error } = await supabase
      .from('speed_trainer_sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return success(null);
  } catch (err) {
    return handleRouteError(err);
  }
}
