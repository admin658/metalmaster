import { z } from 'zod';
export declare const LessonSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["technique", "theory", "rhythm", "lead", "intermediate"]>;
    difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    duration_minutes: z.ZodNumber;
    video_url: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
    instructor_id: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    description: string;
    category: "intermediate" | "technique" | "theory" | "rhythm" | "lead";
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    duration_minutes: number;
    content: string;
    instructor_id: string;
    created_at: string;
    updated_at: string;
    video_url?: string | undefined;
}, {
    id: string;
    title: string;
    description: string;
    category: "intermediate" | "technique" | "theory" | "rhythm" | "lead";
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    duration_minutes: number;
    content: string;
    instructor_id: string;
    created_at: string;
    updated_at: string;
    video_url?: string | undefined;
}>;
export declare const CreateLessonSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    category: z.ZodEnum<["technique", "theory", "rhythm", "lead", "intermediate"]>;
    difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    duration_minutes: z.ZodNumber;
    video_url: z.ZodOptional<z.ZodString>;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    description: string;
    category: "intermediate" | "technique" | "theory" | "rhythm" | "lead";
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    duration_minutes: number;
    content: string;
    video_url?: string | undefined;
}, {
    title: string;
    description: string;
    category: "intermediate" | "technique" | "theory" | "rhythm" | "lead";
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    duration_minutes: number;
    content: string;
    video_url?: string | undefined;
}>;
export declare const UpdateLessonSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodEnum<["technique", "theory", "rhythm", "lead", "intermediate"]>>;
    difficulty_level: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>>;
    duration_minutes: z.ZodOptional<z.ZodNumber>;
    video_url: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    content: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    description?: string | undefined;
    category?: "intermediate" | "technique" | "theory" | "rhythm" | "lead" | undefined;
    difficulty_level?: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
    duration_minutes?: number | undefined;
    video_url?: string | undefined;
    content?: string | undefined;
}, {
    title?: string | undefined;
    description?: string | undefined;
    category?: "intermediate" | "technique" | "theory" | "rhythm" | "lead" | undefined;
    difficulty_level?: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
    duration_minutes?: number | undefined;
    video_url?: string | undefined;
    content?: string | undefined;
}>;
export type Lesson = z.infer<typeof LessonSchema>;
export type CreateLesson = z.infer<typeof CreateLessonSchema>;
export type UpdateLesson = z.infer<typeof UpdateLessonSchema>;
//# sourceMappingURL=lesson.schemas.d.ts.map