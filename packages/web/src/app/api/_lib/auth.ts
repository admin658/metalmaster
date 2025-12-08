import { NextRequest } from 'next/server';
import { createUserSupabaseClient } from './supabase';
import { failure } from './responses';

export type AuthResult =
  | { user: { id: string; email: string }; token: string; supabase: ReturnType<typeof createUserSupabaseClient> }
  | { error: Response };

export function extractToken(req: NextRequest) {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  const token = header?.replace(/Bearer\s+/i, '');
  return token || null;
}

export async function requireUser(req: NextRequest): Promise<AuthResult> {
  const token = extractToken(req);
  if (!token) {
    return { error: failure(401, 'UNAUTHORIZED', 'Missing authorization token') };
  }

  const supabase = createUserSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { error: failure(401, 'UNAUTHORIZED', 'Invalid token') };
  }

  return {
    user: { id: data.user.id, email: data.user.email || '' },
    token,
    supabase,
  };
}
