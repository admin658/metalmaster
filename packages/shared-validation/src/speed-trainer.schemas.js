"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeedTrainerProgressSchema = exports.UpdateSpeedTrainerSessionSchema = exports.CreateSpeedTrainerSessionSchema = exports.SpeedTrainerSessionSchema = void 0;
const zod_1 = require("zod");
const ExerciseTypeSchema = zod_1.z.enum(['metronome', 'chugging', 'tremolo', 'downpicking', 'sweep_picking', 'tapping']);
exports.SpeedTrainerSessionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    riff_id: zod_1.z.string().uuid().optional(),
    exercise_type: ExerciseTypeSchema,
    starting_bpm: zod_1.z.number().int().positive(),
    ending_bpm: zod_1.z.number().int().positive(),
    current_bpm: zod_1.z.number().int().positive(),
    target_bpm: zod_1.z.number().int().positive(),
    duration_seconds: zod_1.z.number().int().positive(),
    accuracy_percentage: zod_1.z.number().min(0).max(100),
    notes: zod_1.z.string().optional(),
    auto_increment_enabled: zod_1.z.boolean(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.CreateSpeedTrainerSessionSchema = zod_1.z.object({
    exercise_type: ExerciseTypeSchema,
    riff_id: zod_1.z.string().uuid().optional(),
    starting_bpm: zod_1.z.number().int().min(40).max(300),
    target_bpm: zod_1.z.number().int().min(40).max(300),
    auto_increment_enabled: zod_1.z.boolean().default(false),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.UpdateSpeedTrainerSessionSchema = zod_1.z.object({
    current_bpm: zod_1.z.number().int().positive().optional(),
    ending_bpm: zod_1.z.number().int().positive().optional(),
    accuracy_percentage: zod_1.z.number().min(0).max(100).optional(),
    duration_seconds: zod_1.z.number().int().positive().optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.SpeedTrainerProgressSchema = zod_1.z.object({
    exercise_type: ExerciseTypeSchema,
    personal_best_bpm: zod_1.z.number().int().positive(),
    average_bpm: zod_1.z.number().int().positive(),
    total_sessions: zod_1.z.number().int().nonnegative(),
    last_session_date: zod_1.z.string().datetime(),
    improvement_trend: zod_1.z.number(),
});
//# sourceMappingURL=speed-trainer.schemas.js.map