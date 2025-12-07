import { z } from 'zod';

const BadgeIdSchema = z.enum([
  'downpicking_demon',
  'sweep_sorcerer',
  'djent_machine',
  'black_metal_blizzard',
  'power_metal_paladin',
  'speed_merchant',
  'rhythm_warrior',
  'tone_master',
]);

const AchievementTypeSchema = z.enum(['badge', 'milestone', 'skill_unlock']);

export const AchievementSchema = z.object({
  id: z.string().uuid(),
  badge_id: BadgeIdSchema,
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  icon_url: z.string().url(),
  type: AchievementTypeSchema,
  xp_multiplier: z.number().min(1).max(5),
  requirements: z.record(z.string(), z.any()).optional(),
  created_at: z.string().datetime(),
});

export const UserAchievementSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  achievement_id: z.string().uuid(),
  earned_at: z.string().datetime(),
  progress_percentage: z.number().min(0).max(100).optional(),
});

export const AchievementProgressSchema = z.object({
  achievement_id: z.string().uuid(),
  badge_id: BadgeIdSchema,
  name: z.string(),
  progress_percentage: z.number().min(0).max(100),
  earned: z.boolean(),
  earned_date: z.string().datetime().optional(),
});

export type Achievement = z.infer<typeof AchievementSchema>;
export type UserAchievement = z.infer<typeof UserAchievementSchema>;
export type AchievementProgress = z.infer<typeof AchievementProgressSchema>;
