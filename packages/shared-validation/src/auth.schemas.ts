import { z } from 'zod';

export const AuthRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const SignUpRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(20),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const RefreshTokenSchema = z.object({
  refresh_token: z.string(),
});

export type AuthRequest = z.infer<typeof AuthRequestSchema>;
export type SignUpRequest = z.infer<typeof SignUpRequestSchema>;
export type RefreshToken = z.infer<typeof RefreshTokenSchema>;
