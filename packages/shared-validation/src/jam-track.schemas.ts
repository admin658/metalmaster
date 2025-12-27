import { z } from 'zod';

const DifficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
const InstrumentSchema = z.enum(['drums', 'bass', 'rhythm', 'full']);

export const BackingTrackSchema = z.object({
  id: z.string().uuid(),
  jam_track_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  audio_url: z.string().url(),
  instrument: InstrumentSchema,
  volume: z.number().min(0).max(1),
});

export const JamTrackSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(1000),
  riff_id: z.string().uuid().optional(),
  bpm: z.number().int().min(40).max(300),
  time_signature: z.string().regex(/^\d+\/\d+$/),
  key: z.string().min(1).max(10),
  duration_seconds: z.number().int().positive(),
  audio_url: z.string().url().optional().nullable(),
  difficulty_level: DifficultyLevelSchema,
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  backing_tracks: z.array(BackingTrackSchema).optional(),
});

export const CreateJamTrackSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000),
  riff_id: z.string().uuid().optional(),
  bpm: z.number().int().min(40).max(300),
  time_signature: z.string().regex(/^[\d]+\/[\d]+$/),
  key: z.string().min(1).max(10),
  duration_seconds: z.number().int().positive(),
  audio_url: z.string().url().optional().nullable(),
  difficulty_level: DifficultyLevelSchema,
});

export const UpdateJamTrackSchema = CreateJamTrackSchema.partial();

export const JamSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  jam_track_id: z.string().uuid(),
  recording_url: z.string().url().optional(),
  duration_seconds: z.number().int().positive(),
  notes: z.string().max(2000).optional(),
  quality_rating: z.number().int().min(1).max(5).optional(),
  created_at: z.string().datetime(),
});

export const CreateJamSessionSchema = z.object({
  recording_url: z.string().url().optional(),
  duration_seconds: z.number().int().positive(),
  notes: z.string().max(2000).optional(),
  quality_rating: z.number().int().min(1).max(5).optional(),
});

export type JamTrack = z.infer<typeof JamTrackSchema>;
export type BackingTrack = z.infer<typeof BackingTrackSchema>;
export type CreateJamTrack = z.infer<typeof CreateJamTrackSchema>;
export type UpdateJamTrack = z.infer<typeof UpdateJamTrackSchema>;
export type JamSession = z.infer<typeof JamSessionSchema>;
export type CreateJamSession = z.infer<typeof CreateJamSessionSchema>;
