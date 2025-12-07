import { z } from 'zod';
export declare const TabSchema: z.ZodObject<{
    id: z.ZodString;
    riff_id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    format: z.ZodEnum<["tablature", "standard_notation", "ascii", "gp5", "gp6"]>;
    tuning: z.ZodString;
    difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    created_by: z.ZodString;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    title: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    content: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    riff_id: string;
    format: "tablature" | "standard_notation" | "ascii" | "gp5" | "gp6";
    tuning: string;
}, {
    id: string;
    title: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    content: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    riff_id: string;
    format: "tablature" | "standard_notation" | "ascii" | "gp5" | "gp6";
    tuning: string;
}>;
export declare const CreateTabSchema: z.ZodObject<{
    riff_id: z.ZodString;
    title: z.ZodString;
    content: z.ZodString;
    format: z.ZodEnum<["tablature", "standard_notation", "ascii", "gp5", "gp6"]>;
    tuning: z.ZodString;
    difficulty_level: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
}, "strip", z.ZodTypeAny, {
    title: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    content: string;
    riff_id: string;
    format: "tablature" | "standard_notation" | "ascii" | "gp5" | "gp6";
    tuning: string;
}, {
    title: string;
    difficulty_level: "beginner" | "intermediate" | "advanced" | "expert";
    content: string;
    riff_id: string;
    format: "tablature" | "standard_notation" | "ascii" | "gp5" | "gp6";
    tuning: string;
}>;
export declare const UpdateTabSchema: z.ZodObject<{
    riff_id: z.ZodOptional<z.ZodString>;
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    format: z.ZodOptional<z.ZodEnum<["tablature", "standard_notation", "ascii", "gp5", "gp6"]>>;
    tuning: z.ZodOptional<z.ZodString>;
    difficulty_level: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    difficulty_level?: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
    content?: string | undefined;
    riff_id?: string | undefined;
    format?: "tablature" | "standard_notation" | "ascii" | "gp5" | "gp6" | undefined;
    tuning?: string | undefined;
}, {
    title?: string | undefined;
    difficulty_level?: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
    content?: string | undefined;
    riff_id?: string | undefined;
    format?: "tablature" | "standard_notation" | "ascii" | "gp5" | "gp6" | undefined;
    tuning?: string | undefined;
}>;
export type Tab = z.infer<typeof TabSchema>;
export type CreateTab = z.infer<typeof CreateTabSchema>;
export type UpdateTab = z.infer<typeof UpdateTabSchema>;
//# sourceMappingURL=tab.schemas.d.ts.map