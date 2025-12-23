import { useEffect, useMemo, useState } from 'react';
import { apiGet } from '../lib/apiClient';

export type LeaderboardEntry = {
  id: string;
  user_id?: string;
  username: string;
  xp: number;
  streak_days: number;
  tone_score?: number;
  practice_minutes?: number;
  location?: string;
  instrument?: string;
};

const fallbackEntries: LeaderboardEntry[] = [
  { id: 'u1', username: 'Avery', xp: 18450, streak_days: 42, tone_score: 94, practice_minutes: 620, location: 'Austin, TX' },
  { id: 'u2', username: 'Sasha', xp: 17680, streak_days: 38, tone_score: 91, practice_minutes: 588, location: 'Toronto' },
  { id: 'u3', username: 'Diego', xp: 16540, streak_days: 33, tone_score: 89, practice_minutes: 540, location: 'Madrid' },
  { id: 'u4', username: 'Priya', xp: 15810, streak_days: 29, tone_score: 92, practice_minutes: 505, location: 'Bangalore' },
  { id: 'u5', username: 'Marcus', xp: 14900, streak_days: 26, tone_score: 87, practice_minutes: 476, location: 'Chicago' },
  { id: 'u6', username: 'Lena', xp: 13840, streak_days: 22, tone_score: 90, practice_minutes: 450, location: 'Berlin' },
  { id: 'u7', username: 'Noah', xp: 12950, streak_days: 20, tone_score: 85, practice_minutes: 412, location: 'Stockholm' },
  { id: 'u8', username: 'Hana', xp: 12030, streak_days: 18, tone_score: 88, practice_minutes: 390, location: 'Tokyo' },
  { id: 'u9', username: 'Cal', xp: 11440, streak_days: 15, tone_score: 84, practice_minutes: 360, location: 'Denver' },
  { id: 'u10', username: 'Ezra', xp: 10980, streak_days: 14, tone_score: 83, practice_minutes: 340, location: 'Sydney' },
];

const normalizeEntry = (entry: any, index: number): LeaderboardEntry => ({
  id: entry?.id || entry?.user_id || `entry-${index}`,
  user_id: entry?.user_id,
  username: entry?.username || entry?.handle || 'Player',
  xp: Number(entry?.xp ?? entry?.total_xp ?? 0),
  streak_days: Number(entry?.streak_days ?? entry?.streak ?? entry?.current_streak ?? 0),
  tone_score: entry?.tone_score !== undefined ? Number(entry.tone_score) : undefined,
  practice_minutes: entry?.practice_minutes !== undefined ? Number(entry.practice_minutes) : undefined,
  location: entry?.location || entry?.city,
  instrument: entry?.instrument || entry?.role,
});

export function useLeaderboard(period: 'weekly' | 'all_time' = 'weekly') {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(fallbackEntries);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      setIsLoading(true);
      try {
        const payload = await apiGet<any>(`/leaderboard?period=${period}`);
        const incoming = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

        if (active) {
          setEntries(incoming.length ? incoming.map(normalizeEntry) : fallbackEntries);
          setError(null);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
          setEntries(fallbackEntries);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [period]);

  const topThree = useMemo(() => entries.slice(0, 3), [entries]);

  return {
    entries,
    topThree,
    isLoading,
    error,
  };
}
