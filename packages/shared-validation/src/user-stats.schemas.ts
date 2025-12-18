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
  total_xp: z.coerce.number().int().nonnegative(),
  level: z.coerce.number().int().positive(),
  level_tier: LevelTierSchema,
  total_practice_minutes: z.coerce.number().int().nonnegative(),
  total_lessons_completed: z.coerce.number().int().nonnegative(),
  current_streak_days: z.coerce.number().int().nonnegative(),
  longest_streak_days: z.coerce.number().int().nonnegative(),
  accuracy_score: z.coerce.number().min(0).max(100),
  speed_score: z.coerce.number().min(0).max(100),
  rhythm_score: z.coerce.number().min(0).max(100),
  tone_knowledge_score: z.coerce.number().min(0).max(100),
  updated_at: z.string().datetime({ offset: true }).optional(),
  subscription_status: SubscriptionStatusSchema,
});

export const UserPracticeHeatmapSchema = z.object({
  user_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  practice_minutes: z.coerce.number().int().nonnegative(),
  lessons_completed: z.coerce.number().int().nonnegative(),
  riffs_completed: z.coerce.number().int().nonnegative(),
  xp_earned: z.coerce.number().int().nonnegative(),
});

export const SkillCategoryStatsSchema = z.object({
  category: SkillCategorySchema,
  current_score: z.coerce.number().min(0).max(100),
  last_updated: z.string().datetime({ offset: true }).optional(),
  progress_last_7_days: z.coerce.number(),
});

export const UserLevelUpNotificationSchema = z.object({
  user_id: z.string().uuid(),
  previous_level: z.coerce.number().int().positive(),
  new_level: z.coerce.number().int().positive(),
  new_tier: LevelTierSchema,
  xp_gained: z.coerce.number().int().nonnegative(),
  timestamp: z.string().datetime(),
});

export type UserStats = z.infer<typeof UserStatsSchema>;
export type UserPracticeHeatmap = z.infer<typeof UserPracticeHeatmapSchema>;
export type SkillCategoryStats = z.infer<typeof SkillCategoryStatsSchema>;
export type UserLevelUpNotification = z.infer<typeof UserLevelUpNotificationSchema>;
