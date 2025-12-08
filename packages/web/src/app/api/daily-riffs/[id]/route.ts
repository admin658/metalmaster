import { NextRequest } from 'next/server';
import { createUserSupabaseClient } from '../../_lib/supabase';
import { handleRouteError, success, failure } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const supabase = createUserSupabaseClient();
    const { id } = params;

    const { data, error } = await supabase
      .from('daily_riffs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return failure(404, 'NOT_FOUND', 'Daily riff not found');
    }

    return success(data);
  } catch (err) {
    return handleRouteError(err);
  }
}
