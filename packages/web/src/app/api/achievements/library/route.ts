import { NextRequest } from 'next/server';
import { createUserSupabaseClient } from '../../_lib/supabase';
import { handleRouteError, success } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const supabase = createUserSupabaseClient();
    const { data, error } = await supabase
      .from('achievements_library')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return success(data || []);
  } catch (err) {
    return handleRouteError(err);
  }
}
