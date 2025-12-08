import { NextRequest } from 'next/server';
import { SignUpRequestSchema } from '@metalmaster/shared-validation';
import { createUserSupabaseClient } from '../../_lib/supabase';
import { handleRouteError, success, failure } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = SignUpRequestSchema.parse(body);

    const supabase = createUserSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: { data: { username: validated.username } },
    });

    if (error) {
      return failure(400, 'SIGNUP_ERROR', error.message);
    }

    return success(
      {
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      },
      201,
    );
  } catch (err) {
    return handleRouteError(err);
  }
}
