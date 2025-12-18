import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success, failure } from '../../_lib/responses';
import { SkillCategoryStatsSchema } from '@metalmaster/shared-validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from('user_stats')
      .select('accuracy_score, speed_score, rhythm_score, tone_knowledge_score, updated_at')
      .eq('user_id', user.id)
      .single();

    if (error && error.code === 'PGRST116') {
      return success([
        { category: 'accuracy', current_score: 0, last_updated: new Date().toISOString(), progress_last_7_days: 0 },
        { category: 'speed', current_score: 0, last_updated: new Date().toISOString(), progress_last_7_days: 0 },
        { category: 'rhythm_consistency', current_score: 0, last_updated: new Date().toISOString(), progress_last_7_days: 0 },
        { category: 'tone_knowledge', current_score: 0, last_updated: new Date().toISOString(), progress_last_7_days: 0 },
      ]);
    }

    if (error) {
      return success([
        { category: 'accuracy', current_score: 0, last_updated: new Date().toISOString(), progress_last_7_days: 0 },
        { category: 'speed', current_score: 0, last_updated: new Date().toISOString(), progress_last_7_days: 0 },
        { category: 'rhythm_consistency', current_score: 0, last_updated: new Date().toISOString(), progress_last_7_days: 0 },
        { category: 'tone_knowledge', current_score: 0, last_updated: new Date().toISOString(), progress_last_7_days: 0 },
      ]);
    }

    const skillsData = [
      { category: 'accuracy', current_score: data.accuracy_score, last_updated: data.updated_at, progress_last_7_days: 0 },
      { category: 'speed', current_score: data.speed_score, last_updated: data.updated_at, progress_last_7_days: 0 },
      { category: 'rhythm_consistency', current_score: data.rhythm_score, last_updated: data.updated_at, progress_last_7_days: 0 },
      { category: 'tone_knowledge', current_score: data.tone_knowledge_score, last_updated: data.updated_at, progress_last_7_days: 0 },
    ];

    const parsed = z.array(SkillCategoryStatsSchema).parse(skillsData);
    return success(parsed);
  } catch (err) {
    return handleRouteError(err);
  }
}
