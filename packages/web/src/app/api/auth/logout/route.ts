import { NextRequest } from 'next/server';
import { createUserSupabaseClient } from '../../_lib/supabase';
import { handleRouteError, success, failure } from '../../_lib/responses';
import { extractToken } from '../../_lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    const supabase = createUserSupabaseClient(token || undefined);

    const { error } = await supabase.auth.signOut();

    if (error) {
      return failure(400, 'LOGOUT_ERROR', error.message);
    }

    return success();
  } catch (err) {
    return handleRouteError(err);
  }
}
