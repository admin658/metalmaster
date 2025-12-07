"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRiffSchema = exports.CreateRiffSchema = exports.RiffSchema = void 0;
const zod_1 = require("zod");
const DifficultyLevelSchema = zod_1.z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
exports.RiffSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().max(1000),
    bpm: zod_1.z.number().int().min(40).max(300),
    time_signature: zod_1.z.string().regex(/^\d+\/\d+$/),
    key: zod_1.z.string().min(1).max(10),
    difficulty_level: DifficultyLevelSchema,
    genre: zod_1.z.string().min(2).max(50),
    audio_url: zod_1.z.string().url().optional(),
    created_by: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.CreateRiffSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().max(1000),
    bpm: zod_1.z.number().int().min(40).max(300),
    time_signature: zod_1.z.string().regex(/^\d+\/\d+$/),
    key: zod_1.z.string().min(1).max(10),
    difficulty_level: DifficultyLevelSchema,
    genre: zod_1.z.string().min(2).max(50),
    audio_url: zod_1.z.string().url().optional(),
});
exports.UpdateRiffSchema = exports.CreateRiffSchema.partial();
//# sourceMappingURL=riff.schemas.js.map