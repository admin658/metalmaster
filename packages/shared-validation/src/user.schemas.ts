import { z } from 'zod';

const SkillLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(20),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  skill_level: SkillLevelSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const UpdateUserProfileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  skill_level: SkillLevelSchema.optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;
