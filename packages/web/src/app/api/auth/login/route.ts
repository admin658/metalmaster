import { NextRequest } from 'next/server';
import { AuthRequestSchema } from '@metalmaster/shared-validation';
import { createUserSupabaseClient } from '../../_lib/supabase';
import { handleRouteError, success, failure } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = AuthRequestSchema.parse(body);

    const supabase = createUserSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      return failure(401, 'AUTH_ERROR', error.message);
    }

    return success({
      user: {
        id: data.user?.id,
        email: data.user?.email,
        username: (data.user?.user_metadata as any)?.username,
      },
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
