import { z } from 'zod';
export declare const AchievementSchema: z.ZodObject<{
    id: z.ZodString;
    badge_id: z.ZodEnum<["downpicking_demon", "sweep_sorcerer", "djent_machine", "black_metal_blizzard", "power_metal_paladin", "speed_merchant", "rhythm_warrior", "tone_master"]>;
    name: z.ZodString;
    description: z.ZodString;
    icon_url: z.ZodString;
    type: z.ZodEnum<["badge", "milestone", "skill_unlock"]>;
    xp_multiplier: z.ZodNumber;
    requirements: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "badge" | "milestone" | "skill_unlock";
    id: string;
    description: string;
    created_at: string;
    badge_id: "downpicking_demon" | "sweep_sorcerer" | "djent_machine" | "black_metal_blizzard" | "power_metal_paladin" | "speed_merchant" | "rhythm_warrior" | "tone_master";
    name: string;
    icon_url: string;
    xp_multiplier: number;
    requirements?: Record<string, any> | undefined;
}, {
    type: "badge" | "milestone" | "skill_unlock";
    id: string;
    description: string;
    created_at: string;
    badge_id: "downpicking_demon" | "sweep_sorcerer" | "djent_machine" | "black_metal_blizzard" | "power_metal_paladin" | "speed_merchant" | "rhythm_warrior" | "tone_master";
    name: string;
    icon_url: string;
    xp_multiplier: number;
    requirements?: Record<string, any> | undefined;
}>;
export declare const UserAchievementSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    achievement_id: z.ZodString;
    earned_at: z.ZodString;
    progress_percentage: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    achievement_id: string;
    earned_at: string;
    progress_percentage?: number | undefined;
}, {
    id: string;
    user_id: string;
    achievement_id: string;
    earned_at: string;
    progress_percentage?: number | undefined;
}>;
export declare const AchievementProgressSchema: z.ZodObject<{
    achievement_id: z.ZodString;
    badge_id: z.ZodEnum<["downpicking_demon", "sweep_sorcerer", "djent_machine", "black_metal_blizzard", "power_metal_paladin", "speed_merchant", "rhythm_warrior", "tone_master"]>;
    name: z.ZodString;
    progress_percentage: z.ZodNumber;
    earned: z.ZodBoolean;
    earned_date: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    badge_id: "downpicking_demon" | "sweep_sorcerer" | "djent_machine" | "black_metal_blizzard" | "power_metal_paladin" | "speed_merchant" | "rhythm_warrior" | "tone_master";
    name: string;
    achievement_id: string;
    progress_percentage: number;
    earned: boolean;
    earned_date?: string | undefined;
}, {
    badge_id: "downpicking_demon" | "sweep_sorcerer" | "djent_machine" | "black_metal_blizzard" | "power_metal_paladin" | "speed_merchant" | "rhythm_warrior" | "tone_master";
    name: string;
    achievement_id: string;
    progress_percentage: number;
    earned: boolean;
    earned_date?: string | undefined;
}>;
export type Achievement = z.infer<typeof AchievementSchema>;
export type UserAchievement = z.infer<typeof UserAchievementSchema>;
export type AchievementProgress = z.infer<typeof AchievementProgressSchema>;
//# sourceMappingURL=achievement.schemas.d.ts.map