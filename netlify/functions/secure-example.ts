import type { Handler } from '@netlify/functions';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type JsonBody =
  | { ok: true; userId: string; data: unknown }
  | { ok: false; message: string; details?: unknown };

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const json = (statusCode: number, body: JsonBody) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

function getBearerToken(authHeader?: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function getServiceRoleClient(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return json(405, { ok: false, message: 'Method not allowed' });
  }

  const token =
    getBearerToken(event.headers.authorization) ||
    getBearerToken((event.headers.Authorization as string | undefined) ?? null);

  if (!token) {
    return json(401, { ok: false, message: 'Missing Authorization: Bearer <token>' });
  }

  const supabase = getServiceRoleClient();

  if (!supabase) {
    return json(500, { ok: false, message: 'Supabase credentials are not configured' });
  }

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return json(401, { ok: false, message: 'Invalid or expired token', details: userError?.message });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('secure-example profileError', profileError);
    }

    return json(200, {
      ok: true,
      userId: user.id,
      data: profile ?? { note: 'No profile row found; update table name/columns for your project.' },
    });
  } catch (err) {
    console.error('secure-example error', err);
    return json(500, {
      ok: false,
      message: 'Unexpected server error',
    });
  }
};
