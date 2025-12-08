import { NextRequest } from 'next/server';
import { createUserSupabaseClient } from '../_lib/supabase';
import { handleRouteError, success } from '../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createUserSupabaseClient();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;

    const { data, count, error } = await supabase
      .from('daily_riffs')
      .select('*', { count: 'exact' })
      .order('featured_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return success({
      items: data || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
