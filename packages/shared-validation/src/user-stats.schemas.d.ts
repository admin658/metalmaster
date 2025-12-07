import { z } from 'zod';
export declare const UserStatsSchema: z.ZodObject<{
    user_id: z.ZodString;
    total_xp: z.ZodNumber;
    level: z.ZodNumber;
    level_tier: z.ZodEnum<["Novice", "Acolyte", "Hammerhand", "Thrash Apprentice", "Riff Adept", "Blackened Knight", "Djent Architect", "Shred Overlord"]>;
    total_practice_minutes: z.ZodNumber;
    total_lessons_completed: z.ZodNumber;
    current_streak_days: z.ZodNumber;
    longest_streak_days: z.ZodNumber;
    accuracy_score: z.ZodNumber;
    speed_score: z.ZodNumber;
    rhythm_score: z.ZodNumber;
    tone_knowledge_score: z.ZodNumber;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    updated_at: string;
    user_id: string;
    total_xp: number;
    level: number;
    level_tier: "Novice" | "Acolyte" | "Hammerhand" | "Thrash Apprentice" | "Riff Adept" | "Blackened Knight" | "Djent Architect" | "Shred Overlord";
    total_practice_minutes: number;
    total_lessons_completed: number;
    current_streak_days: number;
    longest_streak_days: number;
    accuracy_score: number;
    speed_score: number;
    rhythm_score: number;
    tone_knowledge_score: number;
}, {
    updated_at: string;
    user_id: string;
    total_xp: number;
    level: number;
    level_tier: "Novice" | "Acolyte" | "Hammerhand" | "Thrash Apprentice" | "Riff Adept" | "Blackened Knight" | "Djent Architect" | "Shred Overlord";
    total_practice_minutes: number;
    total_lessons_completed: number;
    current_streak_days: number;
    longest_streak_days: number;
    accuracy_score: number;
    speed_score: number;
    rhythm_score: number;
    tone_knowledge_score: number;
}>;
export declare const UserPracticeHeatmapSchema: z.ZodObject<{
    user_id: z.ZodString;
    date: z.ZodString;
    practice_minutes: z.ZodNumber;
    lessons_completed: z.ZodNumber;
    riffs_completed: z.ZodNumber;
    xp_earned: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    user_id: string;
    xp_earned: number;
    date: string;
    practice_minutes: number;
    lessons_completed: number;
    riffs_completed: number;
}, {
    user_id: string;
    xp_earned: number;
    date: string;
    practice_minutes: number;
    lessons_completed: number;
    riffs_completed: number;
}>;
export declare const SkillCategoryStatsSchema: z.ZodObject<{
    category: z.ZodEnum<["accuracy", "speed", "rhythm_consistency", "tone_knowledge"]>;
    current_score: z.ZodNumber;
    last_updated: z.ZodString;
    progress_last_7_days: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    category: "accuracy" | "speed" | "rhythm_consistency" | "tone_knowledge";
    current_score: number;
    last_updated: string;
    progress_last_7_days: number;
}, {
    category: "accuracy" | "speed" | "rhythm_consistency" | "tone_knowledge";
    current_score: number;
    last_updated: string;
    progress_last_7_days: number;
}>;
export type UserStats = z.infer<typeof UserStatsSchema>;
export type UserPracticeHeatmap = z.infer<typeof UserPracticeHeatmapSchema>;
export type SkillCategoryStats = z.infer<typeof SkillCategoryStatsSchema>;
//# sourceMappingURL=user-stats.schemas.d.ts.map