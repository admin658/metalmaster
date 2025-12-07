import { z } from 'zod';
export declare const UserProfileSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    username: z.ZodString;
    avatar_url: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    skill_level: z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    username: string;
    id: string;
    created_at: string;
    updated_at: string;
    skill_level: "beginner" | "intermediate" | "advanced" | "expert";
    avatar_url?: string | undefined;
    bio?: string | undefined;
}, {
    email: string;
    username: string;
    id: string;
    created_at: string;
    updated_at: string;
    skill_level: "beginner" | "intermediate" | "advanced" | "expert";
    avatar_url?: string | undefined;
    bio?: string | undefined;
}>;
export declare const UpdateUserProfileSchema: z.ZodObject<{
    username: z.ZodOptional<z.ZodString>;
    avatar_url: z.ZodOptional<z.ZodString>;
    bio: z.ZodOptional<z.ZodString>;
    skill_level: z.ZodOptional<z.ZodEnum<["beginner", "intermediate", "advanced", "expert"]>>;
}, "strip", z.ZodTypeAny, {
    username?: string | undefined;
    avatar_url?: string | undefined;
    bio?: string | undefined;
    skill_level?: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
}, {
    username?: string | undefined;
    avatar_url?: string | undefined;
    bio?: string | undefined;
    skill_level?: "beginner" | "intermediate" | "advanced" | "expert" | undefined;
}>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UpdateUserProfile = z.infer<typeof UpdateUserProfileSchema>;
//# sourceMappingURL=user.schemas.d.ts.map