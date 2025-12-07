import { z } from 'zod';

const SkillCategorySchema = z.enum(['accuracy', 'speed', 'rhythm_consistency', 'tone_knowledge']);

const LevelTierSchema = z.enum([
  'Novice',
  'Acolyte',
  'Hammerhand',
  'Thrash Apprentice',
  'Riff Adept',
  'Blackened Knight',
  'Djent Architect',
  'Shred Overlord',
]);

export const SubscriptionStatusSchema = z.enum(['free', 'pro', 'trial', 'lifetime']).default('free');

export const UserStatsSchema = z.object({
  user_id: z.string().uuid(),
  total_xp: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  level_tier: LevelTierSchema,
  total_practice_minutes: z.number().int().nonnegative(),
  total_lessons_completed: z.number().int().nonnegative(),
  current_streak_days: z.number().int().nonnegative(),
  longest_streak_days: z.number().int().nonnegative(),
  accuracy_score: z.number().min(0).max(100),
  speed_score: z.number().min(0).max(100),
  rhythm_score: z.number().min(0).max(100),
  tone_knowledge_score: z.number().min(0).max(100),
  updated_at: z.string().datetime(),
  subscription_status: SubscriptionStatusSchema,
});

export const UserPracticeHeatmapSchema = z.object({
  user_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  practice_minutes: z.number().int().nonnegative(),
  lessons_completed: z.number().int().nonnegative(),
  riffs_completed: z.number().int().nonnegative(),
  xp_earned: z.number().int().nonnegative(),
});

export const SkillCategoryStatsSchema = z.object({
  category: SkillCategorySchema,
  current_score: z.number().min(0).max(100),
  last_updated: z.string().datetime(),
  progress_last_7_days: z.number(),
});

export const UserLevelUpNotificationSchema = z.object({
  user_id: z.string().uuid(),
  previous_level: z.number().int().positive(),
  new_level: z.number().int().positive(),
  new_tier: LevelTierSchema,
  xp_gained: z.number().int().nonnegative(),
  timestamp: z.string().datetime(),
});

export type UserStats = z.infer<typeof UserStatsSchema>;
export type UserPracticeHeatmap = z.infer<typeof UserPracticeHeatmapSchema>;
export type SkillCategoryStats = z.infer<typeof SkillCategoryStatsSchema>;
export type UserLevelUpNotification = z.infer<typeof UserLevelUpNotificationSchema>;
