import express from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth';
import {
  PracticeMetricsSchema,
  xpEngine,
  lessons,
  xpRules,
  getLevelForTotalXp,
  type PracticeMetrics,
} from '@metalmaster/shared-validation';

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseService =
  supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

const AwardRequestSchema = z.object({
  lessonId: z.string().min(1),
  sessionKey: z.string().uuid().optional(),
  trackIndex: z.number().int().nonnegative().optional().default(0),
  metrics: PracticeMetricsSchema,
});

const toDateKey = (date: Date) => date.toISOString().split('T')[0];

const ensureUserStats = async (userId: string) => {
  if (!supabaseService) {
    throw new Error('Database service not configured');
  }

  const { data, error } = await supabaseService
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!error) {
    return data;
  }

  if (error.code !== 'PGRST116') {
    throw error;
  }

  const { data: created, error: createError } = await supabaseService
    .from('user_stats')
    .insert({
      user_id: userId,
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
    })
    .select('*')
    .single();

  if (createError) throw createError;

  return created;
};

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

const awardXp =
  (awardMode: 'final' | 'tick') => async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      if (!supabaseService) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Database service not configured',
          },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
        });
      }

      const { lessonId, sessionKey, trackIndex, metrics } = AwardRequestSchema.parse(req.body);
      const userId = req.user!.id;
      const now = new Date();
      const nowIso = now.toISOString();

      const lessonConfig = lessons.find(lesson => lesson.lessonId === lessonId);
      if (!lessonConfig) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_LESSON',
            message: `Unknown lessonId "${lessonId}"`,
          },
          meta: {
            timestamp: nowIso,
            version: '1.0.0',
          },
        });
      }

      const userStats = await ensureUserStats(userId);

      const { data: existingCompletion } = await supabaseService
        .from('lesson_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      const { data: completedLessons } = await supabaseService
        .from('lesson_completions')
        .select('lesson_id')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);

      const completedLessonIds = completedLessons?.map(row => row.lesson_id) || [];

      const { data: earnedAchievements } = await supabaseService
        .from('user_achievements')
        .select('achievement_id, achievements_library(badge_id)')
        .eq('user_id', userId);

      const earnedBadgeIds =
        earnedAchievements
          ?.map((row: any) => row.achievements_library?.badge_id)
          .filter(Boolean) || [];

      let priorSessionAwards: ReturnType<typeof buildPriorAwards> | undefined;
      if (sessionKey) {
        const { data: priorEvents } = await supabaseService
          .from('xp_events')
          .select('metadata')
          .eq('user_id', userId)
          .contains('metadata', { sessionKey, trackIndex, lessonId });

        priorSessionAwards = buildPriorAwards(priorEvents || []);
      }

      const engineResult = xpEngine({
        userId,
        lessonId,
        metrics: metrics as PracticeMetrics,
        userStats,
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
        await supabaseService
          .from('lesson_completions')
          .insert({
            user_id: userId,
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
          await supabaseService
            .from('lesson_completions')
            .update(updates)
            .eq('user_id', userId)
            .eq('lesson_id', lessonId);
        }
      }

      const totalXp = userStats.total_xp + engineResult.xpAwarded;
      const levelEntry = getLevelForTotalXp(totalXp);
      const level = levelEntry.level;
      const levelTier = levelEntry.title;

      const practiceMinutes = Math.round(metrics.activeSeconds / 60);
      const lessonsCompletedDelta = completionAwarded ? 1 : 0;

      const { data: updatedStats, error: updateError } = await supabaseService
        .from('user_stats')
        .update({
          total_xp: totalXp,
          level,
          level_tier: levelTier,
          total_practice_minutes: userStats.total_practice_minutes + practiceMinutes,
          total_lessons_completed: userStats.total_lessons_completed + lessonsCompletedDelta,
          current_streak_days: engineResult.streakUpdate.newStreakDays,
          longest_streak_days: engineResult.streakUpdate.newLongestStreakDays,
          last_active_at: nowIso,
          updated_at: nowIso,
        })
        .eq('user_id', userId)
        .select('*')
        .single();

      if (updateError) throw updateError;

      const dateKey = toDateKey(now);
      const { data: heatmapRow } = await supabaseService
        .from('user_practice_heatmap')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateKey)
        .maybeSingle();

      if (!heatmapRow) {
        await supabaseService.from('user_practice_heatmap').insert({
          user_id: userId,
          date: dateKey,
          practice_minutes: practiceMinutes,
          lessons_completed: lessonsCompletedDelta,
          riffs_completed: 0,
          xp_earned: engineResult.xpAwarded,
        });
      } else {
        await supabaseService
          .from('user_practice_heatmap')
          .update({
            practice_minutes: (heatmapRow.practice_minutes || 0) + practiceMinutes,
            lessons_completed: (heatmapRow.lessons_completed || 0) + lessonsCompletedDelta,
            xp_earned: (heatmapRow.xp_earned || 0) + engineResult.xpAwarded,
          })
          .eq('id', heatmapRow.id);
      }

      if (sessionKey) {
        const { data: practiceSession } = await supabaseService
          .from('practice_sessions')
          .select('id, xp_earned')
          .eq('user_id', userId)
          .eq('session_key', sessionKey)
          .eq('track_index', trackIndex)
          .maybeSingle();

        if (practiceSession) {
          await supabaseService
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
          tempo_clean: engineResult.awardFlags.tempoCleanAwarded ? xpRules.tempo_bonus_clean : 0,
          tempo_aggro: engineResult.awardFlags.tempoAggroAwarded ? xpRules.tempo_bonus_aggro : 0,
          consistency: engineResult.xpBreakdown.consistencyBonus,
          streak: engineResult.xpBreakdown.streakBonus,
          completion: engineResult.xpBreakdown.challengeBonus,
        },
      };

      await supabaseService.from('xp_events').insert({
        user_id: userId,
        event_type: awardMode === 'tick' ? 'lesson_practice_tick' : 'lesson_practice_award',
        xp_amount: engineResult.xpAwarded,
        metadata: xpEventMetadata,
      });

      let awardedBadges: Array<{ badge_id: string; achievement_id: string | null; name: string }> = [];
      if (engineResult.newlyEarnedBadges.length > 0) {
        const { data: badgeRows } = await supabaseService
          .from('achievements_library')
          .select('id, badge_id, name')
          .in('badge_id', engineResult.newlyEarnedBadges);

        const badgeIdToAchievementId = new Map(
          (badgeRows || []).map(row => [row.badge_id, row.id])
        );

        const insertRows = engineResult.newlyEarnedBadges
          .map(badgeId => ({
            user_id: userId,
            achievement_id: badgeIdToAchievementId.get(badgeId),
            earned_at: nowIso,
          }))
          .filter(row => row.achievement_id);

        if (insertRows.length > 0) {
          await supabaseService.from('user_achievements').upsert(insertRows as any, {
            onConflict: 'user_id,achievement_id',
          });
        }

        awardedBadges = engineResult.newlyEarnedBadges.map(badgeId => ({
          badge_id: badgeId,
          achievement_id: badgeIdToAchievementId.get(badgeId) || null,
          name: badgeRows?.find(row => row.badge_id === badgeId)?.name || badgeId,
        }));
      }

      res.json({
        success: true,
        data: {
          xp_awarded: engineResult.xpAwarded,
          xp_breakdown: engineResult.xpBreakdown,
          total_xp: updatedStats.total_xp,
          level: updatedStats.level,
          level_tier: updatedStats.level_tier,
          current_streak_days: updatedStats.current_streak_days,
          badges_awarded: awardedBadges,
          completion_unlocked: engineResult.completionUnlocked,
        },
        meta: {
          timestamp: nowIso,
          version: '1.0.0',
        },
      });
    } catch (error) {
      next(error);
    }
  };

router.post('/award', authenticate, awardXp('final'));
router.post('/tick', authenticate, awardXp('tick'));

export { router as xpRoutes };
