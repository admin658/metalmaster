"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDailyRiffStatsSchema = exports.CreateDailyRiffCompletionSchema = exports.DailyRiffCompletionSchema = exports.DailyRiffSchema = void 0;
const zod_1 = require("zod");
const DifficultyLevelSchema = zod_1.z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
exports.DailyRiffSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    riff_id: zod_1.z.string().uuid(),
    video_url: zod_1.z.string().url(),
    tab_content: zod_1.z.string().min(5),
    description: zod_1.z.string().min(10).max(1000),
    subgenre: zod_1.z.string().min(2).max(100),
    difficulty_level: DifficultyLevelSchema,
    xp_bonus: zod_1.z.number().int().positive(),
    featured_date: zod_1.z.string().datetime(),
    created_at: zod_1.z.string().datetime(),
});
exports.DailyRiffCompletionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    daily_riff_id: zod_1.z.string().uuid(),
    completed_at: zod_1.z.string().datetime(),
    xp_earned: zod_1.z.number().int().nonnegative(),
    bonus_earned: zod_1.z.boolean(),
});
exports.CreateDailyRiffCompletionSchema = zod_1.z.object({
    daily_riff_id: zod_1.z.string().uuid(),
});
exports.UserDailyRiffStatsSchema = zod_1.z.object({
    completed_today: zod_1.z.boolean(),
    days_completed_streak: zod_1.z.number().int().nonnegative(),
    total_completed: zod_1.z.number().int().nonnegative(),
    next_riff_date: zod_1.z.string().datetime(),
});
//# sourceMappingURL=daily-riff.schemas.js.map