import { z } from 'zod';
export declare const SpeedTrainerSessionSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    riff_id: z.ZodOptional<z.ZodString>;
    exercise_type: z.ZodEnum<["metronome", "chugging", "tremolo", "downpicking", "sweep_picking", "tapping"]>;
    starting_bpm: z.ZodNumber;
    ending_bpm: z.ZodNumber;
    current_bpm: z.ZodNumber;
    target_bpm: z.ZodNumber;
    duration_seconds: z.ZodNumber;
    accuracy_percentage: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    auto_increment_enabled: z.ZodBoolean;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    updated_at: string;
    duration_seconds: number;
    user_id: string;
    exercise_type: "metronome" | "chugging" | "tremolo" | "downpicking" | "sweep_picking" | "tapping";
    starting_bpm: number;
    ending_bpm: number;
    current_bpm: number;
    target_bpm: number;
    accuracy_percentage: number;
    auto_increment_enabled: boolean;
    riff_id?: string | undefined;
    notes?: string | undefined;
}, {
    id: string;
    created_at: string;
    updated_at: string;
    duration_seconds: number;
    user_id: string;
    exercise_type: "metronome" | "chugging" | "tremolo" | "downpicking" | "sweep_picking" | "tapping";
    starting_bpm: number;
    ending_bpm: number;
    current_bpm: number;
    target_bpm: number;
    accuracy_percentage: number;
    auto_increment_enabled: boolean;
    riff_id?: string | undefined;
    notes?: string | undefined;
}>;
export declare const CreateSpeedTrainerSessionSchema: z.ZodObject<{
    exercise_type: z.ZodEnum<["metronome", "chugging", "tremolo", "downpicking", "sweep_picking", "tapping"]>;
    riff_id: z.ZodOptional<z.ZodString>;
    starting_bpm: z.ZodNumber;
    target_bpm: z.ZodNumber;
    auto_increment_enabled: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    exercise_type: "metronome" | "chugging" | "tremolo" | "downpicking" | "sweep_picking" | "tapping";
    starting_bpm: number;
    target_bpm: number;
    auto_increment_enabled: boolean;
    riff_id?: string | undefined;
    notes?: string | undefined;
}, {
    exercise_type: "metronome" | "chugging" | "tremolo" | "downpicking" | "sweep_picking" | "tapping";
    starting_bpm: number;
    target_bpm: number;
    riff_id?: string | undefined;
    notes?: string | undefined;
    auto_increment_enabled?: boolean | undefined;
}>;
export declare const UpdateSpeedTrainerSessionSchema: z.ZodObject<{
    current_bpm: z.ZodOptional<z.ZodNumber>;
    ending_bpm: z.ZodOptional<z.ZodNumber>;
    accuracy_percentage: z.ZodOptional<z.ZodNumber>;
    duration_seconds: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    duration_seconds?: number | undefined;
    notes?: string | undefined;
    ending_bpm?: number | undefined;
    current_bpm?: number | undefined;
    accuracy_percentage?: number | undefined;
}, {
    duration_seconds?: number | undefined;
    notes?: string | undefined;
    ending_bpm?: number | undefined;
    current_bpm?: number | undefined;
    accuracy_percentage?: number | undefined;
}>;
export declare const SpeedTrainerProgressSchema: z.ZodObject<{
    exercise_type: z.ZodEnum<["metronome", "chugging", "tremolo", "downpicking", "sweep_picking", "tapping"]>;
    personal_best_bpm: z.ZodNumber;
    average_bpm: z.ZodNumber;
    total_sessions: z.ZodNumber;
    last_session_date: z.ZodString;
    improvement_trend: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    exercise_type: "metronome" | "chugging" | "tremolo" | "downpicking" | "sweep_picking" | "tapping";
    personal_best_bpm: number;
    average_bpm: number;
    total_sessions: number;
    last_session_date: string;
    improvement_trend: number;
}, {
    exercise_type: "metronome" | "chugging" | "tremolo" | "downpicking" | "sweep_picking" | "tapping";
    personal_best_bpm: number;
    average_bpm: number;
    total_sessions: number;
    last_session_date: string;
    improvement_trend: number;
}>;
export type SpeedTrainerSession = z.infer<typeof SpeedTrainerSessionSchema>;
export type CreateSpeedTrainerSession = z.infer<typeof CreateSpeedTrainerSessionSchema>;
export type UpdateSpeedTrainerSession = z.infer<typeof UpdateSpeedTrainerSessionSchema>;
export type SpeedTrainerProgress = z.infer<typeof SpeedTrainerProgressSchema>;
//# sourceMappingURL=speed-trainer.schemas.d.ts.map