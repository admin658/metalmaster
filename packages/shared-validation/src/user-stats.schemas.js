"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillCategoryStatsSchema = exports.UserPracticeHeatmapSchema = exports.UserStatsSchema = void 0;
const zod_1 = require("zod");
const SkillCategorySchema = zod_1.z.enum(['accuracy', 'speed', 'rhythm_consistency', 'tone_knowledge']);
const LevelTierSchema = zod_1.z.enum([
    'Novice',
    'Acolyte',
    'Hammerhand',
    'Thrash Apprentice',
    'Riff Adept',
    'Blackened Knight',
    'Djent Architect',
    'Shred Overlord',
]);
exports.UserStatsSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    total_xp: zod_1.z.number().int().nonnegative(),
    level: zod_1.z.number().int().positive(),
    level_tier: LevelTierSchema,
    total_practice_minutes: zod_1.z.number().int().nonnegative(),
    total_lessons_completed: zod_1.z.number().int().nonnegative(),
    current_streak_days: zod_1.z.number().int().nonnegative(),
    longest_streak_days: zod_1.z.number().int().nonnegative(),
    accuracy_score: zod_1.z.number().min(0).max(100),
    speed_score: zod_1.z.number().min(0).max(100),
    rhythm_score: zod_1.z.number().min(0).max(100),
    tone_knowledge_score: zod_1.z.number().min(0).max(100),
    updated_at: zod_1.z.string().datetime(),
});
exports.UserPracticeHeatmapSchema = zod_1.z.object({
    user_id: zod_1.z.string().uuid(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    practice_minutes: zod_1.z.number().int().nonnegative(),
    lessons_completed: zod_1.z.number().int().nonnegative(),
    riffs_completed: zod_1.z.number().int().nonnegative(),
    xp_earned: zod_1.z.number().int().nonnegative(),
});
exports.SkillCategoryStatsSchema = zod_1.z.object({
    category: SkillCategorySchema,
    current_score: zod_1.z.number().min(0).max(100),
    last_updated: zod_1.z.string().datetime(),
    progress_last_7_days: zod_1.z.number(),
});
//# sourceMappingURL=user-stats.schemas.js.map