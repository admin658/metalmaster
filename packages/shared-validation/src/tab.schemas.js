"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTabSchema = exports.CreateTabSchema = exports.TabSchema = void 0;
const zod_1 = require("zod");
const DifficultyLevelSchema = zod_1.z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
const TabFormatSchema = zod_1.z.enum(['tablature', 'standard_notation', 'ascii', 'gp5', 'gp6']);
exports.TabSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    riff_id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(3).max(200),
    content: zod_1.z.string().min(10),
    format: TabFormatSchema,
    tuning: zod_1.z.string().min(2).max(50),
    difficulty_level: DifficultyLevelSchema,
    created_by: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.CreateTabSchema = zod_1.z.object({
    riff_id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(3).max(200),
    content: zod_1.z.string().min(10),
    format: TabFormatSchema,
    tuning: zod_1.z.string().min(2).max(50),
    difficulty_level: DifficultyLevelSchema,
});
exports.UpdateTabSchema = exports.CreateTabSchema.partial();
//# sourceMappingURL=tab.schemas.js.map