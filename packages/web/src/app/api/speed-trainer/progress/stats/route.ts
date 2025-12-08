import { NextRequest } from 'next/server';
import { requireUser } from '../../../_lib/auth';
import { handleRouteError, success } from '../../../_lib/responses';
import type { SpeedTrainerSession } from '@metalmaster/shared-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { searchParams } = new URL(req.url);
    const exerciseType = searchParams.get('exercise_type') || undefined;

    let query = supabase
      .from('speed_trainer_sessions')
      .select('exercise_type, current_bpm, accuracy_percentage, created_at')
      .eq('user_id', user.id);

    if (exerciseType) {
      query = query.eq('exercise_type', exerciseType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    const grouped = (data || []).reduce<Record<string, SpeedTrainerSession[]>>((acc, session) => {
      const key = session.exercise_type;
      acc[key] = acc[key] || [];
      acc[key].push(session as SpeedTrainerSession);
      return acc;
    }, {});

    const stats = Object.entries(grouped).map(([type, sessions]) => {
      const bpms = sessions.map((s) => s.current_bpm);
      const personalBest = Math.max(...bpms);
      const average = Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length);

      return {
        exercise_type: type,
        personal_best_bpm: personalBest,
        average_bpm: average,
        total_sessions: sessions.length,
        last_session_date: sessions[0].created_at,
        improvement_trend: 0,
      };
    });

    return success(stats);
  } catch (err) {
    return handleRouteError(err);
  }
}
