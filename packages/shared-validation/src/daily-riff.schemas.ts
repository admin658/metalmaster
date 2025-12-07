import { z } from 'zod';

const DifficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
const DailyRiffFrequencySchema = z.enum(['free_weekly', 'subscriber_daily']);

export const DailyRiffSchema = z.object({
  id: z.string().uuid(),
  riff_id: z.string().uuid(),
  video_url: z.string().url(),
  tab_content: z.string().min(5),
  description: z.string().min(10).max(1000),
  subgenre: z.string().min(2).max(100),
  difficulty_level: DifficultyLevelSchema,
  xp_bonus: z.number().int().positive(),
  featured_date: z.string().datetime(),
  frequency: DailyRiffFrequencySchema.default('free_weekly'),
  created_at: z.string().datetime(),
});

export const DailyRiffCompletionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  daily_riff_id: z.string().uuid(),
  completed_at: z.string().datetime(),
  xp_earned: z.number().int().nonnegative(),
  bonus_earned: z.boolean(),
});

export const CreateDailyRiffCompletionSchema = z.object({
  daily_riff_id: z.string().uuid(),
});

export const UserDailyRiffStatsSchema = z.object({
  completed_today: z.boolean(),
  days_completed_streak: z.number().int().nonnegative(),
  total_completed: z.number().int().nonnegative(),
  next_riff_date: z.string().datetime(),
  current_frequency: DailyRiffFrequencySchema.default('free_weekly'),
});

export type DailyRiff = z.infer<typeof DailyRiffSchema>;
export type DailyRiffCompletion = z.infer<typeof DailyRiffCompletionSchema>;
export type CreateDailyRiffCompletion = z.infer<typeof CreateDailyRiffCompletionSchema>;
export type UserDailyRiffStats = z.infer<typeof UserDailyRiffStatsSchema>;
