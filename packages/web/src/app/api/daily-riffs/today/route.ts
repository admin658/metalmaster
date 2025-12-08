import { NextRequest } from 'next/server';
import { createUserSupabaseClient } from '../../_lib/supabase';
import { handleRouteError, success, failure } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const supabase = createUserSupabaseClient();
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_riffs')
      .select('*, riffs(title, description)')
      .eq('featured_date', today)
      .single();

    if (error && (error as any).code === 'PGRST116') {
      return failure(404, 'NOT_FOUND', 'No daily riff featured for today');
    }

    if (error) throw error;

    return success(data);
  } catch (err) {
    return handleRouteError(err);
  }
}
