import { z } from 'zod';
export declare const PracticeSessionSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    session_type: z.ZodEnum<["lesson", "riff_practice", "jam_session", "speed_trainer", "free_play"]>;
    related_riff_id: z.ZodOptional<z.ZodString>;
    related_lesson_id: z.ZodOptional<z.ZodString>;
    related_jam_track_id: z.ZodOptional<z.ZodString>;
    duration_seconds: z.ZodNumber;
    xp_earned: z.ZodNumber;
    accuracy_percentage: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
    started_at: z.ZodString;
    completed_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    duration_seconds: number;
    user_id: string;
    completed_at: string;
    xp_earned: number;
    session_type: "lesson" | "riff_practice" | "jam_session" | "speed_trainer" | "free_play";
    started_at: string;
    notes?: string | undefined;
    accuracy_percentage?: number | undefined;
    related_riff_id?: string | undefined;
    related_lesson_id?: string | undefined;
    related_jam_track_id?: string | undefined;
}, {
    id: string;
    duration_seconds: number;
    user_id: string;
    completed_at: string;
    xp_earned: number;
    session_type: "lesson" | "riff_practice" | "jam_session" | "speed_trainer" | "free_play";
    started_at: string;
    notes?: string | undefined;
    accuracy_percentage?: number | undefined;
    related_riff_id?: string | undefined;
    related_lesson_id?: string | undefined;
    related_jam_track_id?: string | undefined;
}>;
export declare const CreatePracticeSessionSchema: z.ZodObject<{
    session_type: z.ZodEnum<["lesson", "riff_practice", "jam_session", "speed_trainer", "free_play"]>;
    related_riff_id: z.ZodOptional<z.ZodString>;
    related_lesson_id: z.ZodOptional<z.ZodString>;
    related_jam_track_id: z.ZodOptional<z.ZodString>;
    duration_seconds: z.ZodNumber;
    xp_earned: z.ZodNumber;
    accuracy_percentage: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    duration_seconds: number;
    xp_earned: number;
    session_type: "lesson" | "riff_practice" | "jam_session" | "speed_trainer" | "free_play";
    notes?: string | undefined;
    accuracy_percentage?: number | undefined;
    related_riff_id?: string | undefined;
    related_lesson_id?: string | undefined;
    related_jam_track_id?: string | undefined;
}, {
    duration_seconds: number;
    xp_earned: number;
    session_type: "lesson" | "riff_practice" | "jam_session" | "speed_trainer" | "free_play";
    notes?: string | undefined;
    accuracy_percentage?: number | undefined;
    related_riff_id?: string | undefined;
    related_lesson_id?: string | undefined;
    related_jam_track_id?: string | undefined;
}>;
export declare const PracticeSessionStatsSchema: z.ZodObject<{
    total_sessions: z.ZodNumber;
    total_practice_minutes: z.ZodNumber;
    average_session_duration_minutes: z.ZodNumber;
    most_common_session_type: z.ZodEnum<["lesson", "riff_practice", "jam_session", "speed_trainer", "free_play"]>;
    xp_earned_this_week: z.ZodNumber;
    xp_earned_today: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    total_sessions: number;
    total_practice_minutes: number;
    average_session_duration_minutes: number;
    most_common_session_type: "lesson" | "riff_practice" | "jam_session" | "speed_trainer" | "free_play";
    xp_earned_this_week: number;
    xp_earned_today: number;
}, {
    total_sessions: number;
    total_practice_minutes: number;
    average_session_duration_minutes: number;
    most_common_session_type: "lesson" | "riff_practice" | "jam_session" | "speed_trainer" | "free_play";
    xp_earned_this_week: number;
    xp_earned_today: number;
}>;
export type PracticeSession = z.infer<typeof PracticeSessionSchema>;
export type CreatePracticeSession = z.infer<typeof CreatePracticeSessionSchema>;
export type PracticeSessionStats = z.infer<typeof PracticeSessionStatsSchema>;
//# sourceMappingURL=practice-session.schemas.d.ts.map