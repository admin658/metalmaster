import { badges, lessons, xpBadgesConfig, xpRules, type PracticeMetrics } from './xpBadgesConfig';

export type XpEngineInput = {
  userId: string;
  lessonId: string;
  metrics: PracticeMetrics;
  userStats: {
    total_xp: number;
    level: number;
    current_streak_days: number;
    longest_streak_days: number;
    last_active_at?: string | null;
  };
  timestamps: {
    now: string;
    sessionStart?: string;
    sessionEnd?: string;
  };
  previousLessonCompletion?: {
    completed_at?: string | null;
    best_clean_tempo?: number | null;
    best_aggro_tempo?: number | null;
  } | null;
  completedLessonIds?: string[];
  earnedBadgeIds?: string[];
  priorSessionAwards?: {
    tempoCleanAwarded?: boolean;
    tempoAggroAwarded?: boolean;
    consistencyAwarded?: boolean;
    streakAwarded?: boolean;
    completionAwarded?: boolean;
  };
  awardMode?: 'final' | 'tick';
};

export type XpBreakdown = {
  base: number;
  tempoBonus: number;
  consistencyBonus: number;
  streakBonus: number;
  challengeBonus: number;
  antiCheesePenalty: number;
  diminishingMultiplier: number;
};

export type XpEngineResult = {
  xpAwarded: number;
  xpBreakdown: XpBreakdown;
  newlyEarnedBadges: string[];
  completionUnlocked: boolean;
  streakUpdate: {
    newStreakDays: number;
    newLongestStreakDays: number;
    isFirstPracticeToday: boolean;
    previousStreakDays: number;
  };
  awardFlags: {
    tempoCleanAwarded: boolean;
    tempoAggroAwarded: boolean;
    completionAwarded: boolean;
  };
};

const toDateKey = (iso: string) => iso.split('T')[0];

