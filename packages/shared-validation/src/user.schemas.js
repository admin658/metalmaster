"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserProfileSchema = exports.UserProfileSchema = void 0;
const zod_1 = require("zod");
const SkillLevelSchema = zod_1.z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
exports.UserProfileSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3).max(20),
    avatar_url: zod_1.z.string().url().optional(),
    bio: zod_1.z.string().max(500).optional(),
    skill_level: SkillLevelSchema,
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.UpdateUserProfileSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(20).optional(),
    avatar_url: zod_1.z.string().url().optional(),
    bio: zod_1.z.string().max(500).optional(),
    skill_level: SkillLevelSchema.optional(),
});
//# sourceMappingURL=user.schemas.js.map