import { z } from 'zod';
export declare const JamTrackSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    riff_id: z.ZodOptional<z.ZodString>;
    bpm: z.ZodNumber;
    time_signature: z.ZodString;
    key: z.ZodString;
    duration_seconds: z.ZodNumber;
    audio_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    created_by: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    created_at: string;
    updated_at: string;
    bpm: number;
    time_signature: string;
    key: string;
    created_by: string;
    duration_seconds: number;
    audio_url?: string | null | undefined;
    riff_id?: string | undefined;
}, {
    id: string;
    title: string;
    description: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    created_at: string;
    updated_at: string;
    bpm: number;
    time_signature: string;
    key: string;
    created_by: string;
    duration_seconds: number;
    audio_url?: string | null | undefined;
    riff_id?: string | undefined;
}>;
export declare const CreateJamTrackSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    riff_id: z.ZodOptional<z.ZodString>;
    bpm: z.ZodNumber;
    time_signature: z.ZodString;
    key: z.ZodString;
    duration_seconds: z.ZodNumber;
    audio_url: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    bpm: number;
    time_signature: string;
    key: string;
    duration_seconds: number;
    audio_url?: string | null | undefined;
    riff_id?: string | undefined;
}, {
    title: string;
    description: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    bpm: number;
    time_signature: string;
    key: string;
    duration_seconds: number;
    audio_url?: string | null | undefined;
    riff_id?: string | undefined;
}>;
export declare const UpdateJamTrackSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    riff_id: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    bpm: z.ZodOptional<z.ZodNumber>;
    time_signature: z.ZodOptional<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
    duration_seconds: z.ZodOptional<z.ZodNumber>;
    audio_url: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    difficulty_level: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    difficulty_level?: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
    bpm?: number | undefined;
    time_signature?: string | undefined;
    key?: string | undefined;
    audio_url?: string | null | undefined;
    riff_id?: string | undefined;
    duration_seconds?: number | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    difficulty_level?: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
    bpm?: number | undefined;
    time_signature?: string | undefined;
    key?: string | undefined;
    audio_url?: string | null | undefined;
    riff_id?: string | undefined;
    duration_seconds?: number | undefined;
}>;
export declare const JamSessionSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    jam_track_id: z.ZodString;
    recording_url: z.ZodOptional<z.ZodString>;
    duration_seconds: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    quality_rating: z.ZodOptional<z.ZodNumber>;
    created_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    created_at: string;
    duration_seconds: number;
    user_id: string;
    jam_track_id: string;
    recording_url?: string | undefined;
    notes?: string | undefined;
    quality_rating?: number | undefined;
}, {
    id: string;
    created_at: string;
    duration_seconds: number;
    user_id: string;
    jam_track_id: string;
    recording_url?: string | undefined;
    notes?: string | undefined;
    quality_rating?: number | undefined;
}>;
export declare const CreateJamSessionSchema: z.ZodObject<{
    jam_track_id: z.ZodString;
    recording_url: z.ZodOptional<z.ZodString>;
    duration_seconds: z.ZodNumber;
    notes: z.ZodOptional<z.ZodString>;
    quality_rating: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    duration_seconds: number;
    jam_track_id: string;
    recording_url?: string | undefined;
    notes?: string | undefined;
    quality_rating?: number | undefined;
}, {
    duration_seconds: number;
    jam_track_id: string;
    recording_url?: string | undefined;
    notes?: string | undefined;
    quality_rating?: number | undefined;
}>;
export type JamTrack = z.infer<typeof JamTrackSchema>;
export type CreateJamTrack = z.infer<typeof CreateJamTrackSchema>;
export type UpdateJamTrack = z.infer<typeof UpdateJamTrackSchema>;
export type JamSession = z.infer<typeof JamSessionSchema>;
export type CreateJamSession = z.infer<typeof CreateJamSessionSchema>;
//# sourceMappingURL=jam-track.schemas.d.ts.map