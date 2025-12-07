"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PracticeSessionStatsSchema = exports.CreatePracticeSessionSchema = exports.PracticeSessionSchema = void 0;
const zod_1 = require("zod");
const SessionTypeSchema = zod_1.z.enum(['lesson', 'riff_practice', 'jam_session', 'speed_trainer', 'free_play']);
exports.PracticeSessionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    session_type: SessionTypeSchema,
    related_riff_id: zod_1.z.string().uuid().optional(),
    related_lesson_id: zod_1.z.string().uuid().optional(),
    related_jam_track_id: zod_1.z.string().uuid().optional(),
    duration_seconds: zod_1.z.number().int().positive(),
    xp_earned: zod_1.z.number().int().nonnegative(),
    accuracy_percentage: zod_1.z.number().min(0).max(100).optional(),
    notes: zod_1.z.string().max(1000).optional(),
    started_at: zod_1.z.string().datetime(),
    completed_at: zod_1.z.string().datetime(),
});
exports.CreatePracticeSessionSchema = zod_1.z.object({
    session_type: SessionTypeSchema,
    related_riff_id: zod_1.z.string().uuid().optional(),
    related_lesson_id: zod_1.z.string().uuid().optional(),
    related_jam_track_id: zod_1.z.string().uuid().optional(),
    duration_seconds: zod_1.z.number().int().positive(),
    xp_earned: zod_1.z.number().int().nonnegative(),
    accuracy_percentage: zod_1.z.number().min(0).max(100).optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.PracticeSessionStatsSchema = zod_1.z.object({
    total_sessions: zod_1.z.number().int().nonnegative(),
    total_practice_minutes: zod_1.z.number().int().nonnegative(),
    average_session_duration_minutes: zod_1.z.number().nonnegative(),
    most_common_session_type: SessionTypeSchema,
    xp_earned_this_week: zod_1.z.number().int().nonnegative(),
    xp_earned_today: zod_1.z.number().int().nonnegative(),
});
//# sourceMappingURL=practice-session.schemas.js.map