const computeStreakUpdate = (
  userStats: XpEngineInput['userStats'],
  nowIso: string
) => {
  const todayKey = toDateKey(nowIso);
  const lastActiveKey = userStats.last_active_at ? toDateKey(userStats.last_active_at) : null;
  const previousStreak = userStats.current_streak_days || 0;

  if (!lastActiveKey) {
    return {
      newStreakDays: 1,
      newLongestStreakDays: Math.max(userStats.longest_streak_days || 0, 1),
      isFirstPracticeToday: true,
      previousStreakDays: previousStreak,
    };
  }

  if (lastActiveKey === todayKey) {
    const newStreak = Math.max(previousStreak, 1);
    return {
      newStreakDays: newStreak,
      newLongestStreakDays: Math.max(userStats.longest_streak_days || 0, newStreak),
      isFirstPracticeToday: false,
      previousStreakDays: previousStreak,
    };
  }

  const today = new Date(`${todayKey}T00:00:00.000Z`);
  const lastActive = new Date(`${lastActiveKey}T00:00:00.000Z`);
  const daysSinceLast = Math.round((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  const newStreak = daysSinceLast === 1 ? previousStreak + 1 : 1;
  return {
    newStreakDays: newStreak,
    newLongestStreakDays: Math.max(userStats.longest_streak_days || 0, newStreak),
    isFirstPracticeToday: true,
    previousStreakDays: previousStreak,
  };
};

const getLessonConfig = (lessonId: string) => {
  const lesson = lessons.find(l => l.lessonId === lessonId);
  if (!lesson) {
    throw new Error(`Unknown lessonId "${lessonId}" in xpEngine`);
  }
  return lesson;
};

const getDiminishingMultiplier = (minutesToday: number) => {
  const sorted = [...xpRules.diminishing_returns.after_minutes].sort((a, b) => b.minutes - a.minutes);
  for (const rule of sorted) {
    if (minutesToday >= rule.minutes) {
      return rule.multiplier;
    }
  }
  return 1;
};

export const xpEngine = (input: XpEngineInput): XpEngineResult => {
  const {
    lessonId,
    metrics,
    userStats,
    timestamps,
    previousLessonCompletion,
    completedLessonIds = [],
    earnedBadgeIds = [],
    priorSessionAwards,
    awardMode = 'final',
  } = input;

  const lesson = getLessonConfig(lessonId);
  const streakUpdate = computeStreakUpdate(userStats, timestamps.now);

  const baseRaw = Math.floor(metrics.activeSeconds / 10) * xpRules.base_xp_per_10s;
  const baseCapped = Math.min(baseRaw, xpRules.session_base_cap);

  let baseMultiplier = 1;
  if (
    metrics.loopSeconds < xpRules.anti_cheese.micro_loop.max_loop_seconds &&
    metrics.loopsCompleted > xpRules.anti_cheese.micro_loop.min_loops
  ) {
    baseMultiplier *= xpRules.anti_cheese.micro_loop.multiplier;
  }

  if (
    metrics.seeks >= xpRules.anti_cheese.seek_penalty.min_seeks &&
    metrics.totalSeconds <= xpRules.anti_cheese.seek_penalty.short_session_seconds
  ) {
    baseMultiplier *= xpRules.anti_cheese.seek_penalty.multiplier;
  }

  const diminishingMultiplier = getDiminishingMultiplier(metrics.lessonMinutesToday);
  const baseBeforeAntiCheese = Math.floor(baseCapped * baseMultiplier * diminishingMultiplier);

  const activeRatio = metrics.totalSeconds > 0 ? metrics.activeSeconds / metrics.totalSeconds : 0;
  const antiCheeseTriggered =
    xpRules.anti_cheese.disable_base_xp_if_inactive &&
    (metrics.hadActivityGapOver20s || activeRatio < xpRules.anti_cheese.min_active_ratio);

  const antiCheesePenalty = antiCheeseTriggered ? -baseBeforeAntiCheese : 0;
  const baseAwarded = baseBeforeAntiCheese + antiCheesePenalty;

  const bestConsistency = xpRules.consistency_bonuses
    .filter(bonus => metrics.perfectLoopStreakMax >= bonus.streak)
    .sort((a, b) => b.streak - a.streak)[0];

  const consistencyBonus =
    awardMode === 'final' && !priorSessionAwards?.consistencyAwarded
      ? bestConsistency?.bonus || 0
      : 0;

  const tempoCleanEligible = metrics.maxTempoBpm >= lesson.clean_tempo;
  const tempoCleanAwarded =
    awardMode === 'final' && tempoCleanEligible && !priorSessionAwards?.tempoCleanAwarded;

  const previousAggroAchieved =
    (previousLessonCompletion?.best_aggro_tempo || 0) >= lesson.aggro_tempo;
  const tempoAggroEligible = metrics.maxTempoBpm >= lesson.aggro_tempo;
  const tempoAggroAwarded =
    awardMode === 'final' &&
    tempoAggroEligible &&
    !previousAggroAchieved &&
    !priorSessionAwards?.tempoAggroAwarded;

  const tempoBonus =
    (tempoCleanAwarded ? xpRules.tempo_bonus_clean : 0) +
    (tempoAggroAwarded ? xpRules.tempo_bonus_aggro : 0);

  const completionUnlocked =
    metrics.activeSeconds >= lesson.min_active_seconds &&
    metrics.loopsCompleted >= lesson.min_loops;

  const completionAwarded =
    awardMode === 'final' && completionUnlocked && !previousLessonCompletion?.completed_at && !priorSessionAwards?.completionAwarded;

  const challengeBonus = completionAwarded ? lesson.completion_xp : 0;

  let streakBonus = 0;
  if (awardMode === 'final' && !priorSessionAwards?.streakAwarded) {
    if (streakUpdate.isFirstPracticeToday) {
      streakBonus += xpRules.streak_bonuses.daily;
    }

    for (const threshold of xpRules.streak_bonuses.thresholds) {
      if (streakUpdate.previousStreakDays < threshold.days && streakUpdate.newStreakDays >= threshold.days) {
        streakBonus += threshold.bonus;
      }
    }
  }

  const xpAwarded = Math.max(
    0,
    baseAwarded + tempoBonus + consistencyBonus + streakBonus + challengeBonus
  );

  const completedSet = new Set(completedLessonIds);
  if (completionUnlocked) {
    completedSet.add(lessonId);
  }

  const lessonIdsForFoundations = xpBadgesConfig.badges.find(badge => badge.badgeId === 'B10')?.requirements?.lessons as string[] | undefined;

  const shouldAwardBadge = (badgeId: string) => {
    if (earnedBadgeIds.includes(badgeId) || awardMode !== 'final') {
      return false;
    }

    switch (badgeId) {
      case 'B01':
        return lessonId === 'L03' && completionUnlocked && tempoCleanEligible;
      case 'B02':
        return lessonId === 'L02' && metrics.perfectLoopStreakMax >= 5 && tempoCleanEligible;
      case 'B03':
        return lessonId === 'L04' && completionUnlocked && metrics.pauses === 0 && metrics.seeks === 0;
      case 'B04':
        return lessonId === 'L05' && tempoAggroEligible;
      case 'B05':
        return lessonId === 'L06' && metrics.perfectLoopStreakMax >= 8;
      case 'B06':
        return lessonId === 'L07' && metrics.perfectLoopStreakMax >= 5;
      case 'B07':
        return lessonId === 'L08' && metrics.perfectLoopStreakMax >= 6;
      case 'B08':
        return lessonId === 'L09' && tempoAggroEligible;
      case 'B09':
        return lessonId === 'L10' && completionUnlocked && tempoCleanEligible;
      case 'B10': {
        if (!lessonIdsForFoundations) return false;
        return lessonIdsForFoundations.every(lessonCode => completedSet.has(lessonCode));
      }
      default:
        return false;
    }
  };

  const newlyEarnedBadges = badges
    .filter(badge => shouldAwardBadge(badge.badgeId))
    .map(badge => badge.badgeId);

  return {
    xpAwarded,
    xpBreakdown: {
      base: baseBeforeAntiCheese,
      tempoBonus,
      consistencyBonus,
      streakBonus,
      challengeBonus,
      antiCheesePenalty,
      diminishingMultiplier,
    },
    newlyEarnedBadges,
    completionUnlocked,
    streakUpdate,
    awardFlags: {
      tempoCleanAwarded,
      tempoAggroAwarded,
      completionAwarded,
    },
  };
};
