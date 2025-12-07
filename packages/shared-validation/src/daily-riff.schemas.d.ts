import { z } from 'zod';
export declare const DailyRiffSchema: z.ZodObject<{
    id: z.ZodString;
    riff_id: z.ZodString;
    video_url: z.ZodString;
    tab_content: z.ZodString;
    description: z.ZodString;
    subgenre: z.ZodString;
    difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    xp_bonus: z.ZodNumber;
    featured_date: z.ZodString;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    video_url: string;
    created_at: string;
    riff_id: string;
    tab_content: string;
    subgenre: string;
    xp_bonus: number;
    featured_date: string;
}, {
    id: string;
    description: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    video_url: string;
    created_at: string;
    riff_id: string;
    tab_content: string;
    subgenre: string;
    xp_bonus: number;
    featured_date: string;
}>;
export declare const DailyRiffCompletionSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    daily_riff_id: z.ZodString;
    completed_at: z.ZodString;
    xp_earned: z.ZodNumber;
    bonus_earned: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    id: string;
    user_id: string;
    daily_riff_id: string;
    completed_at: string;
    xp_earned: number;
    bonus_earned: boolean;
}, {
    id: string;
    user_id: string;
    daily_riff_id: string;
    completed_at: string;
    xp_earned: number;
    bonus_earned: boolean;
}>;
export declare const CreateDailyRiffCompletionSchema: z.ZodObject<{
    daily_riff_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    daily_riff_id: string;
}, {
    daily_riff_id: string;
}>;
export declare const UserDailyRiffStatsSchema: z.ZodObject<{
    completed_today: z.ZodBoolean;
    days_completed_streak: z.ZodNumber;
    total_completed: z.ZodNumber;
    next_riff_date: z.ZodString;
}, "strip", z.ZodTypeAny, {
    completed_today: boolean;
    days_completed_streak: number;
    total_completed: number;
    next_riff_date: string;
}, {
    completed_today: boolean;
    days_completed_streak: number;
    total_completed: number;
    next_riff_date: string;
}>;
export type DailyRiff = z.infer<typeof DailyRiffSchema>;
export type DailyRiffCompletion = z.infer<typeof DailyRiffCompletionSchema>;
export type CreateDailyRiffCompletion = z.infer<typeof CreateDailyRiffCompletionSchema>;
export type UserDailyRiffStats = z.infer<typeof UserDailyRiffStatsSchema>;
//# sourceMappingURL=daily-riff.schemas.d.ts.map