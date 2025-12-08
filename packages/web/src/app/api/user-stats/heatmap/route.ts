import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success, failure } from '../../_lib/responses';
import { UserPracticeHeatmapSchema } from '@metalmaster/shared-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HeatmapQuerySchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { searchParams } = new URL(req.url);
    const parsed = HeatmapQuerySchema.parse({
      start_date: searchParams.get('start_date'),
      end_date: searchParams.get('end_date'),
    });

    const { data, error } = await supabase
      .from('user_practice_heatmap')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', parsed.start_date)
      .lte('date', parsed.end_date)
      .order('date', { ascending: true });

    if (error) throw error;

    const parsedData = z.array(UserPracticeHeatmapSchema).parse(data || []);
    return success(parsedData);
  } catch (err) {
    return handleRouteError(err);
  }
}
