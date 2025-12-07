import { z } from 'zod';

const SessionTypeSchema = z.enum(['lesson', 'riff_practice', 'jam_session', 'speed_trainer', 'free_play']);

export const PracticeSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  session_type: SessionTypeSchema,
  related_riff_id: z.string().uuid().optional(),
  related_lesson_id: z.string().uuid().optional(),
  related_jam_track_id: z.string().uuid().optional(),
  duration_seconds: z.number().int().positive(),
  xp_earned: z.number().int().nonnegative(),
  accuracy_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
  started_at: z.string().datetime(),
  completed_at: z.string().datetime(),
});

export const CreatePracticeSessionSchema = z.object({
  session_type: SessionTypeSchema,
  related_riff_id: z.string().uuid().optional(),
  related_lesson_id: z.string().uuid().optional(),
  related_jam_track_id: z.string().uuid().optional(),
  duration_seconds: z.number().int().positive(),
  xp_earned: z.number().int().nonnegative(),
  accuracy_percentage: z.number().min(0).max(100).optional(),
  notes: z.string().max(1000).optional(),
});

export const PracticeSessionStatsSchema = z.object({
  total_sessions: z.number().int().nonnegative(),
  total_practice_minutes: z.number().int().nonnegative(),
  average_session_duration_minutes: z.number().nonnegative(),
  most_common_session_type: SessionTypeSchema,
  xp_earned_this_week: z.number().int().nonnegative(),
  xp_earned_today: z.number().int().nonnegative(),
});

export type PracticeSession = z.infer<typeof PracticeSessionSchema>;
export type CreatePracticeSession = z.infer<typeof CreatePracticeSessionSchema>;
export type PracticeSessionStats = z.infer<typeof PracticeSessionStatsSchema>;
