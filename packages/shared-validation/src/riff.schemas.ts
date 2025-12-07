
import { z } from 'zod';

const DifficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

export const RiffSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(1000),
  bpm: z.number().int().min(40).max(300),
  time_signature: z.string().regex(/^\d+\/\d+$/),
  key: z.string().min(1).max(10),
  difficulty_level: DifficultyLevelSchema,
  genre: z.string().min(2).max(50),
  audio_url: z.string().url().optional(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateRiffSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000),
  bpm: z.number().int().min(40).max(300),
  time_signature: z.string().regex(/^\d+\/\d+$/),
  key: z.string().min(1).max(10),
  difficulty_level: DifficultyLevelSchema,
  genre: z.string().min(2).max(50),
  audio_url: z.string().url().optional(),
});

export const UpdateRiffSchema = CreateRiffSchema.partial();

export type Riff = z.infer<typeof RiffSchema>;
export type CreateRiff = z.infer<typeof CreateRiffSchema>;
export type UpdateRiff = z.infer<typeof UpdateRiffSchema>;
