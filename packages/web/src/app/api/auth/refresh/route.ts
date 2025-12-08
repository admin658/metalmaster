import { NextRequest } from 'next/server';
import { createUserSupabaseClient } from '../../_lib/supabase';
import { handleRouteError, success, failure } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { refresh_token } = await req.json();
    const supabase = createUserSupabaseClient();

    const { data, error } = await supabase.auth.refreshSession({ refresh_token });

    if (error) {
      return failure(401, 'REFRESH_ERROR', error.message);
    }

    return success({
      tokens: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
      },
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
