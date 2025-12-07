"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLessonSchema = exports.CreateLessonSchema = exports.LessonSchema = void 0;
const zod_1 = require("zod");
const DifficultyLevelSchema = zod_1.z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
const LessonCategorySchema = zod_1.z.enum(['technique', 'theory', 'rhythm', 'lead', 'intermediate']);
exports.LessonSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().min(10).max(2000),
    category: LessonCategorySchema,
    difficulty_level: DifficultyLevelSchema,
    duration_minutes: zod_1.z.number().int().positive(),
    video_url: zod_1.z.string().url().optional(),
    content: zod_1.z.string().min(10),
    instructor_id: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.CreateLessonSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().min(10).max(2000),
    category: LessonCategorySchema,
    difficulty_level: DifficultyLevelSchema,
    duration_minutes: zod_1.z.number().int().positive(),
    video_url: zod_1.z.string().url().optional(),
    content: zod_1.z.string().min(10),
});
exports.UpdateLessonSchema = exports.CreateLessonSchema.partial();
//# sourceMappingURL=lesson.schemas.js.map