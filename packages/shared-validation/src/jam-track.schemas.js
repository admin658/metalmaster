"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJamSessionSchema = exports.JamSessionSchema = exports.UpdateJamTrackSchema = exports.CreateJamTrackSchema = exports.JamTrackSchema = void 0;
const zod_1 = require("zod");
const DifficultyLevelSchema = zod_1.z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
const InstrumentSchema = zod_1.z.enum(['drums', 'bass', 'rhythm', 'full']);
exports.JamTrackSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().max(1000),
    riff_id: zod_1.z.string().uuid().optional(),
    bpm: zod_1.z.number().int().min(40).max(300),
    time_signature: zod_1.z.string().regex(/^\d+\/\d+$/),
    key: zod_1.z.string().min(1).max(10),
    duration_seconds: zod_1.z.number().int().positive(),
    audio_url: zod_1.z.string().url().optional().nullable(),
    difficulty_level: DifficultyLevelSchema,
    created_by: zod_1.z.string().uuid(),
    created_at: zod_1.z.string().datetime(),
    updated_at: zod_1.z.string().datetime(),
});
exports.CreateJamTrackSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(200),
    description: zod_1.z.string().max(1000),
    riff_id: zod_1.z.string().uuid().optional(),
    bpm: zod_1.z.number().int().min(40).max(300),
    time_signature: zod_1.z.string().regex(/^[\d]+\/[\d]+$/),
    key: zod_1.z.string().min(1).max(10),
    duration_seconds: zod_1.z.number().int().positive(),
    audio_url: zod_1.z.string().url().optional().nullable(),
    difficulty_level: DifficultyLevelSchema,
});
exports.UpdateJamTrackSchema = exports.CreateJamTrackSchema.partial();
exports.JamSessionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    user_id: zod_1.z.string().uuid(),
    jam_track_id: zod_1.z.string().uuid(),
    recording_url: zod_1.z.string().url().optional(),
    duration_seconds: zod_1.z.number().int().positive(),
    notes: zod_1.z.string().max(2000).optional(),
    quality_rating: zod_1.z.number().int().min(1).max(5).optional(),
    created_at: zod_1.z.string().datetime(),
});
exports.CreateJamSessionSchema = zod_1.z.object({
    jam_track_id: zod_1.z.string().uuid(),
    recording_url: zod_1.z.string().url().optional(),
    duration_seconds: zod_1.z.number().int().positive(),
    notes: zod_1.z.string().max(2000).optional(),
    quality_rating: zod_1.z.number().int().min(1).max(5).optional(),
});
//# sourceMappingURL=jam-track.schemas.js.map