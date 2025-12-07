import { z } from 'zod';
export declare const AuthRequestSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const SignUpRequestSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    username: z.ZodString;
    confirm_password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    username: string;
    confirm_password: string;
}, {
    email: string;
    password: string;
    username: string;
    confirm_password: string;
}>, {
    email: string;
    password: string;
    username: string;
    confirm_password: string;
}, {
    email: string;
    password: string;
    username: string;
    confirm_password: string;
}>;
export declare const RefreshTokenSchema: z.ZodObject<{
    refresh_token: z.ZodString;
}, "strip", z.ZodTypeAny, {
    refresh_token: string;
}, {
    refresh_token: string;
}>;
export type AuthRequest = z.infer<typeof AuthRequestSchema>;
export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
//# sourceMappingURL=auth.schemas.d.ts.map