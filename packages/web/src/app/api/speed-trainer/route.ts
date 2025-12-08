import { NextRequest } from 'next/server';
import { requireUser } from '../_lib/auth';
import { handleRouteError, success, failure } from '../_lib/responses';
import { CreateSpeedTrainerSessionSchema } from '@metalmaster/shared-validation';

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
    const exerciseType = searchParams.get('exercise_type') || undefined;

    let query = supabase
      .from('speed_trainer_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    if (exerciseType) {
      query = query.eq('exercise_type', exerciseType);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
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
    const parsed = CreateSpeedTrainerSessionSchema.parse(body);

    const { data, error } = await supabase
      .from('speed_trainer_sessions')
      .insert({
        user_id: user.id,
        exercise_type: parsed.exercise_type,
        starting_bpm: parsed.starting_bpm,
        ending_bpm: parsed.starting_bpm,
        current_bpm: parsed.starting_bpm,
        target_bpm: parsed.target_bpm,
        duration_seconds: 0,
        accuracy_percentage: 0,
        riff_id: parsed.riff_id || null,
        auto_increment_enabled: parsed.auto_increment_enabled,
        notes: parsed.notes || null,
      })
      .select('*')
      .single();

    if (error) throw error;

    return success(data, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
