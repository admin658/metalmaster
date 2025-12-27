import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import express, { Request, Response } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import { lessonRoutes } from './routes/lesson.routes';
import { riffRoutes } from './routes/riff.routes';
import { tabRoutes } from './routes/tab.routes';
import { progressRoutes } from './routes/progress.routes';
import { jamTrackRoutes } from './routes/jam-track.routes';
import { dailyRiffRoutes } from './routes/daily-riff.routes';
import { speedTrainerRoutes } from './routes/speed-trainer.routes';
import { achievementRoutes } from './routes/achievement.routes';
import { userStatsRoutes } from './routes/user-stats.routes';
import { practiceSessionRoutes } from './routes/practice-session.routes';
import { xpRoutes } from './routes/xp.routes';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';
import billingRoutes from './routes/billing.routes';
import billingWebhook from './routes/billing.webhook';
import { toneRoutes } from './routes/tone.routes';
import { leaderboardRoutes } from './routes/leaderboard.routes';

const app = express();
const PORT = process.env.PORT || 3000;

const defaultAllowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
const envAllowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const allowAllOrigins = envAllowedOrigins.includes('*');
const allowedOriginSuffixes = envAllowedOrigins
  .filter(origin => origin.startsWith('*.') || origin.startsWith('.'))
  .map(origin => (origin.startsWith('*.') ? origin.slice(1) : origin));
const allowedOrigins = [
  ...defaultAllowedOrigins,
  ...envAllowedOrigins.filter(origin => !origin.startsWith('*.') && !origin.startsWith('.') && origin !== '*'),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed =
      allowAllOrigins ||
      allowedOrigins.includes(origin) ||
      allowedOriginSuffixes.some(suffix => origin.endsWith(suffix));

    return callback(null, isAllowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Register Stripe webhook with raw body parser (must be before JSON parser)
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }), billingWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(requestLogger);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/riffs', riffRoutes);
app.use('/api/tabs', tabRoutes);
app.use('/api/jam-tracks', jamTrackRoutes);
app.use('/api/daily-riff', dailyRiffRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/speed-trainer', speedTrainerRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/user-stats', userStatsRoutes);
app.use('/api/practice-sessions', practiceSessionRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/tone-settings', toneRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
