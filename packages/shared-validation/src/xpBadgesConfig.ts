import { z } from 'zod';
import seedData from './xpRules.seed.json';

export const PracticeMetricsSchema = z.object({
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

export type PracticeMetrics = z.infer<typeof PracticeMetricsSchema>;

const XpRulesSchema = z.object({
  base_xp_per_10s: z.number().int().positive(),
  session_base_cap: z.number().int().positive(),
  tempo_bonus_clean: z.number().int().nonnegative(),
  tempo_bonus_aggro: z.number().int().nonnegative(),
  consistency_bonuses: z.array(
    z.object({
      streak: z.number().int().positive(),
      bonus: z.number().int().nonnegative(),
    })
  ),
  streak_bonuses: z.object({
    daily: z.number().int().nonnegative(),
    thresholds: z.array(
      z.object({
        days: z.number().int().positive(),
        bonus: z.number().int().nonnegative(),
      })
    ),
  }),
  anti_cheese: z.object({
    disable_base_xp_if_inactive: z.boolean(),
    min_active_ratio: z.number().min(0).max(1),
    gap_seconds: z.number().int().positive(),
    micro_loop: z.object({
      max_loop_seconds: z.number().positive(),
      min_loops: z.number().int().nonnegative(),
      multiplier: z.number().min(0).max(1),
    }),
    seek_penalty: z.object({
      min_seeks: z.number().int().nonnegative(),
      short_session_seconds: z.number().int().positive(),
      multiplier: z.number().min(0).max(1),
    }),
  }),
  diminishing_returns: z.object({
    after_minutes: z.array(
      z.object({
        minutes: z.number().int().positive(),
        multiplier: z.number().min(0).max(1),
      })
    ),
  }),
});

const LessonRequirementSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(1),
  min_active_seconds: z.number().int().nonnegative(),
  min_loops: z.number().int().nonnegative(),
  clean_tempo: z.number().int().positive(),
  aggro_tempo: z.number().int().positive(),
  completion_xp: z.number().int().nonnegative(),
});

const BadgeSchema = z.object({
  badgeId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  icon_url: z.string().min(1),
  type: z.string().min(1),
  xp_multiplier: z.number().min(1).max(5),
  requirements: z.record(z.string(), z.unknown()).optional(),
});

export const XpBadgesConfigSchema = z.object({
  xpRules: XpRulesSchema,
  lessons: z.array(LessonRequirementSchema),
  badges: z.array(BadgeSchema),
});

export type XpBadgesConfig = z.infer<typeof XpBadgesConfigSchema>;
export type LessonRequirement = z.infer<typeof LessonRequirementSchema>;
export type BadgeDefinition = z.infer<typeof BadgeSchema>;

const SeedConfigSchema = z.object({
  version: z.string().min(1),
  difficulty: z.string().min(1),
  xp_rules: z.object({
    base: z.object({
      xp_per_10_seconds: z.number().int().positive(),
      session_base_cap: z.number().int().positive(),
      min_active_ratio: z.number().min(0).max(1),
      activity_gap_seconds: z.number().int().positive(),
    }),
    tempo_bonuses: z.object({
      clean_tempo_bonus: z.number().int().nonnegative(),
      aggro_tempo_bonus: z.number().int().nonnegative(),
      aggro_bonus_one_time_per_lesson: z.boolean(),
    }),
    consistency_bonuses: z.array(
      z.object({
        perfect_loop_streak: z.number().int().positive(),
        xp: z.number().int().nonnegative(),
      })
    ),
    streak_bonuses: z.array(
      z.object({
        days: z.number().int().positive(),
        xp: z.number().int().nonnegative(),
      })
    ),
    diminishing_returns: z.array(
      z.object({
        minutes_on_same_lesson: z.number().int().positive(),
        multiplier: z.number().min(0).max(1),
      })
    ),
    anti_cheese: z.object({
      disable_base_xp_if_inactive: z.boolean(),
      micro_loop_seconds_min: z.number().positive(),
      micro_loop_min_loops: z.number().int().positive().optional().default(8),
      micro_loop_penalty_multiplier: z.number().min(0).max(1),
      seek_penalty_threshold: z.number().int().nonnegative(),
      seek_penalty_session_seconds: z.number().int().positive().optional().default(300),
      seek_penalty_multiplier: z.number().min(0).max(1),
    }),
  }),
  lessons: z.array(
    z.object({
      lesson_id: z.string().min(1),
      title: z.string().min(1),
      min_active_seconds: z.number().int().nonnegative(),
      min_loops: z.number().int().nonnegative(),
      clean_tempo: z.number().int().positive(),
      aggro_tempo: z.number().int().positive(),
      completion_xp: z.number().int().nonnegative(),
    })
  ),
});

const seedConfig = SeedConfigSchema.parse(seedData);
const streakDaily = seedConfig.xp_rules.streak_bonuses.find(entry => entry.days === 1);

