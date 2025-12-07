import { z } from 'zod';

export const PaginationParamsSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total_pages: z.number().int().nonnegative(),
  });

export const ApiMetaSchema = z.object({
  timestamp: z.string(),
  version: z.string(),
});

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema?: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema ?? z.unknown().optional(),
    error: ApiErrorSchema.optional(),
    meta: ApiMetaSchema.optional(),
  });

export type ApiError = z.infer<typeof ApiErrorSchema>;
export type ApiMeta = z.infer<typeof ApiMetaSchema>;
