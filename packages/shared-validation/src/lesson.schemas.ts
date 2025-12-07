
import { z } from 'zod';

const DifficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
const LessonCategorySchema = z.enum(['technique', 'theory', 'rhythm', 'lead', 'songwriting']);
const LessonContentTypeSchema = z.enum(['text', 'image', 'video', 'quiz', 'exercise']);

export const LessonContentSchema = z.object({
  id: z.string().uuid(),
  lesson_id: z.string().uuid(),
  order: z.number().int().nonnegative(),
  type: LessonContentTypeSchema,
  content: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const LessonProgressSchema = z.object({
  lesson_id: z.string().uuid(),
  is_completed: z.boolean(),
  progress_percentage: z.number().min(0).max(100),
  last_accessed: z.string().datetime().nullable(),
});

export const LessonSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: LessonCategorySchema,
  difficulty_level: DifficultyLevelSchema,
  duration_minutes: z.number().int().positive(),
  video_url: z.string().url().optional(),
  content: z.string().min(10),
  instructor_id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const CreateLessonSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: LessonCategorySchema,
  difficulty_level: DifficultyLevelSchema,
  duration_minutes: z.number().int().positive(),
  video_url: z.string().url().optional(),
  content: z.string().min(10),
});

export const UpdateLessonSchema = CreateLessonSchema.partial();

export type Lesson = z.infer<typeof LessonSchema>;
export type LessonContent = z.infer<typeof LessonContentSchema>;
export type LessonProgress = z.infer<typeof LessonProgressSchema>;
export type CreateLesson = z.infer<typeof CreateLessonSchema>;
export type UpdateLesson = z.infer<typeof UpdateLessonSchema>;