const configData: XpBadgesConfig = {
  xpRules: {
    base_xp_per_10s: seedConfig.xp_rules.base.xp_per_10_seconds,
    session_base_cap: seedConfig.xp_rules.base.session_base_cap,
    tempo_bonus_clean: seedConfig.xp_rules.tempo_bonuses.clean_tempo_bonus,
    tempo_bonus_aggro: seedConfig.xp_rules.tempo_bonuses.aggro_tempo_bonus,
    consistency_bonuses: seedConfig.xp_rules.consistency_bonuses.map(entry => ({
      streak: entry.perfect_loop_streak,
      bonus: entry.xp,
    })),
    streak_bonuses: {
      daily: streakDaily?.xp ?? 0,
      thresholds: seedConfig.xp_rules.streak_bonuses
        .filter(entry => entry.days !== 1)
        .map(entry => ({
          days: entry.days,
          bonus: entry.xp,
        })),
    },
    anti_cheese: {
      disable_base_xp_if_inactive: seedConfig.xp_rules.anti_cheese.disable_base_xp_if_inactive,
      min_active_ratio: seedConfig.xp_rules.base.min_active_ratio,
      gap_seconds: seedConfig.xp_rules.base.activity_gap_seconds,
      micro_loop: {
        max_loop_seconds: seedConfig.xp_rules.anti_cheese.micro_loop_seconds_min,
        min_loops: seedConfig.xp_rules.anti_cheese.micro_loop_min_loops,
        multiplier: seedConfig.xp_rules.anti_cheese.micro_loop_penalty_multiplier,
      },
      seek_penalty: {
        min_seeks: seedConfig.xp_rules.anti_cheese.seek_penalty_threshold,
        short_session_seconds: seedConfig.xp_rules.anti_cheese.seek_penalty_session_seconds,
        multiplier: seedConfig.xp_rules.anti_cheese.seek_penalty_multiplier,
      },
    },
    diminishing_returns: {
      after_minutes: seedConfig.xp_rules.diminishing_returns.map(entry => ({
        minutes: entry.minutes_on_same_lesson,
        multiplier: entry.multiplier,
      })),
    },
  },
  lessons: seedConfig.lessons.map(lesson => ({
    lessonId: lesson.lesson_id,
    title: lesson.title,
    min_active_seconds: lesson.min_active_seconds,
    min_loops: lesson.min_loops,
    clean_tempo: lesson.clean_tempo,
    aggro_tempo: lesson.aggro_tempo,
    completion_xp: lesson.completion_xp,
  })),
  badges: [
    {
      badgeId: 'B01',
      name: 'Iron Wrist I',
      description: 'Complete L03 at clean tempo.',
      icon_url: '/badges/b01-iron-wrist.png',
      type: 'lesson',
      xp_multiplier: 1,
      requirements: { lessonId: 'L03', type: 'completion_clean' },
    },
    {
      badgeId: 'B02',
      name: 'Mute Surgeon',
      description: 'Hit a perfect 5-loop streak in L02 at clean tempo.',
      icon_url: '/badges/b02-mute-surgeon.png',
      type: 'lesson',
      xp_multiplier: 1,
      requirements: { lessonId: 'L02', type: 'perfect_streak_clean', streak: 5 },
    },
    {
      badgeId: 'B03',
      name: 'Chord Executioner',
      description: 'Complete L04 without pauses or seeks.',
      icon_url: '/badges/b03-chord-executioner.png',
      type: 'lesson',
      xp_multiplier: 1,
      requirements: { lessonId: 'L04', type: 'completion_no_pauses_seeks' },
    },
    {
      badgeId: 'B04',
      name: 'Gallop Engine',
      description: 'Reach aggro tempo in L05.',
      icon_url: '/badges/b04-gallop-engine.png',
      type: 'lesson',
      xp_multiplier: 1,
      requirements: { lessonId: 'L05', type: 'aggro_tempo' },
    },
    {
      badgeId: 'B05',
      name: 'Alternate Assassin',
      description: 'Hit an 8-loop perfect streak in L06.',
      icon_url: '/badges/b05-alternate-assassin.png',
      type: 'lesson',
      xp_multiplier: 1,
      requirements: { lessonId: 'L06', type: 'perfect_streak', streak: 8 },
    },
    {
      badgeId: 'B06',
      name: 'Crossing Clean',
      description: 'Hit a 5-loop perfect streak in L07.',
      icon_url: '/badges/b06-crossing-clean.png',
      type: 'lesson',
      xp_multiplier: 1,
      requirements: { lessonId: 'L07', type: 'perfect_streak', streak: 5 },
    },
    {
      badgeId: 'B07',
      name: 'Silence Controller',
      description: 'Hit a 6-loop perfect streak in L08.',
      icon_url: '/badges/b07-silence-controller.png',
      type: 'lesson',
      xp_multiplier: 1,
      requirements: { lessonId: 'L08', type: 'perfect_streak', streak: 6 },
    },
    {
      badgeId: 'B08',
      name: 'Burst Certified',
      description: 'Reach aggro tempo in L09.',
      icon_url: '/badges/b08-burst-certified.png',
      type: 'lesson',
      xp_multiplier: 1,
      requirements: { lessonId: 'L09', type: 'aggro_tempo' },
    },
    {
      badgeId: 'B09',
      name: 'First Riff Forged',
      description: 'Complete L10 at clean tempo.',
      icon_url: '/badges/b09-first-riff-forged.png',
      type: 'lesson',
      xp_multiplier: 1,
      requirements: { lessonId: 'L10', type: 'completion_clean' },
    },
    {
      badgeId: 'B10',
      name: 'Foundations: Steel',
      description: 'Complete lessons L01 through L10.',
      icon_url: '/badges/b10-foundations-steel.png',
      type: 'lesson',
      xp_multiplier: 1,
      requirements: { type: 'all_lessons', lessons: ['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08', 'L09', 'L10'] },
    },
  ],
};

export const xpBadgesConfig = XpBadgesConfigSchema.parse(configData);
export const xpRules = xpBadgesConfig.xpRules;
export const lessons = xpBadgesConfig.lessons;
export const badges = xpBadgesConfig.badges;
