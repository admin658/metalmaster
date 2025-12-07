import { z } from 'zod';

const ExerciseTypeSchema = z.enum(['metronome', 'chugging', 'tremolo', 'downpicking', 'sweep_picking', 'tapping']);

export const SpeedTrainerSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  riff_id: z.string().uuid().optional(),
  exercise_type: ExerciseTypeSchema,
  starting_bpm: z.number().int().positive(),
  ending_bpm: z.number().int().positive(),
  current_bpm: z.number().int().positive(),
  target_bpm: z.number().int().positive(),
  duration_seconds: z.number().int().positive(),
  accuracy_percentage: z.number().min(0).max(100),
  notes: z.string().optional(),
  auto_increment_enabled: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateSpeedTrainerSessionSchema = z.object({
  exercise_type: ExerciseTypeSchema,
  riff_id: z.string().uuid().optional(),
  starting_bpm: z.number().int().min(40).max(300),
  target_bpm: z.number().int().min(40).max(300),
  auto_increment_enabled: z.boolean().default(false),
  notes: z.string().max(1000).optional(),
});

export const UpdateSpeedTrainerSessionSchema = z.object({
  current_bpm: z.number().int().positive().optional(),
  ending_bpm: z.number().int().positive().optional(),
  accuracy_percentage: z.number().min(0).max(100).optional(),
  duration_seconds: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
});

export const SpeedTrainerProgressSchema = z.object({
  exercise_type: ExerciseTypeSchema,
  personal_best_bpm: z.number().int().positive(),
  average_bpm: z.number().int().positive(),
  total_sessions: z.number().int().nonnegative(),
  last_session_date: z.string().datetime(),
  improvement_trend: z.number(),
});

export type SpeedTrainerSession = z.infer<typeof SpeedTrainerSessionSchema>;
export type CreateSpeedTrainerSession = z.infer<typeof CreateSpeedTrainerSessionSchema>;
export type UpdateSpeedTrainerSession = z.infer<typeof UpdateSpeedTrainerSessionSchema>;
export type SpeedTrainerProgress = z.infer<typeof SpeedTrainerProgressSchema>;
