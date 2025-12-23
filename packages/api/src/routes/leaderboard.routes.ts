import express from 'express';
import { z } from 'zod';
import { supabase } from '../index';

export const leaderboardRoutes = express.Router();

const QuerySchema = z.object({
  period: z.enum(['weekly', 'all_time']).default('weekly'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .pipe(z.number().min(1).max(200).optional()),
});

type LeaderboardEntry = {
  user_id: string;
  username: string;
  xp: number;
  streak_days: number;
  tone_score?: number;
  practice_minutes?: number;
};

leaderboardRoutes.get('/', async (req, res, next) => {
  try {
    const { period, limit } = QuerySchema.parse(req.query);
    const rowLimit = limit || 50;

    if (period === 'weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: heatmapRows, error: heatmapError } = await supabase
        .from('user_practice_heatmap')
        .select('user_id, xp_earned, practice_minutes, date')
        .gte('date', weekAgo)
        .limit(2000);

      if (heatmapError) throw heatmapError;

      const aggregates = new Map<string, { xp: number; practice: number }>();
      for (const row of heatmapRows || []) {
        const key = row.user_id as string;
        if (!key) continue;
        const prev = aggregates.get(key) || { xp: 0, practice: 0 };
        aggregates.set(key, {
          xp: prev.xp + Number(row.xp_earned || 0),
          practice: prev.practice + Number(row.practice_minutes || 0),
        });
      }

      const userIds = Array.from(aggregates.keys());
      if (!userIds.length) {
        return res.json({ success: true, data: [], meta: { period, count: 0 } });
      }

      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select('user_id, current_streak_days, tone_knowledge_score')
        .in('user_id', userIds);
      if (statsError) throw statsError;

      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, username, email')
        .in('id', userIds);
      if (userError) throw userError;

      const entries: LeaderboardEntry[] = userIds.map((id) => {
        const agg = aggregates.get(id)!;
        const stat = (userStats || []).find((s) => s.user_id === id);
        const user = (users || []).find((u) => u.id === id);
        const username = user?.username || (user?.email ? user.email.split('@')[0] : 'Player');
        return {
          user_id: id,
          username,
          xp: Math.round(agg.xp),
          practice_minutes: Math.round(agg.practice),
          streak_days: stat?.current_streak_days || 0,
          tone_score: stat?.tone_knowledge_score ?? undefined,
        };
      });

      const sorted = entries
        .sort((a, b) => b.xp - a.xp || b.streak_days - a.streak_days)
        .slice(0, rowLimit);

      return res.json({
        success: true,
        data: sorted,
        meta: { period, count: sorted.length, generated_at: new Date().toISOString() },
      });
    }

    // All-time leaderboard
    const { data, error } = await supabase
      .from('user_stats')
      .select('user_id, total_xp, current_streak_days, tone_knowledge_score')
      .order('total_xp', { ascending: false })
      .limit(rowLimit);
    if (error) throw error;

    const userIds = (data || []).map((row) => row.user_id);
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username, email')
      .in('id', userIds);
    if (userError) throw userError;

    const entries: LeaderboardEntry[] = (data || []).map((row) => {
      const user = (users || []).find((u) => u.id === row.user_id);
      const username = user?.username || (user?.email ? user.email.split('@')[0] : 'Player');
      return {
        user_id: row.user_id,
        username,
        xp: Number(row.total_xp || 0),
        streak_days: Number(row.current_streak_days || 0),
        tone_score: row.tone_knowledge_score ?? undefined,
      };
    });

    return res.json({
      success: true,
      data: entries,
      meta: { period, count: entries.length, generated_at: new Date().toISOString() },
    });
  } catch (error) {
    next(error);
  }
});
