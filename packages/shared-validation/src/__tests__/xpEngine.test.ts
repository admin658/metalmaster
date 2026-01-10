import { xpEngine, type XpEngineInput } from '../xpEngine';
import type { PracticeMetrics } from '../xpBadgesConfig';

const baseMetrics: PracticeMetrics = {
  activeSeconds: 300,
  totalSeconds: 300,
  loopsCompleted: 14,
  perfectLoops: 14,
  perfectLoopStreakMax: 5,
  avgTempoBpm: 120,
  maxTempoBpm: 150,
  pauses: 0,
  seeks: 0,
  loopSeconds: 20,
  lessonMinutesToday: 0,
  hadActivityGapOver20s: false,
};

type InputOverrides = Omit<Partial<XpEngineInput>, 'metrics' | 'userStats' | 'timestamps'> & {
  metrics?: Partial<PracticeMetrics>;
  userStats?: Partial<XpEngineInput['userStats']>;
  timestamps?: Partial<XpEngineInput['timestamps']>;
};

const buildInput = (overrides: InputOverrides = {}): XpEngineInput => ({
  userId: 'user-1',
  lessonId: 'L03',
  metrics: {
    ...baseMetrics,
    ...(overrides.metrics ?? {}),
  },
  userStats: {
    total_xp: 0,
    level: 1,
    current_streak_days: 0,
    longest_streak_days: 0,
    last_active_at: null,
    ...(overrides.userStats ?? {}),
  },
  timestamps: {
    now: '2025-01-03T12:00:00.000Z',
    sessionStart: '2025-01-03T11:50:00.000Z',
    sessionEnd: '2025-01-03T12:00:00.000Z',
    ...(overrides.timestamps ?? {}),
  },
  previousLessonCompletion: overrides.previousLessonCompletion ?? null,
  completedLessonIds: overrides.completedLessonIds ?? [],
  earnedBadgeIds: overrides.earnedBadgeIds ?? [],
  priorSessionAwards: overrides.priorSessionAwards,
  awardMode: overrides.awardMode,
});

describe('xpEngine', () => {
  it('awards base, tempo, consistency, streak, completion, and lesson badge rewards', () => {
    const result = xpEngine(buildInput());

    expect(result.xpBreakdown).toEqual({
      base: 60,
      tempoBonus: 75,
      consistencyBonus: 20,
      streakBonus: 10,
      challengeBonus: 190,
      antiCheesePenalty: 0,
      diminishingMultiplier: 1,
    });
    expect(result.xpAwarded).toBe(355);
    expect(result.newlyEarnedBadges).toEqual(['B01']);
    expect(result.completionUnlocked).toBe(true);
    expect(result.awardFlags).toEqual({
      tempoCleanAwarded: true,
      tempoAggroAwarded: true,
      completionAwarded: true,
    });
  });

  it('zeros base XP when inactivity triggers the anti-cheese rule', () => {
    const result = xpEngine(
      buildInput({
        lessonId: 'L01',
        metrics: {
          activeSeconds: 100,
          totalSeconds: 500,
          loopsCompleted: 2,
          perfectLoops: 0,
          perfectLoopStreakMax: 0,
          avgTempoBpm: 80,
          maxTempoBpm: 80,
          pauses: 0,
          seeks: 0,
          loopSeconds: 20,
          lessonMinutesToday: 0,
          hadActivityGapOver20s: true,
        },
        userStats: {
          current_streak_days: 1,
          longest_streak_days: 1,
          last_active_at: '2025-01-03T08:00:00.000Z',
        },
      })
    );

    expect(result.xpBreakdown.base).toBe(20);
    expect(result.xpBreakdown.antiCheesePenalty).toBe(-20);
    expect(result.xpAwarded).toBe(0);
  });

  it('applies micro-loop penalties, diminishing returns, and blocks repeat aggro bonuses', () => {
    const result = xpEngine(
      buildInput({
        lessonId: 'L05',
        metrics: {
          activeSeconds: 200,
          totalSeconds: 200,
          loopsCompleted: 12,
          perfectLoops: 0,
          perfectLoopStreakMax: 0,
          avgTempoBpm: 125,
          maxTempoBpm: 125,
          pauses: 0,
          seeks: 0,
          loopSeconds: 5,
          lessonMinutesToday: 20,
          hadActivityGapOver20s: false,
        },
        userStats: {
          current_streak_days: 1,
          longest_streak_days: 1,
          last_active_at: '2025-01-03T08:00:00.000Z',
        },
        previousLessonCompletion: {
          best_aggro_tempo: 150,
        },
      })
    );

    expect(result.xpBreakdown.base).toBe(4);
    expect(result.xpBreakdown.tempoBonus).toBe(25);
    expect(result.xpBreakdown.diminishingMultiplier).toBe(0.5);
    expect(result.awardFlags.tempoAggroAwarded).toBe(false);
    expect(result.xpAwarded).toBe(29);
  });

  it('adds streak threshold bonuses when crossing milestone days', () => {
    const result = xpEngine(
      buildInput({
        lessonId: 'L01',
        metrics: {
          activeSeconds: 50,
          totalSeconds: 50,
          loopsCompleted: 1,
          perfectLoops: 0,
          perfectLoopStreakMax: 0,
          avgTempoBpm: 70,
          maxTempoBpm: 70,
          pauses: 0,
          seeks: 0,
          loopSeconds: 20,
          lessonMinutesToday: 0,
          hadActivityGapOver20s: false,
        },
        userStats: {
          current_streak_days: 2,
          longest_streak_days: 2,
          last_active_at: '2025-01-02T18:00:00.000Z',
        },
      })
    );

    expect(result.xpBreakdown.streakBonus).toBe(35);
    expect(result.streakUpdate).toEqual({
      newStreakDays: 3,
      newLongestStreakDays: 3,
      isFirstPracticeToday: true,
      previousStreakDays: 2,
    });
    expect(result.xpAwarded).toBe(45);
  });
});