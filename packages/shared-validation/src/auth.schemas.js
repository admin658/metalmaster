"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenSchema = exports.SignUpRequestSchema = exports.AuthRequestSchema = void 0;
const zod_1 = require("zod");
exports.AuthRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
exports.SignUpRequestSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters').max(20),
    confirm_password: zod_1.z.string(),
}).refine(data => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
});
exports.RefreshTokenSchema = zod_1.z.object({
    refresh_token: zod_1.z.string(),
});
//# sourceMappingURL=auth.schemas.js.map