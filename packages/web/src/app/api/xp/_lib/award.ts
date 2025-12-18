import { NextRequest } from 'next/server';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success, failure } from '../../_lib/responses';
import { supabaseAdmin } from '../../_lib/supabase';
import { z } from 'zod';
import {
  xpEngine,
  xpBadgesConfig,
  getLevelForTotalXp,
} from '@metalmaster/shared-validation';
import type { PracticeMetrics } from '@metalmaster/shared-validation';

const AwardMetaSchema = z.object({
  lessonId: z.string().min(1),
  sessionKey: z.string().uuid().optional(),
  trackIndex: z.number().int().nonnegative().optional().default(0),
});

const PracticeMetricsSchema = z.object({
  activeSeconds: z.number().nonnegative(),
  totalSeconds: z.number().nonnegative(),
  loopsCompleted: z.number().int().nonnegative(),
  perfectLoops: z.number().int().nonnegative(),
  perfectLoopStreakMax: z.number().int().nonnegative(),
  avgTempoBpm: z.number().nonnegative(),
  maxTempoBpm: z.number().nonnegative(),
  pauses: z.number().int().nonnegative(),
  seeks: z.number().int().nonnegative(),
  loopSeconds: z.number().nonnegative(),
  lessonMinutesToday: z.number().nonnegative(),
  hadActivityGapOver20s: z.boolean(),
});

const toDateKey = (date: Date) => date.toISOString().split('T')[0];

const buildPriorAwards = (events: Array<{ metadata: any }>) => {
  const priorAwards = {
    tempoCleanAwarded: false,
    tempoAggroAwarded: false,
    consistencyAwarded: false,
    streakAwarded: false,
    completionAwarded: false,
  };

  for (const event of events) {
    const bonuses = event.metadata?.bonuses || {};
    if (bonuses.tempo_clean > 0) priorAwards.tempoCleanAwarded = true;
    if (bonuses.tempo_aggro > 0) priorAwards.tempoAggroAwarded = true;
    if (bonuses.consistency > 0) priorAwards.consistencyAwarded = true;
    if (bonuses.streak > 0) priorAwards.streakAwarded = true;
    if (bonuses.completion > 0) priorAwards.completionAwarded = true;
  }

  return priorAwards;
};

