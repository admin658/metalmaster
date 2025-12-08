import { NextRequest } from 'next/server';
import { requireUser } from '../_lib/auth';
import { handleRouteError, success } from '../_lib/responses';
import { CreatePracticeSessionSchema } from '@metalmaster/shared-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const sessionType = searchParams.get('session_type') || undefined;

    let query = supabase
      .from('practice_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (sessionType) {
      query = query.eq('session_type', sessionType);
    }

    const { data, count, error } = await query
      .order('started_at', { ascending: false })
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

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const body = await req.json();
    const parsed = CreatePracticeSessionSchema.parse(body);

    const { data, error } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: user.id,
        session_type: parsed.session_type,
        related_riff_id: parsed.related_riff_id || null,
        related_lesson_id: parsed.related_lesson_id || null,
        related_jam_track_id: parsed.related_jam_track_id || null,
        duration_seconds: parsed.duration_seconds,
        xp_earned: parsed.xp_earned,
        accuracy_percentage: parsed.accuracy_percentage || null,
        notes: parsed.notes || null,
        started_at: new Date(Date.now() - parsed.duration_seconds * 1000).toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) throw error;

    return success(data, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
