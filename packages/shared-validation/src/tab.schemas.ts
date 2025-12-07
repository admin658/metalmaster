import { z } from 'zod';

const DifficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
const TabFormatSchema = z.enum(['tablature', 'standard_notation', 'ascii', 'gp5', 'gp6']);

export const TabSchema = z.object({
  id: z.string().uuid(),
  riff_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  format: TabFormatSchema,
  tuning: z.string().min(2).max(50),
  difficulty_level: DifficultyLevelSchema,
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const TabVersionSchema = z.object({
  id: z.string().uuid(),
  tab_id: z.string().uuid(),
  version_number: z.number().int().positive(),
  content: z.string().min(1),
  changed_by: z.string().uuid(),
  change_description: z.string().max(500).optional(),
  created_at: z.string().datetime(),
});

export const TabNoteSchema = z.object({
  id: z.string().uuid(),
  tab_id: z.string().uuid(),
  line_number: z.number().int().positive(),
  note: z.string().min(1),
  user_id: z.string().uuid(),
  created_at: z.string().datetime(),
});

export const CreateTabSchema = z.object({
  riff_id: z.string().uuid(),
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  format: TabFormatSchema,
  tuning: z.string().min(2).max(50),
  difficulty_level: DifficultyLevelSchema,
});

export const UpdateTabSchema = CreateTabSchema.partial();

export type Tab = z.infer<typeof TabSchema>;
export type TabVersion = z.infer<typeof TabVersionSchema>;
export type TabNote = z.infer<typeof TabNoteSchema>;
export type CreateTab = z.infer<typeof CreateTabSchema>;
export type UpdateTab = z.infer<typeof UpdateTabSchema>;