export async function handleXpAward(req: NextRequest, awardMode: 'final' | 'tick') {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { supabase, user } = auth;
    const writeClient = supabaseAdmin || supabase;

    const body = await req.json();
    const { lessonId, sessionKey, trackIndex } = AwardMetaSchema.parse(body);
    const metrics = PracticeMetricsSchema.parse(body.metrics) as PracticeMetrics;
    const now = new Date();
    const nowIso = now.toISOString();

    const lessonConfig = xpBadgesConfig?.lessons?.find(lesson => lesson.lessonId === lessonId);
    if (!lessonConfig) {
      return failure(400, 'INVALID_LESSON', `Unknown lessonId "${lessonId}"`);
    }

    const { data: userStats, error: statsError } = await writeClient
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError;
    }

    let ensuredStats = userStats;
    if (!ensuredStats) {
      await writeClient
        .from('users')
        .upsert(
          {
            id: user.id,
            email: user.email,
          },
          { onConflict: 'id' },
        );

      const { data: createdStats, error: createError } = await writeClient
        .from('user_stats')
        .insert({
          user_id: user.id,
          total_xp: 0,
          level: 1,
          level_tier: 'Novice',
          total_practice_minutes: 0,
          total_lessons_completed: 0,
          current_streak_days: 0,
          longest_streak_days: 0,
          accuracy_score: 0,
          speed_score: 0,
          rhythm_score: 0,
          tone_knowledge_score: 0,
          subscription_status: 'free',
        })
        .select('*')
        .single();

      if (createError) throw createError;
      ensuredStats = createdStats;
    }

    const { data: existingCompletion } = await writeClient
      .from('lesson_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    const { data: completedLessons } = await writeClient
      .from('lesson_completions')
      .select('lesson_id')
      .eq('user_id', user.id)
      .not('completed_at', 'is', null);

    const completedLessonIds = completedLessons?.map(row => row.lesson_id) || [];

    const { data: earnedAchievements } = await writeClient
      .from('user_achievements')
      .select('achievement_id, achievements_library(badge_id)')
      .eq('user_id', user.id);

    const earnedBadgeIds =
      earnedAchievements
        ?.map((row: any) => row.achievements_library?.badge_id)
        .filter(Boolean) || [];

    let priorSessionAwards: ReturnType<typeof buildPriorAwards> | undefined;
    if (sessionKey) {
      const { data: priorEvents } = await writeClient
        .from('xp_events')
        .select('metadata')
        .eq('user_id', user.id)
        .contains('metadata', { sessionKey, trackIndex, lessonId });

      priorSessionAwards = buildPriorAwards(priorEvents || []);
    }

    const engineResult = xpEngine({
      userId: user.id,
      lessonId,
      metrics: metrics as PracticeMetrics,
      userStats: ensuredStats,
      timestamps: {
        now: nowIso,
      },
      previousLessonCompletion: existingCompletion,
      completedLessonIds,
      earnedBadgeIds,
      priorSessionAwards,
      awardMode,
    });

    const tempoCleanEligible = metrics.maxTempoBpm >= lessonConfig.clean_tempo;
    const tempoAggroEligible = metrics.maxTempoBpm >= lessonConfig.aggro_tempo;
    const completionAwarded = engineResult.awardFlags.completionAwarded;

    if (!existingCompletion && (completionAwarded || engineResult.awardFlags.tempoAggroAwarded || tempoCleanEligible)) {
      await writeClient
        .from('lesson_completions')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          completed_at: completionAwarded ? nowIso : null,
          best_clean_tempo: tempoCleanEligible ? metrics.maxTempoBpm : 0,
          best_aggro_tempo: engineResult.awardFlags.tempoAggroAwarded ? metrics.maxTempoBpm : 0,
        });
    } else if (existingCompletion) {
      const updates: Record<string, any> = {};
      if (completionAwarded && !existingCompletion.completed_at) {
        updates.completed_at = nowIso;
      }

      if (tempoCleanEligible && metrics.maxTempoBpm > (existingCompletion.best_clean_tempo || 0)) {
        updates.best_clean_tempo = metrics.maxTempoBpm;
      }

      if (tempoAggroEligible && metrics.maxTempoBpm > (existingCompletion.best_aggro_tempo || 0)) {
        updates.best_aggro_tempo = metrics.maxTempoBpm;
      }

      if (Object.keys(updates).length > 0) {
        await writeClient
          .from('lesson_completions')
          .update(updates)
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);
      }
    }

    const totalXp = ensuredStats.total_xp + engineResult.xpAwarded;
    const levelEntry = getLevelForTotalXp(totalXp);
    const level = levelEntry.level;
    const levelTier = levelEntry.title;

    const practiceMinutes = Math.round(metrics.activeSeconds / 60);
    const lessonsCompletedDelta = completionAwarded ? 1 : 0;

    const { data: updatedStats, error: updateError } = await writeClient
      .from('user_stats')
      .update({
        total_xp: totalXp,
        level,
        level_tier: levelTier,
        total_practice_minutes: ensuredStats.total_practice_minutes + practiceMinutes,
        total_lessons_completed: ensuredStats.total_lessons_completed + lessonsCompletedDelta,
        current_streak_days: engineResult.streakUpdate.newStreakDays,
        longest_streak_days: engineResult.streakUpdate.newLongestStreakDays,
        last_active_at: nowIso,
        updated_at: nowIso,
      })
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (updateError) throw updateError;

    const dateKey = toDateKey(now);
    const { data: heatmapRow } = await writeClient
      .from('user_practice_heatmap')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', dateKey)
      .maybeSingle();

    if (!heatmapRow) {
      await writeClient.from('user_practice_heatmap').insert({
        user_id: user.id,
        date: dateKey,
        practice_minutes: practiceMinutes,
        lessons_completed: lessonsCompletedDelta,
        riffs_completed: 0,
        xp_earned: engineResult.xpAwarded,
      });
    } else {
      await writeClient
        .from('user_practice_heatmap')
        .update({
          practice_minutes: (heatmapRow.practice_minutes || 0) + practiceMinutes,
          lessons_completed: (heatmapRow.lessons_completed || 0) + lessonsCompletedDelta,
          xp_earned: (heatmapRow.xp_earned || 0) + engineResult.xpAwarded,
        })
        .eq('id', heatmapRow.id);
    }

    if (sessionKey) {
      const { data: practiceSession } = await writeClient
        .from('practice_sessions')
        .select('id, xp_earned')
        .eq('user_id', user.id)
        .eq('session_key', sessionKey)
        .eq('track_index', trackIndex)
        .maybeSingle();

      if (practiceSession) {
        await writeClient
          .from('practice_sessions')
          .update({
            xp_earned: (practiceSession.xp_earned || 0) + engineResult.xpAwarded,
          })
          .eq('id', practiceSession.id);
      }
    }

    const xpEventMetadata = {
      lessonId,
      sessionKey,
      trackIndex,
      awardMode,
      completionUnlocked: engineResult.completionUnlocked,
      metrics: {
        activeSeconds: metrics.activeSeconds,
        totalSeconds: metrics.totalSeconds,
        loopsCompleted: metrics.loopsCompleted,
        perfectLoopStreakMax: metrics.perfectLoopStreakMax,
        maxTempoBpm: metrics.maxTempoBpm,
        seeks: metrics.seeks,
        pauses: metrics.pauses,
      },
      breakdown: engineResult.xpBreakdown,
      bonuses: {
        tempo_clean: engineResult.awardFlags.tempoCleanAwarded ? xpBadgesConfig?.xpRules?.tempo_bonus_clean || 0 : 0,
        tempo_aggro: engineResult.awardFlags.tempoAggroAwarded ? xpBadgesConfig?.xpRules?.tempo_bonus_aggro || 0 : 0,
        consistency: engineResult.xpBreakdown.consistencyBonus,
        streak: engineResult.xpBreakdown.streakBonus,
        completion: engineResult.xpBreakdown.challengeBonus,
      },
    };

    await writeClient.from('xp_events').insert({
      user_id: user.id,
      event_type: awardMode === 'tick' ? 'lesson_practice_tick' : 'lesson_practice_award',
      xp_amount: engineResult.xpAwarded,
      metadata: xpEventMetadata,
    });

    let awardedBadges: Array<{ badge_id: string; achievement_id: string | null; name: string }> = [];
    if (engineResult.newlyEarnedBadges.length > 0) {
      const { data: badgeRows } = await writeClient
        .from('achievements_library')
        .select('id, badge_id, name')
        .in('badge_id', engineResult.newlyEarnedBadges);

      const badgeIdToAchievementId = new Map(
        (badgeRows || []).map(row => [row.badge_id, row.id]),
      );

      const insertRows = engineResult.newlyEarnedBadges
        .map(badgeId => ({
          user_id: user.id,
          achievement_id: badgeIdToAchievementId.get(badgeId),
          earned_at: nowIso,
        }))
        .filter(row => row.achievement_id);

      if (insertRows.length > 0) {
        await writeClient.from('user_achievements').upsert(insertRows as any, {
          onConflict: 'user_id,achievement_id',
        });
      }

      awardedBadges = engineResult.newlyEarnedBadges.map(badgeId => ({
        badge_id: badgeId,
        achievement_id: badgeIdToAchievementId.get(badgeId) || null,
        name: badgeRows?.find(row => row.badge_id === badgeId)?.name || badgeId,
      }));
    }

    return success({
      xp_awarded: engineResult.xpAwarded,
      xp_breakdown: engineResult.xpBreakdown,
      total_xp: updatedStats.total_xp,
      level: updatedStats.level,
      level_tier: updatedStats.level_tier,
      current_streak_days: updatedStats.current_streak_days,
      badges_awarded: awardedBadges,
      completion_unlocked: engineResult.completionUnlocked,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
