import { z } from "zod";

export const achievementSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  tier: z.enum(["bronze", "silver", "gold", "legendary", "mythic"]),
  category: z.enum(["progression", "practice", "technique", "daily", "ai_feedback", "genre"]),
  xp_reward: z.number().int().nonnegative(),
  created_at: z.string().datetime().optional(),
});

export type Achievement = z.infer<typeof achievementSchema>;
export const achievementsArraySchema = z.array(achievementSchema);
