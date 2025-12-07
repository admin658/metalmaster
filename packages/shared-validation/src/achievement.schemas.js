"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AchievementProgressSchema = exports.UserAchievementSchema = exports.AchievementSchema = void 0;
const zod_1 = require("zod");
const BadgeIdSchema = zod_1.z.enum([
    'downpicking_demon',
    'sweep_sorcerer',
    'djent_machine',
    'black_metal_blizzard',
    'power_metal_paladin',
    'speed_merchant',
    'rhythm_warrior',
    'tone_master',
]);
const AchievementTypeSchema = zod_1.z.enum(['badge', 'milestone', 'skill_unlock']);
exports.AchievementSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    badge_id: BadgeIdSchema,
    name: zod_1.z.string().min(3).max(100),
    description: zod_1.z.string().min(10).max(500),
    icon_url: zod_1.z.string().url(),
    type: AchievementTypeSchema,
    xp_multiplier: zod_1.z.number().min(1).max(5),
    requirements: zod_1.z.record(zod_1.z.any()).optional(),
    created_at: zod_1.z.string().datetime(),
});
exports.UserAchievementSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    achievement_id: zod_1.z.string().uuid(),
    earned_at: zod_1.z.string().datetime(),
    progress_percentage: zod_1.z.number().min(0).max(100).optional(),
});
exports.AchievementProgressSchema = zod_1.z.object({
    achievement_id: zod_1.z.string().uuid(),
    badge_id: BadgeIdSchema,
    name: zod_1.z.string(),
    progress_percentage: zod_1.z.number().min(0).max(100),
    earned: zod_1.z.boolean(),
    earned_date: zod_1.z.string().datetime().optional(),
});
//# sourceMappingURL=achievement.schemas.js.map