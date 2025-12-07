import { z } from 'zod';
export declare const RiffSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    bpm: z.ZodNumber;
    time_signature: z.ZodString;
    key: z.ZodString;
    difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    genre: z.ZodString;
    audio_url: z.ZodOptional<z.ZodString>;
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
    genre: string;
    created_by: string;
    audio_url?: string | undefined;
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
    genre: string;
    created_by: string;
    audio_url?: string | undefined;
}>;
export declare const CreateRiffSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    bpm: z.ZodNumber;
    time_signature: z.ZodString;
    key: z.ZodString;
    difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    genre: z.ZodString;
    audio_url: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    bpm: number;
    time_signature: string;
    key: string;
    genre: string;
    audio_url?: string | undefined;
}, {
    title: string;
    description: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    bpm: number;
    time_signature: string;
    key: string;
    genre: string;
    audio_url?: string | undefined;
}>;
export declare const UpdateRiffSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    bpm: z.ZodOptional<z.ZodNumber>;
    time_signature: z.ZodOptional<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
    difficulty_level: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>>;
    genre: z.ZodOptional<z.ZodString>;
    audio_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    difficulty_level?: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
    bpm?: number | undefined;
    time_signature?: string | undefined;
    key?: string | undefined;
    genre?: string | undefined;
    audio_url?: string | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    difficulty_level?: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
    bpm?: number | undefined;
    time_signature?: string | undefined;
    key?: string | undefined;
    genre?: string | undefined;
    audio_url?: string | undefined;
}>;
export type Riff = z.infer<typeof RiffSchema>;
export type CreateRiff = z.infer<typeof CreateRiffSchema>;
export type UpdateRiff = z.infer<typeof UpdateRiffSchema>;
//# sourceMappingURL=riff.schemas.d.ts.map